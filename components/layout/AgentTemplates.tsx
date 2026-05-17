"use client"

import Link from "next/link"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { AGENT_TEMPLATES, getPlan } from "@/lib/agent-catalog"
import { BlurFade } from "@/components/ui/blur-fade"

const templates = AGENT_TEMPLATES.filter((template) => template.status === "deployable")

export function AgentTemplates() {
  return (
    <section id="agent-templates" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <BlurFade inView delay={0}>
          <div className="mb-12 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[3px] text-neutral-400">
                Ready-made agents
              </p>
              <h2 className="text-[34px] font-black leading-[1.1] tracking-[-0.03em] text-neutral-950 sm:text-[46px]">
                Start with tested templates, not a blank prompt.
              </h2>
            </div>
            <p className="max-w-md text-[15px] leading-relaxed text-neutral-600">
              The public catalog shows only templates that are meant to become one-click deployable. Samples that need secrets or setup stay hidden until they are product-ready.
            </p>
          </div>
        </BlurFade>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {templates.map((template, index) => (
            <BlurFade key={template.id} inView delay={0.04 * index}>
              <div className="flex h-full flex-col rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                    {template.category}
                  </span>
                  <span className="text-[11px] font-semibold text-orange-600">{getPlan(template.minimumPlan).name}+</span>
                </div>
                <h3 className="text-[16px] font-bold text-neutral-950">{template.name}</h3>
                <p className="mt-2 flex-1 text-[13px] leading-relaxed text-neutral-600">{template.description}</p>
                <div className="mt-5 flex items-center gap-2 text-[12px] font-medium text-neutral-500">
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                  Managed MiniMax default
                </div>
              </div>
            </BlurFade>
          ))}
        </div>

        <BlurFade inView delay={0.3}>
          <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-5 sm:flex-row">
            <div>
              <h3 className="text-[15px] font-bold text-neutral-950">Need a workflow that is not in the catalog?</h3>
              <p className="mt-1 text-[13px] text-neutral-600">FireClaw also builds custom agents around your process, data, and channels.</p>
            </div>
            <Link
              href="#custom-agents"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-neutral-950 px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-neutral-800"
            >
              Custom agent
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </BlurFade>
      </div>
    </section>
  )
}
