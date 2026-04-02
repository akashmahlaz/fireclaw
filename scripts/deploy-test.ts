/**
 * Quick deployment test script.
 * Usage: bunx tsx scripts/deploy-test.ts
 *
 * Provisions a real Hetzner VPS with OpenClaw + Caddy.
 */

import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local BEFORE any other imports that read process.env at module scope
config({ path: resolve(__dirname, "../.env.local") });

const TEST_USER_ID = "deploy-test-script";

async function main() {
  // Dynamic imports so env vars are loaded before module-level code like db.ts runs
  const { provisionAgent, waitForHealth } = await import("../lib/provision");
  const { createAgent, updateAgent } = await import("../lib/agents");

  console.log("=== FireClaw Deploy Test ===\n");
  console.log("Env check:");
  console.log("  HETZNER_API_TOKEN:", process.env.HETZNER_API_TOKEN ? "✓ set" : "✗ MISSING");
  console.log("  CLOUDFLARE_API_TOKEN:", process.env.CLOUDFLARE_API_TOKEN ? "✓ set" : "✗ MISSING");
  console.log("  CLOUDFLARE_ZONE_ID:", process.env.CLOUDFLARE_ZONE_ID ? "✓ set" : "✗ MISSING");
  console.log("  AGENT_BASE_DOMAIN:", process.env.AGENT_BASE_DOMAIN || "✗ MISSING");
  console.log("  MONGODB_URI:", process.env.MONGODB_URI ? "✓ set" : "✗ MISSING");
  console.log("  NEXT_PUBLIC_APP_URL:", process.env.NEXT_PUBLIC_APP_URL || "(none)");
  console.log("");

  if (!process.env.HETZNER_API_TOKEN || !process.env.CLOUDFLARE_API_TOKEN || !process.env.MONGODB_URI) {
    console.error("Missing required env vars. Create .env.local with the required values.");
    process.exit(1);
  }

  // 1. Create agent record
  console.log("[1/4] Creating agent record...");
  const agent = await createAgent({
    userId: TEST_USER_ID,
    name: "test-deploy",
    template: "assistant",
    region: "eu-central",
    tier: "starter",
  });
  const agentId = agent._id!.toString();
  console.log(`  Agent ID: ${agentId}`);
  console.log(`  Status: ${agent.status}`);

  // 2. Provision VPS
  console.log("\n[2/4] Provisioning VPS (this takes 2-5 min)...");
  const startTime = Date.now();
  let result;
  try {
    result = await provisionAgent({
      agentId,
      userId: TEST_USER_ID,
      name: "test-deploy",
      region: "eu-central",
      tier: "starter",
    });
  } catch (err) {
    console.error("\n❌ PROVISIONING FAILED:", err);
    await updateAgent(agentId, TEST_USER_ID, { status: "error" });
    process.exit(1);
  }

  const provisionTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n  ✓ VPS created in ${provisionTime}s`);
  console.log(`  Server ID: ${result.serverId}`);
  console.log(`  Server IP: ${result.serverIp}`);
  console.log(`  Domain: ${result.domain}`);
  console.log(`  DNS Record: ${result.dnsRecordId}`);
  console.log(`  Gateway Token: ${result.gatewayToken}`);

  // 3. Wait for health
  console.log("\n[3/4] Waiting for OpenClaw health check (up to 10 min)...");
  const healthy = await waitForHealth(result.domain, agentId, undefined, result.serverIp);

  if (healthy) {
    await updateAgent(agentId, TEST_USER_ID, { status: "running" });
    console.log("\n  ✓ Health check PASSED — OpenClaw is running!");
  } else {
    await updateAgent(agentId, TEST_USER_ID, { status: "error" });
    console.log("\n  ✗ Health check TIMED OUT after 10 min");
    console.log(`  Debug: ssh root@${result.serverIp}`);
    console.log(`  Logs:  docker compose -f /opt/openclaw/docker-compose.yml logs`);
  }

  // 4. Summary
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log("\n=== DEPLOY SUMMARY ===");
  console.log(`  Status: ${healthy ? "✅ RUNNING" : "❌ ERROR (health timeout)"}`);
  console.log(`  Dashboard URL: https://${result.domain}`);
  console.log(`  Gateway Token: ${result.gatewayToken}`);
  console.log(`  Server IP: ${result.serverIp}`);
  console.log(`  Agent ID: ${agentId}`);
  console.log(`  Total time: ${totalTime}s`);
  console.log(`  SSH: ssh root@${result.serverIp}`);

  process.exit(healthy ? 0 : 1);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
