import { Bot, Activity, MessageSquare, Globe, ArrowLeft } from "lucide-react";
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
import { notFound } from "next/navigation";

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

      <Card>
        <CardHeader>
          <CardTitle>Channels</CardTitle>
          <CardDescription>
            Connect your agent to messaging platforms.
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
                <p className="text-xs text-muted-foreground">Not connected</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Connect
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900/30">
                <Globe className="size-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Telegram</p>
                <p className="text-xs text-muted-foreground">Not connected</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Connect
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-md bg-purple-100 dark:bg-purple-900/30">
                <Globe className="size-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Web Chat</p>
                <p className="text-xs text-muted-foreground">Not connected</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Embed
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline">Restart Agent</Button>
        <Button variant="destructive">Stop Agent</Button>
      </div>
    </div>
  );
}
