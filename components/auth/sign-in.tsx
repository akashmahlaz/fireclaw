"use client"

import Link from "next/link"
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button"
 
export default function SignIn() {
  return (
    <Link href="/auth/signin">
      <InteractiveHoverButton>Sign In</InteractiveHoverButton>
    </Link>
  )
}
