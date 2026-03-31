"use client"

import {
  CreditCard,
  Receipt,
  Zap,
  Server,
  ExternalLink,
  Check,
} from "lucide-react"
import { BlurFade } from "@/components/ui/blur-fade"
import { BorderBeam } from "@/components/ui/border-beam"
import { NumberTicker } from "@/components/ui/number-ticker"
import { RainbowButton } from "@/components/ui/rainbow-button"
import { cn } from "@/lib/utils"

const currentPlan = {
  name: "Starter",
  price: 7.99,
  specs: "2 vCPU · 4 GB RAM · 40 GB NVMe",
  features: ["1 OpenClaw instance", "3 channels", "EU region", "SSL + subdomain", "Community support"],
}

const upgradePlans = [
  { name: "Standard", price: 14.99, specs: "4 vCPU · 8 GB RAM" },
  { name: "Pro", price: 29.99, specs: "8 vCPU · 16 GB RAM", popular: true },
  { name: "Enterprise", price: 59.99, specs: "16 vCPU · 32 GB RAM" },
]

const invoices = [
  { date: "Jun 1, 2025", amount: "$7.99", status: "Paid", desc: "Starter Plan — 1 agent" },
  { date: "May 1, 2025", amount: "$7.99", status: "Paid", desc: "Starter Plan — 1 agent" },
  { date: "Apr 1, 2025", amount: "$7.99", status: "Paid", desc: "Starter Plan — 1 agent" },
]

export function BillingClient({
  agentCount,
  runningCount,
  totalMonthly,
}: {
  agentCount: number
  runningCount: number
  totalMonthly: number
}) {
  return (
    <div className="p-6 lg:p-8">
      <BlurFade inView delay={0}>
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-1 text-[22px] font-black tracking-[-0.02em] text-neutral-900">
            Billing
          </h1>
          <p className="mb-8 text-[13px] text-neutral-500">
            Manage your subscription, usage, and invoices.
          </p>

          {/* Summary cards */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <SummaryCard
              icon={CreditCard}
              label="Monthly Cost"
              value={
                <span className="text-[22px] font-black text-neutral-900">
                  $<NumberTicker value={totalMonthly} decimalPlaces={2} />
                </span>
              }
            />
            <SummaryCard
              icon={Server}
              label="Active Agents"
              value={
                <span className="text-[22px] font-black text-neutral-900">
                  <NumberTicker value={runningCount} />
                  <span className="text-[14px] font-medium text-neutral-400"> / {agentCount}</span>
                </span>
              }
            />
            <SummaryCard
              icon={Zap}
              label="Current Plan"
              value={
                <span className="text-[22px] font-black text-orange-600">
                  {currentPlan.name}
                </span>
              }
            />
          </div>

          {/* Current plan */}
          <div className="relative mb-8 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6">
            <BorderBeam size={150} borderWidth={2} colorFrom="#f97316" colorTo="#fb923c" duration={12} />
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[2px] text-neutral-400">
                  Current Plan
                </p>
                <h3 className="mt-1 text-[20px] font-black text-neutral-900">
                  {currentPlan.name}{" "}
                  <span className="font-medium text-neutral-400">
                    ${currentPlan.price}/mo
                  </span>
                </h3>
                <p className="mt-1 text-[12px] font-mono text-neutral-500">{currentPlan.specs}</p>
                <ul className="mt-3 space-y-1.5">
                  {currentPlan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-[13px] text-neutral-600">
                      <Check className="size-3 text-emerald-500" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-2">
                <button className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-neutral-700 transition-all hover:bg-neutral-50">
                  Manage Subscription
                </button>
                <button className="text-[12px] text-red-500 hover:text-red-600">
                  Cancel Plan
                </button>
              </div>
            </div>
          </div>

          {/* Upgrade options */}
          <div className="mb-8">
            <h3 className="mb-4 text-[13px] font-bold uppercase tracking-wider text-neutral-400">
              Upgrade Your Plan
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              {upgradePlans.map((plan) => (
                <div
                  key={plan.name}
                  className={cn(
                    "relative overflow-hidden rounded-2xl border bg-white p-5 transition-all hover:shadow-md",
                    plan.popular ? "border-orange-200" : "border-neutral-200",
                  )}
                >
                  {plan.popular && (
                    <>
                      <span className="absolute top-3 right-3 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white">
                        Popular
                      </span>
                      <BorderBeam size={100} borderWidth={1.5} colorFrom="#f97316" colorTo="#fb923c" duration={8} />
                    </>
                  )}
                  <p className="text-[16px] font-black text-neutral-900">{plan.name}</p>
                  <p className="mt-1 text-[22px] font-black text-neutral-900">
                    ${plan.price}
                    <span className="text-[13px] font-medium text-neutral-400">/mo</span>
                  </p>
                  <p className="mt-1 text-[12px] font-mono text-neutral-400">{plan.specs}</p>
                  <div className="mt-4">
                    {plan.popular ? (
                      <RainbowButton className="w-full text-[13px]">
                        Upgrade
                      </RainbowButton>
                    ) : (
                      <button className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 text-[13px] font-semibold text-neutral-700 transition-all hover:bg-neutral-50">
                        Upgrade
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Invoices */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[13px] font-bold uppercase tracking-wider text-neutral-400">
                Recent Invoices
              </h3>
              <button className="flex items-center gap-1 text-[12px] font-medium text-orange-600 hover:text-orange-700">
                View All <ExternalLink className="size-3" />
              </button>
            </div>
            <div className="divide-y divide-neutral-100">
              {invoices.map((inv, i) => (
                <div key={i} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-[13px] font-medium text-neutral-700">{inv.desc}</p>
                    <p className="text-[12px] text-neutral-400">{inv.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600">
                      {inv.status}
                    </span>
                    <span className="text-[14px] font-bold text-neutral-900">{inv.amount}</span>
                    <button className="text-neutral-400 hover:text-neutral-600">
                      <Receipt className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </BlurFade>
    </div>
  )
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      <div className="mb-3 flex size-9 items-center justify-center rounded-xl bg-neutral-50">
        <Icon className="size-4 text-neutral-400" />
      </div>
      <p className="mb-1 text-[11px] text-neutral-400">{label}</p>
      {value}
    </div>
  )
}
