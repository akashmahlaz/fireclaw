"use client"

import { BarChart3, CalendarClock, Code2, FileText, MessageSquare, ShieldCheck, Workflow, Wrench } from "lucide-react"
import { BlurFade } from "@/components/ui/blur-fade"

const audiences = [
  {
    icon: MessageSquare,
    title: "Small teams",
    text: "Deploy a reliable support, research, or operations agent before hiring infrastructure help.",
  },
  {
    icon: Workflow,
    title: "Agencies",
    text: "Run client agents with plan limits, usage visibility, and repeatable delivery patterns.",
  },
  {
    icon: Wrench,
    title: "Founders",
    text: "Turn recurring internal work into managed agent workflows without building a full internal tool.",
  },
]

const roadmap = [
  { icon: FileText, title: "Template catalog", text: "Curated ADK and OpenClaw agents with productized health checks and plan gates." },
  { icon: MessageSquare, title: "Business channels", text: "Web chat first, then WhatsApp and other channels where customers already work." },
  { icon: Code2, title: "App deploys", text: "Express and Next.js templates can become clean Docker deploy paths after agents mature." },
  { icon: CalendarClock, title: "Marketplace", text: "Reusable workflows, custom builds, and partner templates after the core motion is proven." },
]

const metrics = [
  { label: "Customer conversations", value: "18.4k" },
  { label: "Documents processed", value: "7.1k" },
  { label: "Escalations avoided", value: "42%" },
]

export function Features() {
  return (
    <section id="features" className="border-b border-neutral-200 bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <BlurFade inView delay={0}>
          <div className="mb-12 grid gap-8 lg:grid-cols-[0.86fr_1.14fr]">
            <div>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[3px] text-neutral-500">Who it serves</p>
              <h2 className="text-[34px] font-black leading-[1.1] text-neutral-950 sm:text-[46px]">
                Position FireClaw as an operating layer, not another AI toy.
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {audiences.map((item) => (
                <div key={item.title} className="border border-neutral-200 bg-white p-5 shadow-sm">
                  <item.icon className="mb-4 size-5 text-orange-600" />
                  <h3 className="text-[15px] font-bold text-neutral-950">{item.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-neutral-600">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </BlurFade>

        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <BlurFade inView delay={0.08}>
            <div className="h-full border border-neutral-200 bg-neutral-950 p-6 text-white shadow-xl shadow-neutral-900/10">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-500">Executive view</p>
                  <h3 className="mt-1 text-[26px] font-black">Workflow impact</h3>
                </div>
                <BarChart3 className="size-5 text-orange-300" />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {metrics.map((metric) => (
                  <div key={metric.label} className="border border-white/10 bg-white/[0.04] p-4">
                    <p className="font-mono text-[28px] font-semibold text-white">{metric.value}</p>
                    <p className="mt-2 text-[12px] leading-snug text-neutral-400">{metric.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 grid gap-2">
                {["Usage limits protect cost", "Live health shows reliability", "Escalation rules preserve human control"].map((item) => (
                  <div key={item} className="flex items-center gap-3 border border-white/10 bg-white/[0.03] px-4 py-3 text-[13px] text-neutral-300">
                    <ShieldCheck className="size-4 text-emerald-400" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </BlurFade>

          <BlurFade inView delay={0.12}>
            <div className="h-full border border-neutral-200 bg-neutral-50 p-6">
              <div className="mb-8 max-w-2xl">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[3px] text-neutral-500">Product direction</p>
                <h3 className="text-[28px] font-black text-neutral-950 sm:text-[34px]">
                  Build trust by showing a roadmap that compounds.
                </h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {roadmap.map((item) => (
                  <div key={item.title} className="border border-neutral-200 bg-white p-4">
                    <item.icon className="mb-4 size-5 text-neutral-800" />
                    <h4 className="text-[14px] font-bold text-neutral-950">{item.title}</h4>
                    <p className="mt-2 text-[12px] leading-relaxed text-neutral-600">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </BlurFade>
        </div>
      </div>
    </section>
  )
}
