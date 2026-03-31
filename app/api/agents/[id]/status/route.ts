import { auth } from "@/auth";
import { getAgentById, updateAgent } from "@/lib/agents";
import { waitForHealth } from "@/lib/provision";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const agent = await getAgentById(id, session.user.id);

  if (!agent) {
    return Response.json({ error: "Agent not found" }, { status: 404 });
  }

  if (agent.status !== "provisioning" || !agent.serverIp) {
    return Response.json({ status: agent.status });
  }

  // Quick health check (single attempt, don't block long)
  try {
    const res = await fetch(`http://${agent.serverIp}:18789/healthz`, {
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      await updateAgent(id, session.user.id, { status: "running" });
      return Response.json({ status: "running" });
    }
  } catch {
    // Not ready yet
  }

  return Response.json({ status: "provisioning" });
}
