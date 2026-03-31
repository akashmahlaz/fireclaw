"use client"

import { BlurFade } from "@/components/ui/blur-fade"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"

const faqs = [
  {
    q: "What is OpenClaw?",
    a: "OpenClaw is an open-source AI assistant engine that connects to messaging channels like WhatsApp, Telegram, Discord, and more. FireClaw deploys it on a dedicated server for you — fully configured with SSL, DNS, and health monitoring.",
  },
  {
    q: "Is my server shared with other users?",
    a: "No. Every FireClaw deployment runs on a dedicated VPS. Your data, compute, and network are completely isolated. You get root-level access to your own machine.",
  },
  {
    q: "How long does deployment take?",
    a: "Under 60 seconds on average. We provision from pre-built server snapshots, so your OpenClaw instance is live almost instantly with SSL and DNS already configured.",
  },
  {
    q: "Can I connect multiple messaging channels?",
    a: "Yes. Depending on your plan, you can connect up to unlimited channels — WhatsApp, Telegram, Discord, Slack, Signal, iMessage, and more. All from a single dashboard.",
  },
  {
    q: "What regions are available?",
    a: "We currently offer EU (Nuremberg), US (Ashburn), and Asia (Singapore). Enterprise plans can request custom regions.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. All plans are monthly with no long-term commitment. Cancel anytime from your dashboard — your server will remain active until the end of the billing period.",
  },
  {
    q: "Do I get SSH access to my server?",
    a: "Yes. All plans include full root SSH access. You can install additional software, modify configurations, or access logs directly on your VPS.",
  },
  {
    q: "What happens if my server goes down?",
    a: "Our monitoring system checks your instance every 30 seconds. If an issue is detected, we automatically restart the service. Pro and Enterprise plans include automatic failover and priority incident response.",
  },
]

export function FAQ() {
  return (
    <section id="faq" className="relative bg-neutral-50 py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-6">
        {/* Header */}
        <BlurFade inView delay={0}>
          <div className="mb-14 text-center">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[3px] text-neutral-400">
              FAQ
            </p>
            <h2 className="text-[36px] font-black leading-[1.1] tracking-[-0.03em] text-neutral-900 sm:text-[44px] lg:text-[52px]">
              Questions?
              <br />
              <span className="text-neutral-400">We&apos;ve got answers.</span>
            </h2>
          </div>
        </BlurFade>

        {/* Accordion */}
        <BlurFade inView delay={0.1}>
          <Accordion className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} className="border-b border-neutral-200">
                <AccordionTrigger className="py-5 text-[15px] font-semibold text-neutral-900 hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-[14px] leading-relaxed text-neutral-500">
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
