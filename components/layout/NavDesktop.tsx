"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

type DropdownItem = { name: string; desc: string; href: string }
type DropdownSection = { title: string; items: DropdownItem[] }
type DropdownDef = { sections: DropdownSection[] }

const navItems: Array<{ label: string; href?: string; dropdown?: DropdownDef }> = [
  {
    label: "Platform",
    dropdown: {
      sections: [
        {
          title: "Deploy",
          items: [
            { name: "Agent Templates", desc: "Ready-made agents for business workflows", href: "#agent-templates" },
            { name: "Managed AI", desc: "MiniMax included by default, no user API key required", href: "#how-it-works" },
            { name: "Simple Plans", desc: "Pricing by deployed agents and usage limits", href: "#pricing" },
          ],
        },
        {
          title: "Manage",
          items: [
            { name: "Dashboard", desc: "Monitor deployed agents and provisioning logs", href: "/dashboard" },
            { name: "Custom Agents", desc: "Founder-led builds for your exact workflow", href: "#custom-agents" },
            { name: "Roadmap", desc: "Channels, workflow templates, and marketplace direction", href: "#features" },
          ],
        },
      ],
    },
  },
  {
    label: "Solutions",
    dropdown: {
      sections: [
        {
          title: "Use Cases",
          items: [
            { name: "Agencies", desc: "Deploy agents for multiple clients from one dashboard", href: "#features" },
            { name: "Small Teams", desc: "Automate support, research, content, and document work", href: "#features" },
            { name: "Support Teams", desc: "Start with a customer support agent template", href: "#agent-templates" },
          ],
        },
        {
          title: "Future App Deploys",
          items: [
            { name: "Express", desc: "Straightforward backend Docker template", href: "#faq" },
            { name: "Next.js", desc: "Docker-first app deploy template path", href: "#faq" },
            { name: "WordPress", desc: "Supportable as a separate managed app product", href: "#faq" },
          ],
        },
      ],
    },
  },
  { label: "Pricing", href: "#pricing" },
  { label: "Docs", href: "/docs" },
]

export function NavDesktop() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleEnter = (label: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setActiveDropdown(label)
  }

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setActiveDropdown(null), 120)
  }

  return (
    <div className="hidden items-center gap-9 md:flex">
      {navItems.map((item) =>
        item.dropdown ? (
          <div key={item.label} className="relative" onMouseEnter={() => handleEnter(item.label)} onMouseLeave={handleLeave}>
            <button
              className={`flex items-center gap-2 rounded-md px-1 py-2 text-[16px] font-bold transition-colors ${
                activeDropdown === item.label ? "text-neutral-950" : "text-neutral-800 hover:text-violet-700"
              }`}
            >
              {item.label}
              <ChevronDown className={`size-4 transition-transform duration-200 ${activeDropdown === item.label ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {activeDropdown === item.label && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.13 }}
                  className="absolute left-1/2 top-full mt-2 min-w-[22.5rem] -translate-x-1/2 rounded-lg border border-neutral-200 bg-white p-5 shadow-2xl shadow-neutral-900/10"
                  onMouseEnter={() => handleEnter(item.label)}
                  onMouseLeave={handleLeave}
                >
                  <div className="absolute -top-1.5 left-1/2 size-3 -translate-x-1/2 rotate-45 border-l border-t border-neutral-200 bg-white" />
                  <div className={`grid gap-6 ${item.dropdown.sections.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                    {item.dropdown.sections.map((section) => (
                      <div key={section.title}>
                        <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-500">{section.title}</p>
                        <div className="space-y-0.5">
                          {section.items.map((di) => (
                            <Link
                              key={di.name}
                              href={di.href}
                              onClick={() => setActiveDropdown(null)}
                              className="group flex flex-col rounded-md px-3 py-2.5 transition-colors hover:bg-neutral-50"
                            >
                              <span className="text-[13px] font-semibold text-neutral-800 group-hover:text-neutral-900">{di.name}</span>
                              <span className="mt-0.5 text-[12px] leading-snug text-neutral-400">{di.desc}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <Link
            key={item.label}
            href={item.href ?? "#"}
            className="rounded-md px-1 py-2 text-[16px] font-bold text-neutral-800 transition-colors hover:text-violet-700"
          >
            {item.label}
          </Link>
        ),
      )}
    </div>
  )
}
