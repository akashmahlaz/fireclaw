import { auth } from "@/auth";
import {
  listServerTypes,
  listLocations,
  listDatacenters,
  listIsos,
  listCertificates,
  getPricing,
  listSshKeys,
  listPlacementGroups,
  listPrimaryIps,
} from "@/lib/hetzner";

/**
 * GET /api/hetzner/catalog
 *
 * Unified reference/catalog endpoint for dashboard forms.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [
      serverTypes,
      locations,
      datacenters,
      isos,
      certificates,
      pricing,
      sshKeys,
      placementGroups,
      primaryIps,
    ] = await Promise.all([
      listServerTypes(),
      listLocations(),
      listDatacenters(),
      listIsos(),
      listCertificates(),
      getPricing(),
      listSshKeys(),
      listPlacementGroups(),
      listPrimaryIps(),
    ]);

    return Response.json({
      serverTypes,
      locations,
      datacenters,
      isos,
      certificates,
      pricing,
      sshKeys,
      placementGroups,
      primaryIps,
    });
  } catch (err) {
    console.error("[hetzner/catalog] Failed:", err);
    return Response.json({ error: "Failed to fetch Hetzner catalog" }, { status: 500 });
  }
}
