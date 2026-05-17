import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function Hero() {
  return (
    <section className="relative min-h-[calc(100svh-64px)] overflow-hidden bg-white">
      <Image
        src="/hero1.png"
        alt="Operator working calmly while AI agents complete business tasks"
        fill
        priority
        quality={100}
        sizes="100vw"
        className="object-cover object-[62%_center]"
      />
      <div className="absolute inset-0" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-64px)] max-w-7xl items-center px-6 lg:px-8">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-bold tracking-tight text-neutral-900 sm:text-6xl lg:text-7xl">
            AI  Agents 
          </h1>
          <h1 className="text-5xl font-bold tracking-tight text-neutral-900 sm:text-6xl lg:text-7xl">
            For <span className="text-violet-600">Business</span>
          </h1>
          <p className="mt-6 text-xl leading-relaxed text-neutral-600">
            Deploy, Monitor, and Scale AI agents across your Business — all from one powerful platform.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href="/auth/signin"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-violet-600/20 transition-all duration-200 hover:bg-violet-700 hover:shadow-violet-600/30"
            >
              Start Deploying
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="#agent-templates"
              className="text-base font-medium text-neutral-700 transition-colors hover:text-neutral-900"
            >
              Explore agents →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
