import { randomBytes } from "crypto";
import { createServer, deleteServer, getServer, rebootServer } from "./hetzner";
import { createDNSRecord, deleteDNSRecord, generateSubdomain } from "./cloudflare";
import { updateAgent } from "./agents";

/** Map tier → Hetzner server type */
const TIER_SERVER_MAP: Record<string, string> = {
  starter: "cx22",     // 2 vCPU, 4 GB RAM  — ~€3.49/mo
  standard: "cx32",    // 4 vCPU, 8 GB RAM  — ~€6.49/mo
  pro: "cx42",         // 8 vCPU, 16 GB RAM — ~€14.49/mo
  enterprise: "cx52",  // 16 vCPU, 32 GB RAM— ~€28.49/mo
};

/**
 * Generates a cloud-init script that provisions a VPS with:
 * 1. Docker CE + Docker Compose
 * 2. Caddy reverse proxy (auto-HTTPS via Let's Encrypt)
 * 3. OpenClaw running on :18789 (proxied through Caddy)
 */
function buildCloudInit(opts: {
  gatewayToken: string;
  domain: string;
  openaiApiKey?: string;
  anthropicApiKey?: string;
}): string {
  const compose = `
version: "3.8"
services:
  openclaw:
    image: ghcr.io/openclaw/openclaw:latest
    container_name: openclaw
    restart: unless-stopped
    ports:
      - "127.0.0.1:18789:18789"
    volumes:
      - openclaw-data:/home/node/.openclaw
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - OPENCLAW_GATEWAY_TOKEN=\${OPENCLAW_GATEWAY_TOKEN}
      - OPENCLAW_GATEWAY_BIND=lan
      - OPENCLAW_GATEWAY_MODE=local
      - OPENAI_API_KEY=\${OPENAI_API_KEY:-}
      - ANTHROPIC_API_KEY=\${ANTHROPIC_API_KEY:-}

  caddy:
    image: caddy:2-alpine
    container_name: caddy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy-data:/data
      - caddy-config:/config
    depends_on:
      - openclaw

volumes:
  openclaw-data:
  caddy-data:
  caddy-config:
`.trim();

  const caddyfile = `
${opts.domain} {
  reverse_proxy openclaw:18789
}
`.trim();

  const envFile = [
    `OPENCLAW_GATEWAY_TOKEN=${opts.gatewayToken}`,
    `OPENAI_API_KEY=${opts.openaiApiKey ?? ""}`,
    `ANTHROPIC_API_KEY=${opts.anthropicApiKey ?? ""}`,
  ].join("\n");

  return `#!/bin/bash
set -euo pipefail

# ── Install Docker CE ───────────────────────────────────────────────
apt-get update -y
apt-get install -y ca-certificates curl gnupg
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# ── Create OpenClaw directory ───────────────────────────────────────
mkdir -p /opt/openclaw
cd /opt/openclaw

# ── Write Docker Compose ────────────────────────────────────────────
cat > docker-compose.yml << 'COMPOSE_EOF'
${compose}
COMPOSE_EOF

# ── Write Caddyfile ─────────────────────────────────────────────────
cat > Caddyfile << 'CADDY_EOF'
${caddyfile}
CADDY_EOF

# ── Write environment file ──────────────────────────────────────────
cat > .env << 'ENV_EOF'
${envFile}
ENV_EOF
chmod 600 .env

# ── Pull and start ──────────────────────────────────────────────────
docker compose pull
docker compose up -d

# ── Firewall: allow SSH + HTTP + HTTPS only ─────────────────────────
apt-get install -y ufw
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "FireClaw provisioning complete"
`;
}

/**
 * Generate a secure gateway token for the OpenClaw instance.
 */
export function generateGatewayToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Provision a new Hetzner VPS with OpenClaw + Caddy (HTTPS) + Cloudflare DNS.
 *
 * Flow:
 * 1. Generate subdomain + gateway token
 * 2. Create Hetzner VPS with cloud-init (Docker + Caddy + OpenClaw)
 * 3. Create Cloudflare A record pointing subdomain → VPS IP
 * 4. Update agent record with server info + domain
 */
export async function provisionAgent(opts: {
  agentId: string;
  userId: string;
  name: string;
  region?: string;
  tier?: string;
  openaiApiKey?: string;
  anthropicApiKey?: string;
}): Promise<{
  serverId: string;
  serverIp: string;
  domain: string;
  dnsRecordId: string;
  gatewayToken: string;
}> {
  const gatewayToken = generateGatewayToken();
  const subdomain = generateSubdomain(opts.name, opts.agentId);
  const domain = `${subdomain}.${process.env.AGENT_BASE_DOMAIN ?? "fireclaw.ai"}`;

  // Map regions to Hetzner locations
  const locationMap: Record<string, string> = {
    "eu-central": "fsn1",
    "eu-west": "hel1",
    "us-east": "ash",
    "us-west": "hil",
    "ap-southeast": "sin1",
  };
  const location = locationMap[opts.region ?? "eu-central"] ?? "fsn1";
  const serverType = TIER_SERVER_MAP[opts.tier ?? "starter"] ?? "cx22";

  const userData = buildCloudInit({
    gatewayToken,
    domain,
    openaiApiKey: opts.openaiApiKey,
    anthropicApiKey: opts.anthropicApiKey,
  });

  // 1. Create Hetzner VPS
  const server = await createServer({
    name: `fireclaw-${opts.agentId}`,
    serverType,
    image: "ubuntu-24.04",
    location,
    userData,
  });

  const serverIp = server.public_net.ipv4.ip;

  // 2. Create Cloudflare DNS record
  const dnsRecord = await createDNSRecord(subdomain, serverIp);

  // 3. Update agent record
  await updateAgent(opts.agentId, opts.userId, {
    serverId: String(server.id),
    serverIp,
    domain,
    dnsRecordId: dnsRecord.id,
    status: "provisioning",
  });

  return {
    serverId: String(server.id),
    serverIp,
    domain,
    dnsRecordId: dnsRecord.id,
    gatewayToken,
  };
}

/**
 * Poll the VPS until OpenClaw comes online.
 * Returns true if healthy, false if timed out.
 */
export async function waitForHealth(
  serverIp: string,
  timeoutMs = 180_000
): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`http://${serverIp}:18789/healthz`, {
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) return true;
    } catch {
      // Not ready yet
    }
    await new Promise((r) => setTimeout(r, 10_000));
  }
  return false;
}

/**
 * Destroy an agent's VPS on Hetzner and clean up DNS.
 */
export async function destroyAgent(
  serverId: string,
  dnsRecordId?: string
): Promise<void> {
  await deleteServer(Number(serverId));
  if (dnsRecordId) {
    try {
      await deleteDNSRecord(dnsRecordId);
    } catch (err) {
      console.error(`Failed to delete DNS record ${dnsRecordId}:`, err);
    }
  }
}

/**
 * Reboot an agent's VPS.
 */
export async function rebootAgent(serverId: string): Promise<void> {
  await rebootServer(Number(serverId));
}

/**
 * Get the URL for the OpenClaw Control UI on the VPS.
 */
export function getControlUiUrl(serverIp: string): string {
  return `http://${serverIp}:18789`;
}
