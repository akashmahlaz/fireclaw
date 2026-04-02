import { auth } from "@/auth";
import { getGlobalServerAction, listGlobalServerActions } from "@/lib/hetzner";

/**
 * GET /api/hetzner/actions?status=running&page=1&per_page=25
 * GET /api/hetzner/actions?id=123
 */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const idParam = url.searchParams.get("id");

  try {
    if (idParam) {
      const id = Number(idParam);
      if (!id || Number.isNaN(id)) {
        return Response.json({ error: "Invalid action id" }, { status: 400 });
      }
      const action = await getGlobalServerAction(id);
      return Response.json({ action });
    }

    const status = url.searchParams.get("status") as "running" | "success" | "error" | null;
    const page = Number(url.searchParams.get("page") ?? "1");
    const perPage = Number(url.searchParams.get("per_page") ?? "25");

    const data = await listGlobalServerActions({
      status: status ?? undefined,
      page,
      per_page: perPage,
    });

    return Response.json(data);
  } catch (err) {
    console.error("[hetzner/actions] Failed:", err);
    return Response.json({ error: "Failed to fetch actions" }, { status: 500 });
  }
}
