import { auth } from "@/auth";
import { createAgent, getAgentsByUser } from "@/lib/agents";
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

  // TODO: Trigger Hetzner server provisioning asynchronously
  // await provisionServer(agent);

  return Response.json(agent, { status: 201 });
}
