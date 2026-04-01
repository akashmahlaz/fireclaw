/**
 * Hetzner Cloud provider implementation.
 *
 * Key design:
 * - We show the **guaranteed** price (CPX, available everywhere) to the user.
 * - During provisioning we try cheaper types first (CX/CAX) — extra margin if they work.
 * - If all cheaper types are out of stock, CPX is the safety net.
 *
 * Hetzner families:
 *   CX  = Intel/AMD cost-optimized — EU only (fsn1, hel1, nbg1)
 *   CAX = Ampere ARM              — EU + US-East (ash), limited stock
 *   CPX = Shared Intel/AMD        — ALL locations (universal fallback)
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
  { id: "starter",    label: "Starter",    minCores: 2,  minMemory: 4  },
  { id: "standard",   label: "Standard",   minCores: 4,  minMemory: 8  },
  { id: "pro",        label: "Pro",        minCores: 8,  minMemory: 16 },
  { id: "enterprise", label: "Enterprise", minCores: 16, minMemory: 32 },
];

/** Locations we expose to customers */
const EXPOSED_LOCATIONS: Record<string, { label: string; country: string; region: string }> = {
  fsn1: { label: "Falkenstein", country: "de", region: "eu-central" },
  ash:  { label: "Ashburn",     country: "us", region: "us-east" },
  sin:  { label: "Singapore",   country: "sg", region: "ap-southeast" },
};

/** Our margin in EUR per tier (added on top of Hetzner's cost) */
const TIER_MARGIN_EUR: Record<string, number> = {
  starter: 3,
  standard: 7,
  pro: 15,
  enterprise: 30,
};

const EUR_TO_INR = 92;

/**
 * Fallback chains per tier per location.
 * Order: cheapest → universal fallback (CPX always last).
 * The *last* entry is the "guaranteed" type used for pricing.
 */
const FALLBACK_CHAINS: Record<string, Record<string, string[]>> = {
  starter: {
    fsn1: ["cx23", "cax11", "cpx21"],
    hel1: ["cx23", "cax11", "cpx21"],
    nbg1: ["cx23", "cax11", "cpx21"],
    ash:  ["cax11", "cpx21"],
    hil:  ["cpx21"],
    sin:  ["cpx21"],
  },
  standard: {
    fsn1: ["cx33", "cax21", "cpx31"],
    hel1: ["cx33", "cax21", "cpx31"],
    nbg1: ["cx33", "cax21", "cpx31"],
    ash:  ["cax21", "cpx31"],
    hil:  ["cpx31"],
    sin:  ["cpx31"],
  },
  pro: {
    fsn1: ["cx43", "cax31", "cpx41"],
    hel1: ["cx43", "cax31", "cpx41"],
    nbg1: ["cx43", "cax31", "cpx41"],
    ash:  ["cax31", "cpx41"],
    hil:  ["cpx41"],
    sin:  ["cpx41"],
  },
  enterprise: {
    fsn1: ["cx53", "cax41", "cpx51"],
    hel1: ["cx53", "cax41", "cpx51"],
    nbg1: ["cx53", "cax41", "cpx51"],
    ash:  ["cax41", "cpx51"],
    hil:  ["cpx51"],
    sin:  ["cpx51"],
  },
};

/* ── Hetzner API types ───────────────────────────────────────────── */

interface HetznerPrice {
  location: string;
  price_monthly: { gross: string };
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
}

/* ── Cache ────────────────────────────────────────────────────────── */

let cache: { data: AvailabilityResponse; ts: number } | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/* ── Provider ────────────────────────────────────────────────────── */

export const hetznerProvider: CloudProvider = {
  name: "hetzner",

  async getAvailability(): Promise<AvailabilityResponse> {
    if (cache && Date.now() - cache.ts < CACHE_TTL_MS) {
      return cache.data;
    }

    const token = process.env.HETZNER_API_TOKEN;
    if (!token) throw new Error("Missing HETZNER_API_TOKEN");

    // Fetch all server types from Hetzner
    const res = await fetch(
      "https://api.hetzner.cloud/v1/server_types?per_page=50",
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (!res.ok) throw new Error(`Hetzner API ${res.status}`);
    const { server_types: allTypes } = (await res.json()) as {
      server_types: HetznerServerType[];
    };

    // Build a lookup: serverTypeName → { specs, price per location }
    const typeMap = new Map<string, HetznerServerType>();
    for (const st of allTypes) {
      if (!st.deprecated) typeMap.set(st.name, st);
    }

    const locations: RegionAvailability[] = [];

    for (const [locId, locMeta] of Object.entries(EXPOSED_LOCATIONS)) {
      const tiers: Record<string, TierAvailability> = {};

      for (const tierDef of TIER_DEFS) {
        const chain = FALLBACK_CHAINS[tierDef.id]?.[locId];
        if (!chain || chain.length === 0) continue;

        // The guaranteed type is the LAST in the chain (CPX — always available)
        const guaranteedName = chain[chain.length - 1];
        const guaranteedSt = typeMap.get(guaranteedName);
        if (!guaranteedSt) continue;

        const guaranteedPrice = guaranteedSt.prices.find((p) => p.location === locId);
        if (!guaranteedPrice) continue;

        const providerCostEur = parseFloat(guaranteedPrice.price_monthly.gross);
        const margin = TIER_MARGIN_EUR[tierDef.id] ?? 5;
        const totalEur = providerCostEur + margin;
        const priceInr = Math.round(totalEur * EUR_TO_INR * 100); // paise

        tiers[tierDef.id] = {
          guaranteedType: guaranteedName,
          fallbackChain: chain,
          cores: guaranteedSt.cores,
          memory: guaranteedSt.memory,
          disk: guaranteedSt.disk,
          architecture: guaranteedSt.architecture === "arm" ? "arm" : "x86",
          providerCostEur,
          priceInr,
        };
      }

      if (Object.keys(tiers).length > 0) {
        locations.push({
          id: locId,
          label: locMeta.label,
          country: locMeta.country,
          region: locMeta.region,
          tiers,
        });
      }
    }

    const data: AvailabilityResponse = {
      provider: "hetzner",
      locations,
      tierDefs: TIER_DEFS,
    };

    cache = { data, ts: Date.now() };
    return data;
  },

  async provision(opts: ProvisionOpts): Promise<ProvisionResult> {
    // Get the fallback chain for this tier/location
    const chain = FALLBACK_CHAINS[opts.tier]?.[opts.location] ?? ["cpx21"];

    for (let i = 0; i < chain.length; i++) {
      const tryType = chain[i];
      console.log(
        `[hetzner-provider] attempt ${i + 1}/${chain.length}: ${tryType} in ${opts.location}`,
      );

      try {
        const server = await createServer({
          name: opts.name,
          serverType: tryType,
          image: "ubuntu-24.04",
          location: opts.location,
          userData: opts.userData,
        });

        console.log(
          `[hetzner-provider] success: ${server.server_type.name} id=${server.id} ip=${server.public_net.ipv4.ip}`,
        );

        return {
          serverId: String(server.id),
          serverIp: server.public_net.ipv4.ip,
          serverType: server.server_type.name,
          datacenter: server.datacenter.name,
        };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        const isUnavailable =
          msg.includes("resource_unavailable") || msg.includes("unavailable");

        console.warn(
          `[hetzner-provider] ${tryType} failed (unavailable=${isUnavailable}): ${msg}`,
        );

        if (isUnavailable && i < chain.length - 1) {
          continue; // try next in chain
        }
        throw err; // fatal or last fallback failed
      }
    }

    // TypeScript: unreachable but satisfies return
    throw new Error("All server type fallbacks exhausted");
  },

  async destroy(serverId: string): Promise<void> {
    await deleteServer(Number(serverId));
  },
};
