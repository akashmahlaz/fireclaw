import { randomBytes } from "crypto";
import { createServer, deleteServer, getServer, rebootServer } from "./hetzner";
import { updateAgent } from "./agents";

/**
 * Generates a cloud-init script that provisions a VPS with Docker + OpenClaw.
 *
 * After boot the VPS will:
 * 1. Install Docker CE
 * 2. Pull ghcr.io/openclaw/openclaw:latest
 * 3. Run OpenClaw Gateway in a container on port 18789
 * 4. Expose the Control UI for configuring channels and AI models
 */
function buildCloudInit(opts: {
  gatewayToken: string;
  openaiApiKey?: string;
  anthropicApiKey?: string;
}): string {
  // Docker Compose file embedded inline
  const compose = `
version: "3.8"
services:
  openclaw:
    image: ghcr.io/openclaw/openclaw:latest
    container_name: openclaw
    restart: unless-stopped
    ports:
      - "18789:18789"
    volumes:
      - openclaw-data:/home/node/.openclaw
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - OPENCLAW_GATEWAY_TOKEN=\${OPENCLAW_GATEWAY_TOKEN}
      - OPENCLAW_GATEWAY_BIND=lan
      - OPENCLAW_GATEWAY_MODE=local
      - OPENAI_API_KEY=\${OPENAI_API_KEY:-}
      - ANTHROPIC_API_KEY=\${ANTHROPIC_API_KEY:-}
volumes:
  openclaw-data:
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

# ── Write environment file ──────────────────────────────────────────
cat > .env << 'ENV_EOF'
${envFile}
ENV_EOF
chmod 600 .env

# ── Pull and start ──────────────────────────────────────────────────
docker compose pull
docker compose up -d

# ── Wait for health check ───────────────────────────────────────────
for i in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:18789/healthz > /dev/null 2>&1; then
    echo "OpenClaw is healthy"
    break
  fi
  sleep 5
done

# ── Firewall: allow only SSH + OpenClaw port ────────────────────────
apt-get install -y ufw
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 18789/tcp
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
 * Provision a new Hetzner VPS with OpenClaw pre-installed.
 *
 * Returns the server info + gateway token needed to access the Control UI.
 */
export async function provisionAgent(opts: {
  agentId: string;
  userId: string;
  name: string;
  region?: string;
  openaiApiKey?: string;
  anthropicApiKey?: string;
}): Promise<{
  serverId: string;
  serverIp: string;
  gatewayToken: string;
}> {
  const gatewayToken = generateGatewayToken();

  // Map regions to Hetzner locations
  const locationMap: Record<string, string> = {
    "eu-central": "fsn1",
    "eu-west": "hel1",
    "us-east": "ash",
    "us-west": "hil",
    "ap-southeast": "sin1",
  };
  const location = locationMap[opts.region ?? "eu-central"] ?? "fsn1";

  const userData = buildCloudInit({
    gatewayToken,
    openaiApiKey: opts.openaiApiKey,
    anthropicApiKey: opts.anthropicApiKey,
  });

  // Create the Hetzner server
  const server = await createServer({
    name: `fireclaw-${opts.agentId}`,
    serverType: "cx23", // 2 vCPU, 4GB RAM — cheapest at €3.49/mo
    image: "ubuntu-24.04",
    location,
    userData,
  });

  // Update agent record with server info
  await updateAgent(opts.agentId, opts.userId, {
    serverId: String(server.id),
    serverIp: server.public_net.ipv4.ip,
    status: "provisioning",
  });

  return {
    serverId: String(server.id),
    serverIp: server.public_net.ipv4.ip,
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
 * Destroy an agent's VPS on Hetzner.
 */
export async function destroyAgent(serverId: string): Promise<void> {
  await deleteServer(Number(serverId));
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
