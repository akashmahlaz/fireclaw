import Link from "next/link"
import Image from "next/image"
import { auth } from "@/auth"
import { NavDesktop } from "./NavDesktop"
import { NavActions } from "./NavActions"
import { MobileNav } from "./MobileNav"

export default async function Navbar() {
  const session = await auth()
  const isLoggedIn = !!session

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200/60 bg-white/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          aria-label="FireClaw home"
          className="flex items-center"
        >
          <Image
            src="/fireclaw-wordmark.svg"
            alt="FireClaw"
            width={140}
            height={24}
            className="h-6 w-auto"
            priority
          />
        </Link>

        {/* Center nav — desktop only */}
        <NavDesktop />

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <NavActions isLoggedIn={isLoggedIn} />
          <MobileNav isLoggedIn={isLoggedIn} />
        </div>
      </nav>
    </header>
  )
}