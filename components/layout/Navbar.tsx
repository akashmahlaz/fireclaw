import Link from "next/link"
import { Flame } from "lucide-react"
import { auth } from "@/auth"
import { NavDesktop } from "./NavDesktop"
import { NavActions } from "./NavActions"
import { MobileNav } from "./MobileNav"

export default async function Navbar() {
  const session = await auth()
  const isLoggedIn = !!session

  return (
    <header className="sticky top-0 z-40 w-full border-b border-violet-100/80 bg-white/92 backdrop-blur-xl">
      <nav className="mx-auto flex h-[88px] max-w-[1600px] items-center justify-between px-8 lg:px-12">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3.5"
          aria-label="FireClaw home"
        >
          <span className="flex size-11 items-center justify-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-600/20">
            <Flame className="size-7" fill="currentColor" strokeWidth={1.5} />
          </span>
          <span className="text-[31px] font-black leading-none tracking-[-0.04em] text-neutral-950">
            FireClaw
          </span>
        </Link>

        <NavDesktop />

        <div className="flex items-center gap-3">
          <NavActions isLoggedIn={isLoggedIn} />
          <MobileNav isLoggedIn={isLoggedIn} />
        </div>
      </nav>
    </header>
  )
}
