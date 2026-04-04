"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4">
      <p className="text-[13px] font-bold uppercase tracking-[3px] text-red-400">
        Error
      </p>
      <h1 className="mt-3 text-[32px] font-black tracking-[-0.03em] text-neutral-900">
        Something went wrong
      </h1>
      <p className="mt-2 text-[14px] text-neutral-500">
        An unexpected error occurred. Please try again.
      </p>
      <div className="mt-8 flex items-center gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-neutral-900 px-6 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-neutral-700"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-full border border-neutral-200 px-6 py-2.5 text-[13px] font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}
