import { auth } from "@/auth";
import { getAgentById } from "@/lib/agents";
import { getServerMetrics } from "@/lib/hetzner";

/**
 * GET /api/agents/:id/metrics?type=cpu,disk,network&period=1h
 *
 * Returns Hetzner server metrics for an agent's VPS.
 * Supported types: cpu, disk, network (comma-separated)
 * Supported periods: 1h, 6h, 24h, 7d, 30d
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
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
  if (!agent.serverId) {
    return Response.json({ error: "No server associated" }, { status: 400 });
  }

  const url = new URL(request.url);
  const type = url.searchParams.get("type") ?? "cpu,disk,network";
  const period = url.searchParams.get("period") ?? "1h";

  // Validate type parameter
  const validTypes = new Set(["cpu", "disk", "network"]);
  const requestedTypes = type.split(",").map((t) => t.trim());
  for (const t of requestedTypes) {
    if (!validTypes.has(t)) {
      return Response.json(
        { error: `Invalid metric type: ${t}. Valid: cpu, disk, network` },
        { status: 400 },
      );
    }
  }

  // Parse period to start/end timestamps
  const periodMs: Record<string, number> = {
    "1h": 60 * 60 * 1000,
    "6h": 6 * 60 * 60 * 1000,
    "24h": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
    "30d": 30 * 24 * 60 * 60 * 1000,
  };

  const ms = periodMs[period];
  if (!ms) {
    return Response.json(
      { error: `Invalid period: ${period}. Valid: 1h, 6h, 24h, 7d, 30d` },
      { status: 400 },
    );
  }

  const end = new Date();
  const start = new Date(end.getTime() - ms);

  try {
    const metrics = await getServerMetrics(
      Number(agent.serverId),
      requestedTypes.join(","),
      start.toISOString(),
      end.toISOString(),
    );

    return Response.json({
      metrics,
      serverId: agent.serverId,
      period,
      type: requestedTypes,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[metrics] Agent ${id} metrics error:`, msg);
    return Response.json({ error: "Failed to fetch metrics" }, { status: 502 });
  }
}
