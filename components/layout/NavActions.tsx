"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function NavActions({ isLoggedIn }: { isLoggedIn: boolean }) {
  if (isLoggedIn) {
    return (
      <div className="hidden items-center md:flex">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-neutral-700"
        >
          Dashboard
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    )
  }

  return (
    <div className="hidden items-center gap-3 md:flex">
      <Link
        href="/auth/signin"
        className="text-[13px] font-medium text-neutral-500 transition-colors hover:text-neutral-900"
      >
        Log in
      </Link>
      <Link
        href="/auth/signin"
        className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-neutral-700"
      >
        Get started
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  )
}
