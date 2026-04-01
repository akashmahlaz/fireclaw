import { auth } from "@/auth";
import { getProvider } from "@/lib/providers";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const provider = getProvider("hetzner");
    const data = await provider.getAvailability();
    return Response.json(data);
  } catch (err) {
    console.error("[hetzner/availability] Failed:", err);
    return Response.json(
      { error: "Failed to fetch availability" },
      { status: 500 },
    );
  }
}
