import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Zap } from "lucide-react";

const plans = [
  {
    name: "Personal",
    price: "₹499",
    period: "/mo",
    agents: 1,
    messages: "1,000",
    current: true,
  },
  {
    name: "Business",
    price: "₹1,999",
    period: "/mo",
    agents: 5,
    messages: "10,000",
    current: false,
  },
  {
    name: "Agency",
    price: "₹4,999",
    period: "/mo",
    agents: 25,
    messages: "50,000",
    current: false,
  },
];

export default function BillingPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Billing</h1>
        <p className="text-sm text-muted-foreground">
          Manage your subscription and payment methods.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="size-5" />
            Current Plan
          </CardTitle>
          <CardDescription>
            You&apos;re on the <strong>Free Trial</strong>. Upgrade to deploy
            agents.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Badge variant="outline">Free Trial</Badge>
            <span className="text-sm text-muted-foreground">
              0 / 1 agents deployed · 0 / 100 messages used
            </span>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-4 font-heading text-lg font-semibold">
          Available Plans
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.name} className={plan.current ? "border-primary" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {plan.name}
                  {plan.current && <Badge>Current</Badge>}
                </CardTitle>
                <CardDescription>
                  Up to {plan.agents} agent{plan.agents > 1 ? "s" : ""} ·{" "}
                  {plan.messages} messages/mo
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">
                    {plan.period}
                  </span>
                </div>
                <Button
                  variant={plan.current ? "outline" : "default"}
                  className="w-full gap-1.5"
                  disabled={plan.current}
                >
                  {plan.current ? "Current Plan" : (
                    <>
                      <Zap className="size-4" />
                      Upgrade
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>
            No payment method on file. Add one to upgrade your plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline">Add Payment Method</Button>
        </CardContent>
      </Card>
    </div>
  );
}
