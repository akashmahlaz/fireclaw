import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Clock3,
  Headphones,
  Search,
  Send,
  ShieldCheck,
  Zap,
} from "lucide-react"



const trustItems = [
  { icon: Zap, title: "No code setup", text: "Deploy in minutes" },
  { icon: Clock3, title: "Instant deployment", text: "Get started right away" },
  { icon: ShieldCheck, title: "Enterprise ready", text: "Secure and scalable" },
]

const statusIcons = [Search, BookOpen, Headphones, Send, BarChart3]

export function Hero() {
  return (
    <section className="relative min-h-[calc(100svh-88px)] overflow-hidden border-b border-violet-100 bg-white">
      <Image
        src="/hero1.png"
        alt="Operator working calmly while AI agents complete business tasks"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[62%_center]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.985)_0%,rgba(255,255,255,0.94)_30%,rgba(255,255,255,0.48)_57%,rgba(255,255,255,0.04)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_38%_38%,rgba(124,58,237,0.13),transparent_34%)]" />

      <div className="relative z-10 mx-auto min-h-[calc(100svh-88px)] max-w-[1600px] px-8 lg:px-12">
        <div className="flex min-h-[calc(100svh-88px)] items-center pt-2">
          <div className="w-full max-w-[720px] pb-20">
            <div className="mb-14 inline-flex items-center gap-3 rounded-lg border border-violet-200 bg-white/80 px-4 py-2.5 text-[16px] font-medium text-slate-700 shadow-sm shadow-violet-950/5 backdrop-blur">
              <span className="size-2.5 rounded-full bg-violet-600" />
              Managed agent infrastructure for serious teams
            </div>

            <h1 className="max-w-[12.5ch] text-[66px] font-black leading-[1.03] tracking-[-0.052em] text-black sm:text-[86px] lg:text-[92px]">
              Deploy AI{" "}
              <span className="block bg-gradient-to-r from-violet-600 to-violet-500 bg-clip-text text-transparent">
                Agents for Business
              </span>
            </h1>

            <p className="mt-9 max-w-[640px] text-[24px] leading-[1.47] text-slate-600">
              Deploy, monitor, and scale AI agents across your organization - all from one powerful platform.
            </p>

            <div className="mt-11 flex flex-col gap-5 sm:flex-row">
              <Link
                href="/auth/signin"
                className="inline-flex items-center justify-center gap-4 rounded-lg bg-violet-600 px-7 py-4 text-[18px] font-bold text-white shadow-xl shadow-violet-600/20 transition hover:bg-violet-700"
              >
                Start Deploying
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="#agent-templates"
                className="inline-flex items-center justify-center gap-2 rounded-3xl border  bg-white/80 px-4 py-2 text-sm font-bold text-violet-700 shadow-sm backdrop-blur transition hover:bg-white"
              >
                Explore Agents
                <span className="flex size-6 items-center justify-center rounded-full border border-violet-500">
                  <ArrowRight className="size-3.5" />
                </span>
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-12 left-8 z-20 hidden grid-cols-3 gap-13 lg:grid lg:px-4">
          {trustItems.map((item) => (
            <div key={item.title} className="grid grid-cols-[50px_1fr] items-center gap-4">
              <span className="flex size-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                <item.icon className="size-5" />
              </span>
              <span>
                <span className="block text-[14px] font-black text-neutral-950">{item.title}</span>
                <span className="mt-1 block text-[14px] font-medium text-slate-500">{item.text}</span>
              </span>
            </div>
          ))}
        </div>

        <svg className="pointer-events-none absolute inset-0 hidden h-full w-full text-violet-300/70 lg:block" aria-hidden="true">
          <path d="M920 196 C 1020 130, 1240 150, 1348 250 S 1460 472, 1336 560" fill="none" stroke="currentColor" strokeDasharray="7 11" strokeWidth="2" />
          <path d="M760 466 C 896 362, 1046 450, 1108 536 S 1306 638, 1438 540" fill="none" stroke="currentColor" strokeDasharray="7 11" strokeWidth="2" />
          <path d="M1030 318 L 1030 450" fill="none" stroke="currentColor" strokeDasharray="7 11" strokeWidth="2" />
        </svg>

        {/* <div className="hidden lg:block">
          {agentCards.map((agent, index) => (
            <div
              key={agent.name}
              className={`hero-agent-card absolute z-20 rounded-xl border border-violet-100 bg-white/94 p-5 shadow-2xl shadow-violet-950/10 backdrop-blur-xl ${agent.className}`}
              style={{ animationDelay: `${index * 0.5}s` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <span className="flex size-13 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                    <agent.icon className="size-7" />
                  </span>
                  <div>
                    <h3 className="text-[15px] font-black text-black">{agent.name}</h3>
                    <p className="mt-2 text-[13px] leading-snug text-slate-700">{agent.result}</p>
                  </div>
                </div>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-[13px] font-black text-white">
                  {agent.avatar}
                </span>
              </div>

              <div className="mt-5 flex items-end justify-between gap-5">
                <div className="h-9 flex-1 overflow-hidden">
                  <svg viewBox="0 0 144 40" className="h-full w-full text-violet-600" aria-hidden="true">
                    <path d="M2 29 C 16 16, 26 30, 42 18 S 66 10, 82 20 S 112 29, 142 8" fill="none" stroke="currentColor" strokeWidth="3.2" />
                  </svg>
                </div>
                <span className="text-[18px] font-black text-violet-600">{agent.metric}</span>
              </div>

              <span className="mt-4 inline-flex rounded-lg bg-violet-100 px-4 py-1.5 text-[13px] font-bold text-violet-600">
                Running
              </span>
            </div>
          ))}
        </div> */}

        <div className="absolute bottom-8 left-[53%] z-30 hidden items-center gap-5 rounded-xl border border-violet-100 bg-white/88 px-6 py-4 shadow-2xl shadow-violet-950/10 backdrop-blur-xl lg:flex">
          <span className="size-2.5 rounded-full bg-violet-600" />
          <span className="text-[15px] font-bold text-neutral-900">All agents running smoothly</span>
          <div className="flex items-center gap-3">
            {statusIcons.map((Icon, index) => (
              <span key={index} className="flex size-9 items-center justify-center rounded-full bg-violet-50 text-violet-600">
                <Icon className="size-4" />
              </span>
            ))}
            <span className="flex size-9 items-center justify-center rounded-full bg-slate-100 text-[13px] font-black text-slate-600">+12</span>
          </div>
        </div>
      </div>
    </section>
  )
}
