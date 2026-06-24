"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { ArrowRight, Sparkles, Lock, Search } from "lucide-react";
import {
  AGENT_TEMPLATES,
  getPlan,
  type AgentTemplate,
} from "@/lib/agent-catalog";
import { cn } from "@/lib/utils";

/* ── Helpers ────────────────────────────────────────────────────────────── */

const featuredOrder: string[] = ["openclaw", "ad-chain-verify", "seo-agent"];

function sortFeatured(list: AgentTemplate[]): AgentTemplate[] {
  return [...list].sort(
    (a, b) => featuredOrder.indexOf(a.id) - featuredOrder.indexOf(b.id),
  );
}

/* ── Main ──────────────────────────────────────────────────────────────── */

export function MarketplaceClient() {
  const [query, setQuery] = useState("");

  const featured = useMemo(
    () => sortFeatured(AGENT_TEMPLATES.filter((t) => t.featured)),
    [],
  );

  const others = useMemo(() => {
    const list = AGENT_TEMPLATES.filter((t) => !t.featured);
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return list.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.tagline.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="px-6 py-10 lg:px-12 lg:py-14 max-w-6xl">
      {/* Page header */}
      <section className="mb-12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400 mb-3">
          Agent Marketplace
        </p>
        <h1 className="font-display text-[clamp(2.25rem,4.5vw,3rem)] leading-[1.05] text-stone-900 mb-3">
          Pick an agent. Deploy in minutes.
        </h1>
        <p className="text-[15px] text-stone-500 max-w-xl leading-relaxed">
          Every agent runs on its own dedicated server with HTTPS, monitoring,
          and a fireclaw.ai subdomain. No infra to manage.
        </p>
      </section>

      {/* Priority / featured rail */}
      <section className="mb-16">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.15em] text-stone-400">
            Available now
          </h2>
          <span className="hidden sm:inline text-[12px] text-stone-400">
            {featured.length} agents
          </span>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((t) => (
            <FeaturedCard key={t.id} template={t} />
          ))}
        </div>
      </section>

      {/* Coming soon */}
      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.15em] text-stone-400">
            Coming soon
          </h2>
          <label className="relative flex items-center max-w-[260px] flex-1">
            <Search className="absolute left-3 size-3.5 text-stone-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search agents"
              className="w-full rounded-full border border-stone-200 bg-white pl-9 pr-3 py-2 text-[13px] placeholder:text-stone-400 focus:border-stone-400 focus:outline-none"
            />
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((t) => (
            <ComingSoonCard key={t.id} template={t} />
          ))}
        </div>
        {others.length === 0 && (
          <p className="rounded-2xl border border-dashed border-stone-200 bg-white p-10 text-center text-[13px] text-stone-400">
            Nothing matches &ldquo;{query}&rdquo;.
          </p>
        )}
      </section>
    </div>
  );
}

/* ── Featured card ─────────────────────────────────────────────────────── */

function FeaturedCard({ template }: { template: AgentTemplate }) {
  const plan = getPlan(template.minimumPlan);
  const priceLabel = template.pricingTiers?.[0]
    ? `From ${template.pricingTiers[0].price}${template.pricingTiers[0].period}`
    : `From ${plan.price}${plan.period}`;

  return (
    <Link
      href={`/dashboard/marketplace/${template.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white transition-all hover:border-stone-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
    >
      {/* Image */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-stone-50">
        {template.imageUrl ? (
          <Image
            src={template.imageUrl}
            alt={template.name}
            fill
            sizes="(min-width: 1024px) 360px, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl">
            {template.icon}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center gap-3">
          {template.logoUrl ? (
            <div className="flex size-9 items-center justify-center overflow-hidden rounded-lg bg-stone-50">
              <Image
                src={template.logoUrl}
                alt=""
                width={28}
                height={28}
                className="size-7"
              />
            </div>
          ) : (
            <div className="flex size-9 items-center justify-center rounded-lg bg-stone-50 text-lg">
              {template.icon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold text-stone-900 leading-tight">
              {template.name}
            </p>
            <p className="text-[11px] text-stone-400 leading-tight mt-0.5">
              {template.category}
            </p>
          </div>
        </div>
        <p className="mb-5 text-[13px] text-stone-500 leading-relaxed line-clamp-2 min-h-[2.6em]">
          {template.tagline}
        </p>
        <div className="mt-auto flex items-center justify-between border-t border-stone-100 pt-4">
          <span className="text-[12px] font-medium text-stone-900">
            {priceLabel}
          </span>
          <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-stone-900 transition-colors group-hover:text-orange-600">
            View
            <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ── Coming-soon card ──────────────────────────────────────────────────── */

function ComingSoonCard({ template }: { template: AgentTemplate }) {
  const isCustom = template.status === "custom-setup";
  return (
    <div
      className={cn(
        "group relative flex items-start gap-3 rounded-2xl border border-stone-200 bg-white p-4",
        "opacity-90 hover:opacity-100 transition-opacity",
      )}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-stone-50 text-xl">
        {template.icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-[13px] font-semibold text-stone-900">
            {template.name}
          </p>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
              isCustom
                ? "bg-stone-900 text-white"
                : "bg-stone-100 text-stone-500",
            )}
          >
            {isCustom ? (
              <>
                <Sparkles className="size-2.5" />
                Talk to us
              </>
            ) : (
              <>
                <Lock className="size-2.5" />
                Soon
              </>
            )}
          </span>
        </div>
        <p className="mt-1 text-[12px] text-stone-500 leading-snug line-clamp-2">
          {template.tagline}
        </p>
      </div>
    </div>
  );
}
