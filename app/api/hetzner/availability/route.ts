import { auth } from "@/auth";

/**
 * Our tier definitions — minimum specs each tier requires.
 * We find the cheapest Hetzner server type that meets these at each location.
 */
const TIER_SPECS = [
  { id: "starter", label: "Starter", minCores: 2, minMemory: 4 },
  { id: "standard", label: "Standard", minCores: 4, minMemory: 8 },
  { id: "pro", label: "Pro", minCores: 8, minMemory: 16 },
  { id: "enterprise", label: "Enterprise", minCores: 16, minMemory: 32 },
] as const;

/** Locations we expose (subset of all Hetzner locations) */
const EXPOSED_LOCATIONS: Record<
  string,
  { label: string; country: string; region: string }
> = {
  fsn1: { label: "Falkenstein", country: "de", region: "eu-central" },
  ash: { label: "Ashburn", country: "us", region: "us-east" },
  sin: { label: "Singapore", country: "sg", region: "ap-southeast" },
};

/** Our margin in EUR per tier */
const TIER_MARGIN_EUR: Record<string, number> = {
  starter: 3,
  standard: 7,
  pro: 15,
  enterprise: 30,
};

const EUR_TO_INR = 92; // approximate, update periodically
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

interface HetznerPrice {
  location: string;
  price_hourly: { net: string; gross: string };
  price_monthly: { net: string; gross: string };
}

interface HetznerServerType {
  id: number;
  name: string;
  description: string;
  cores: number;
  memory: number;
  disk: number;
  prices: HetznerPrice[];
  cpu_type: string;
  architecture: string;
  deprecated: boolean;
}

interface CachedResult {
  data: AvailabilityResponse;
  ts: number;
}

interface TierOption {
  serverType: string;
  cores: number;
  memory: number;
  disk: number;
  hetznerEur: number;
  priceInr: number;
  architecture: string;
}

interface LocationInfo {
  id: string;
  label: string;
  country: string;
  region: string;
  tiers: Record<string, TierOption>;
}

interface AvailabilityResponse {
  locations: LocationInfo[];
  tierDefs: { id: string; label: string; minCores: number; minMemory: number }[];
}

let cache: CachedResult | null = null;

async function fetchAvailability(): Promise<AvailabilityResponse> {
  if (cache && Date.now() - cache.ts < CACHE_TTL_MS) {
    return cache.data;
  }

  const token = process.env.HETZNER_API_TOKEN;
  if (!token) throw new Error("Missing HETZNER_API_TOKEN");

  const res = await fetch(
    "https://api.hetzner.cloud/v1/server_types?per_page=50",
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) throw new Error(`Hetzner API ${res.status}`);
  const { server_types: serverTypes } = (await res.json()) as {
    server_types: HetznerServerType[];
  };

  // Only use shared (non-dedicated) types, skip deprecated
  const shared = serverTypes.filter(
    (st) =>
      !st.deprecated &&
      !st.name.startsWith("ccx"), // skip dedicated
  );

  const locations: LocationInfo[] = [];

  for (const [locId, locMeta] of Object.entries(EXPOSED_LOCATIONS)) {
    const tiers: Record<string, TierOption> = {};

    for (const tier of TIER_SPECS) {
      // Find cheapest server type at this location meeting tier specs
      let best: { st: HetznerServerType; price: number } | null = null;

      for (const st of shared) {
        if (st.cores < tier.minCores || st.memory < tier.minMemory) continue;
        const priceEntry = st.prices.find((p) => p.location === locId);
        if (!priceEntry) continue;
        const monthly = parseFloat(priceEntry.price_monthly.gross);
        if (!best || monthly < best.price) {
          best = { st, price: monthly };
        }
      }

      if (best) {
        const margin = TIER_MARGIN_EUR[tier.id] ?? 5;
        const totalEur = best.price + margin;
        const inrPaise = Math.round(totalEur * EUR_TO_INR * 100);

        tiers[tier.id] = {
          serverType: best.st.name,
          cores: best.st.cores,
          memory: best.st.memory,
          disk: best.st.disk,
          hetznerEur: best.price,
          priceInr: inrPaise,
          architecture: best.st.architecture,
        };
      }
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
    locations,
    tierDefs: TIER_SPECS.map((t) => ({
      id: t.id,
      label: t.label,
      minCores: t.minCores,
      minMemory: t.minMemory,
    })),
  };

  cache = { data, ts: Date.now() };
  return data;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await fetchAvailability();
    return Response.json(data);
  } catch (err) {
    console.error("[hetzner/availability] Failed:", err);
    return Response.json(
      { error: "Failed to fetch availability" },
      { status: 500 },
    );
  }
}
