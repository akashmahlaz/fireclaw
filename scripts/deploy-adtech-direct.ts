/**
 * Direct deploy for adtech-crawler — no MongoDB required.
 * Calls Hetzner + Cloudflare directly.
 * Usage: bunx tsx scripts/deploy-adtech-direct.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { readFileSync } from "fs";
import { join } from "path";
import { randomBytes } from "crypto";

config({ path: resolve(__dirname, "../.env.local") });

const HETZNER_TOKEN = process.env.HETZNER_API_TOKEN!;
const CF_TOKEN = process.env.CLOUDFLARE_API_TOKEN!;
const CF_ZONE = process.env.CLOUDFLARE_ZONE_ID!;
const BASE_DOMAIN = (process.env.AGENT_BASE_DOMAIN ?? "fireclaw.in").trim();
const MINIMAX_KEY = "4hMbbAfQfaIFJCrX1V6i1HoLuqBi_-L7Sj_W_n17cMx42LjLUjw";

function gatewayToken() {
  return randomBytes(24).toString("hex");
}

function escapeHeredoc(content: string, delim: string): string {
  // If content contains the delimiter, it will break heredoc — warn
  if (content.includes(delim)) {
    console.warn(`⚠️  Content for heredoc contains delimiter ${delim} — replacing`);
    content = content.replace(new RegExp(delim, "g"), `_${delim}_`);
  }
  return content;
}

async function buildCloudInit(domain: string, token: string): Promise<string> {
  // Load workspace files from config/agents/adtech-crawler/
  const wsFiles: Record<string, string> = {};
  const wsDir = join(__dirname, "../config/agents/adtech-crawler");
  const { readdirSync } = require("fs");
  try {
    for (const f of readdirSync(wsDir)) {
      if (f.endsWith(".md")) {
        let c = readFileSync(join(wsDir, f), "utf-8").trim();
        c = c.replaceAll("{{BUSINESS_NAME}}", "bematterfull-adtech");
        wsFiles[f] = c;
      }
    }
  } catch {}

  // Load system prompt
  let systemPrompt = "";
  try {
    systemPrompt = readFileSync(join(__dirname, "../config/agents/adtech-crawler.md"), "utf-8")
      .trim()
      .replaceAll("{{BUSINESS_NAME}}", "bematterfull-adtech");
  } catch {}

  const image = "ghcr.io/akashmahlaz/openclaw:fireclaw-latest";
  const compose = `services:
  openclaw-gateway:
    image: ${image}
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
      - MINIMAX_API_KEY=\${MINIMAX_API_KEY:-}
      - MINIMAX_CODE_PLAN_KEY=\${MINIMAX_CODE_PLAN_KEY:-}
    command: ["node","openclaw.mjs","gateway","--bind","lan","--port","18789","--allow-unconfigured"]
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
  caddy-config:`;

  const caddyfile = `${domain} {
  reverse_proxy openclaw-gateway:18789 {
    header_up X-Forwarded-Proto {scheme}
    header_up X-Real-IP {remote_host}
  }
}`;

  const openclawConfig = {
    gateway: {
      auth: { token },
      bind: "lan",
      port: 18789,
      trustedProxies: ["172.16.0.0/12", "10.0.0.0/8", "127.0.0.1"],
      controlUi: {
        allowedOrigins: [`https://${domain}`],
        dangerouslyDisableDeviceAuth: true,
      },
    },
    agents: {
      defaults: {
        systemPrompt,
        model: "minimax/MiniMax-M2.7",
        fallbackModels: ["minimax/MiniMax-M2.7-highspeed"],
      },
    },
    models: {
      providers: {
        minimax: { apiKey: MINIMAX_KEY, baseUrl: "https://api.minimax.io/anthropic" },
      },
    },
  };

  const wsFilesScript = Object.entries(wsFiles)
    .map(([fname, content]) => {
      const d = `WSEOF_${fname.replace(/[^A-Z0-9]/gi, "_").toUpperCase()}`;
      return `cat > /root/.openclaw/workspace/${fname} << '${d}'\n${escapeHeredoc(content, d)}\n${d}\nchown 1000:1000 /root/.openclaw/workspace/${fname}`;
    })
    .join("\n\n");

  return `#!/bin/bash
set -uo pipefail
report() { true; }
report "☁️ Cloud-init started" "pending"

# Install Docker
apt-get update -qq
apt-get install -y -qq ca-certificates curl gnupg
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" > /etc/apt/sources.list.d/docker.list
apt-get update -qq
apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
report "🐳 Docker installed" "ok"

mkdir -p /opt/openclaw
cd /opt/openclaw

mkdir -p /root/.openclaw/workspace
mkdir -p /root/.openclaw/workspace/memory
chown -R 1000:1000 /root/.openclaw

${wsFilesScript}

cat > /root/.openclaw/openclaw.json << 'CONFIGEOF'
${JSON.stringify(openclawConfig, null, 2)}
CONFIGEOF
chown 1000:1000 /root/.openclaw/openclaw.json
report "⚙️ OpenClaw config written" "ok"

cat > docker-compose.yml << 'COMPOSE_EOF'
${compose}
COMPOSE_EOF

cat > Caddyfile << 'CADDY_EOF'
${caddyfile}
CADDY_EOF

cat > .env << 'ENV_EOF'
OPENCLAW_GATEWAY_TOKEN=${token}
MINIMAX_API_KEY=${MINIMAX_KEY}
MINIMAX_CODE_PLAN_KEY=${MINIMAX_KEY}
ENV_EOF
chmod 600 .env
report "📄 Config files written" "ok"

cat > /opt/openclaw/setup.sh << 'SETUP_SCRIPT'
#!/bin/bash
set -uo pipefail
cd /opt/openclaw
for i in 1 2 3; do
  docker compose pull && break || sleep 10
done
docker compose up -d
for i in $(seq 1 30); do
  curl -fsS http://127.0.0.1:18789/healthz >/dev/null 2>&1 && echo "✅ Gateway healthy" && exit 0
  sleep 10
done
echo "⚠️ Gateway did not respond in time"
SETUP_SCRIPT
chmod +x /opt/openclaw/setup.sh

cat > /etc/systemd/system/openclaw-setup.service << 'SYSTEMD_EOF'
[Unit]
Description=OpenClaw Docker Setup
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
ExecStart=/opt/openclaw/setup.sh
StandardOutput=journal
StandardError=journal
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
SYSTEMD_EOF

systemctl daemon-reload
systemctl enable openclaw-setup.service
systemctl start openclaw-setup.service &
report "🚀 Setup service started" "ok"
`;
}

async function hetzner(path: string, method = "GET", body?: unknown) {
  const res = await fetch(`https://api.hetzner.cloud/v1${path}`, {
    method,
    headers: { Authorization: `Bearer ${HETZNER_TOKEN}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`Hetzner ${method} ${path} → ${res.status}: ${await res.text()}`);
  return res.json() as any;
}

async function cfDNS(ip: string, subdomain: string) {
  const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${CF_ZONE}/dns_records`, {
    method: "POST",
    headers: { Authorization: `Bearer ${CF_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ type: "A", name: subdomain, content: ip, ttl: 60, proxied: false }),
  });
  const data = await res.json() as any;
  if (!data.success) throw new Error(`CF DNS error: ${JSON.stringify(data.errors)}`);
  return data.result.id as string;
}

async function main() {
  console.log("=== FireClaw AdTech Crawler — Direct Deploy ===\n");

  if (!HETZNER_TOKEN || !CF_TOKEN || !CF_ZONE) {
    console.error("❌ Missing env vars"); process.exit(1);
  }

  const token = gatewayToken();
  const subdomain = `bematterfull-adtech.${BASE_DOMAIN}`;
  const domain = subdomain;

  console.log(`Domain: ${domain}`);
  console.log(`Token:  ${token}`);

  console.log("\n[1/3] Building cloud-init script...");
  const userData = await buildCloudInit(domain, token);
  console.log(`  ✓ Script size: ${userData.length} bytes`);

  console.log("\n[2/3] Creating Hetzner VPS...");
  const server = await hetzner("/servers", "POST", {
    name: `fireclaw-adtech-${Date.now()}`,
    server_type: "cx22",
    location: "fsn1",
    image: "ubuntu-24.04",
    user_data: userData,
    labels: { "fireclaw-template": "adtech-crawler" },
  });
  const serverId = server.server.id;
  const serverIp = server.server.public_net.ipv4.ip;
  console.log(`  ✓ Server ID: ${serverId}`);
  console.log(`  ✓ Server IP: ${serverIp}`);

  console.log("\n[3/3] Creating Cloudflare DNS record...");
  const dnsId = await cfDNS(serverIp, subdomain);
  console.log(`  ✓ DNS record ID: ${dnsId}`);

  console.log("\n✅ DEPLOYMENT SUCCESSFUL");
  console.log("==========================================");
  console.log(`  Dashboard:     https://${domain}`);
  console.log(`  Server IP:     ${serverIp}`);
  console.log(`  Server ID:     ${serverId}`);
  console.log(`  DNS record:    ${dnsId}`);
  console.log(`  Gateway Token: ${token}`);
  console.log("==========================================");
  console.log("\n⏳ Wait 3-5 min for Docker + OpenClaw to start");
  console.log("Then open the dashboard URL above");
}

main().catch((e) => { console.error("❌ Deploy failed:", e); process.exit(1); });
