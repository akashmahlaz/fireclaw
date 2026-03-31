import Link from "next/link"
import { auth } from "@/auth"
import { Flame } from "lucide-react"
import { NavActions } from "./NavActions"
import { MobileNav } from "./MobileNav"

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "How It Works", href: "#how-it-works" },
]

export default async function Navbar() {
  const session = await auth()
  const isLoggedIn = !!session

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-lg supports-backdrop-filter:bg-background/60">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-linear-to-br from-orange-500 to-red-600 shadow-sm">
            <Flame className="size-4 text-white" />
          </div>
          <span className="font-heading text-lg font-semibold tracking-tight">
            FireClaw
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <NavActions isLoggedIn={isLoggedIn} />
          <MobileNav isLoggedIn={isLoggedIn} />
        </div>
      </nav>
    </header>
  )
}
