"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, X } from "lucide-react"

export function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="relative z-50 flex items-center justify-center gap-2 bg-violet-600 px-4 py-2 text-sm text-white">
      <p>
        <span className="font-medium">Early Access is live</span> —{" "}
        <Link href="/auth/signin" className="inline-flex items-center gap-1 font-semibold underline-offset-2 hover:underline">
          Deploy a managed agent without adding an AI key
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
