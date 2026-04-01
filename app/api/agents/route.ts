import { auth } from "@/auth";
import { createAgent, getAgentsByUser, updateAgent, pushProvisionLog } from "@/lib/agents";
import { provisionAgent, waitForHealth } from "@/lib/provision";
import { NextRequest } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const agents = await getAgentsByUser(session.user.id);
  return Response.json(agents);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, template, region, tier, apiKey, aiProvider } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return Response.json({ error: "Name is required" }, { status: 400 });
  }

  const allowedTemplates = ["sales", "support", "assistant", "custom"] as const;
  if (!allowedTemplates.includes(template)) {
    return Response.json({ error: "Invalid template" }, { status: 400 });
  }

  const allowedTiers = ["starter", "standard", "pro", "enterprise"] as const;
  const agentTier = allowedTiers.includes(tier) ? tier : "starter";

  const userId = session.user.id;

  const agent = await createAgent({
    userId,
    name: name.trim(),
    template,
    region: region || "eu-central",
    tier: agentTier,
  });

  const agentId = agent._id!.toString();

  // Provision VPS with OpenClaw in the background — don't block the response
  console.log(`[deploy] Agent ${agentId}: starting background provisioning (region=${region || "eu-central"}, tier=${agentTier}, hasApiKey=${!!apiKey})`);
  provisionAgent({
    agentId,
    userId,
    name: name.trim(),
    region: region || "eu-central",
    tier: agentTier,
    openaiApiKey: aiProvider === "anthropic" ? undefined : apiKey || undefined,
    anthropicApiKey: aiProvider === "anthropic" ? apiKey || undefined : undefined,
  })
    .then(async ({ gatewayToken, serverIp, domain }) => {
      console.log(`[deploy] Agent ${agentId}: provision returned — ip=${serverIp}, domain=${domain}`);
      await updateAgent(agentId, userId, { gatewayToken });

      // Wait for OpenClaw to come online (health check)
      await pushProvisionLog(agentId, "Waiting for OpenClaw Gateway to start", "pending");
      const healthy = await waitForHealth(serverIp, agentId);

      if (healthy) {
        await pushProvisionLog(agentId, "Health check passed — OpenClaw Gateway responding", "ok");
        await pushProvisionLog(agentId, `🚀 Live at https://${domain}`, "ok");
        await updateAgent(agentId, userId, { status: "running" });
        console.log(`[deploy] Agent ${agentId}: ✅ RUNNING at https://${domain}`);
      } else {
        await pushProvisionLog(agentId, "Health check timed out (5 min) — server may still be booting", "error");
        await pushProvisionLog(agentId, `Try: ssh root@${serverIp} then docker compose -f /opt/openclaw/docker-compose.yml logs`, "error");
        await updateAgent(agentId, userId, { status: "error" });
        console.error(`[deploy] Agent ${agentId}: ❌ Health check TIMED OUT — ip=${serverIp}`);
      }
    })
    .catch(async (err) => {
      console.error(`[deploy] Agent ${agentId}: ❌ PROVISION FAILED:`, err);
      await pushProvisionLog(agentId, `Provisioning error: ${err instanceof Error ? err.message : "Unknown error"}`, "error");
      await updateAgent(agentId, userId, { status: "error" });
    });

  return Response.json(agent, { status: 201 });
}
