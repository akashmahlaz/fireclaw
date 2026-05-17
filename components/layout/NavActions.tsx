"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function NavActions({ isLoggedIn }: { isLoggedIn: boolean }) {
  if (isLoggedIn) {
    return (
      <div className="hidden items-center md:flex">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700"
        >
          Dashboard
          <ArrowRight className="size-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="hidden items-center gap-3 md:flex">
      <Link
        href="/auth/signin"
        className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
      >
        Log in
      </Link>
      <Link
        href="/auth/signin"
        className="inline-flex items-center gap-2 rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700"
      >
        Get started
        <ArrowRight className="size-4" />
      </Link>
    </div>
  )
}
