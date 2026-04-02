/**
 * Hetzner Cloud API client — comprehensive wrapper.
 *
 * Docs: https://docs.hetzner.cloud/
 * Base URL: https://api.hetzner.cloud/v1
 *
 * Covers: Servers, Server Actions, Server Types, Locations,
 *         Datacenters, Pricing, Firewalls, SSH Keys, Images.
 *
 * Required env: HETZNER_API_TOKEN
 */

const BASE = "https://api.hetzner.cloud/v1";

function headers() {
  const token = process.env.HETZNER_API_TOKEN;
  if (!token) throw new Error("Missing HETZNER_API_TOKEN");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  } as const;
}

async function hetznerFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const method = init?.method ?? "GET";
  console.log(`[hetzner] ${method} ${BASE}${path}`);
  if (init?.body) {
    console.log(`[hetzner] Request body:`, init.body);
  }
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { ...headers(), ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`[hetzner] ${method} ${path} → ${res.status}: ${body}`);
    throw new Error(`Hetzner API error ${res.status}: ${body}`);
  }
  const data = (await res.json()) as T;
  console.log(`[hetzner] ${method} ${path} → ${res.status} OK`);
  return data;
}

// ── Types ──────────────────────────────────────────────────────────────

export interface HetznerServer {
  id: number;
  name: string;
  status: string; // "running" | "initializing" | "starting" | "stopping" | "off" | "deleting" | "migrating" | "rebuilding" | "unknown"
  public_net: {
    ipv4: { ip: string };
    ipv6: { ip: string };
  };
  server_type: { name: string; id: number; cores: number; memory: number; disk: number };
  datacenter: { name: string; location: { name: string; city: string; country: string } };
  image: { id: number; name: string; os_flavor: string } | null;
  labels: Record<string, string>;
  protection: { delete: boolean; rebuild: boolean };
  created: string;
  included_traffic: number;
  ingoing_traffic: number | null;
  outgoing_traffic: number | null;
}

export interface HetznerAction {
  id: number;
  command: string;
  status: "running" | "success" | "error";
  progress: number; // 0-100
  started: string;
  finished: string | null;
  resources: { id: number; type: string }[];
  error: { code: string; message: string } | null;
}

export interface HetznerMetrics {
  start: string;
  end: string;
  step: number;
  time_series: Record<
    string,
    { values: [number, string][] }
  >;
}

export interface HetznerPricing {
  currency: string;
  vat_rate: string;
  server_types: {
    id: number;
    name: string;
    prices: {
      location: string;
      price_hourly: { net: string; gross: string };
      price_monthly: { net: string; gross: string };
      included_traffic: number;
      price_per_tb_traffic: { net: string; gross: string };
    }[];
  }[];
  primary_ips: {
    type: string;
    prices: {
      location: string;
      price_hourly: { net: string; gross: string };
      price_monthly: { net: string; gross: string };
    }[];
  }[];
  floating_ips: {
    type: string;
    prices: { location: string; price_monthly: { net: string; gross: string } }[];
  }[];
  image: { price_per_gb_month: { net: string; gross: string } };
  volume: { price_per_gb_month: { net: string; gross: string } };
  server_backup: { percentage: string };
}

export interface HetznerFirewall {
  id: number;
  name: string;
  labels: Record<string, string>;
  rules: {
    direction: "in" | "out";
    protocol: "tcp" | "udp" | "icmp" | "esp" | "gre";
    port: string;
    source_ips: string[];
    destination_ips: string[];
  }[];
  applied_to: { type: string; server?: { id: number } }[];
}

interface CreateServerResponse {
  server: HetznerServer;
  action: HetznerAction;
  root_password: string | null;
}

interface ListServersResponse {
  servers: HetznerServer[];
}

// ── Servers ────────────────────────────────────────────────────────────

export async function createServer(opts: {
  name: string;
  serverType?: string;
  image?: string;
  location?: string;
  userData?: string;
  labels?: Record<string, string>;
  firewalls?: { firewall: number }[];
}): Promise<HetznerServer> {
  const body: Record<string, unknown> = {
    name: opts.name,
    server_type: opts.serverType ?? "cx23",
    image: opts.image ?? "ubuntu-24.04",
    location: opts.location ?? "fsn1",
    user_data: opts.userData,
    start_after_create: true,
  };
  if (opts.labels) body.labels = opts.labels;
  if (opts.firewalls) body.firewalls = opts.firewalls;

  const data = await hetznerFetch<CreateServerResponse>("/servers", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return data.server;
}

export async function getServer(id: number): Promise<HetznerServer> {
  const data = await hetznerFetch<{ server: HetznerServer }>(`/servers/${id}`);
  return data.server;
}

export async function listServers(labelSelector?: string): Promise<HetznerServer[]> {
  const qs = labelSelector ? `?label_selector=${encodeURIComponent(labelSelector)}` : "";
  const data = await hetznerFetch<ListServersResponse>(`/servers${qs}`);
  return data.servers;
}

export async function updateServer(
  id: number,
  opts: { name?: string; labels?: Record<string, string> },
): Promise<HetznerServer> {
  const data = await hetznerFetch<{ server: HetznerServer }>(`/servers/${id}`, {
    method: "PUT",
    body: JSON.stringify(opts),
  });
  return data.server;
}

export async function deleteServer(id: number): Promise<void> {
  await hetznerFetch(`/servers/${id}`, { method: "DELETE" });
}

// ── Server Actions ─────────────────────────────────────────────────────

export async function powerOnServer(id: number): Promise<HetznerAction> {
  const data = await hetznerFetch<{ action: HetznerAction }>(
    `/servers/${id}/actions/poweron`,
    { method: "POST" },
  );
  return data.action;
}

export async function powerOffServer(id: number): Promise<HetznerAction> {
  const data = await hetznerFetch<{ action: HetznerAction }>(
    `/servers/${id}/actions/poweroff`,
    { method: "POST" },
  );
  return data.action;
}

/** Graceful ACPI shutdown — sends shutdown signal to OS. */
export async function shutdownServer(id: number): Promise<HetznerAction> {
  const data = await hetznerFetch<{ action: HetznerAction }>(
    `/servers/${id}/actions/shutdown`,
    { method: "POST" },
  );
  return data.action;
}

export async function rebootServer(id: number): Promise<HetznerAction> {
  const data = await hetznerFetch<{ action: HetznerAction }>(
    `/servers/${id}/actions/reboot`,
    { method: "POST" },
  );
  return data.action;
}

/** Hard reset — like pressing the reset button. */
export async function resetServer(id: number): Promise<HetznerAction> {
  const data = await hetznerFetch<{ action: HetznerAction }>(
    `/servers/${id}/actions/reset`,
    { method: "POST" },
  );
  return data.action;
}

/** Reset root password. Server must be running. */
export async function resetServerPassword(id: number): Promise<{
  action: HetznerAction;
  root_password: string;
}> {
  return hetznerFetch(`/servers/${id}/actions/reset_password`, { method: "POST" });
}

/**
 * Change server type (upgrade/downgrade).
 * Server must be stopped first. Set upgrade_disk=false to allow future downgrades.
 */
export async function changeServerType(
  id: number,
  serverType: string,
  upgradeDisk = false,
): Promise<HetznerAction> {
  const data = await hetznerFetch<{ action: HetznerAction }>(
    `/servers/${id}/actions/change_type`,
    {
      method: "POST",
      body: JSON.stringify({ server_type: serverType, upgrade_disk: upgradeDisk }),
    },
  );
  return data.action;
}

/** Rebuild server from a new image (reinstall OS). */
export async function rebuildServer(
  id: number,
  image: string,
): Promise<HetznerAction> {
  const data = await hetznerFetch<{ action: HetznerAction }>(
    `/servers/${id}/actions/rebuild`,
    {
      method: "POST",
      body: JSON.stringify({ image }),
    },
  );
  return data.action;
}

/** Enable delete + rebuild protection. */
export async function changeServerProtection(
  id: number,
  opts: { delete: boolean; rebuild: boolean },
): Promise<HetznerAction> {
  const data = await hetznerFetch<{ action: HetznerAction }>(
    `/servers/${id}/actions/change_protection`,
    {
      method: "POST",
      body: JSON.stringify(opts),
    },
  );
  return data.action;
}

/** Enable automatic daily backups (adds 20% to server cost). */
export async function enableServerBackup(id: number): Promise<HetznerAction> {
  const data = await hetznerFetch<{ action: HetznerAction }>(
    `/servers/${id}/actions/enable_backup`,
    { method: "POST" },
  );
  return data.action;
}

/** Disable backups — immediately deletes all existing backups! */
export async function disableServerBackup(id: number): Promise<HetznerAction> {
  const data = await hetznerFetch<{ action: HetznerAction }>(
    `/servers/${id}/actions/disable_backup`,
    { method: "POST" },
  );
  return data.action;
}

/** Create a snapshot image from the server. */
export async function createServerImage(
  id: number,
  opts: { description?: string; type?: "snapshot" | "backup"; labels?: Record<string, string> },
): Promise<{ image: { id: number; description: string }; action: HetznerAction }> {
  return hetznerFetch(`/servers/${id}/actions/create_image`, {
    method: "POST",
    body: JSON.stringify(opts),
  });
}

/** Get a VNC console websocket URL (for browser-based console access). */
export async function requestServerConsole(id: number): Promise<{
  wss_url: string;
  password: string;
  action: HetznerAction;
}> {
  return hetznerFetch(`/servers/${id}/actions/request_console`, { method: "POST" });
}

/** Enable Hetzner Rescue Mode (boots into minimal Linux for recovery). */
export async function enableRescueMode(
  id: number,
  sshKeys?: number[],
): Promise<{ root_password: string; action: HetznerAction }> {
  return hetznerFetch(`/servers/${id}/actions/enable_rescue`, {
    method: "POST",
    body: JSON.stringify({ type: "linux64", ssh_keys: sshKeys ?? [] }),
  });
}

/** Disable rescue mode. */
export async function disableRescueMode(id: number): Promise<HetznerAction> {
  const data = await hetznerFetch<{ action: HetznerAction }>(
    `/servers/${id}/actions/disable_rescue`,
    { method: "POST" },
  );
  return data.action;
}

/** Set reverse DNS for a server IP. Pass dns_ptr=null to reset. */
export async function changeReverseDns(
  id: number,
  ip: string,
  dnsPtr: string | null,
): Promise<HetznerAction> {
  const data = await hetznerFetch<{ action: HetznerAction }>(
    `/servers/${id}/actions/change_dns_ptr`,
    {
      method: "POST",
      body: JSON.stringify({ ip, dns_ptr: dnsPtr }),
    },
  );
  return data.action;
}

// ── Action Tracking ────────────────────────────────────────────────────

/** List all actions for a server (with optional status filter). */
export async function listServerActions(
  serverId: number,
  opts?: { status?: "running" | "success" | "error"; page?: number; per_page?: number },
): Promise<{ actions: HetznerAction[]; meta: { pagination: { total_entries: number } } }> {
  const params = new URLSearchParams();
  if (opts?.status) params.set("status", opts.status);
  if (opts?.page) params.set("page", String(opts.page));
  if (opts?.per_page) params.set("per_page", String(opts.per_page));
  const qs = params.toString() ? `?${params}` : "";
  return hetznerFetch(`/servers/${serverId}/actions${qs}`);
}

/** Get a specific action by ID (poll for completion). */
export async function getAction(actionId: number): Promise<HetznerAction> {
  const data = await hetznerFetch<{ action: HetznerAction }>(`/actions/${actionId}`);
  return data.action;
}

/**
 * Wait for an action to complete by polling.
 * Returns the finished action or throws on error.
 */
export async function waitForAction(
  actionId: number,
  timeoutMs = 120_000,
  intervalMs = 3_000,
): Promise<HetznerAction> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const action = await getAction(actionId);
    if (action.status === "success") return action;
    if (action.status === "error") {
      throw new Error(`Action ${actionId} failed: ${action.error?.message ?? "unknown"}`);
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(`Action ${actionId} timed out after ${timeoutMs}ms`);
}

// ── Server Metrics ─────────────────────────────────────────────────────

/**
 * Get server metrics (CPU, disk, network).
 * @param type - "cpu", "disk", "network" or comma-separated like "cpu,disk,network"
 * @param start - RFC3339 timestamp
 * @param end - RFC3339 timestamp
 * @param step - Resolution in seconds (optional, auto-adjusted if omitted)
 */
export async function getServerMetrics(
  serverId: number,
  type: string,
  start: string,
  end: string,
  step?: number,
): Promise<HetznerMetrics> {
  const params = new URLSearchParams({ type, start, end });
  if (step) params.set("step", String(step));
  const data = await hetznerFetch<{ metrics: HetznerMetrics }>(
    `/servers/${serverId}/metrics?${params}`,
  );
  return data.metrics;
}

// ── Pricing ────────────────────────────────────────────────────────────

/** Get all prices (server types with hourly/monthly + traffic costs). */
export async function getPricing(): Promise<HetznerPricing> {
  const data = await hetznerFetch<{ pricing: HetznerPricing }>("/pricing");
  return data.pricing;
}

// ── Firewalls ──────────────────────────────────────────────────────────

export async function createFirewall(opts: {
  name: string;
  labels?: Record<string, string>;
  rules: {
    direction: "in" | "out";
    protocol: "tcp" | "udp" | "icmp";
    port?: string;
    source_ips?: string[];
    destination_ips?: string[];
  }[];
  apply_to?: { type: "server"; server: { id: number } }[];
}): Promise<HetznerFirewall> {
  const data = await hetznerFetch<{ firewall: HetznerFirewall }>("/firewalls", {
    method: "POST",
    body: JSON.stringify(opts),
  });
  return data.firewall;
}

export async function getFirewall(id: number): Promise<HetznerFirewall> {
  const data = await hetznerFetch<{ firewall: HetznerFirewall }>(`/firewalls/${id}`);
  return data.firewall;
}

export async function listFirewalls(labelSelector?: string): Promise<HetznerFirewall[]> {
  const qs = labelSelector ? `?label_selector=${encodeURIComponent(labelSelector)}` : "";
  const data = await hetznerFetch<{ firewalls: HetznerFirewall[] }>(`/firewalls${qs}`);
  return data.firewalls;
}

export async function deleteFirewall(id: number): Promise<void> {
  await hetznerFetch(`/firewalls/${id}`, { method: "DELETE" });
}

export async function setFirewallRules(
  id: number,
  rules: {
    direction: "in" | "out";
    protocol: "tcp" | "udp" | "icmp";
    port?: string;
    source_ips?: string[];
    destination_ips?: string[];
  }[],
): Promise<HetznerAction[]> {
  const data = await hetznerFetch<{ actions: HetznerAction[] }>(
    `/firewalls/${id}/actions/set_rules`,
    {
      method: "POST",
      body: JSON.stringify({ rules }),
    },
  );
  return data.actions;
}

export async function applyFirewallToResources(
  id: number,
  resources: { type: "server"; server: { id: number } }[],
): Promise<HetznerAction[]> {
  const data = await hetznerFetch<{ actions: HetznerAction[] }>(
    `/firewalls/${id}/actions/apply_to_resources`,
    {
      method: "POST",
      body: JSON.stringify({ apply_to: resources }),
    },
  );
  return data.actions;
}

export async function removeFirewallFromResources(
  id: number,
  resources: { type: "server"; server: { id: number } }[],
): Promise<HetznerAction[]> {
  const data = await hetznerFetch<{ actions: HetznerAction[] }>(
    `/firewalls/${id}/actions/remove_from_resources`,
    {
      method: "POST",
      body: JSON.stringify({ remove_from: resources }),
    },
  );
  return data.actions;
}
