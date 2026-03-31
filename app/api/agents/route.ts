import { auth } from "@/auth";
import { createAgent, getAgentsByUser, updateAgent } from "@/lib/agents";
import { provisionAgent } from "@/lib/provision";
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
  const { name, template, region } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return Response.json({ error: "Name is required" }, { status: 400 });
  }

  const allowedTemplates = ["sales", "support", "assistant", "custom"] as const;
  if (!allowedTemplates.includes(template)) {
    return Response.json({ error: "Invalid template" }, { status: 400 });
  }

  const agent = await createAgent({
    userId: session.user.id,
    name: name.trim(),
    template,
    region: region || "eu-central",
  });

  const agentId = agent._id!.toString();

  // Provision VPS with OpenClaw in the background — don't block the response
  provisionAgent({
    agentId,
    userId: session.user.id,
    name: name.trim(),
    region: region || "eu-central",
  })
    .then(async ({ gatewayToken }) => {
      await updateAgent(agentId, session.user.id, { gatewayToken });
    })
    .catch(async (err) => {
      console.error(`Failed to provision agent ${agentId}:`, err);
      await updateAgent(agentId, session.user.id, { status: "error" });
    });

  return Response.json(agent, { status: 201 });
}
