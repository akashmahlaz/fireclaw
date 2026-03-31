"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { Menu, Flame, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "How It Works", href: "#how-it-works" },
]

export function MobileNav({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<Button variant="ghost" size="icon-sm" />}>
          <Menu className="size-5" />
          <span className="sr-only">Toggle menu</span>
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>
              <Link
                href="/"
                className="flex items-center gap-2.5"
                onClick={() => setOpen(false)}
              >
                <div className="flex size-7 items-center justify-center rounded-md bg-linear-to-br from-orange-500 to-red-600">
                  <Flame className="size-3.5 text-white" />
                </div>
                <span className="text-base font-semibold tracking-tight">
                  FireClaw
                </span>
              </Link>
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 px-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <Separator className="mx-4" />
          <div className="flex flex-col gap-2 p-4">
            {isLoggedIn ? (
              <Button
                className="w-full gap-1.5"
                render={<Link href="/dashboard" />}
                onClick={() => setOpen(false)}
              >
                Dashboard
                <ArrowRight data-icon="inline-end" />
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setOpen(false)
                    signIn("google", { redirectTo: "/dashboard" })
                  }}
                >
                  Sign In
                </Button>
                <Button
                  className="w-full gap-1.5"
                  onClick={() => {
                    setOpen(false)
                    signIn("google", { redirectTo: "/dashboard" })
                  }}
                >
                  Get Started
                  <ArrowRight data-icon="inline-end" />
                </Button>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
