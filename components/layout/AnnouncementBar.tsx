"use client"

import { useState } from "react"
import Link from "next/link"
import { X, ArrowRight } from "lucide-react"

export function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="relative z-50 flex items-center justify-center gap-3 bg-orange-600 px-4 py-2.5 text-white">
      <p className="text-[13px] font-medium tracking-wide">
        <span className="opacity-90">Early Access is live —</span>{" "}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 font-semibold underline-offset-2 hover:underline"
        >
          Deploy your OpenClaw in under 60 seconds
          <ArrowRight className="inline size-3.5" />
        </Link>
      </p>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss announcement"
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 opacity-70 transition-opacity hover:opacity-100"
      >
        <X className="size-3.5" />
      </button>
    </div>
  )
}
