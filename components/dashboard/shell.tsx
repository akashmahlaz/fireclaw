"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bot,
  Rocket,
  CreditCard,
  Settings,
  LogOut,
  Flame,
  Menu,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useSyncPlanStore } from "@/hooks/use-sync-plan";

/* ── Navigation ── */
const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Agents", href: "/dashboard/agents", icon: Bot },
  { label: "Marketplace", href: "/dashboard/deploy", icon: Rocket },
  { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

/* ── Props ── */
interface DashboardShellProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
  children: React.ReactNode;
}

/* ── Main Shell ── */
export function DashboardShell({ user, children }: DashboardShellProps) {
  useSyncPlanStore();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "FC";

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      {/* Desktop Rail */}
      <DesktopRail
        user={{
          name: user.name ?? "User",
          email: user.email ?? "",
          image: user.image ?? "",
          initials,
        }}
      />

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <MobileNav
            user={{
              name: user.name ?? "User",
              email: user.email ?? "",
              image: user.image ?? "",
              initials,
            }}
            onClose={() => setMobileOpen(false)}
          />
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar
          user={{
            name: user.name ?? "User",
            image: user.image ?? "",
            initials,
          }}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

/* ── Desktop Rail (68px) ── */
function DesktopRail({
  user,
}: {
  user: { name: string; email: string; image: string; initials: string };
}) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <nav className="hidden md:flex w-[68px] flex-col items-center border-r border-[var(--border)] bg-white py-5 gap-1">
      {/* Brand */}
      <Link
        href="/dashboard"
        className="mb-6 flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-sm transition-transform hover:scale-105"
        title="FireClaw"
      >
        <Flame className="size-5 text-white" />
      </Link>

      {/* Nav icons */}
      <div className="flex flex-1 flex-col items-center gap-1">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={cn(
                "flex size-10 items-center justify-center rounded-xl transition-all duration-150",
                active
                  ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm"
                  : "text-stone-400 hover:text-stone-700 hover:bg-stone-100",
              )}
            >
              <item.icon
                className="size-[18px]"
                strokeWidth={active ? 2.2 : 1.8}
              />
            </Link>
          );
        })}
      </div>

      {/* Bottom section */}
      <div className="flex flex-col items-center gap-2 mt-auto">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          title="Sign out"
          className="flex size-10 items-center justify-center rounded-xl text-stone-400 transition-colors hover:bg-red-50 hover:text-red-500"
        >
          <LogOut className="size-[18px]" strokeWidth={1.8} />
        </button>

        <Link href="/dashboard/settings" title={user.name}>
          <Avatar className="size-9 ring-2 ring-stone-100 transition-all hover:ring-orange-200">
            <AvatarImage src={user.image} alt={user.name} />
            <AvatarFallback className="bg-stone-100 text-[11px] font-semibold text-stone-600">
              {user.initials}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </nav>
  );
}

/* ── Top Bar ── */
function TopBar({
  user,
  onMenuClick,
}: {
  user: { name: string; image: string; initials: string };
  onMenuClick: () => void;
}) {
  const pathname = usePathname();

  const getTitle = () => {
    if (pathname === "/dashboard") return "Overview";
    if (pathname.startsWith("/dashboard/agents")) return "Agents";
    if (pathname.startsWith("/dashboard/deploy")) return "Marketplace";
    if (pathname.startsWith("/dashboard/billing")) return "Billing";
    if (pathname.startsWith("/dashboard/settings")) return "Settings";
    return "Dashboard";
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--border)] bg-white/80 backdrop-blur-md px-5 lg:px-8">
      <div className="flex items-center gap-3">
        {/* Mobile menu */}
        <button
          onClick={onMenuClick}
          className="md:hidden flex size-9 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100"
        >
          <Menu className="size-5" />
        </button>

        {/* Desktop page label */}
        <h1 className="hidden md:block text-[13px] font-semibold tracking-wide uppercase text-stone-400">
          {getTitle()}
        </h1>

        {/* Mobile brand */}
        <Link href="/dashboard" className="md:hidden flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600">
            <Flame className="size-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-stone-900">FireClaw</span>
        </Link>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/deploy"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-stone-900 px-4 py-1.5 text-[12px] font-semibold text-white transition-all hover:bg-stone-700 active:scale-[0.97]"
        >
          <Rocket className="size-3" />
          Deploy
        </Link>

        <Link href="/dashboard/settings" className="md:hidden">
          <Avatar className="size-8 ring-1 ring-stone-200">
            <AvatarImage src={user.image} alt={user.name} />
            <AvatarFallback className="bg-stone-100 text-[10px] font-semibold text-stone-600">
              {user.initials}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
}

/* ── Mobile Nav Drawer ── */
function MobileNav({
  user,
  onClose,
}: {
  user: { name: string; email: string; image: string; initials: string };
  onClose: () => void;
}) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <div className="relative z-10 flex h-full w-72 flex-col bg-white shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600">
            <Flame className="size-4 text-white" />
          </div>
          <span className="text-[15px] font-bold text-stone-900">FireClaw</span>
        </div>
        <button
          onClick={onClose}
          className="flex size-8 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[14px] font-medium transition-colors",
                  active
                    ? "bg-stone-900 text-white"
                    : "text-stone-600 hover:bg-stone-50 hover:text-stone-900",
                )}
              >
                <item.icon className="size-[18px]" strokeWidth={1.8} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-stone-100 px-4 py-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="size-9 ring-1 ring-stone-200">
            <AvatarImage src={user.image} alt={user.name} />
            <AvatarFallback className="bg-stone-100 text-[11px] font-semibold text-stone-600">
              {user.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="truncate text-[13px] font-semibold text-stone-900">
              {user.name}
            </p>
            <p className="truncate text-[11px] text-stone-400">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[13px] font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}
