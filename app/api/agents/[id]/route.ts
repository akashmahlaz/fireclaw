import { auth } from "@/auth";
import { getAgentById, updateAgent, deleteAgent } from "@/lib/agents";
import { destroyAgent, rebootAgent } from "@/lib/provision";

export async function GET(
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

  return Response.json(agent);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  // Handle server actions (reboot, stop, start)
  if (body.action) {
    const agent = await getAgentById(id, session.user.id);
    if (!agent) {
      return Response.json({ error: "Agent not found" }, { status: 404 });
    }
    if (!agent.serverId) {
      return Response.json({ error: "No server associated" }, { status: 400 });
    }

    if (body.action === "reboot") {
      await rebootAgent(agent.serverId);
      await updateAgent(id, session.user.id, { status: "running" });
      return Response.json({ success: true });
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  }

  // Only allow specific fields to be updated
  const allowed: Record<string, boolean> = {
    name: true,
    status: true,
  };
  const update: Record<string, unknown> = {};
  for (const key of Object.keys(body)) {
    if (allowed[key]) update[key] = body[key];
  }

  if (Object.keys(update).length === 0) {
    return Response.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const ok = await updateAgent(id, session.user.id, update as Parameters<typeof updateAgent>[2]);
  if (!ok) {
    return Response.json({ error: "Agent not found" }, { status: 404 });
  }

  return Response.json({ success: true });
}

export async function DELETE(
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

  // Terminate Hetzner server before deleting from DB
  if (agent.serverId) {
    try {
      await destroyAgent(agent.serverId);
    } catch (err) {
      console.error(`Failed to destroy server ${agent.serverId}:`, err);
    }
  }

  const ok = await deleteAgent(id, session.user.id);
  if (!ok) {
    return Response.json({ error: "Agent not found" }, { status: 404 });
  }

  return Response.json({ success: true });
}
