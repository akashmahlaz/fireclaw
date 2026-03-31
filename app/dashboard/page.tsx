import { Bot, Activity, MessageSquare, Server } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { auth } from "@/auth";
import { getAgentsByUser } from "@/lib/agents";

export default async function DashboardPage() {
  const session = await auth();
  const agents = session?.user?.id
    ? await getAgentsByUser(session.user.id)
    : [];

  const totalAgents = agents.length;
  const activeAgents = agents.filter((a) => a.status === "running").length;
  const totalMessages = agents.reduce((sum, a) => sum + a.messageCount, 0);

  const stats = [
    { label: "Total Agents", value: String(totalAgents), icon: Bot, change: totalAgents === 0 ? "Deploy your first agent" : `${totalAgents} deployed` },
    { label: "Active Now", value: String(activeAgents), icon: Activity, change: activeAgents === 0 ? "—" : `${activeAgents} running` },
    { label: "Messages (30d)", value: totalMessages.toLocaleString(), icon: MessageSquare, change: "—" },
    { label: "Server Health", value: activeAgents > 0 ? "Healthy" : "—", icon: Server, change: totalAgents === 0 ? "No agents yet" : `${activeAgents}/${totalAgents} online` },
  ];
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Overview of your AI agents and usage.
          </p>
        </div>
        <Button render={<Link href="/dashboard/agents/new" />}>
          Deploy Agent
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>{s.label}</CardDescription>
              <s.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardTitle className="text-2xl">{s.value}</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">{s.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            You haven&apos;t deployed any agents yet. Here&apos;s how to get started:
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <div className="flex items-start gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              1
            </span>
            <p>
              <strong>Deploy an agent</strong> — Click &quot;Deploy Agent&quot; and pick a template
              (sales bot, support bot, or personal assistant).
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              2
            </span>
            <p>
              <strong>Configure</strong> — Set the agent name, persona, and AI model.
              Add your own API key or use bundled credits.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              3
            </span>
            <p>
              <strong>Connect</strong> — Open the agent dashboard to configure
              channels, AI models, and more. You&apos;re live!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
