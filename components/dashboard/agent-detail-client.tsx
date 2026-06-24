"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Rocket,
  Shield,
  Zap,
  Globe,
} from "lucide-react";
import {
  getPlan,
  type AgentTemplate,
  type AgentPricingTier,
} from "@/lib/agent-catalog";
import { cn } from "@/lib/utils";

interface Props {
  template: AgentTemplate;
}

export function AgentDetailClient({ template }: Props) {
  const router = useRouter();
  const plan = getPlan(template.minimumPlan);
  const isDeployable = template.status === "deployable";
  const isCustom = template.status === "custom-setup";

  const handleDeploy = () => {
    if (!isDeployable) return;
    router.push(`/dashboard/deploy?template=${template.id}`);
  };

  return (
    <div className="px-6 py-10 lg:px-12 lg:py-14 max-w-5xl">
      {/* Back link */}
      <Link
        href="/dashboard/marketplace"
        className="mb-8 inline-flex items-center gap-1.5 text-[12px] font-medium text-stone-500 transition-colors hover:text-stone-900"
      >
        <ArrowLeft className="size-3.5" />
        Marketplace
      </Link>

      {/* Hero */}
      <section className="mb-14 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="mb-5 flex items-center gap-3">
            {template.logoUrl ? (
              <div className="flex size-12 items-center justify-center overflow-hidden rounded-xl bg-stone-50">
                <Image
                  src={template.logoUrl}
                  alt=""
                  width={36}
                  height={36}
                  className="size-9"
                />
              </div>
            ) : (
              <div className="flex size-12 items-center justify-center rounded-xl bg-stone-50 text-2xl">
                {template.icon}
              </div>
            )}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-stone-400">
                {template.category}
              </p>
              <h1 className="font-display text-[2rem] leading-tight text-stone-900">
                {template.name}
              </h1>
            </div>
          </div>
          <p className="mb-6 max-w-xl text-[18px] leading-snug text-stone-800">
            {template.tagline}
          </p>
          <p className="mb-8 max-w-xl text-[14px] leading-relaxed text-stone-500">
            {template.description}
          </p>

          {/* Primary CTA */}
          <div className="flex items-center gap-3">
            {isDeployable ? (
              <button
                onClick={handleDeploy}
                className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-6 py-3 text-[13px] font-semibold text-white transition-all hover:bg-stone-700 active:scale-[0.97]"
              >
                <Rocket className="size-4" />
                Deploy {template.name}
              </button>
            ) : isCustom ? (
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-6 py-3 text-[13px] font-semibold text-white transition-all hover:bg-stone-700"
              >
                Talk to founders
                <ArrowRight className="size-4" />
              </Link>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-6 py-3 text-[13px] font-semibold text-stone-500">
                Coming soon
              </span>
            )}
            <Link
              href="/dashboard/marketplace"
              className="text-[13px] font-medium text-stone-500 hover:text-stone-900"
            >
              See all agents
            </Link>
          </div>
        </div>

        {/* Hero image */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-stone-200 bg-stone-50">
          {template.imageUrl ? (
            <Image
              src={template.imageUrl}
              alt={template.name}
              fill
              sizes="(min-width: 1024px) 360px, 100vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-7xl">
              {template.icon}
            </div>
          )}
        </div>
      </section>

      {/* Capabilities */}
      <section className="mb-14">
        <h2 className="mb-6 text-[13px] font-semibold uppercase tracking-[0.15em] text-stone-400">
          What it can do
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {template.capabilities.map((cap) => (
            <li
              key={cap}
              className="flex items-start gap-3 rounded-xl border border-stone-100 bg-white p-4"
            >
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <Check className="size-3" strokeWidth={3} />
              </span>
              <span className="text-[13px] text-stone-700 leading-relaxed">
                {cap}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Pricing */}
      <section className="mb-14">
        <h2 className="mb-6 text-[13px] font-semibold uppercase tracking-[0.15em] text-stone-400">
          Pricing
        </h2>
        {template.pricingTiers && template.pricingTiers.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {template.pricingTiers.map((tier) => (
              <PricingTierCard key={tier.label} tier={tier} />
            ))}
          </div>
        ) : (
          <PlanFallbackCard
            planName={plan.name}
            price={plan.price}
            period={plan.period}
            includes={plan.includedAiCredits}
            features={plan.features}
            highlighted
          />
        )}
        <p className="mt-4 text-[12px] text-stone-400">
          Requires a Fireclaw {plan.name} plan or higher. Billing handled at
          deploy time.
        </p>
      </section>

      {/* What's included on every agent */}
      <section>
        <h2 className="mb-6 text-[13px] font-semibold uppercase tracking-[0.15em] text-stone-400">
          Every Fireclaw agent ships with
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <IncludedBadge
            icon={Globe}
            title="Subdomain + HTTPS"
            text="Your own *.fireclaw.ai address, secured automatically."
          />
          <IncludedBadge
            icon={Shield}
            title="Dedicated server"
            text="Cost-optimised Hetzner instance picked at deploy time."
          />
          <IncludedBadge
            icon={Zap}
            title="Live monitoring"
            text="Health checks, status, and provision logs in your dashboard."
          />
        </div>
      </section>
    </div>
  );
}

/* ── Pricing cards ──────────────────────────────────────────────────────── */

function PricingTierCard({ tier }: { tier: AgentPricingTier }) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-white p-5",
        tier.highlighted
          ? "border-stone-900 shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
          : "border-stone-200",
      )}
    >
      <div className="mb-1 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-stone-400">
          {tier.label}
        </p>
        {tier.highlighted && (
          <span className="rounded-full bg-stone-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
            Popular
          </span>
        )}
      </div>
      <p className="font-display text-[2rem] leading-tight text-stone-900">
        {tier.price}
        <span className="ml-1 text-[13px] font-medium text-stone-400">
          {tier.period}
        </span>
      </p>
      <p className="mt-2 text-[12px] text-stone-500 leading-snug">
        {tier.includes}
      </p>
    </div>
  );
}

function PlanFallbackCard({
  planName,
  price,
  period,
  includes,
  features,
  highlighted,
}: {
  planName: string;
  price: string;
  period: string;
  includes: string;
  features: string[];
  highlighted?: boolean;
}) {
  return (
    <div
      className={cn(
        "max-w-md rounded-2xl border bg-white p-6",
        highlighted ? "border-stone-900" : "border-stone-200",
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-stone-400">
        {planName} Plan
      </p>
      <p className="mt-1 font-display text-[2.25rem] leading-tight text-stone-900">
        {price}
        <span className="ml-1 text-[14px] font-medium text-stone-400">
          {period}
        </span>
      </p>
      <p className="mt-2 text-[13px] text-stone-500">{includes}</p>
      <ul className="mt-4 space-y-2">
        {features.map((f) => (
          <li
            key={f}
            className="flex items-start gap-2 text-[13px] text-stone-700"
          >
            <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

function IncludedBadge({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-stone-100 bg-white p-4">
      <div className="mb-2 flex size-8 items-center justify-center rounded-lg bg-stone-50">
        <Icon className="size-4 text-stone-700" />
      </div>
      <p className="text-[13px] font-semibold text-stone-900">{title}</p>
      <p className="mt-1 text-[12px] text-stone-500 leading-snug">{text}</p>
    </div>
  );
}
