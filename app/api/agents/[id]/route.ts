import { auth } from "@/auth";
import { getAgentById, updateAgent, deleteAgent } from "@/lib/agents";
import { destroyAgent, rebootAgent } from "@/lib/provision";
import {
  shutdownServer,
  powerOnServer,
  powerOffServer,
  resetServer,
  changeServerType,
  requestServerConsole,
  getServer,
  listServerActions,
} from "@/lib/hetzner";

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

    if (body.action === "shutdown") {
      await shutdownServer(Number(agent.serverId));
      await updateAgent(id, session.user.id, { status: "stopped" });
      return Response.json({ success: true });
    }

    if (body.action === "poweron") {
      await powerOnServer(Number(agent.serverId));
      await updateAgent(id, session.user.id, { status: "running" });
      return Response.json({ success: true });
    }

    if (body.action === "poweroff") {
      await powerOffServer(Number(agent.serverId));
      await updateAgent(id, session.user.id, { status: "stopped" });
      return Response.json({ success: true });
    }

    if (body.action === "reset") {
      await resetServer(Number(agent.serverId));
      await updateAgent(id, session.user.id, { status: "running" });
      return Response.json({ success: true });
    }

    if (body.action === "console") {
      const result = await requestServerConsole(Number(agent.serverId));
      return Response.json({
        wss_url: result.wss_url,
        password: result.password,
      });
    }

    if (body.action === "status") {
      const server = await getServer(Number(agent.serverId));
      return Response.json({
        status: server.status,
        serverType: server.server_type.name,
        datacenter: server.datacenter.name,
        ip: server.public_net.ipv4.ip,
        created: server.created,
        includedTraffic: server.included_traffic,
        ingoingTraffic: server.ingoing_traffic,
        outgoingTraffic: server.outgoing_traffic,
      });
    }

    if (body.action === "actions") {
      const result = await listServerActions(Number(agent.serverId), {
        per_page: 25,
      });
      return Response.json(result);
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

  // Terminate Hetzner server + clean up DNS before deleting from DB
  if (agent.serverId) {
    try {
      await destroyAgent(agent.serverId, agent.dnsRecordId);
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
