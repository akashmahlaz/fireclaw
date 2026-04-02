import { ObjectId } from "mongodb";
import client from "@/lib/db";
import { NextRequest } from "next/server";

const DB_NAME = "fireclaw";

/**
 * POST /api/agents/[id]/webhook
 *
 * Called by the cloud-init script on the VPS to report installation progress.
 * Authenticated via the gateway token (shared secret).
 *
 * Body: { secret: string, step: string, status: "ok" | "pending" | "error" }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!ObjectId.isValid(id)) {
    return Response.json({ error: "Invalid agent ID" }, { status: 400 });
  }

  let body: { secret?: string; step?: string; status?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { secret, step, status } = body;

  if (!secret || typeof secret !== "string") {
    return Response.json({ error: "Missing secret" }, { status: 401 });
  }
  if (!step || typeof step !== "string") {
    return Response.json({ error: "Missing step" }, { status: 400 });
  }

  const validStatuses = ["ok", "pending", "error"] as const;
  const logStatus = validStatuses.includes(status as (typeof validStatuses)[number])
    ? (status as "ok" | "pending" | "error")
    : "ok";

  // Verify the secret matches the agent's gatewayToken
  const col = client.db(DB_NAME).collection("agents");
  const agent = await col.findOne({ _id: new ObjectId(id) });

  if (!agent) {
    return Response.json({ error: "Agent not found" }, { status: 404 });
  }

  // Constant-time comparison to prevent timing attacks
  if (!agent.gatewayToken || agent.gatewayToken !== secret) {
    return Response.json({ error: "Invalid secret" }, { status: 401 });
  }

  // Push the log entry (same format as pushProvisionLog)
  // Limit step text to 500 chars to prevent abuse
  const sanitizedStep = step.slice(0, 500);
  await col.updateOne(
    { _id: new ObjectId(id) },
    {
      $push: { provisionLog: { step: sanitizedStep, status: logStatus, ts: Date.now() } } as never,
      $set: { updatedAt: new Date() },
    }
  );

  return Response.json({ ok: true });
}
