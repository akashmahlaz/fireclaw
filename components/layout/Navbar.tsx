import Link from "next/link";
import { auth } from "@/auth";
import { Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react"
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button"
import SignIn from "../auth/sign-in";

export default async function Navbar() {
    const session = await auth()
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-heading text-lg font-bold">
          <Flame className="size-5 text-orange-500" />
          FireClaw
        </Link>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link href="/features" className="text-muted-foreground transition-colors hover:text-foreground">
            Features
          </Link>
          <Link href="/pricing" className="text-muted-foreground transition-colors hover:text-foreground">
            Pricing
          </Link>
          <Link href="/how-it-works" className="text-muted-foreground transition-colors hover:text-foreground">
            How It Works
          </Link>
        </nav>
        {session ? (
  <Link href="/dashboard">
    <Button>Dashboard</Button>
  </Link>
) : (
  <SignIn />
)}

      </div>
    </header>
  );
}
