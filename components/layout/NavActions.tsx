"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function NavActions({ isLoggedIn }: { isLoggedIn: boolean }) {
  if (isLoggedIn) {
    return (
      <div className="hidden items-center md:flex">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-3 rounded-lg bg-violet-600 px-6 py-3.5 text-[17px] font-bold text-white shadow-lg shadow-violet-600/20 transition-colors hover:bg-violet-700"
        >
          Dashboard
          <ArrowRight className="size-5" />
        </Link>
      </div>
    )
  }

  return (
    <div className="hidden items-center gap-3 md:flex">
      <Link
        href="/auth/signin"
        className="text-[15px] font-bold text-neutral-600 transition-colors hover:text-neutral-950"
      >
        Log in
      </Link>
      <Link
        href="/auth/signin"
        className="inline-flex items-center gap-3 rounded-lg bg-violet-600 px-6 py-3.5 text-[17px] font-bold text-white shadow-lg shadow-violet-600/20 transition-colors hover:bg-violet-700"
      >
        Get started
        <ArrowRight className="size-5" />
      </Link>
    </div>
  )
}
