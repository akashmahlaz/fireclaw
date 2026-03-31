import { Bot, Activity, MessageSquare, Globe, ArrowLeft, ExternalLink, Key, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { auth } from "@/auth";
import { getAgentById } from "@/lib/agents";
import { getControlUiUrl } from "@/lib/provision";
import { notFound } from "next/navigation";
import { AgentActions } from "./agent-actions";

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const { id } = await params;
  const agent = await getAgentById(id, session.user.id);
  if (!agent) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" render={<Link href="/dashboard/agents" />}>
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex flex-1 items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold">{agent.name}</h1>
            <p className="text-sm text-muted-foreground">
              Agent ID: {agent._id!.toString()}
            </p>
          </div>
          <Badge
            variant={agent.status === "running" ? "default" : "outline"}
          >
            {agent.status}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Status</CardDescription>
            <Activity className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-lg capitalize">{agent.status}</CardTitle>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Messages</CardDescription>
            <MessageSquare className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-lg">{agent.messageCount}</CardTitle>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Uptime</CardDescription>
            <Bot className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-lg">—</CardTitle>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Region</CardDescription>
            <Globe className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-sm">{agent.region}</CardTitle>
          </CardContent>
        </Card>
      </div>

      {/* OpenClaw Access Card */}
      {agent.status === "provisioning" && (
        <Card>
          <CardContent className="flex items-center gap-3 py-6">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
            <div>
              <p className="font-medium">Provisioning your agent...</p>
              <p className="text-sm text-muted-foreground">
                This usually takes 2-3 minutes. The server is being created and OpenClaw is being installed.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {agent.status === "running" && agent.serverIp && (
        <Card>
          <CardHeader>
            <CardTitle>Agent Dashboard</CardTitle>
            <CardDescription>
              Open the OpenClaw Control UI to connect WhatsApp, Telegram, configure AI models, and manage your agent.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button render={<a href={getControlUiUrl(agent.serverIp)} target="_blank" rel="noopener noreferrer" />}>
              <ExternalLink className="size-4" />
              Open Agent Dashboard
            </Button>
            {agent.gatewayToken && (
              <div className="flex items-center gap-2 rounded-md bg-muted p-3">
                <Key className="size-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Gateway Token (use to log in)</p>
                  <p className="font-mono text-xs break-all">{agent.gatewayToken}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {agent.status === "error" && (
        <Card>
          <CardContent className="py-6">
            <p className="text-sm text-destructive">
              Something went wrong during provisioning. Try deleting this agent and creating a new one.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Channels</CardTitle>
          <CardDescription>
            Connect your agent to messaging platforms via the Agent Dashboard above.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-md bg-green-100 dark:bg-green-900/30">
                <MessageSquare className="size-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">WhatsApp</p>
                <p className="text-xs text-muted-foreground">
                  {agent.channels.whatsapp ? "Connected" : "Connect via Agent Dashboard → Channels → Show QR"}
                </p>
              </div>
            </div>
            <Badge variant={agent.channels.whatsapp ? "default" : "outline"}>
              {agent.channels.whatsapp ? "Connected" : "Not connected"}
            </Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900/30">
                <Globe className="size-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Telegram</p>
                <p className="text-xs text-muted-foreground">
                  {agent.channels.telegram ? "Connected" : "Connect via Agent Dashboard → Channels"}
                </p>
              </div>
            </div>
            <Badge variant={agent.channels.telegram ? "default" : "outline"}>
              {agent.channels.telegram ? "Connected" : "Not connected"}
            </Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-md bg-purple-100 dark:bg-purple-900/30">
                <Globe className="size-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Web Chat</p>
                <p className="text-xs text-muted-foreground">
                  {agent.channels.webchat ? "Embedded" : "Set up via Agent Dashboard"}
                </p>
              </div>
            </div>
            <Badge variant={agent.channels.webchat ? "default" : "outline"}>
              {agent.channels.webchat ? "Active" : "Not set up"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <AgentActions agentId={agent._id!.toString()} status={agent.status} />
    </div>
  );
}
