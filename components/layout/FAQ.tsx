"use client"

import { BlurFade } from "@/components/ui/blur-fade"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    q: "What is FireClaw?",
    a: "FireClaw is a managed platform for deploying business AI agents. You choose an agent template or request a custom build, and FireClaw handles hosting, SSL, deployment logs, and default AI model configuration.",
  },
  {
    q: "Do users need to add an AI API key?",
    a: "No for the default flow. FireClaw attaches managed MiniMax access so every deployed agent starts working immediately. Claude, OpenAI, and BYO keys are upgrade paths for advanced users.",
  },
  {
    q: "How long does deployment take?",
    a: "The product goal is a deploy flow that feels like minutes, not cloud setup. The dashboard shows live provisioning logs while FireClaw chooses the runtime, configures SSL, and checks health.",
  },
  {
    q: "Why do you not show regions in the deploy flow?",
    a: "Most customers do not want to choose data centers. FireClaw picks the most cost-effective healthy location internally and keeps advanced infrastructure choices out of the normal flow.",
  },
  {
    q: "Can FireClaw build custom agents?",
    a: "Yes. Custom builds are for workflows that need private data, tools, integrations, channels, or a higher quality model than the default MiniMax setup.",
  },
  {
    q: "Can FireClaw deploy WordPress, Express, or Next.js apps?",
    a: "Express and Next.js are straightforward future Docker templates. WordPress is supportable too, but it should be treated as a separate managed app product because it needs database, backups, plugin policy, and update handling.",
  },
  {
    q: "How does FireClaw keep OpenClaw updated?",
    a: "OpenClaw stays upstream-trackable. FireClaw-specific work lives in a small patch layer, deployment image, and app orchestration so upstream updates can be rebased and smoke-tested regularly.",
  },
]

export function FAQ() {
  return (
    <section id="faq" className="bg-neutral-50 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-6">
        <BlurFade inView delay={0}>
          <div className="mb-12 text-center">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[3px] text-neutral-400">FAQ</p>
            <h2 className="text-[34px] font-black leading-[1.1] tracking-[-0.03em] text-neutral-950 sm:text-[46px]">
              Practical answers for the new direction.
            </h2>
          </div>
        </BlurFade>

        <BlurFade inView delay={0.1}>
          <Accordion className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} className="border-b border-neutral-200">
                <AccordionTrigger className="py-5 text-left text-[15px] font-semibold text-neutral-950 hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-[14px] leading-relaxed text-neutral-600">
                  <p>{faq.a}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </BlurFade>
      </div>
    </section>
  )
}
