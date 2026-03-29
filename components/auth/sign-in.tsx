
"use client"

import { signIn } from "next-auth/react"
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button"
 
export default function SignIn() {
  return <InteractiveHoverButton onClick={() => signIn("google")}>SignIn</InteractiveHoverButton>
}
