"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, ArrowRight } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { FireclawLogo } from "./FireclawLogo"

const navLinks = [
  { label: "Platform", href: "#features" },
  { label: "Solutions", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Docs", href: "/docs" },
  { label: "How It Works", href: "#how-it-works" },
]

export function MobileNav({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="flex size-9 items-center justify-center rounded-lg text-neutral-600 transition-colors hover:bg-neutral-100"
      >
        <Menu className="size-5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex flex-col bg-white"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5"
              >
                <FireclawLogo size={28} />
                <span className="text-sm font-black uppercase tracking-[0.12em] text-neutral-900">
                  FIRECLAW
                </span>
              </Link>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex size-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 transition-colors active:bg-neutral-200"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Links */}
            <nav className="flex flex-1 flex-col gap-1 px-4 pt-4">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href + link.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.2 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-2xl px-4 py-3.5 text-[16px] font-semibold text-neutral-700 transition-colors active:bg-neutral-50"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Actions — pinned to bottom */}
            <div className="border-t border-neutral-100 px-6 pb-8 pt-4">
              <div className="flex flex-col gap-3">
                {isLoggedIn ? (
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-neutral-900 px-5 py-3.5 text-[15px] font-semibold text-white transition-colors active:bg-neutral-700"
                  >
                    Dashboard
                    <ArrowRight className="size-4" />
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/auth/signin"
                      onClick={() => setOpen(false)}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-neutral-900 px-5 py-3.5 text-[15px] font-semibold text-white transition-colors active:bg-neutral-700"
                    >
                      Get started
                      <ArrowRight className="size-4" />
                    </Link>
                    <Link
                      href="/auth/signin"
                      onClick={() => setOpen(false)}
                      className="w-full rounded-full border border-neutral-200 px-5 py-3.5 text-center text-[15px] font-semibold text-neutral-700 transition-colors active:bg-neutral-50"
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
    </div>
  )
}
