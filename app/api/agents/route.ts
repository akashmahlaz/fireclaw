import { auth } from "@/auth";
import { createAgent, getAgentsByUser, updateAgent, pushProvisionLog } from "@/lib/agents";
import { provisionAgent, waitForHealth } from "@/lib/provision";
import { rateLimitByUser } from "@/lib/rate-limit";
import { checkDeployQuota } from "@/lib/subscriptions";
import { sendDeploySuccessEmail, sendDeployFailureEmail } from "@/lib/email";
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

  // Rate limit: 5 deploys per hour per user
  const rl = rateLimitByUser(session.user.id, "agents:create", 5, 60 * 60 * 1000);
  if (rl) return rl;

  // TODO: re-enable payment/quota check before going live
  // const quota = await checkDeployQuota(session.user.id);
  // if (!quota.allowed) {
  //   return Response.json(
  //     { error: quota.reason, used: quota.used, limit: quota.limit },
  //     { status: 403 },
  //   );
  // }

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
    .then(async ({ serverIp, domain }) => {
      console.log(`[deploy] Agent ${agentId}: provision returned — ip=${serverIp}, domain=${domain}`);

      // Wait for OpenClaw to come online (health check)
      await pushProvisionLog(agentId, "Waiting for OpenClaw Gateway to start", "pending");
      const healthy = await waitForHealth(domain, agentId, undefined, serverIp);

      if (healthy) {
        // Update status FIRST — on Vercel serverless the function can be
        // killed at any moment after the response was already sent.
        await updateAgent(agentId, userId, { status: "running" });
        await pushProvisionLog(agentId, "Health check passed — OpenClaw Gateway responding", "ok");
        await pushProvisionLog(agentId, `🚀 Live at https://${domain}`, "ok");
        console.log(`[deploy] Agent ${agentId}: ✅ RUNNING at https://${domain}`);
        // Send success email (non-blocking)
        if (session.user?.email) {
          sendDeploySuccessEmail(session.user.email, name.trim(), domain).catch(() => {});
        }
      } else {
        await updateAgent(agentId, userId, { status: "error" });
        await pushProvisionLog(agentId, "Health check timed out (10 min) — server may still be booting", "error");
        await pushProvisionLog(agentId, `Try: ssh root@${serverIp} then docker compose -f /opt/openclaw/docker-compose.yml logs`, "error");
        console.error(`[deploy] Agent ${agentId}: ❌ Health check TIMED OUT — ip=${serverIp}`);
      }
    })
    .catch(async (err) => {
      console.error(`[deploy] Agent ${agentId}: ❌ PROVISION FAILED:`, err);
      await pushProvisionLog(agentId, `Provisioning error: ${err instanceof Error ? err.message : "Unknown error"}`, "error");
      await updateAgent(agentId, userId, { status: "error" });
      // Send failure email (non-blocking)
      if (session.user?.email) {
        sendDeployFailureEmail(session.user.email, name.trim(), err instanceof Error ? err.message : "Unknown error").catch(() => {});
      }
    });

  return Response.json(agent, { status: 201 });
}
