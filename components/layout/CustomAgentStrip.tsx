import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function CustomAgentStrip() {
  return (
    <section className="bg-white px-6 py-12 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-2xl border border-neutral-200 bg-neutral-50/40 px-6 py-7 sm:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
              Need a workflow that is not in the catalog?
            </h2>
            <p className="mt-2 text-base leading-7 text-neutral-600">
              FireClaw also builds custom agents around your process, data, and channels.
            </p>
          </div>

          <Link
            href="/contact"
            className="inline-flex h-14 shrink-0 items-center justify-center gap-3 rounded-full bg-neutral-950 px-8 text-base font-semibold text-white transition-colors hover:bg-neutral-800"
          >
            Custom agent
            <ArrowRight className="size-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
