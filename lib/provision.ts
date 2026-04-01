import { randomBytes } from "crypto";
import { createServer, deleteServer, getServer, rebootServer } from "./hetzner";
import { createDNSRecord, deleteDNSRecord, generateSubdomain } from "./cloudflare";
import { updateAgent, pushProvisionLog } from "./agents";

/** Map tier + location → Hetzner server type.
 *
 * CX  = Cost-Optimized Intel/AMD — EU only (fsn1, hel1, nbg1)
 * CAX = Ampere ARM — EU + US-East (ash)
 * CPX = Shared Intel/AMD — All locations including Singapore (sin)
 *
 * We pick the cheapest family available at each location.
 */
const TIER_SERVER_MAP: Record<string, Record<string, string>> = {
  starter: {
    fsn1: "cx23",   // 2c/4GB/40GB   €4.99
    hel1: "cx23",
    nbg1: "cx23",
    ash:  "cax11",  // 2c/4GB/40GB   €3.99
    hil:  "cpx11",  // 2c/2GB/40GB   €6.99 (only 2GB — closest match)
    sin:  "cpx21",  // 3c/4GB/80GB   €21.99
  },
  standard: {
    fsn1: "cx33",   // 4c/8GB/80GB   €7.99
    hel1: "cx33",
    nbg1: "cx33",
    ash:  "cax21",  // 4c/8GB/80GB   €6.99
    hil:  "cpx31",  // 4c/8GB/160GB  €24.99
    sin:  "cpx31",  // 4c/8GB/160GB  €38.49
  },
  pro: {
    fsn1: "cx43",   // 8c/16GB/160GB €13.99
    hel1: "cx43",
    nbg1: "cx43",
    ash:  "cax31",  // 8c/16GB/160GB €13.49
    hil:  "cpx41",  // 8c/16GB/240GB €46.49
    sin:  "cpx41",  // 8c/16GB/240GB €65.49
  },
  enterprise: {
    fsn1: "cx53",   // 16c/32GB/320GB €26.49
    hel1: "cx53",
    nbg1: "cx53",
    ash:  "cax41",  // 16c/32GB/320GB €26.99
    hil:  "cpx51",  // 16c/32GB/360GB €92.49
    sin:  "cpx51",  // 16c/32GB/360GB €117.99
  },
};

function resolveServerType(tier: string, location: string): string {
  return TIER_SERVER_MAP[tier]?.[location] ?? TIER_SERVER_MAP.starter?.[location] ?? "cx23";
}

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
services:
  openclaw-gateway:
    image: ghcr.io/openclaw/openclaw:latest
    container_name: openclaw-gateway
    restart: unless-stopped
    ports:
      - "127.0.0.1:18789:18789"
    volumes:
      - /root/.openclaw:/home/node/.openclaw
      - /root/.openclaw/workspace:/home/node/.openclaw/workspace
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - HOME=/home/node
      - NODE_ENV=production
      - OPENCLAW_GATEWAY_TOKEN=\${OPENCLAW_GATEWAY_TOKEN}
      - OPENCLAW_GATEWAY_BIND=lan
      - OPENCLAW_GATEWAY_PORT=18789
      - OPENAI_API_KEY=\${OPENAI_API_KEY:-}
      - ANTHROPIC_API_KEY=\${ANTHROPIC_API_KEY:-}
    command: ["node", "dist/index.js", "gateway", "--bind", "lan", "--port", "18789", "--allow-unconfigured"]

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
      - openclaw-gateway

volumes:
  caddy-data:
  caddy-config:
`.trim();

  const caddyfile = `
${opts.domain} {
  reverse_proxy openclaw-gateway:18789
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

# ── Create persistent state directories ─────────────────────────────
mkdir -p /root/.openclaw/workspace
chown -R 1000:1000 /root/.openclaw

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
  // Docs: https://docs.hetzner.com/cloud/general/locations/
  // Valid: fsn1, nbg1, hel1, ash, hil, sin
  const locationMap: Record<string, string> = {
    "eu-central": "fsn1",
    "eu-west": "hel1",
    "us-east": "ash",
    "us-west": "hil",
    "ap-south": "sin",
    "ap-southeast": "sin",
  };
  const location = locationMap[opts.region ?? "eu-central"] ?? "fsn1";
  const serverType = resolveServerType(opts.tier ?? "starter", location);

  console.log(`[provision] Agent ${opts.agentId}: region=${opts.region} → location=${location}, tier=${opts.tier} → serverType=${serverType}`);
  console.log(`[provision] Agent ${opts.agentId}: subdomain=${subdomain}, domain=${domain}`);

  const userData = buildCloudInit({
    gatewayToken,
    domain,
    openaiApiKey: opts.openaiApiKey,
    anthropicApiKey: opts.anthropicApiKey,
  });
  console.log(`[provision] Agent ${opts.agentId}: cloud-init script generated (${userData.length} bytes)`);

  // Log: Starting
  await pushProvisionLog(opts.agentId, "Payment verified — starting provisioning", "ok");

  // 1. Create Hetzner VPS
  console.log(`[provision] Agent ${opts.agentId}: calling Hetzner createServer(name=fireclaw-${opts.agentId}, type=${serverType}, image=ubuntu-24.04, location=${location})`);
  await pushProvisionLog(opts.agentId, `Creating ${serverType} VPS in ${location}`, "pending");
  let server;
  try {
    server = await createServer({
      name: `fireclaw-${opts.agentId}`,
      serverType,
      image: "ubuntu-24.04",
      location,
      userData,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[provision] Agent ${opts.agentId}: Hetzner createServer FAILED:`, msg);
    await pushProvisionLog(opts.agentId, `Hetzner error: ${msg}`, "error");
    throw err;
  }
  const serverIp = server.public_net.ipv4.ip;
  console.log(`[provision] Agent ${opts.agentId}: VPS created — id=${server.id}, ip=${serverIp}, type=${server.server_type.name}, dc=${server.datacenter.name}`);
  await pushProvisionLog(opts.agentId, `VPS online — ${server.server_type.name} in ${server.datacenter.name} (IP: ${serverIp})`, "ok");

  // 2. Create Cloudflare DNS record
  console.log(`[provision] Agent ${opts.agentId}: creating Cloudflare DNS A record: ${subdomain} → ${serverIp}`);
  await pushProvisionLog(opts.agentId, `Creating DNS: ${domain} → ${serverIp}`, "pending");
  let dnsRecord;
  try {
    dnsRecord = await createDNSRecord(subdomain, serverIp);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[provision] Agent ${opts.agentId}: Cloudflare DNS FAILED:`, msg);
    await pushProvisionLog(opts.agentId, `DNS error: ${msg}`, "error");
    throw err;
  }
  console.log(`[provision] Agent ${opts.agentId}: DNS created — recordId=${dnsRecord.id}, ${domain} → ${serverIp}`);
  await pushProvisionLog(opts.agentId, `DNS live → ${domain}`, "ok");

  // 3. Update agent record
  console.log(`[provision] Agent ${opts.agentId}: updating agent record with server info`);
  await updateAgent(opts.agentId, opts.userId, {
    serverId: String(server.id),
    serverIp,
    domain,
    dnsRecordId: dnsRecord.id,
    status: "provisioning",
  });
  await pushProvisionLog(opts.agentId, "Agent record updated with server info", "ok");

  // 4. Wait for cloud-init to finish + OpenClaw to come online
  console.log(`[provision] Agent ${opts.agentId}: waiting for cloud-init (Docker + Caddy + OpenClaw)...`);
  await pushProvisionLog(opts.agentId, "Waiting for Docker + OpenClaw install (cloud-init ~2-4 min)", "pending");

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
  agentId: string,
  timeoutMs = 300_000
): Promise<boolean> {
  const start = Date.now();
  let attempt = 0;
  console.log(`[health] Agent ${agentId}: starting health poll at http://${serverIp}/healthz (timeout ${timeoutMs / 1000}s)`);

  while (Date.now() - start < timeoutMs) {
    attempt++;
    const elapsed = Math.round((Date.now() - start) / 1000);
    try {
      const res = await fetch(`http://${serverIp}/healthz`, {
        signal: AbortSignal.timeout(8000),
      });
      console.log(`[health] Agent ${agentId}: attempt #${attempt} (${elapsed}s) → ${res.status} ${res.statusText}`);
      if (res.ok) {
        console.log(`[health] Agent ${agentId}: HEALTHY after ${elapsed}s (${attempt} attempts)`);
        return true;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`[health] Agent ${agentId}: attempt #${attempt} (${elapsed}s) → ${msg}`);
    }

    // Log progress to the user every 30s
    if (attempt % 3 === 0) {
      await pushProvisionLog(agentId, `Still waiting for OpenClaw… (${elapsed}s elapsed)`, "pending");
    }

    await new Promise((r) => setTimeout(r, 10_000));
  }
  console.error(`[health] Agent ${agentId}: TIMED OUT after ${timeoutMs / 1000}s (${attempt} attempts)`);
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
