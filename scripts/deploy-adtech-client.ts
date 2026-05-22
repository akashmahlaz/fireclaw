/**
 * Deploy adtech-crawler agent for client.
 * Usage: bunx tsx scripts/deploy-adtech-client.ts
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env.local") });

async function main() {
  const { provisionAgent } = await import("../lib/provision");
  const { createAgent } = await import("../lib/agents");

  console.log("=== FireClaw AdTech Crawler Deployment ===\n");
  console.log("Env check:");
  console.log("  HETZNER_API_TOKEN:", process.env.HETZNER_API_TOKEN ? "✓ set" : "✗ MISSING");
  console.log("  CLOUDFLARE_API_TOKEN:", process.env.CLOUDFLARE_API_TOKEN ? "✓ set" : "✗ MISSING");
  console.log("  AGENT_BASE_DOMAIN:", process.env.AGENT_BASE_DOMAIN || "✗ MISSING");
  console.log("  MONGODB_URI:", process.env.MONGODB_URI ? "✓ set" : "✗ MISSING");
  console.log("");

  if (!process.env.HETZNER_API_TOKEN || !process.env.CLOUDFLARE_API_TOKEN || !process.env.MONGODB_URI) {
    console.error("❌ Missing required env vars.");
    process.exit(1);
  }

  const MINIMAX_KEY = process.env.MINIMAX_API_KEY || "4hMbbAfQfaIFJCrX1V6i1HoLuqBi_-L7Sj_W_n17cMx42LjLUjw";

  console.log("[1/3] Creating agent record...");
  const agent = await createAgent({
    userId: "client-adtech-deploy",
    name: "bematterfull-adtech",
    template: "adtech-crawler",
    region: "eu-central",
    tier: "starter",
  });
  const agentId = agent._id!.toString();
  console.log(`  ✓ Agent ID: ${agentId}`);

  console.log("\n[2/3] Provisioning VPS (takes 3-5 min)...");
  let result;
  try {
    result = await provisionAgent({
      agentId,
      userId: "client-adtech-deploy",
      name: "bematterfull-adtech",
      templateId: "adtech-crawler",
      region: "eu-central",
      tier: "starter",
    });
  } catch (err) {
    console.error("❌ Provisioning failed:", err);
    process.exit(1);
  }

  console.log("\n✅ DEPLOYMENT SUCCESSFUL");
  console.log("==========================================");
  console.log(`  Domain:       https://${result.domain}`);
  console.log(`  Server IP:    ${result.serverIp}`);
  console.log(`  Agent ID:     ${agentId}`);
  console.log(`  Gateway Token: ${result.gatewayToken}`);
  console.log("==========================================");
  console.log("\nNext steps:");
  console.log("1. Wait 2-3 min for HTTPS cert to provision");
  console.log("2. Open the dashboard URL above");
  console.log("3. Upload the input list to /root/.openclaw/workspace/input-list.txt via SSH");
  console.log("4. Tell the agent: 'Process input-list.txt in batches of 50'");
}

main().catch(console.error);
