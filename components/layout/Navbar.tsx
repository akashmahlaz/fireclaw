import Link from "next/link"
import { auth } from "@/auth"
import { NavDesktop } from "./NavDesktop"
import { NavActions } from "./NavActions"
import { MobileNav } from "./MobileNav"

export default async function Navbar() {
  const session = await auth()
  const isLoggedIn = !!session

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-100 bg-white backdrop-blur-xl md:bg-white/95">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Wordmark */}
        <Link
          href="/"
          className="shrink-0 text-sm font-black tracking-[0.12em] text-neutral-900 uppercase"
        >
          FIRECLAW
        </Link>

        {/* Desktop mega-menu */}
        <NavDesktop />

        {/* Right: sign-in + CTA + mobile hamburger */}
        <div className="flex items-center gap-3">
          <NavActions isLoggedIn={isLoggedIn} />
          <MobileNav isLoggedIn={isLoggedIn} />
        </div>
      </nav>
    </header>
  )
}
