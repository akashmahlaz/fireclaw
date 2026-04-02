/**
 * Hetzner Cloud provider implementation.
 *
 * Uses THREE Hetzner API endpoints for accurate availability:
 *
 * 1. GET /v1/server_types  — types with `locations[].available` (real-time)
 *    and `locations[].deprecation.unavailable_after` (scheduled removal)
 *
 * 2. GET /v1/datacenters   — `server_types.available` = IDs you can create NOW
 *    (most accurate for real-time stock)
 *
 * 3. GET /v1/locations     — dynamic location list with city, country, network_zone
 *
 * Hetzner server type families (cheapest → most expensive):
 *   CX  = Cost-Optimized (x86)    — EU only, cheapest
 *   CAX = ARM Ampere (shared)     — EU + some US, cheap
 *   CPXx2 = Regular gen2 (x86)   — EU + sin, good mid-range
 *   CPXx1 = Regular gen1 (x86)   — being deprecated per-location
 *   CCX = Dedicated AMD (x86)    — all locations, most expensive
 */

import type {
  CloudProvider,
  AvailabilityResponse,
  RegionAvailability,
  TierAvailability,
  TierDef,
  ProvisionOpts,
  ProvisionResult,
} from "./types";
import { createServer, deleteServer } from "../hetzner";

/* ── Configuration ───────────────────────────────────────────────── */

const TIER_DEFS: TierDef[] = [
  { id: "starter",    label: "Starter",    minCores: 1,  minMemory: 2  },
  { id: "standard",   label: "Standard",   minCores: 2,  minMemory: 4  },
  { id: "pro",        label: "Pro",        minCores: 4,  minMemory: 8  },
  { id: "enterprise", label: "Enterprise", minCores: 8,  minMemory: 16 },
];

/**
 * Server type preference order per tier (cheapest first).
 * Filtered at runtime against the real API `locations[].available` +
 * `datacenters.server_types.available` fields.
 *
 * Real Hetzner prices (EUR excl VAT, Apr 2026):
 *   CX22:  €3.79/mo (1 vCPU, 2GB) — cheapest, IPv6 only by default
 *   CX23:  €4.49/mo (2 vCPU, 4GB)
 *   CAX11: €4.99/mo (2 ARM vCPU, 4GB)
 *   CX33:  €6.99/mo (4 vCPU, 8GB)
 *   CAX21: €8.49/mo (4 ARM vCPU, 8GB)
 */
const TYPE_PREFERENCE: Record<string, string[]> = {
  // Starter: cheapest available (~$4.49-4.99 USD)
  // CX23 = 2 vCPU 4GB €4.49, CAX11 = 2 ARM vCPU 4GB €4.99
  starter:    ["cx23", "cax11", "cpx12", "cpx11", "ccx13"],
  // Standard: 4 vCPU, 8 GB (~$6.99-8.49 USD)
  standard:   ["cx33", "cax21", "cpx22", "cpx21", "ccx13"],
  // Pro: 8 vCPU, 16 GB (~$12.49-16.49 USD)
  pro:        ["cx43", "cax31", "cpx32", "cpx31", "ccx23"],
  // Enterprise: 16+ vCPU, 32+ GB
  enterprise: ["cx53", "cax41", "cpx42", "cpx41", "ccx33"],
};

/** Fallback location ordering by network_zone */
const ZONE_FALLBACK: Record<string, string[]> = {
  "eu-central":    ["nbg1", "hel1", "fsn1"],
  "us-east":       ["ash", "hil"],
  "us-west":       ["hil", "ash"],
  "ap-southeast":  ["sin"],
};

/** Our margin in USD per tier */
const TIER_MARGIN_USD: Record<string, number> = {
  starter: 0,
  standard: 1,
  pro: 3,
  enterprise: 7,
};

const USD_TO_INR = 84;
/**
 * EUR→USD fallback rate, used ONLY if the account's pricing currency is EUR.
 * Hetzner returns prices in the account's billing currency — most accounts
 * created with a US payment method already get USD prices from /pricing.
 */
const EUR_TO_USD_FALLBACK = 1.09;

/* ── Hetzner API types ───────────────────────────────────────────── */

interface HetznerPrice {
  location: string;
  price_monthly: { gross: string };
}

interface HetznerLocationAvail {
  id: number;
  name: string;
  available: boolean;
  recommended: boolean;
  deprecation: {
    announced: string;
    unavailable_after: string;
  } | null;
}

interface HetznerServerType {
  id: number;
  name: string;
  cores: number;
  memory: number;
  disk: number;
  prices: HetznerPrice[];
  architecture: string;
  deprecated: boolean;
  deprecation: unknown;
  category: string;
  cpu_type: string;
  locations: HetznerLocationAvail[];
}

interface HetznerLocation {
  id: number;
  name: string;
  city: string;
  country: string;
  network_zone: string;
}

interface HetznerDatacenter {
  id: number;
  name: string;
  location: HetznerLocation;
  server_types: {
    available: number[];
    supported: number[];
  };
}

/* ── Cache ────────────────────────────────────────────────────────── */

let cache: { data: AvailabilityResponse; ts: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

interface ApiCache {
  typeMap: Map<string, HetznerServerType>;
  typeIdMap: Map<number, string>;
  locations: HetznerLocation[];
  datacenters: HetznerDatacenter[];
  /** Set of "typeName:locationName" that are available NOW per datacenter API */
  dcAvailable: Set<string>;
  /** Pricing from GET /pricing — includes hourly, monthly, traffic per type per location */
  pricing: Map<string, {
    location: string;
    priceHourlyGross: number;
    priceMonthlyGross: number;
    includedTraffic: number;
    pricePerTbTrafficGross: number;
  }>;
  /** Currency from /pricing ("USD" or "EUR") */
  pricingCurrency: string;
  ts: number;
}

let apiCache: ApiCache | null = null;
const API_CACHE_TTL_MS = 5 * 60 * 1000;

function hetznerHeaders(): Record<string, string> {
  const token = process.env.HETZNER_API_TOKEN;
  if (!token) throw new Error("Missing HETZNER_API_TOKEN");
  return { Authorization: `Bearer ${token}` };
}

/**
 * Fetch all 3 Hetzner API endpoints in parallel and build a unified cache.
 */
async function fetchHetznerData(): Promise<ApiCache> {
  if (apiCache && Date.now() - apiCache.ts < API_CACHE_TTL_MS) {
    return apiCache;
  }

  const headers = hetznerHeaders();

  const [typesRes, locRes, dcRes, pricingRes] = await Promise.all([
    fetch("https://api.hetzner.cloud/v1/server_types?per_page=50", { headers }),
    fetch("https://api.hetzner.cloud/v1/locations", { headers }),
    fetch("https://api.hetzner.cloud/v1/datacenters", { headers }),
    fetch("https://api.hetzner.cloud/v1/pricing", { headers }),
  ]);

  if (!typesRes.ok) throw new Error(`Hetzner server_types API ${typesRes.status}`);
  if (!locRes.ok)   throw new Error(`Hetzner locations API ${locRes.status}`);
  if (!dcRes.ok)    throw new Error(`Hetzner datacenters API ${dcRes.status}`);
  if (!pricingRes.ok) throw new Error(`Hetzner pricing API ${pricingRes.status}`);

  const [typesJson, locJson, dcJson, pricingJson] = await Promise.all([
    typesRes.json() as Promise<{ server_types: HetznerServerType[] }>,
    locRes.json()   as Promise<{ locations: HetznerLocation[] }>,
    dcRes.json()    as Promise<{ datacenters: HetznerDatacenter[] }>,
    pricingRes.json() as Promise<{ pricing: {
      currency: string;
      server_types: {
        id: number;
        name: string;
        prices: {
          location: string;
          price_hourly: { gross: string };
          price_monthly: { gross: string };
          included_traffic: number;
          price_per_tb_traffic: { gross: string };
        }[];
      }[];
    } }>,
  ]);

  // Build type maps
  const typeMap = new Map<string, HetznerServerType>();
  const typeIdMap = new Map<number, string>();
  for (const st of typesJson.server_types) {
    if (!st.deprecated) {
      typeMap.set(st.name, st);
      typeIdMap.set(st.id, st.name);
    }
  }

  // Build datacenter "available" set: "typeName:locationName"
  const dcAvailable = new Set<string>();
  for (const dc of dcJson.datacenters) {
    const locName = dc.location.name;
    for (const typeId of dc.server_types.available) {
      const typeName = typeIdMap.get(typeId);
      if (typeName) {
        dcAvailable.add(`${typeName}:${locName}`);
      }
    }
  }

  console.log(
    `[hetzner] API: ${typeMap.size} types, ${locJson.locations.length} locations, ${dcJson.datacenters.length} DCs, ${dcAvailable.size} available pairs`,
  );

  // Build pricing map: "typeName:locationName" → pricing data
  const pricing = new Map<string, {
    location: string;
    priceHourlyGross: number;
    priceMonthlyGross: number;
    includedTraffic: number;
    pricePerTbTrafficGross: number;
  }>();
  for (const st of pricingJson.pricing.server_types) {
    for (const p of st.prices) {
      pricing.set(`${st.name}:${p.location}`, {
        location: p.location,
        priceHourlyGross: parseFloat(p.price_hourly.gross),
        priceMonthlyGross: parseFloat(p.price_monthly.gross),
        includedTraffic: p.included_traffic,
        pricePerTbTrafficGross: parseFloat(p.price_per_tb_traffic.gross),
      });
    }
  }

  const pricingCurrency = pricingJson.pricing.currency ?? "EUR";
  console.log(`[hetzner] Pricing: ${pricing.size} type×location entries, currency=${pricingCurrency}`);

  apiCache = {
    typeMap,
    typeIdMap,
    locations: locJson.locations,
    datacenters: dcJson.datacenters,
    dcAvailable,
    pricing,
    pricingCurrency,
    ts: Date.now(),
  };
  return apiCache;
}

/**
 * Check if a server type is truly available in a location.
 * Uses BOTH sources:
 *   1. server_type.locations[].available (type-level flag)
 *   2. datacenter.server_types.available (datacenter real-time stock)
 */
function isTypeAvailableInLocation(
  data: ApiCache,
  typeName: string,
  locationName: string,
): boolean {
  const st = data.typeMap.get(typeName);
  if (!st) return false;

  // Check 1: server_type.locations[].available
  const locEntry = st.locations.find((l) => l.name === locationName);
  if (!locEntry || !locEntry.available) return false;

  // Check 1b: skip if deprecated and past unavailable_after
  if (locEntry.deprecation?.unavailable_after) {
    const deadline = new Date(locEntry.deprecation.unavailable_after);
    if (Date.now() > deadline.getTime()) return false;
  }

  // Check 2: datacenter.server_types.available
  if (!data.dcAvailable.has(`${typeName}:${locationName}`)) return false;

  return true;
}

/**
 * Build a fallback chain for a tier + location.
 * Only includes types that pass BOTH availability checks.
 */
function buildChainForLocation(
  data: ApiCache,
  tierId: string,
  locationId: string,
): string[] {
  const preferred = TYPE_PREFERENCE[tierId] ?? [];
  return preferred.filter((name) => isTypeAvailableInLocation(data, name, locationId));
}

/**
 * Get monthly price (EUR) for a type in a location.
 */
function getPrice(data: ApiCache, typeName: string, locationId: string): number | null {
  const st = data.typeMap.get(typeName);
  if (!st) return null;
  const price = st.prices.find((p) => p.location === locationId);
  if (!price) return null;
  return parseFloat(price.price_monthly.gross);
}

/**
 * Determine if a Hetzner API error is retriable.
 */
function isRetriableError(msg: string): boolean {
  return (
    msg.includes("resource_unavailable") ||
    msg.includes("unavailable") ||
    msg.includes("unsupported location") ||
    msg.includes("server location disabled") ||
    msg.includes("location disabled") ||
    msg.includes("error during placement") ||
    msg.includes("error 412") ||
    msg.includes("error 422") ||
    // Network-level errors — retry with next type/location
    msg.includes("fetch failed") ||
    msg.includes("ECONNRESET") ||
    msg.includes("ECONNREFUSED") ||
    msg.includes("ETIMEDOUT") ||
    msg.includes("socket hang up")
  );
}

/* ── Provider ────────────────────────────────────────────────────── */

export const hetznerProvider: CloudProvider = {
  name: "hetzner",

  async getAvailability(): Promise<AvailabilityResponse> {
    if (cache && Date.now() - cache.ts < CACHE_TTL_MS) {
      return cache.data;
    }

    const data = await fetchHetznerData();
    const locations: RegionAvailability[] = [];

    for (const loc of data.locations) {
      const tiers: Record<string, TierAvailability> = {};

      for (const tierDef of TIER_DEFS) {
        const chain = buildChainForLocation(data, tierDef.id, loc.name);
        if (chain.length === 0) continue;

        // Use the FIRST type in the chain (cheapest truly-available) for pricing
        const pricingName = chain[0];
        const pricingSt = data.typeMap.get(pricingName)!;

        // Use /pricing endpoint for accurate hourly + monthly + traffic costs
        const pricingKey = `${pricingName}:${loc.name}`;
        const pricingData = data.pricing.get(pricingKey);
        // Fallback to server_type.prices if /pricing doesn't have this combo
        const providerCostGross = pricingData?.priceMonthlyGross
          ?? getPrice(data, pricingName, loc.name);
        if (!providerCostGross) continue;

        const providerCostHourlyGross = pricingData?.priceHourlyGross ?? (providerCostGross / 730);
        const includedTrafficBytes = pricingData?.includedTraffic ?? 0;
        const trafficCostGross = pricingData?.pricePerTbTrafficGross ?? 0;

        // Convert to USD only if account's pricing currency is EUR
        const toUsd = data.pricingCurrency === "USD" ? 1 : EUR_TO_USD_FALLBACK;
        const providerCostUsd = providerCostGross * toUsd;
        const providerCostHourlyUsd = providerCostHourlyGross * toUsd;
        const trafficCostPerTbUsd = trafficCostGross * toUsd;

        const marginUsd = TIER_MARGIN_USD[tierDef.id] ?? 2;
        const totalUsd = providerCostUsd + marginUsd;
        const priceUsd = Math.round(totalUsd * 100);
        const priceInr = Math.round(totalUsd * USD_TO_INR * 100);

        tiers[tierDef.id] = {
          guaranteedType: pricingName,
          fallbackChain: chain,
          cores: pricingSt.cores,
          memory: pricingSt.memory,
          disk: pricingSt.disk,
          architecture: pricingSt.architecture === "arm" ? "arm" : "x86",
          providerCostUsd,
          providerCostHourlyUsd,
          includedTrafficBytes,
          trafficCostPerTbUsd,
          priceUsd,
          priceInr,
        };
      }

      if (Object.keys(tiers).length > 0) {
        locations.push({
          id: loc.name,
          label: loc.city,
          country: loc.country.toLowerCase(),
          region: loc.network_zone,
          tiers,
        });
      }
    }

    // Sort: locations with more tiers first
    locations.sort((a, b) => Object.keys(b.tiers).length - Object.keys(a.tiers).length);

    const result: AvailabilityResponse = {
      provider: "hetzner",
      locations,
      tierDefs: TIER_DEFS,
    };

    console.log(
      `[hetzner] availability: ${locations.map((l) => `${l.id}(${Object.keys(l.tiers).length} tiers)`).join(", ") || "NONE"}`,
    );

    cache = { data: result, ts: Date.now() };
    return result;
  },

  async provision(opts: ProvisionOpts): Promise<ProvisionResult> {
    const log = opts.onLog ?? (async () => {});

    // Fetch fresh API data (all 3 endpoints)
    const data = await fetchHetznerData();

    // Find network_zone for this location → get fallback locations
    const requestedLoc = data.locations.find((l) => l.name === opts.location);
    const zone = requestedLoc?.network_zone;
    const fallbackLocs = zone ? (ZONE_FALLBACK[zone] ?? [opts.location]) : [opts.location];

    // Ensure the requested location is first
    const orderedLocations = [
      opts.location,
      ...fallbackLocs.filter((l) => l !== opts.location),
    ];

    let lastError: Error | null = null;
    let totalAttempts = 0;

    for (const loc of orderedLocations) {
      const chain = buildChainForLocation(data, opts.tier, loc);
      const locLabel = data.locations.find((l) => l.name === loc)?.city ?? loc;

      if (chain.length === 0) {
        console.log(`[hetzner] ${loc}: no available types for tier=${opts.tier}`);
        await log(`Skipping ${locLabel} — no types available`, "error");
        continue;
      }

      console.log(`[hetzner] ${loc} (${locLabel}): chain=[${chain.join(", ")}]`);

      for (const tryType of chain) {
        totalAttempts++;
        console.log(`[hetzner] attempt ${totalAttempts}: ${tryType} in ${loc}`);
        await log(`Trying ${tryType} in ${locLabel} (attempt ${totalAttempts})…`, "pending");

        try {
          const server = await createServer({
            name: opts.name,
            serverType: tryType,
            image: "ubuntu-24.04",
            location: loc,
            userData: opts.userData,
            labels: opts.labels,
          });

          console.log(
            `[hetzner] ✓ ${server.server_type.name} id=${server.id} ip=${server.public_net.ipv4.ip} dc=${server.datacenter.name}`,
          );
          await log(`✓ Created ${server.server_type.name} in ${locLabel}`, "ok");

          return {
            serverId: String(server.id),
            serverIp: server.public_net.ipv4.ip,
            serverType: server.server_type.name,
            datacenter: server.datacenter.name,
          };
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          const retriable = isRetriableError(msg);

          console.warn(`[hetzner] ${tryType}@${loc} failed (retriable=${retriable}): ${msg}`);
          lastError = err instanceof Error ? err : new Error(msg);

          if (msg.includes("location disabled") || msg.includes("server location disabled")) {
            await log(`✗ ${locLabel} disabled — skipping`, "error");
            // Invalidate cache since our data is stale
            apiCache = null;
            cache = null;
            break;
          }

          await log(`✗ ${tryType} in ${locLabel} — ${retriable ? "trying next" : "fatal"}`, "error");

          if (!retriable) throw lastError;
        }
      }

      console.log(`[hetzner] all types exhausted in ${loc}`);
    }

    throw lastError ?? new Error(
      `All server type + location fallbacks exhausted for tier=${opts.tier}`,
    );
  },

  async destroy(serverId: string): Promise<void> {
    await deleteServer(Number(serverId));
  },
};
