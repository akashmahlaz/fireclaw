import { randomBytes } from "crypto";
import { deleteServer, rebootServer, shutdownServer, getServer, changeServerProtection, updateServer } from "./hetzner";
import { createDNSRecord, deleteDNSRecord, generateSubdomain } from "./cloudflare";
import { updateAgent, pushProvisionLog } from "./agents";
import { getProvider } from "./providers";

/**
 * Generates a cloud-init script that provisions a VPS with:
 * 1. Docker CE + Docker Compose
 * 2. Caddy reverse proxy (auto-HTTPS via Let's Encrypt)
 * 3. OpenClaw running on :18789 (proxied through Caddy)
 */
function buildCloudInit(opts: {
  gatewayToken: string;
  domain: string;
  webhookUrl?: string;
  webhookSecret?: string;
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

  // Build a webhook helper function for the bash script
  const webhookFn = opts.webhookUrl && opts.webhookSecret
    ? `
# ── Webhook helper to report progress ──────────────────────────────
WEBHOOK_URL="${opts.webhookUrl}"
WEBHOOK_SECRET="${opts.webhookSecret}"
report() {
  local step="\$1"
  local status="\${2:-ok}"
  curl -sf -X POST "\$WEBHOOK_URL" \\
    -H "Content-Type: application/json" \\
    -d "{\\"secret\\":\\"\$WEBHOOK_SECRET\\",\\"step\\":\\"\$step\\",\\"status\\":\\"\$status\\"}" \\
    --max-time 5 || true
}
`
    : `
report() { true; }
`;

  return `#!/bin/bash
set -euo pipefail
${webhookFn}
report "☁️ Cloud-init started — installing dependencies" "pending"

# ── Install Docker CE ───────────────────────────────────────────────
apt-get update -y
apt-get install -y ca-certificates curl gnupg
report "📦 apt packages installed (ca-certificates, curl, gnupg)" "ok"

install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list
apt-get update -y
report "🔧 Docker repo configured" "ok"

apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
report "🐳 Docker CE + Compose installed" "ok"

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
report "📄 Config files written (Compose, Caddy, .env)" "ok"

# ── Pull and start ──────────────────────────────────────────────────
report "⬇️ Pulling Docker images (openclaw + caddy)…" "pending"
docker compose pull
report "⬇️ Docker images pulled" "ok"

report "🚀 Starting containers…" "pending"
docker compose up -d
report "🚀 Docker containers started (openclaw + caddy)" "ok"

# ── Firewall: allow SSH + HTTP + HTTPS only ─────────────────────────
apt-get install -y ufw
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
report "🔒 Firewall configured (SSH + HTTP + HTTPS)" "ok"

report "✅ Cloud-init complete — waiting for health check" "ok"
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

  // Save gatewayToken early so the cloud-init webhook can authenticate
  await updateAgent(opts.agentId, opts.userId, { gatewayToken });

  // Map regions to Hetzner locations
  // Docs: https://docs.hetzner.com/cloud/general/locations/
  // Valid: fsn1, nbg1, hel1, ash, hil, sin
  const VALID_LOCATIONS = new Set(["fsn1", "nbg1", "hel1", "ash", "hil", "sin"]);
  const locationMap: Record<string, string> = {
    "eu-central": "fsn1",
    "eu-west": "hel1",
    "us-east": "ash",
    "us-west": "hil",
    "ap-south": "sin",
    "ap-southeast": "sin",
  };
  // Accept either a location ID directly (e.g. "fsn1") or a region name (e.g. "eu-central")
  const regionOrLoc = opts.region ?? "eu-central";
  const location = VALID_LOCATIONS.has(regionOrLoc)
    ? regionOrLoc
    : (locationMap[regionOrLoc] ?? "fsn1");
  const tier = opts.tier ?? "starter";

  console.log(`[provision] Agent ${opts.agentId}: region=${opts.region} → location=${location}, tier=${tier}`);
  console.log(`[provision] Agent ${opts.agentId}: subdomain=${subdomain}, domain=${domain}`);

  // Build webhook URL so cloud-init can report progress back
  // Only set webhook if we have a public URL — VPS can't reach localhost
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  const webhookUrl = appUrl ? `${appUrl}/api/agents/${opts.agentId}/webhook` : undefined;
  
  if (!webhookUrl) {
    console.log(`[provision] Agent ${opts.agentId}: no NEXT_PUBLIC_APP_URL set — cloud-init progress webhook disabled`);
  }

  const userData = buildCloudInit({
    gatewayToken,
    domain,
    webhookUrl: webhookUrl || undefined,
    webhookSecret: webhookUrl ? gatewayToken : undefined,
    openaiApiKey: opts.openaiApiKey,
    anthropicApiKey: opts.anthropicApiKey,
  });
  console.log(`[provision] Agent ${opts.agentId}: cloud-init script generated (${userData.length} bytes)`);

  // Log: Starting
  await pushProvisionLog(opts.agentId, "Payment verified — starting provisioning", "ok");

  // 1. Create VPS via provider (handles fallback chain internally)
  await pushProvisionLog(opts.agentId, `Creating VPS in ${location} (${tier} tier)`, "pending");
  let provisionResult;
  try {
    const provider = getProvider("hetzner");
    provisionResult = await provider.provision({
      name: `fireclaw-${opts.agentId}`,
      location,
      tier,
      userData,
      labels: {
        "fireclaw-agent": opts.agentId,
        "fireclaw-user": opts.userId,
        "fireclaw-tier": tier,
      },
      onLog: (step, status) => pushProvisionLog(opts.agentId, step, status),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[provision] Agent ${opts.agentId}: VPS creation FAILED:`, msg);
    await pushProvisionLog(opts.agentId, `Server error: ${msg}`, "error");
    throw err;
  }
  const { serverId, serverIp, serverType, datacenter } = provisionResult;
  console.log(`[provision] Agent ${opts.agentId}: VPS created — type=${serverType}, id=${serverId}, ip=${serverIp}, dc=${datacenter}`);
  await pushProvisionLog(opts.agentId, `VPS online — ${serverType} in ${datacenter} (IP: ${serverIp})`, "ok");

  // Enable delete protection so servers aren't accidentally destroyed
  try {
    await changeServerProtection(Number(serverId), { delete: true, rebuild: true });
    console.log(`[provision] Agent ${opts.agentId}: delete+rebuild protection enabled`);
  } catch (err) {
    // Non-fatal — log and continue
    console.warn(`[provision] Agent ${opts.agentId}: failed to enable protection:`, err);
  }

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
    serverId,
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
    serverId,
    serverIp,
    domain,
    dnsRecordId: dnsRecord.id,
    gatewayToken,
  };
}

/**
 * Poll the VPS until OpenClaw comes online.
 * We check via the domain (not raw IP) because Caddy only
 * serves requests matching the configured domain name.
 * Returns true if healthy, false if timed out.
 */
export async function waitForHealth(
  domain: string,
  agentId: string,
  timeoutMs = 300_000
): Promise<boolean> {
  const start = Date.now();
  let attempt = 0;
  // Try HTTPS first (Caddy auto-TLS), fall back to HTTP
  const urls = [
    `https://${domain}/healthz`,
    `http://${domain}/healthz`,
  ];
  console.log(`[health] Agent ${agentId}: starting health poll at ${urls[0]} (timeout ${timeoutMs / 1000}s)`);

  while (Date.now() - start < timeoutMs) {
    attempt++;
    const elapsed = Math.round((Date.now() - start) / 1000);

    for (const url of urls) {
      try {
        const res = await fetch(url, {
          signal: AbortSignal.timeout(8000),
          // Don't follow redirects — a 301/302 from Caddy means it's alive
          redirect: "manual",
        });
        console.log(`[health] Agent ${agentId}: attempt #${attempt} (${elapsed}s) ${url} → ${res.status} ${res.statusText}`);
        // 200 = OpenClaw responding, 301/302 = Caddy alive (HTTP→HTTPS redirect)
        if (res.ok || res.status === 301 || res.status === 302) {
          // If we got a redirect, do one final check on HTTPS to confirm OpenClaw is up
          if (res.status === 301 || res.status === 302) {
            try {
              const httpsRes = await fetch(urls[0], { signal: AbortSignal.timeout(8000) });
              if (httpsRes.ok) {
                console.log(`[health] Agent ${agentId}: HEALTHY (HTTPS confirmed) after ${elapsed}s (${attempt} attempts)`);
                return true;
              }
            } catch {
              // HTTPS not ready yet, but Caddy is up — wait a bit more
              console.log(`[health] Agent ${agentId}: Caddy responding but OpenClaw not yet ready`);
            }
          } else {
            console.log(`[health] Agent ${agentId}: HEALTHY after ${elapsed}s (${attempt} attempts)`);
            return true;
          }
        }
        break; // Got a response from this URL, don't try the fallback
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        // Classify the error for better logging
        let reason = "unknown";
        if (msg.includes("ECONNREFUSED") || msg.includes("ECONNRESET")) {
          reason = "connection refused (server booting)";
        } else if (msg.includes("ENOTFOUND") || msg.includes("EAI_AGAIN")) {
          reason = "DNS not resolving yet";
        } else if (msg.includes("ETIMEDOUT") || msg.includes("UND_ERR_CONNECT_TIMEOUT") || msg.includes("timed out")) {
          reason = "connection timed out";
        } else if (msg.includes("CERT") || msg.includes("certificate") || msg.includes("SSL")) {
          reason = "TLS/cert not ready yet";
        } else if (msg.includes("fetch failed")) {
          reason = "no response (VPS still booting)";
        }
        
        // Only log once per attempt (for the first URL)
        if (url === urls[0]) {
          console.log(`[health] Agent ${agentId}: attempt #${attempt} (${elapsed}s) → ${reason} (${msg})`);
        }
      }
    }

    // Log progress to the user every 30s with detail
    if (attempt % 3 === 0) {
      const elapsed2 = Math.round((Date.now() - start) / 1000);
      await pushProvisionLog(agentId, `Still waiting… ${elapsed2}s elapsed (cloud-init installing Docker + pulling images)`, "pending");
    }

    await new Promise((r) => setTimeout(r, 10_000));
  }
  console.error(`[health] Agent ${agentId}: TIMED OUT after ${timeoutMs / 1000}s (${attempt} attempts)`);
  return false;
}

/**
 * Destroy an agent's VPS on Hetzner and clean up DNS.
 * Disables delete protection first, then deletes the server.
 */
export async function destroyAgent(
  serverId: string,
  dnsRecordId?: string
): Promise<void> {
  const id = Number(serverId);
  // Disable protection before deleting
  try {
    await changeServerProtection(id, { delete: false, rebuild: false });
  } catch {
    // May fail if server is already gone — ignore
  }
  await deleteServer(id);
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
