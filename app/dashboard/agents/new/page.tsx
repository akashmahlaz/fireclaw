"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, MessageSquare, Headphones, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const templates = [
  {
    id: "sales",
    name: "Sales Bot",
    description: "Lead qualification, product recommendations, and follow-ups.",
    icon: MessageSquare,
  },
  {
    id: "support",
    name: "Support Bot",
    description: "Answer FAQs, create tickets, and route to human agents.",
    icon: Headphones,
  },
  {
    id: "assistant",
    name: "Personal Assistant",
    description: "General-purpose AI for scheduling, reminders, and research.",
    icon: User,
  },
  {
    id: "custom",
    name: "Custom Agent",
    description: "Start from scratch. Define your own personality and tools.",
    icon: Bot,
  },
];

export default function NewAgentPage() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [agentName, setAgentName] = useState("");
  const [deploying, setDeploying] = useState(false);

  async function handleDeploy() {
    if (!selectedTemplate || !agentName.trim()) return;
    setDeploying(true);

    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: agentName.trim(), template: selectedTemplate }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Failed to deploy agent");
        setDeploying(false);
        return;
      }

      router.push("/dashboard/agents");
    } catch {
      alert("Something went wrong");
      setDeploying(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Deploy New Agent</h1>
        <p className="text-sm text-muted-foreground">
          Pick a template, name your agent, and deploy.
        </p>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium">1. Choose a template</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {templates.map((t) => (
            <Card
              key={t.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                selectedTemplate === t.id
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border/60"
              )}
              onClick={() => setSelectedTemplate(t.id)}
            >
              <CardHeader className="flex flex-row items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <t.icon className="size-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{t.name}</CardTitle>
                  <CardDescription className="text-xs">{t.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">2. Name your agent</h2>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="agent-name">Agent Name</Label>
          <Input
            id="agent-name"
            placeholder="e.g. My Sales Bot"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            maxLength={60}
          />
        </div>
      </div>

      <Separator />

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button
          disabled={!selectedTemplate || !agentName.trim() || deploying}
          onClick={handleDeploy}
        >
          {deploying ? "Deploying…" : "Deploy Agent"}
        </Button>
      </div>
    </div>
  );
}
