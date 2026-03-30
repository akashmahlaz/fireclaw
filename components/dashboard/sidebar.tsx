"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  Flame,
  LayoutDashboard,
  CreditCard,
  Settings,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/agents", label: "Agents", icon: Bot },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

interface DashboardSidebarProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 border-r bg-sidebar text-sidebar-foreground md:flex md:flex-col">
      <div className="flex h-14 items-center gap-2 px-4 font-heading text-lg font-bold">
        <Flame className="size-5 text-orange-500" />
        FireClaw
      </div>

      <Separator />

      <div className="px-3 py-3">
        <Button
          size="sm"
          className="w-full gap-1.5"
          render={<Link href="/dashboard/agents/new" />}
        >
          <Plus className="size-4" />
          New Agent
        </Button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {navItems.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Separator />

      <div className="flex items-center gap-3 p-4">
        {user.image && (
          <img
            src={user.image}
            alt=""
            className="size-8 rounded-full"
          />
        )}
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium">{user.name}</span>
          <span className="truncate text-xs text-muted-foreground">{user.email}</span>
        </div>
      </div>
    </aside>
  );
}
