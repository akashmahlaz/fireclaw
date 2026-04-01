/**
 * Cloudflare DNS API client for managing agent subdomains.
 *
 * Each deployed agent gets `<slug>.fireclaw.ai` pointing to its VPS IP.
 *
 * Docs: https://developers.cloudflare.com/api/operations/dns-records-for-a-zone-create-dns-record
 *
 * Required env:
 *   CLOUDFLARE_API_TOKEN — scoped to Zone:DNS:Edit
 *   CLOUDFLARE_ZONE_ID   — zone ID for the base domain
 *   AGENT_BASE_DOMAIN    — e.g. "fireclaw.ai"
 */

const CF_BASE = "https://api.cloudflare.com/client/v4";

function headers() {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!token) throw new Error("Missing CLOUDFLARE_API_TOKEN");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  } as const;
}

function zoneId() {
  const id = process.env.CLOUDFLARE_ZONE_ID;
  if (!id) throw new Error("Missing CLOUDFLARE_ZONE_ID");
  return id;
}

function baseDomain() {
  return process.env.AGENT_BASE_DOMAIN ?? "fireclaw.ai";
}

interface CFResult<T> {
  success: boolean;
  errors: { code: number; message: string }[];
  result: T;
}

interface DNSRecord {
  id: string;
  type: string;
  name: string;
  content: string;
  proxied: boolean;
  ttl: number;
}

/**
 * Create an A record: `<subdomain>.fireclaw.ai → <ip>`
 *
 * Proxied = false so traffic goes direct to the VPS
 * (Cloudflare proxy doesn't support arbitrary ports well).
 * TTL = 60s for fast propagation.
 */
export async function createDNSRecord(
  subdomain: string,
  ip: string
): Promise<DNSRecord> {
  const fqdn = `${subdomain}.${baseDomain()}`;
  console.log(`[cloudflare] Creating A record: ${fqdn} → ${ip} (zone=${zoneId()}, proxied=false, ttl=60)`);

  const res = await fetch(`${CF_BASE}/zones/${zoneId()}/dns_records`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      type: "A",
      name: fqdn,
      content: ip,
      ttl: 60,
      proxied: false,
    }),
  });

  const data: CFResult<DNSRecord> = await res.json();

  if (!data.success) {
    console.error(`[cloudflare] DNS create FAILED:`, data.errors);
    throw new Error(
      `Cloudflare DNS error: ${data.errors.map((e) => e.message).join(", ")}`
    );
  }

  console.log(`[cloudflare] DNS record created: id=${data.result.id}, ${data.result.name} → ${data.result.content}`);
  return data.result;
}

/**
 * Delete a DNS record by its Cloudflare record ID.
 */
export async function deleteDNSRecord(recordId: string): Promise<void> {
  const res = await fetch(
    `${CF_BASE}/zones/${zoneId()}/dns_records/${recordId}`,
    {
      method: "DELETE",
      headers: headers(),
    }
  );

  const data: CFResult<{ id: string }> = await res.json();

  if (!data.success) {
    throw new Error(
      `Cloudflare DNS delete error: ${data.errors.map((e) => e.message).join(", ")}`
    );
  }
}

/**
 * List DNS records matching a name pattern (for cleanup).
 */
export async function listDNSRecords(
  name?: string
): Promise<DNSRecord[]> {
  const params = new URLSearchParams({ type: "A", per_page: "100" });
  if (name) params.set("name", name);

  const res = await fetch(
    `${CF_BASE}/zones/${zoneId()}/dns_records?${params}`,
    { headers: headers() }
  );

  const data: CFResult<DNSRecord[]> = await res.json();

  if (!data.success) {
    throw new Error(
      `Cloudflare DNS list error: ${data.errors.map((e) => e.message).join(", ")}`
    );
  }

  return data.result;
}

/**
 * Generate a unique subdomain slug for an agent.
 * Format: `<name-slug>-<short-id>`
 * e.g. "my-bot-a1b2c3"
 */
export function generateSubdomain(agentName: string, agentId: string): string {
  const slug = agentName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 20);

  const shortId = agentId.slice(-6);
  return `${slug}-${shortId}`;
}
