"use client"

import Link from "next/link"
import { Check, ArrowRight } from "lucide-react"
import { BlurFade } from "@/components/ui/blur-fade"
import { MagicCard } from "@/components/ui/magic-card"
import { BorderBeam } from "@/components/ui/border-beam"

const plans = [
  {
    name: "Starter",
    price: "€4.49",
    period: "/mo",
    description: "Perfect for testing and personal projects.",
    specs: "2 vCPU · 4 GB RAM · 40 GB NVMe",
    features: [
      "1 OpenClaw instance",
      "Dedicated VPS — not shared",
      "fireclaw.ai subdomain + SSL",
      "Full root SSH access",
      "Community support",
    ],
    highlighted: false,
  },
  {
    name: "Standard",
    price: "€6.99",
    period: "/mo",
    description: "For creators and small teams.",
    specs: "4 vCPU · 8 GB RAM · 80 GB NVMe",
    features: [
      "1 OpenClaw instance",
      "Dedicated VPS — not shared",
      "Custom domain + SSL",
      "Full root SSH access",
      "All 6 locations",
      "Email support",
    ],
    highlighted: false,
  },
  {
    name: "Pro",
    price: "€12.49",
    period: "/mo",
    badge: "Most Popular",
    description: "For businesses scaling fast.",
    specs: "8 vCPU · 16 GB RAM · 160 GB NVMe",
    features: [
      "Up to 3 instances",
      "Dedicated VPS — not shared",
      "Custom domain + SSL",
      "Full root SSH access",
      "All 6 locations",
      "Priority support",
      "API access",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "€22.99",
    period: "/mo",
    description: "Maximum power for demanding workloads.",
    specs: "16 vCPU · 32 GB RAM · 320 GB NVMe",
    features: [
      "Unlimited instances",
      "Dedicated VPS — not shared",
      "Custom domain + dedicated IP",
      "Full root SSH access",
      "All 6 locations",
      "24/7 priority support",
      "API + webhooks",
    ],
    highlighted: false,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="relative bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <BlurFade inView delay={0}>
          <div className="mb-14 text-center">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[3px] text-neutral-400">
              Pricing
            </p>
            <h2 className="text-[36px] font-black leading-[1.1] tracking-[-0.03em] text-neutral-900 sm:text-[44px] lg:text-[52px]">
              Simple pricing.
              <br />
              <span className="text-neutral-400">No hidden fees.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-neutral-500">
              Every plan includes a dedicated VPS — not shared hosting.
              No hidden fees, no markup. Cancel anytime.
            </p>
          </div>
        </BlurFade>

        {/* Pricing grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan, i) => (
            <BlurFade key={plan.name} inView delay={0.06 * i}>
              <MagicCard
                className={`relative flex h-full flex-col rounded-2xl border p-6 shadow-sm ${
                  plan.highlighted
                    ? "border-orange-200 bg-orange-50/40"
                    : "border-neutral-200 bg-white"
                }`}
                gradientSize={250}
                gradientColor={plan.highlighted ? "#fdba7430" : "#f5f5f520"}
              >
                {/* BorderBeam on highlighted card */}
                {plan.highlighted && (
                  <BorderBeam
                    size={180}
                    duration={8}
                    colorFrom="#f97316"
                    colorTo="#fbbf24"
                  />
                )}

                {/* Badge */}
                {plan.badge && (
                  <div className="mb-3 inline-flex w-fit items-center rounded-full bg-orange-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                    {plan.badge}
                  </div>
                )}

                {/* Plan name */}
                <h3 className="text-[18px] font-bold text-neutral-900">
                  {plan.name}
                </h3>

                {/* Price */}
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-[40px] font-black leading-none tracking-[-0.04em] text-neutral-900">
                    {plan.price}
                  </span>
                  <span className="text-[14px] font-medium text-neutral-400">
                    {plan.period}
                  </span>
                </div>

                {/* Description */}
                <p className="mt-2 text-[13px] leading-relaxed text-neutral-500">
                  {plan.description}
                </p>

                {/* Specs badge */}
                <div className="mt-4 rounded-lg bg-neutral-100 px-3 py-2 text-[11px] font-bold tracking-wide text-neutral-600">
                  {plan.specs}
                </div>

                {/* Features list */}
                <ul className="mt-5 flex flex-1 flex-col gap-2.5">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-[13px] text-neutral-600"
                    >
                      <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href="/auth/signin"
                  className={`mt-6 flex items-center justify-center gap-2 rounded-full px-5 py-3 text-[14px] font-semibold transition-all duration-200 ${
                    plan.highlighted
                      ? "bg-neutral-900 text-white shadow-lg shadow-neutral-900/20 hover:bg-neutral-700"
                      : "border border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50"
                  }`}
                >
                  Get started
                  <ArrowRight className="size-3.5" />
                </Link>
              </MagicCard>
            </BlurFade>
          ))}
        </div>

        {/* Bottom note */}
        <BlurFade inView delay={0.3}>
          <p className="mt-10 text-center text-[12px] text-neutral-400">
            All plans include SSL, DNS management, and full SSH access.
            All prices in EUR excl. VAT.{" "}
            <Link href="/contact" className="font-medium text-neutral-600 underline underline-offset-2 hover:text-neutral-900">
              Need something custom?
            </Link>
          </p>
        </BlurFade>
      </div>
    </section>
  )
}
