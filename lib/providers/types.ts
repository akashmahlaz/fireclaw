/**
 * Cloud provider abstraction.
 *
 * Each provider (Hetzner, AWS, etc.) implements CloudProvider.
 * The availability API and provisioning logic use this interface
 * so adding a new provider is just a new implementation file.
 */

/* ── Availability ─────────────────────────────────────────────────── */

export interface TierAvailability {
  /** Server type that will be used for billing (guaranteed available) */
  guaranteedType: string;
  /** Ordered list of types to try (cheapest first, guaranteed last) */
  fallbackChain: string[];
  cores: number;
  memory: number; // GB
  disk: number;   // GB
  architecture: "x86" | "arm";
  /** Provider's base cost in USD/month (from /pricing endpoint) */
  providerCostUsd: number;
  /** Provider's hourly cost in USD (for pro-rated billing) */
  providerCostHourlyUsd: number;
  /** Included traffic in bytes (from /pricing endpoint) */
  includedTrafficBytes: number;
  /** Cost per TB of extra traffic in USD (from /pricing endpoint) */
  trafficCostPerTbUsd: number;
  /** Price charged to customer in USD cents */
  priceUsd: number;
  /** Price charged to customer in INR paise */
  priceInr: number;
}

export interface RegionAvailability {
  id: string;           // provider-specific location ID, e.g. "fsn1"
  label: string;        // human name, e.g. "Falkenstein"
  country: string;      // ISO 3166-1 alpha-2, e.g. "de"
  region: string;       // our canonical region, e.g. "eu-central"
  tiers: Record<string, TierAvailability>;
}

export interface AvailabilityResponse {
  provider: string;
  locations: RegionAvailability[];
  tierDefs: TierDef[];
}

export interface TierDef {
  id: string;
  label: string;
  minCores: number;
  minMemory: number;
}

/* ── Provisioning ────────────────────────────────────────────────── */

export interface ProvisionOpts {
  name: string;
  location: string;
  tier: string;
  userData: string;
  /** Labels to set on the created server (key/value metadata) */
  labels?: Record<string, string>;
  /** Optional callback for per-attempt progress logging (shown in UI) */
  onLog?: (step: string, status: "ok" | "pending" | "error") => Promise<void>;
}

export interface ProvisionResult {
  serverId: string;
  serverIp: string;
  serverType: string;
  datacenter: string;
}

/* ── Provider interface ──────────────────────────────────────────── */

export interface CloudProvider {
  readonly name: string;

  /**
   * Fetch live availability: which tiers are available in which regions,
   * with guaranteed pricing (based on the universal fallback type).
   */
  getAvailability(): Promise<AvailabilityResponse>;

  /**
   * Provision a server. Tries the fallback chain in order;
   * returns info about the server that was actually created.
   */
  provision(opts: ProvisionOpts): Promise<ProvisionResult>;

  /**
   * Destroy a server by provider-specific ID.
   */
  destroy(serverId: string): Promise<void>;
}
