/**
 * Hetzner Cloud API client for server provisioning.
 *
 * Docs: https://docs.hetzner.cloud/
 * Base URL: https://api.hetzner.cloud/v1
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
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { ...headers(), ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Hetzner API error ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

// ── Types ──────────────────────────────────────────────────────────────

export interface HetznerServer {
  id: number;
  name: string;
  status: string;
  public_net: {
    ipv4: { ip: string };
    ipv6: { ip: string };
  };
  server_type: { name: string };
  datacenter: { name: string };
  created: string;
}

interface CreateServerResponse {
  server: HetznerServer;
  action: { id: number; status: string };
}

interface ListServersResponse {
  servers: HetznerServer[];
}

// ── API ────────────────────────────────────────────────────────────────

export async function createServer(opts: {
  name: string;
  serverType?: string;
  image?: string;
  location?: string;
  userData?: string;
}): Promise<HetznerServer> {
  const body = {
    name: opts.name,
    server_type: opts.serverType ?? "cpx22",
    image: opts.image ?? "ubuntu-24.04",
    location: opts.location ?? "fsn1",
    user_data: opts.userData,
    start_after_create: true,
  };
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

export async function listServers(): Promise<HetznerServer[]> {
  const data = await hetznerFetch<ListServersResponse>("/servers");
  return data.servers;
}

export async function deleteServer(id: number): Promise<void> {
  await hetznerFetch(`/servers/${id}`, { method: "DELETE" });
}

export async function powerOnServer(id: number): Promise<void> {
  await hetznerFetch(`/servers/${id}/actions/poweron`, { method: "POST" });
}

export async function powerOffServer(id: number): Promise<void> {
  await hetznerFetch(`/servers/${id}/actions/poweroff`, { method: "POST" });
}

export async function rebootServer(id: number): Promise<void> {
  await hetznerFetch(`/servers/${id}/actions/reboot`, { method: "POST" });
}
