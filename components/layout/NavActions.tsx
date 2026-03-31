"use client"

import { signIn } from "next-auth/react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function NavActions({ isLoggedIn }: { isLoggedIn: boolean }) {
  if (isLoggedIn) {
    return (
      <div className="hidden items-center md:flex">
        <Button
          size="sm"
          className="gap-1.5"
          render={<Link href="/dashboard" />}
        >
          Dashboard
          <ArrowRight data-icon="inline-end" />
        </Button>
      </div>
    )
  }

  return (
    <div className="hidden items-center gap-2 md:flex">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => signIn("google", { redirectTo: "/dashboard" })}
      >
        Sign In
      </Button>
      <Button
        size="sm"
        className="gap-1.5"
        onClick={() => signIn("google", { redirectTo: "/dashboard" })}
      >
        Get Started
        <ArrowRight data-icon="inline-end" />
      </Button>
    </div>
  )
}
