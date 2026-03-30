import { Bot, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { auth } from "@/auth";
import { getAgentsByUser } from "@/lib/agents";

export default async function AgentsPage() {
  const session = await auth();
  const agents = session?.user?.id
    ? (await getAgentsByUser(session.user.id)).map((a) => ({
        id: a._id!.toString(),
        name: a.name,
        template: a.template,
        status: a.status === "provisioning" ? ("deploying" as const) : a.status,
        messages: a.messageCount,
      }))
    : [];
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Agents</h1>
          <p className="text-sm text-muted-foreground">
            Deploy and manage your AI agents.
          </p>
        </div>
        <Button className="gap-1.5" render={<Link href="/dashboard/agents/new" />}>
          <Plus className="size-4" />
          New Agent
        </Button>
      </div>

      {agents.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted">
              <Bot className="size-7 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">No agents yet</CardTitle>
              <CardDescription className="mt-1">
                Deploy your first AI agent to get started.
              </CardDescription>
            </div>
            <Button render={<Link href="/dashboard/agents/new" />}>
              Deploy Your First Agent
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <Link key={agent.id} href={`/dashboard/agents/${agent.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{agent.name}</CardTitle>
                    <Badge
                      variant={
                        agent.status === "running"
                          ? "default"
                          : agent.status === "deploying"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {agent.status}
                    </Badge>
                  </div>
                  <CardDescription>{agent.template}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {agent.messages.toLocaleString()} messages
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
