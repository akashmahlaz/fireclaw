import Link from "next/link";
import { Flame } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-heading text-lg font-bold">
          <Flame className="size-5 text-orange-500" />
          FireClaw
        </Link>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link href="#features" className="text-muted-foreground transition-colors hover:text-foreground">
            Features
          </Link>
          <Link href="#pricing" className="text-muted-foreground transition-colors hover:text-foreground">
            Pricing
          </Link>
          <Link href="#how-it-works" className="text-muted-foreground transition-colors hover:text-foreground">
            How It Works
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" render={<Link href="/login" />}>
            Log in
          </Button>
          <Button size="sm" render={<Link href="/login" />}>
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
}
