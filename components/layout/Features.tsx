import {
  Bot,
  LayoutDashboard,
  Zap,
  Shield,
  Globe,
  BarChart3,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BlurFade } from "@/components/ui/blur-fade";

const features = [
  {
    icon: Bot,
    title: "Multi-Agent Deploy",
    description:
      "Deploy 10+ AI agents in minutes. Each runs in an isolated container with its own config, memory, and integrations.",
  },
  {
    icon: LayoutDashboard,
    title: "Unified Dashboard",
    description:
      "Manage all your agents from one place. See status, logs, usage, and health across every agent at a glance.",
  },
  {
    icon: Zap,
    title: "Pre-Built Templates",
    description:
      "Sales bot, support bot, personal assistant — pick a template, customize it, and deploy. No code required.",
  },
  {
    icon: Shield,
    title: "White-Label",
    description:
      "Agency plan includes custom branding. Your agents, your brand, your client's domain. No FireClaw watermark.",
  },
  {
    icon: Globe,
    title: "WhatsApp + Telegram",
    description:
      "Connect agents to WhatsApp, Telegram, and web chat out of the box. QR scan and you're live.",
  },
  {
    icon: BarChart3,
    title: "Cross-Agent Analytics",
    description:
      "Message volume, response time, user satisfaction — track performance across all agents in a single report.",
  },
];

export function Features() {
  return (
    <section id="features" className="w-full bg-muted/40 px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <BlurFade inView>
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to run an AI agency
            </h2>
            <p className="mt-3 text-muted-foreground">
              From single-agent personal use to managing fleets for your clients.
            </p>
          </div>
        </BlurFade>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <BlurFade key={f.title} inView delay={i * 0.05}>
              <Card className="h-full border-border/60 bg-card/80 transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10">
                    <f.icon className="size-5 text-primary" />
                  </div>
                  <CardTitle>{f.title}</CardTitle>
                  <CardDescription>{f.description}</CardDescription>
                </CardHeader>
                <CardContent />
              </Card>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}
