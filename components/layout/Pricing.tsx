import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BlurFade } from "@/components/ui/blur-fade";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

const plans = [
  {
    name: "Personal",
    price: "₹499",
    usd: "~$6",
    period: "/mo",
    description: "For individuals who want their own AI assistant.",
    agents: "1 agent",
    features: [
      "1 AI Agent",
      "WhatsApp + Telegram",
      "1,000 messages/mo",
      "Pre-built templates",
      "Basic dashboard",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Business",
    price: "₹1,999",
    usd: "~$24",
    period: "/mo",
    description: "For small businesses with multiple use cases.",
    agents: "3 agents",
    features: [
      "3 AI Agents",
      "WhatsApp + Telegram + Web",
      "5,000 messages/mo",
      "All templates",
      "Cross-agent analytics",
      "Priority support",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Agency",
    price: "₹4,999",
    usd: "~$60",
    period: "/mo",
    description: "For agencies managing AI for their clients.",
    agents: "10 agents",
    features: [
      "10 AI Agents",
      "All channels",
      "15,000 messages/mo",
      "White-label branding",
      "Client billing",
      "API access",
      "Dedicated support",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="w-full px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <BlurFade inView>
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-3 text-muted-foreground">
              Start free. Scale as your agency grows. No hidden fees.
            </p>
          </div>
        </BlurFade>

        <div className="grid items-start gap-6 md:grid-cols-3">
          {plans.map((plan, i) => (
            <BlurFade key={plan.name} inView delay={i * 0.08}>
              <Card
                className={`relative h-full ${
                  plan.popular
                    ? "border-primary shadow-xl ring-1 ring-primary/20"
                    : "border-border/60"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge>Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="flex items-baseline gap-1 pt-2">
                    <span className="font-heading text-4xl font-bold">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{plan.usd}/mo · {plan.agents}</span>
                </CardHeader>

                <CardContent className="flex flex-col gap-4">
                  <Separator />
                  <ul className="flex flex-col gap-2.5 text-sm">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <Check className="size-4 shrink-0 text-primary" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    render={<Link href="/login" />}
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}
