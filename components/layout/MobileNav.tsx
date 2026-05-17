"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, ArrowRight } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

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
        className="flex size-9 items-center justify-center rounded-md text-neutral-600 transition-colors hover:bg-neutral-100"
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
            <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
              <Link href="/" onClick={() => setOpen(false)} aria-label="FireClaw home">
                <Image src="/fireclaw-wordmark.svg" alt="FireClaw" width={140} height={24} className="h-6 w-auto" />
              </Link>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex size-9 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Links */}
            <nav className="flex flex-1 flex-col gap-1 px-3 pt-3">
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
                    className="block rounded-md px-3 py-2.5 text-base font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Actions */}
            <div className="border-t border-neutral-200 px-4 pb-6 pt-4">
              <div className="flex flex-col gap-2">
                {isLoggedIn ? (
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
                  >
                    Dashboard
                    <ArrowRight className="size-4" />
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/auth/signin"
                      onClick={() => setOpen(false)}
                      className="flex w-full items-center justify-center gap-2 rounded-md bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-700"
                    >
                      Get started
                      <ArrowRight className="size-4" />
                    </Link>
                    <Link
                      href="/auth/signin"
                      onClick={() => setOpen(false)}
                      className="w-full rounded-md border border-neutral-300 px-4 py-2.5 text-center text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
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
