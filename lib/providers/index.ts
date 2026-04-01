/**
 * Provider registry.
 *
 * Import `getProvider("hetzner")` to get the Hetzner implementation.
 * Add new providers here as they are built (e.g., "aws", "gcp").
 */

export type { CloudProvider, AvailabilityResponse, RegionAvailability, TierAvailability, TierDef, ProvisionOpts, ProvisionResult } from "./types";

import type { CloudProvider } from "./types";
import { hetznerProvider } from "./hetzner";

const providers: Record<string, CloudProvider> = {
  hetzner: hetznerProvider,
};

export function getProvider(name = "hetzner"): CloudProvider {
  const p = providers[name];
  if (!p) throw new Error(`Unknown cloud provider: ${name}`);
  return p;
}

/** All registered provider names */
export function listProviders(): string[] {
  return Object.keys(providers);
}
