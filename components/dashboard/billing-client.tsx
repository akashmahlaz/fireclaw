"use client";

import {
  CreditCard,
  Receipt,
  Zap,
  Server,
  ExternalLink,
  Check,
  Crown,
} from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const currentPlan = {
  name: "Starter",
  price: 7.99,
  features: [
    "1 OpenClaw instance",
    "3 channels",
    "EU region",
    "SSL + subdomain",
    "Community support",
  ],
};

const upgradePlans = [
  {
    name: "Standard",
    price: 14.99,
    features: [
      "3 OpenClaw instances",
      "10 channels",
      "Multi-region",
      "Priority support",
    ],
  },
  {
    name: "Pro",
    price: 29.99,
    popular: true,
    features: [
      "10 OpenClaw instances",
      "Unlimited channels",
      "Custom domains",
      "Dedicated support",
    ],
  },
  {
    name: "Enterprise",
    price: 59.99,
    features: [
      "Unlimited instances",
      "SLA guarantee",
      "SSO & RBAC",
      "24/7 phone support",
    ],
  },
];

const invoices = [
  {
    date: "Jun 1, 2025",
    amount: "$7.99",
    status: "Paid",
    desc: "Starter Plan — Monthly",
  },
  {
    date: "May 1, 2025",
    amount: "$7.99",
    status: "Paid",
    desc: "Starter Plan — Monthly",
  },
  {
    date: "Apr 1, 2025",
    amount: "$7.99",
    status: "Paid",
    desc: "Starter Plan — Monthly",
  },
];

export function BillingClient({
  agentCount,
  runningCount,
  totalMonthly,
}: {
  agentCount: number;
  runningCount: number;
  totalMonthly: number;
}) {
  return (
    <div className="p-6 lg:p-8">
      <BlurFade inView delay={0}>
        <div className="mx-auto max-w-4xl">
          {/* Page header */}
          <div className="mb-8">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-neutral-900">
              Billing
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              Manage your subscription and invoices
            </p>
          </div>

          {/* Summary row */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <Card className="rounded-2xl border-neutral-200 shadow-sm">
              <CardContent className="p-5">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100">
                  <CreditCard className="h-4 w-4 text-neutral-500" />
                </div>
                <p className="text-xs text-neutral-500">Monthly Cost</p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-neutral-900">
                  ${totalMonthly.toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-neutral-200 shadow-sm">
              <CardContent className="p-5">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100">
                  <Server className="h-4 w-4 text-neutral-500" />
                </div>
                <p className="text-xs text-neutral-500">Active Agents</p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-neutral-900">
                  {runningCount}
                  <span className="text-sm font-normal text-neutral-400">
                    {" "}
                    / {agentCount}
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-neutral-200 shadow-sm">
              <CardContent className="p-5">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50">
                  <Zap className="h-4 w-4 text-orange-500" />
                </div>
                <p className="text-xs text-neutral-500">Current Plan</p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-orange-600">
                  {currentPlan.name}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Current plan section */}
          <Card className="mb-8 rounded-2xl border-neutral-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
                    Current Plan
                  </p>
                  <h3 className="font-heading mt-2 text-xl font-bold text-neutral-900">
                    {currentPlan.name}
                    <span className="ml-2 text-base font-normal text-neutral-400">
                      ${currentPlan.price}/mo
                    </span>
                  </h3>
                  <ul className="mt-4 space-y-2">
                    {currentPlan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2.5 text-sm text-neutral-600"
                      >
                        <Check className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col gap-2.5">
                  <Button
                    variant="outline"
                    className="rounded-xl border-neutral-200 px-5 text-sm font-medium"
                  >
                    Manage Subscription
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600"
                  >
                    Cancel Plan
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upgrade options */}
          <div className="mb-8">
            <h3 className="font-heading mb-4 text-sm font-semibold uppercase tracking-wider text-neutral-400">
              Upgrade Your Plan
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              {upgradePlans.map((plan) => (
                <Card
                  key={plan.name}
                  className={cn(
                    "relative rounded-2xl shadow-sm transition-shadow hover:shadow-md",
                    plan.popular
                      ? "border-orange-300 ring-1 ring-orange-200"
                      : "border-neutral-200",
                  )}
                >
                  <CardContent className="p-5">
                    {plan.popular && (
                      <Badge className="absolute top-4 right-4 bg-orange-500 text-white hover:bg-orange-600">
                        <Crown className="mr-1 h-3 w-3" />
                        Popular
                      </Badge>
                    )}
                    <p className="font-heading text-base font-bold text-neutral-900">
                      {plan.name}
                    </p>
                    <p className="mt-1 text-2xl font-bold text-neutral-900">
                      ${plan.price}
                      <span className="text-sm font-normal text-neutral-400">
                        /mo
                      </span>
                    </p>
                    <ul className="mt-4 space-y-2">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-2 text-xs text-neutral-600"
                        >
                          <Check className="h-3 w-3 shrink-0 text-emerald-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={cn(
                        "mt-5 w-full rounded-xl text-sm font-medium",
                        plan.popular
                          ? "bg-orange-500 text-white hover:bg-orange-600"
                          : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50",
                      )}
                      variant={plan.popular ? "default" : "outline"}
                    >
                      Upgrade to {plan.name}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent invoices */}
          <Card className="rounded-2xl border-neutral-200 shadow-sm">
            <CardContent className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-neutral-400">
                  Recent Invoices
                </h3>
                <button className="flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700">
                  View All <ExternalLink className="h-3 w-3" />
                </button>
              </div>
              <Separator className="mb-2" />
              <div className="divide-y divide-neutral-100">
                {invoices.map((inv, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-3.5"
                  >
                    <div>
                      <p className="text-sm font-medium text-neutral-700">
                        {inv.desc}
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-400">
                        {inv.date}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="secondary"
                        className="bg-emerald-50 text-emerald-600 hover:bg-emerald-50"
                      >
                        {inv.status}
                      </Badge>
                      <span className="text-sm font-semibold text-neutral-900">
                        {inv.amount}
                      </span>
                      <button className="text-neutral-400 transition-colors hover:text-neutral-600">
                        <Receipt className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </BlurFade>
    </div>
  );
}
