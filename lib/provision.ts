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
  ghcrToken?: string;
}): string {
  const openclawImage = process.env.OPENCLAW_DOCKER_IMAGE || "ghcr.io/akashmahlaz/openclaw:fireclaw-latest";

  const compose = `
services:
  openclaw-gateway:
    image: ${openclawImage}
    container_name: openclaw-gateway
    restart: unless-stopped
    ports:
      - "127.0.0.1:18789:18789"
    volumes:
      - /root/.openclaw:/home/node/.openclaw
      - /root/.openclaw/workspace:/home/node/.openclaw/workspace
      - /var/run/docker.sock:/var/run/docker.sock
    env_file:
      - .env
    environment:
      - HOME=/home/node
      - NODE_ENV=production
      - TERM=xterm-256color
      - OPENCLAW_GATEWAY_TOKEN=\${OPENCLAW_GATEWAY_TOKEN}
      - OPENCLAW_GATEWAY_BIND=lan
      - OPENCLAW_GATEWAY_PORT=18789
      - XDG_CONFIG_HOME=/home/node/.openclaw
      - OPENAI_API_KEY=\${OPENAI_API_KEY:-}
      - ANTHROPIC_API_KEY=\${ANTHROPIC_API_KEY:-}
    command:
      [
        "node",
        "openclaw.mjs",
        "gateway",
        "--bind",
        "lan",
        "--port",
        "18789",
        "--allow-unconfigured",
      ]

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
      openclaw-gateway:
        condition: service_started

volumes:
  caddy-data:
  caddy-config:
`.trim();

  const caddyfile = `
${opts.domain} {
  reverse_proxy openclaw-gateway:18789 {
    header_up X-Forwarded-Proto {scheme}
    header_up X-Real-IP {remote_host}
  }
}
`.trim();

  const envFile = [
    `OPENCLAW_GATEWAY_TOKEN=${opts.gatewayToken}`,
    `OPENAI_API_KEY=${opts.openaiApiKey ?? ""}`,
    `ANTHROPIC_API_KEY=${opts.anthropicApiKey ?? ""}`,
  ].join("\n");

  // Escape the gateway token for JSON embedding
  const gatewayTokenJson = JSON.stringify(opts.gatewayToken);

  // Build the OpenClaw JSON config with AI provider settings
  const aiProviderConfig = opts.openaiApiKey
    ? `,
  "agents": {
    "defaults": {
      "model": "openai/gpt-4o",
      "fallbackModels": ["openai/gpt-4o-mini"]
    }
  },
  "models": {
    "providers": {
      "openai": {
        "apiKey": "${opts.openaiApiKey}"
      }
    }
  }`
    : opts.anthropicApiKey
    ? `,
  "agents": {
    "defaults": {
      "model": "anthropic/claude-sonnet-4-20250514",
      "fallbackModels": ["anthropic/claude-haiku-4-20250414"]
    }
  },
  "models": {
    "providers": {
      "anthropic": {
        "apiKey": "${opts.anthropicApiKey}"
      }
    }
  }`
    : '';

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

  // Docker pull + start is split into a separate systemd service so
  // it survives if cloud-final.service is killed (Hetzner can SIGTERM
  // cloud-init before a ~700 MB image pull finishes).
  return `#!/bin/bash
# Use -uo pipefail but NOT -e: we handle errors manually so failure
# in one step doesn't silently kill the whole cloud-init.
set -uo pipefail
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
if ! command -v docker &>/dev/null; then
  report "❌ Docker install FAILED" "error"
  echo "ERROR: Docker CE installation failed" >&2
  exit 1
fi
report "🐳 Docker CE + Compose installed" "ok"

# ── Create OpenClaw directory ───────────────────────────────────────
mkdir -p /opt/openclaw
cd /opt/openclaw

# ── Create persistent state directories ─────────────────────────────
mkdir -p /root/.openclaw/workspace
chown -R 1000:1000 /root/.openclaw

# ── Write initial OpenClaw config ───────────────────────────────────
cat > /root/.openclaw/openclaw.json << CONFIGEOF
{
  "gateway": {
    "auth": {
      "token": ${gatewayTokenJson}
    },
    "bind": "lan",
    "port": 18789,
    "trustedProxies": ["172.16.0.0/12", "10.0.0.0/8", "127.0.0.1"],
    "controlUi": {
      "allowedOrigins": ["https://${opts.domain}"],
      "dangerouslyDisableDeviceAuth": true
    }
  }${aiProviderConfig}
}
CONFIGEOF
chown 1000:1000 /root/.openclaw/openclaw.json
report "⚙️ OpenClaw config written" "ok"

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

# ── Setup script (runs in its own systemd service) ──────────────────
# This is decoupled from cloud-init so it survives cloud-final.service
# being killed by systemd during a long docker image pull.
cat > /opt/openclaw/setup.sh << 'SETUP_SCRIPT'
#!/bin/bash
set -uo pipefail

# ── Webhook helper (duplicated here since we run in a separate unit) 
WEBHOOK_URL="${opts.webhookUrl ?? ""}"
WEBHOOK_SECRET="${opts.webhookSecret ?? ""}"
report() {
  [ -z "\$WEBHOOK_URL" ] && return 0
  local step="\$1"
  local status="\${2:-ok}"
  curl -sf -X POST "\$WEBHOOK_URL" \\
    -H "Content-Type: application/json" \\
    -d "{\\"secret\\":\\"\$WEBHOOK_SECRET\\",\\"step\\":\\"\$step\\",\\"status\\":\\"\$status\\"}" \\
    --max-time 5 || true
}

cd /opt/openclaw

# ── Login to GHCR if token provided ────────────────────────────────
${opts.ghcrToken ? `echo "${opts.ghcrToken}" | docker login ghcr.io -u akashmahlaz --password-stdin && report "🔑 GHCR login OK" "ok" || { report "❌ GHCR login failed" "error"; exit 1; }` : "# No GHCR token — assuming public image"}

# ── Pull images with retry ──────────────────────────────────────────
report "⬇️ Pulling Docker images (openclaw + caddy)…" "pending"
pull_ok=false
for attempt in 1 2 3; do
  if docker compose pull 2>&1; then
    pull_ok=true
    break
  fi
  report "⬇️ Image pull attempt \$attempt failed — retrying in 10s…" "pending"
  sleep 10
done
if [ "\$pull_ok" = false ]; then
  report "❌ Docker image pull FAILED after 3 attempts" "error"
  echo "ERROR: docker compose pull failed" >&2
  exit 1
fi
report "⬇️ Docker images pulled" "ok"

# ── Start containers ────────────────────────────────────────────────
report "🚀 Starting containers…" "pending"
docker compose up -d
report "🚀 Docker containers started (openclaw + caddy)" "ok"

# ── Wait for gateway to become healthy ──────────────────────────────
report "⏳ Waiting for OpenClaw Gateway to respond…" "pending"
for i in \$(seq 1 30); do
  if curl -fsS http://127.0.0.1:18789/healthz >/dev/null 2>&1; then
    report "🩺 Gateway health check passed" "ok"
    break
  fi
  sleep 5
done

# ── Firewall: allow SSH + HTTP + HTTPS only ─────────────────────────
apt-get install -y ufw
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
report "🔒 Firewall configured (SSH + HTTP + HTTPS)" "ok"

report "✅ Setup complete — agent is online" "ok"
echo "FireClaw setup complete"
SETUP_SCRIPT
chmod +x /opt/openclaw/setup.sh

# ── Systemd service for the heavy Docker pull + start ───────────────
cat > /etc/systemd/system/fireclaw-setup.service << 'UNIT_EOF'
[Unit]
Description=FireClaw Agent Setup (Docker pull + start)
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
TimeoutStartSec=900
ExecStart=/opt/openclaw/setup.sh
StandardOutput=journal+console
StandardError=journal+console

[Install]
WantedBy=multi-user.target
UNIT_EOF

systemctl daemon-reload
systemctl enable fireclaw-setup.service
# Start async so cloud-init can exit immediately
systemctl start fireclaw-setup.service --no-block

report "☁️ Cloud-init done — Docker setup running in background" "ok"
echo "FireClaw cloud-init complete (setup service started)"
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
    ghcrToken: process.env.GHCR_TOKEN || undefined,
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
  timeoutMs = 600_000,
  serverIp?: string,
): Promise<boolean> {
  const start = Date.now();
  let attempt = 0;
  // Try HTTPS first (Caddy auto-TLS), fall back to HTTP
  const urls = [
    `https://${domain}/healthz`,
    `http://${domain}/healthz`,
  ];
  // IP-based fallback: hit Caddy on port 80 via raw IP (needs Host header)
  const ipFallbackUrl = serverIp ? `http://${serverIp}/healthz` : null;
  console.log(`[health] Agent ${agentId}: starting health poll at ${urls[0]} (timeout ${timeoutMs / 1000}s)${ipFallbackUrl ? ` (IP fallback: ${ipFallbackUrl})` : ""}`);

  while (Date.now() - start < timeoutMs) {
    attempt++;
    const elapsed = Math.round((Date.now() - start) / 1000);

    // Try domain-based URLs first
    let domainFailed = true;
    for (const url of urls) {
      try {
        const res = await fetch(url, {
          signal: AbortSignal.timeout(8000),
          redirect: "manual",
        });
        console.log(`[health] Agent ${agentId}: attempt #${attempt} (${elapsed}s) ${url} → ${res.status} ${res.statusText}`);
        domainFailed = false;
        if (res.ok || res.status === 301 || res.status === 302) {
          if (res.status === 301 || res.status === 302) {
            try {
              const httpsRes = await fetch(urls[0], { signal: AbortSignal.timeout(8000) });
              if (httpsRes.ok) {
                console.log(`[health] Agent ${agentId}: HEALTHY (HTTPS confirmed) after ${elapsed}s (${attempt} attempts)`);
                return true;
              }
            } catch {
              console.log(`[health] Agent ${agentId}: Caddy responding but OpenClaw not yet ready`);
            }
          } else {
            console.log(`[health] Agent ${agentId}: HEALTHY after ${elapsed}s (${attempt} attempts)`);
            return true;
          }
        }
        break;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
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
        if (url === urls[0]) {
          console.log(`[health] Agent ${agentId}: attempt #${attempt} (${elapsed}s) → ${reason} (${msg})`);
        }
      }
    }

    // If domain-based URLs all failed (DNS issue), try IP-based fallback via Caddy port 80
    if (domainFailed && ipFallbackUrl) {
      try {
        const res = await fetch(ipFallbackUrl, {
          signal: AbortSignal.timeout(8000),
          headers: { Host: domain },
          redirect: "manual",
        });
        console.log(`[health] Agent ${agentId}: IP fallback attempt #${attempt} (${elapsed}s) → ${res.status} ${res.statusText}`);
        if (res.ok) {
          console.log(`[health] Agent ${agentId}: HEALTHY (via IP fallback) after ${elapsed}s (${attempt} attempts)`);
          return true;
        }
        // 308 redirect means Caddy is up but redirecting HTTP→HTTPS
        if (res.status === 301 || res.status === 302 || res.status === 308) {
          console.log(`[health] Agent ${agentId}: Caddy responding via IP (redirect ${res.status}) — marking healthy`);
          return true;
        }
      } catch (ipErr) {
        const ipMsg = ipErr instanceof Error ? ipErr.message : String(ipErr);
        // Only log IP fallback failures at debug level
        if (attempt <= 3 || attempt % 6 === 0) {
          console.log(`[health] Agent ${agentId}: IP fallback attempt #${attempt} (${elapsed}s) → ${ipMsg}`);
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
  try {
    await deleteServer(id);
  } catch (err) {
    // If the server is already gone on Hetzner (404), that's fine — skip
    if (err instanceof Error && err.message.includes("404")) {
      console.log(`[provision] Server ${id} already deleted on Hetzner — skipping`);
    } else {
      throw err;
    }
  }
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
