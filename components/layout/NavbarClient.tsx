"use client"

import Link from "next/link"
import Image from "next/image"
import { ChevronDown, Menu, X, ArrowRight } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useRef, useState } from "react"

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

const mobileNavLinks = [
  { label: "Platform", href: "#features" },
  { label: "Solutions", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Docs", href: "/docs" },
  { label: "How It Works", href: "#how-it-works" },
]

export function NavbarClient({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleEnter = (label: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setActiveDropdown(label)
  }

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setActiveDropdown(null), 150)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200/80 bg-white/90 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" aria-label="FireClaw home" className="flex items-center">
          <Image
            src="/fireclaw-wordmark.svg"
            alt="FireClaw"
            width={140}
            height={24}
            className="h-6 w-auto"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
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
                      className="absolute left-1/2 top-full mt-3 w-[28rem] -translate-x-1/2 rounded-xl border border-neutral-200 bg-white p-3 shadow-xl"
                      onMouseEnter={() => handleEnter(item.label)}
                      onMouseLeave={handleLeave}
                    >
                      <div className="grid grid-cols-2 gap-6">
                        {item.dropdown.sections.map((section) => (
                          <div key={section.title}>
                            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                              {section.title}
                            </p>
                            <div className="space-y-1.5">
                              {section.items.map((di) => (
                                <Link
                                  key={di.name}
                                  href={di.href}
                                  className="block rounded-lg px-3 py-2 text-sm hover:bg-neutral-50"
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
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-violet-600/20 transition-all duration-200 hover:bg-violet-700 hover:shadow-violet-600/30"
            >
              Dashboard
              <ArrowRight className="size-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
              >
                Log in
              </Link>
              <Link
                href="/auth/signin"
                className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-violet-600/20 transition-all duration-200 hover:bg-violet-700 hover:shadow-violet-600/30"
              >
                Get started
                <ArrowRight className="size-4" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="flex size-10 items-center justify-center rounded-lg text-neutral-600 transition-colors hover:bg-neutral-100 md:hidden"
        >
          <Menu className="size-5" />
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex flex-col bg-white md:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3.5">
              <Link href="/" onClick={() => setMobileOpen(false)} aria-label="FireClaw home">
                <Image src="/fireclaw-wordmark.svg" alt="FireClaw" width={140} height={24} className="h-6 w-auto" />
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="flex size-10 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Links */}
            <nav className="flex flex-1 flex-col gap-1 px-3 pt-4">
              {mobileNavLinks.map((link, i) => (
                <motion.div
                  key={link.href + link.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.2 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-4 py-3 text-base font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Actions */}
            <div className="border-t border-neutral-200 px-4 pb-8 pt-5">
              <div className="flex flex-col gap-3">
                {isLoggedIn ? (
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
                  >
                    Dashboard
                    <ArrowRight className="size-4" />
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/auth/signin"
                      onClick={() => setMobileOpen(false)}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-violet-600/20 transition-all duration-200 hover:bg-violet-700 hover:shadow-violet-600/30"
                    >
                      Get started
                      <ArrowRight className="size-4" />
                    </Link>
                    <Link
                      href="/auth/signin"
                      onClick={() => setMobileOpen(false)}
                      className="w-full rounded-lg border border-neutral-300 px-5 py-3 text-center text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                    >
                      Log in
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}