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
    timeoutRef.current = setTimeout(() => setActiveDropdown(null), 150)
  }

  return (
    <nav className="hidden items-center gap-1 md:flex">
      {navItems.map((item) =>
        item.dropdown ? (
          <div
            key={item.label}
            className="relative"
            onMouseEnter={() => handleEnter(item.label)}
            onMouseLeave={handleLeave}
          >
            <button
              className={`flex items-center gap-1 text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900 ${
                activeDropdown === item.label ? "text-neutral-900" : ""
              }`}
            >
              {item.label}
              <ChevronDown
                className={`size-3.5 transition-transform ${
                  activeDropdown === item.label ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {activeDropdown === item.label && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute left-1/2 top-full mt-2 w-96 -translate-x-1/2 rounded-lg border border-neutral-200 bg-white p-2 shadow-xl"
                  onMouseEnter={() => handleEnter(item.label)}
                  onMouseLeave={handleLeave}
                >
                  <div className="grid grid-cols-2 gap-4">
                    {item.dropdown.sections.map((section) => (
                      <div key={section.title}>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                          {section.title}
                        </p>
                        <div className="space-y-1">
                          {section.items.map((di) => (
                            <Link
                              key={di.name}
                              href={di.href}
                              className="block rounded-md px-2 py-1.5 text-sm hover:bg-neutral-50"
                              onClick={() => setActiveDropdown(null)}
                            >
                              <span className="font-medium text-neutral-900">{di.name}</span>
                              <span className="mt-0.5 block text-xs text-neutral-500">{di.desc}</span>
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
            className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
          >
            {item.label}
          </Link>
        ),
      )}
    </nav>
  )
}