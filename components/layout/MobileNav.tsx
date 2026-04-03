"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { Menu, X, ArrowRight } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

const navLinks = [
  { label: "Platform", href: "#features" },
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
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              className="fixed inset-y-0 right-0 z-50 flex w-72 flex-col bg-white shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="text-sm font-black uppercase tracking-[0.12em] text-neutral-900"
                >
                  FIRECLAW
                </Link>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="flex size-8 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Links */}
              <nav className="flex flex-col gap-0.5 p-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.href + link.label}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-4 py-3 text-[14px] font-medium text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Divider */}
              <div className="mx-4 border-t border-neutral-100" />

              {/* Actions */}
              <div className="flex flex-col gap-2 p-4">
                {isLoggedIn ? (
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-neutral-900 px-5 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-neutral-700"
                  >
                    Dashboard
                    <ArrowRight className="size-4" />
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setOpen(false)
                        signIn("google", { redirectTo: "/dashboard" })
                      }}
                      className="w-full rounded-full border border-neutral-200 px-5 py-3 text-[14px] font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
                    >
                      Log in
                    </button>
                    <button
                      onClick={() => {
                        setOpen(false)
                        signIn("google", { redirectTo: "/dashboard" })
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-neutral-900 px-5 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-neutral-700"
                    >
                      Get started
                      <ArrowRight className="size-4" />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
