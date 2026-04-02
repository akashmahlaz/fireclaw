import { ObjectId } from "mongodb";
import client from "@/lib/db";
import { auth } from "@/auth";
import { NextRequest } from "next/server";

const DB_NAME = "fireclaw";

/**
 * POST /api/agents/[id]/fix-config
 *
 * Pushes the correct openclaw.json to a running agent's server.
 * Uses the OpenClaw Gateway's WebSocket config.set protocol via HTTP.
 *
 * This fixes the "origin not allowed" and "pairing required" errors
 * on servers deployed before the config fix was added to cloud-init.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (!ObjectId.isValid(id)) {
    return Response.json({ error: "Invalid agent ID" }, { status: 400 });
  }

  const col = client.db(DB_NAME).collection("agents");
  const agent = await col.findOne({
    _id: new ObjectId(id),
    userId: session.user.id,
  });

  if (!agent) {
    return Response.json({ error: "Agent not found" }, { status: 404 });
  }

  if (!agent.domain || !agent.gatewayToken) {
    return Response.json({ error: "Agent not fully provisioned" }, { status: 400 });
  }

  // Build the correct config
  const correctConfig = {
    gateway: {
      auth: {
        token: agent.gatewayToken,
      },
      bind: "lan",
      port: 18789,
      trustedProxies: ["172.16.0.0/12", "10.0.0.0/8", "127.0.0.1"],
      controlUi: {
        allowedOrigins: [`https://${agent.domain}`],
        dangerouslyDisableDeviceAuth: true,
      },
    },
  };

  // Try to push config via the OpenClaw Gateway's /tools/invoke endpoint
  // This uses the exec tool to write the config file and restart
  const gatewayUrl = `https://${agent.domain}`;

  try {
    // Step 1: Write the correct config via exec tool
    const writeConfigRes = await fetch(`${gatewayUrl}/tools/invoke`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${agent.gatewayToken}`,
      },
      body: JSON.stringify({
        tool: "exec",
        args: {
          command: `cat > /home/node/.openclaw/openclaw.json << 'CONFIGEOF'\n${JSON.stringify(correctConfig, null, 2)}\nCONFIGEOF`,
        },
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!writeConfigRes.ok) {
      // If /tools/invoke fails (exec might be blocked), try alternative approach:
      // Use the WS config.set method via the OpenResponses API
      const configSetRes = await fetch(`${gatewayUrl}/v1/responses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${agent.gatewayToken}`,
        },
        body: JSON.stringify({
          model: "openclaw",
          input: `Update your openclaw.json config file to fix the "origin not allowed" error. Write this exact JSON to ~/.openclaw/openclaw.json:\n\n${JSON.stringify(correctConfig, null, 2)}\n\nThen restart the gateway with: openclaw gateway restart`,
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (!configSetRes.ok) {
        const errText = await configSetRes.text();
        console.error(`[fix-config] Agent ${id}: both methods failed. Last: ${configSetRes.status} ${errText}`);
        return Response.json(
          {
            error: "Could not push config to agent. The agent may need manual fix.",
            detail: errText,
          },
          { status: 502 }
        );
      }

      return Response.json({
        success: true,
        method: "agent-turn",
        message: "Config fix requested via agent. It may take a moment to apply.",
      });
    }

    return Response.json({
      success: true,
      method: "exec",
      message: "Config updated successfully. Gateway will auto-restart.",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[fix-config] Agent ${id}: error pushing config:`, msg);

    // If the gateway is unreachable (which is likely since origin is not allowed for WS but HTTP might work),
    // provide instructions for manual fix
    return Response.json(
      {
        error: "Could not reach agent gateway",
        manual_fix: `SSH into the server (${agent.serverIp}) and run:\ndocker exec openclaw-gateway sh -c 'cat > /home/node/.openclaw/openclaw.json << EOF\n${JSON.stringify(correctConfig, null, 2)}\nEOF'\ndocker restart openclaw-gateway`,
      },
      { status: 502 }
    );
  }
}
