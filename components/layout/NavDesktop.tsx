"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

type DropdownItem = { name: string; desc: string; href: string }
type DropdownSection = { title: string; items: DropdownItem[] }
type DropdownDef = { sections: DropdownSection[] }

const navItems: Array<{ label: string; href?: string; dropdown?: DropdownDef }> = [
  {
    label: "PLATFORM",
    dropdown: {
      sections: [
        {
          title: "Deploy",
          items: [
            { name: "1-Click Deploy", desc: "Launch OpenClaw on a dedicated VPS in seconds", href: "/dashboard" },
            { name: "VPS Tiers", desc: "Starter, Standard, Pro, Enterprise", href: "#pricing" },
            { name: "Regions", desc: "US, EU, and Singapore data centers", href: "#pricing" },
          ],
        },
        {
          title: "Manage",
          items: [
            { name: "Dashboard", desc: "Monitor, reboot, resize your instances", href: "/dashboard" },
            { name: "Custom Domains", desc: "Bring your own domain with SSL", href: "/dashboard" },
            { name: "Backups", desc: "Automated daily snapshots", href: "/dashboard" },
          ],
        },
      ],
    },
  },
  {
    label: "CHANNELS",
    dropdown: {
      sections: [
        {
          title: "Messaging",
          items: [
            { name: "WhatsApp", desc: "Connect your personal or business number", href: "#features" },
            { name: "Telegram", desc: "Bot and group chat automation", href: "#features" },
            { name: "Discord", desc: "Server bots and DM automation", href: "#features" },
          ],
        },
        {
          title: "More Platforms",
          items: [
            { name: "Slack", desc: "Workspace AI assistant integration", href: "#features" },
            { name: "Signal & iMessage", desc: "Private messaging support", href: "#features" },
            { name: "Web Chat", desc: "Embedded chat on any website", href: "#features" },
          ],
        },
      ],
    },
  },
  { label: "PRICING", href: "#pricing" },
  { label: "DOCS", href: "/docs" },
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
    <div className="hidden items-center gap-0.5 md:flex">
      {navItems.map((item) =>
        item.dropdown ? (
          <div
            key={item.label}
            className="relative"
            onMouseEnter={() => handleEnter(item.label)}
            onMouseLeave={handleLeave}
          >
            <button
              className={`flex items-center gap-1 rounded-md px-3.5 py-2 text-[11px] font-bold tracking-widest transition-colors ${
                activeDropdown === item.label
                  ? "text-neutral-900"
                  : "text-neutral-400 hover:text-neutral-700"
              }`}
            >
              {item.label}
              <ChevronDown
                className={`size-3 transition-transform duration-200 ${
                  activeDropdown === item.label ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {activeDropdown === item.label && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.13 }}
                  className="absolute left-1/2 top-full mt-1 min-w-85 -translate-x-1/2 rounded-2xl border border-neutral-100 bg-white p-5 shadow-xl shadow-neutral-200/60"
                  onMouseEnter={() => handleEnter(item.label)}
                  onMouseLeave={handleLeave}
                >
                  {/* Arrow pointer */}
                  <div className="absolute -top-1.5 left-1/2 size-3 -translate-x-1/2 rotate-45 border-l border-t border-neutral-100 bg-white" />

                  <div
                    className={`grid gap-6 ${
                      item.dropdown.sections.length > 1 ? "grid-cols-2" : "grid-cols-1"
                    }`}
                  >
                    {item.dropdown.sections.map((section) => (
                      <div key={section.title}>
                        <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400">
                          {section.title}
                        </p>
                        <div className="space-y-0.5">
                          {section.items.map((di) => (
                            <Link
                              key={di.name}
                              href={di.href}
                              onClick={() => setActiveDropdown(null)}
                              className="group flex flex-col rounded-xl px-3 py-2.5 transition-colors hover:bg-neutral-50"
                            >
                              <span className="text-[13px] font-semibold text-neutral-800 group-hover:text-neutral-900">
                                {di.name}
                              </span>
                              <span className="mt-0.5 text-[12px] leading-snug text-neutral-400">
                                {di.desc}
                              </span>
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
            className="rounded-md px-3.5 py-2 text-[11px] font-bold tracking-widest text-neutral-400 transition-colors hover:text-neutral-700"
          >
            {item.label}
          </Link>
        )
      )}
    </div>
  )
}
