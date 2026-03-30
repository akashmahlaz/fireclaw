import { auth } from "@/auth";
import { getAgentById, updateAgent, deleteAgent } from "@/lib/agents";

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

  // Only allow specific fields to be updated
  const allowed: Record<string, boolean> = {
    name: true,
    status: true,
    channels: true,
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

  // TODO: Terminate Hetzner server before deleting
  // const agent = await getAgentById(id, session.user.id);
  // if (agent?.serverId) await destroyServer(agent.serverId);

  const ok = await deleteAgent(id, session.user.id);
  if (!ok) {
    return Response.json({ error: "Agent not found" }, { status: 404 });
  }

  return Response.json({ success: true });
}
