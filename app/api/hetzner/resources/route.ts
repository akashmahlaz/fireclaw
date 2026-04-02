import { auth } from "@/auth";
import {
  listSshKeys,
  createSshKey,
  deleteSshKey,
  listImages,
  updateImage,
  deleteImage,
  listVolumes,
  createVolume,
  updateVolume,
  deleteVolume,
  listPrimaryIps,
  createPrimaryIp,
  updatePrimaryIp,
  deletePrimaryIp,
  listNetworks,
  createNetwork,
  updateNetwork,
  deleteNetwork,
  listPlacementGroups,
  createPlacementGroup,
  deletePlacementGroup,
  listFirewalls,
  createFirewall,
  setFirewallRules,
  deleteFirewall,
  listFloatingIps,
  createFloatingIp,
  updateFloatingIp,
  deleteFloatingIp,
  assignFloatingIp,
  unassignFloatingIp,
} from "@/lib/hetzner";

/**
 * GET /api/hetzner/resources?kind=ssh_keys|images|volumes|primary_ips|networks|placement_groups
 * POST /api/hetzner/resources with body: { kind, ...payload }
 */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const kind = new URL(request.url).searchParams.get("kind");

  try {
    switch (kind) {
      case "ssh_keys":
        return Response.json({ items: await listSshKeys() });
      case "images":
        return Response.json({ items: await listImages() });
      case "volumes":
        return Response.json({ items: await listVolumes() });
      case "primary_ips":
        return Response.json({ items: await listPrimaryIps() });
      case "networks":
        return Response.json({ items: await listNetworks() });
      case "placement_groups":
        return Response.json({ items: await listPlacementGroups() });
      case "firewalls":
        return Response.json({ items: await listFirewalls() });
      case "floating_ips":
        return Response.json({ items: await listFloatingIps() });
      default:
        return Response.json({ error: "Invalid kind" }, { status: 400 });
    }
  } catch (err) {
    console.error("[hetzner/resources][GET] Failed:", err);
    return Response.json({ error: "Failed to fetch resources" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  try {
    switch (body.kind) {
      case "ssh_key": {
        if (!body.name || !body.public_key) {
          return Response.json({ error: "name and public_key are required" }, { status: 400 });
        }
        const item = await createSshKey({
          name: body.name,
          public_key: body.public_key,
          labels: body.labels,
        });
        return Response.json({ item });
      }
      case "volume": {
        if (!body.name || !body.size) {
          return Response.json({ error: "name and size are required" }, { status: 400 });
        }
        const item = await createVolume({
          name: body.name,
          size: Number(body.size),
          location: body.location,
          labels: body.labels,
        });
        return Response.json({ item });
      }
      case "primary_ip": {
        if (!body.name || !body.type) {
          return Response.json({ error: "name and type are required" }, { status: 400 });
        }
        const item = await createPrimaryIp({
          name: body.name,
          type: body.type,
          datacenter: body.datacenter,
          assignee_id: body.assigneeId,
          auto_delete: body.autoDelete,
          labels: body.labels,
        });
        return Response.json({ item });
      }
      case "network": {
        if (!body.name || !body.ip_range) {
          return Response.json({ error: "name and ip_range are required" }, { status: 400 });
        }
        const item = await createNetwork({
          name: body.name,
          ip_range: body.ip_range,
          labels: body.labels,
        });
        return Response.json({ item });
      }
      case "placement_group": {
        if (!body.name) {
          return Response.json({ error: "name is required" }, { status: 400 });
        }
        const item = await createPlacementGroup({
          name: body.name,
          type: body.type,
          labels: body.labels,
        });
        return Response.json({ item });
      }
      case "firewall": {
        if (!body.name || !Array.isArray(body.rules)) {
          return Response.json({ error: "name and rules[] are required" }, { status: 400 });
        }
        const item = await createFirewall({
          name: body.name,
          labels: body.labels,
          rules: body.rules,
          apply_to: body.apply_to,
        });
        return Response.json({ item });
      }
      case "floating_ip": {
        if (!body.type) {
          return Response.json({ error: "type is required" }, { status: 400 });
        }
        const item = await createFloatingIp({
          type: body.type,
          home_location: body.home_location,
          server: body.server,
          description: body.description,
          labels: body.labels,
        });
        return Response.json({ item });
      }
      default:
        return Response.json({ error: "Invalid kind" }, { status: 400 });
    }
  } catch (err) {
    console.error("[hetzner/resources][POST] Failed:", err);
    return Response.json({ error: "Failed to create resource" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const id = Number(body.id);
  if (!id || Number.isNaN(id)) {
    return Response.json({ error: "Valid numeric id is required" }, { status: 400 });
  }

  try {
    switch (body.kind) {
      case "image": {
        const item = await updateImage(id, {
          description: body.description,
          type: body.type,
          labels: body.labels,
        });
        return Response.json({ item });
      }
      case "volume": {
        const item = await updateVolume(id, {
          name: body.name,
          labels: body.labels,
        });
        return Response.json({ item });
      }
      case "primary_ip": {
        const item = await updatePrimaryIp(id, {
          name: body.name,
          auto_delete: body.autoDelete,
          labels: body.labels,
        });
        return Response.json({ item });
      }
      case "network": {
        const item = await updateNetwork(id, {
          name: body.name,
          labels: body.labels,
        });
        return Response.json({ item });
      }
      case "firewall": {
        if (Array.isArray(body.rules)) {
          const actions = await setFirewallRules(id, body.rules);
          return Response.json({ actions });
        }
        return Response.json({ error: "rules[] is required for firewall patch" }, { status: 400 });
      }
      case "floating_ip": {
        const item = await updateFloatingIp(id, {
          description: body.description,
          labels: body.labels,
        });
        return Response.json({ item });
      }
      case "floating_ip_assign": {
        if (!body.server || Number.isNaN(Number(body.server))) {
          return Response.json({ error: "server is required" }, { status: 400 });
        }
        const action = await assignFloatingIp(id, Number(body.server));
        return Response.json({ action });
      }
      case "floating_ip_unassign": {
        const action = await unassignFloatingIp(id);
        return Response.json({ action });
      }
      default:
        return Response.json({ error: "Invalid kind" }, { status: 400 });
    }
  } catch (err) {
    console.error("[hetzner/resources][PATCH] Failed:", err);
    return Response.json({ error: "Failed to update resource" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const kind = url.searchParams.get("kind");
  const id = Number(url.searchParams.get("id"));
  if (!id || Number.isNaN(id)) {
    return Response.json({ error: "Valid numeric id is required" }, { status: 400 });
  }

  try {
    switch (kind) {
      case "ssh_key":
        await deleteSshKey(id);
        break;
      case "image":
        await deleteImage(id);
        break;
      case "volume":
        await deleteVolume(id);
        break;
      case "primary_ip":
        await deletePrimaryIp(id);
        break;
      case "network":
        await deleteNetwork(id);
        break;
      case "placement_group":
        await deletePlacementGroup(id);
        break;
      case "firewall":
        await deleteFirewall(id);
        break;
      case "floating_ip":
        await deleteFloatingIp(id);
        break;
      default:
        return Response.json({ error: "Invalid kind" }, { status: 400 });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("[hetzner/resources][DELETE] Failed:", err);
    return Response.json({ error: "Failed to delete resource" }, { status: 500 });
  }
}
