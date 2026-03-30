import Link from "next/link";
import { Flame } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="w-full border-t bg-muted/30 px-4 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <Link href="/" className="flex items-center gap-2 font-heading text-lg font-bold">
            <Flame className="size-5 text-orange-500" />
            FireClaw
          </Link>
          <nav className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <Link href="#features" className="hover:text-foreground">Features</Link>
            <Link href="#pricing" className="hover:text-foreground">Pricing</Link>
            <Link href="#how-it-works" className="hover:text-foreground">How It Works</Link>
          </nav>
        </div>
        <Separator />
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} FireClaw. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
