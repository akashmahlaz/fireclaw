"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bot,
  Store,
  Rocket,
  CreditCard,
  Settings,
  LogOut,
  Flame,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useSyncPlanStore } from "@/hooks/use-sync-plan";
import { useUserPlan } from "@/lib/store";

/* ── Navigation ── */
const navSections: {
  label: string;
  items: { label: string; href: string; icon: typeof LayoutDashboard }[];
}[] = [
  {
    label: "Workspace",
    items: [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { label: "My Agents", href: "/dashboard/agents", icon: Bot },
    ],
  },
  {
    label: "Discover",
    items: [
      { label: "Marketplace", href: "/dashboard/marketplace", icon: Store },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

const SIDEBAR_EXPANDED_WIDTH = 240;
const SIDEBAR_COLLAPSED_WIDTH = 68;
const STORAGE_KEY = "fireclaw-sidebar-collapsed";

/* ── Props ── */
interface DashboardShellProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
  children: React.ReactNode;
}

/* ── Main Shell ── */
export function DashboardShell({ user, children }: DashboardShellProps) {
  useSyncPlanStore();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);

  // Hydrate collapsed state from localStorage
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "true") setCollapsed(true);
    } catch {}
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {}
      return next;
    });
  };

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
      {/* Desktop Sidebar */}
      <DesktopSidebar
        user={{
          name: user.name ?? "User",
          email: user.email ?? "",
          image: user.image ?? "",
          initials,
        }}
        collapsed={collapsed}
        onToggle={toggleCollapsed}
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

/* ── Desktop Sidebar ── */
function DesktopSidebar({
  user,
  collapsed,
  onToggle,
}: {
  user: { name: string; email: string; image: string; initials: string };
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const { tier } = useUserPlan();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const planLabel = tier
    ? tier.charAt(0).toUpperCase() + tier.slice(1)
    : "Free";

  return (
    <nav
      className="hidden md:flex flex-col border-r border-stone-200/80 bg-white relative select-none"
      style={{
        width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH,
        minWidth: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH,
        transition:
          "width 200ms cubic-bezier(0.4, 0, 0.2, 1), min-width 200ms cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Brand */}
      <div
        className={cn(
          "flex items-center border-b border-stone-100 shrink-0",
          collapsed ? "justify-center px-0 py-5" : "px-5 py-5",
        )}
      >
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 group"
          title="FireClaw"
        >
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-sm transition-transform group-hover:scale-105">
            <Flame className="size-[18px] text-white" />
          </div>
          {!collapsed && (
            <span className="text-[15px] font-bold text-stone-900 tracking-tight">
              FireClaw
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <div
        className={cn(
          "flex-1 overflow-y-auto py-4",
          collapsed ? "px-2" : "px-3",
        )}
      >
        <div className="flex flex-col gap-5">
          {navSections.map((section) => (
            <div key={section.label} className="flex flex-col gap-0.5">
              {!collapsed && (
                <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-400">
                  {section.label}
                </p>
              )}
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "group relative flex items-center rounded-xl transition-all duration-150",
                      collapsed
                        ? "justify-center size-10 mx-auto"
                        : "gap-3 px-3 py-2.5",
                      active
                        ? "bg-stone-900 text-white shadow-sm"
                        : "text-stone-500 hover:text-stone-900 hover:bg-stone-50",
                    )}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-orange-500" />
                    )}
                    <item.icon
                      className="size-[18px] shrink-0"
                      strokeWidth={active ? 2.2 : 1.8}
                    />
                    {!collapsed && (
                      <span className="text-[13px] font-medium truncate">
                        {item.label}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Deploy CTA */}
        <div className={cn("mt-6", collapsed ? "px-0" : "px-0")}>
          {collapsed ? (
            <Link
              href="/dashboard/marketplace"
              title="Deploy Agent"
              className="flex size-10 mx-auto items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-sm transition-all hover:shadow-md hover:scale-105 active:scale-95"
            >
              <Rocket className="size-[18px]" />
            </Link>
          ) : (
            <Link
              href="/dashboard/marketplace"
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-all hover:shadow-md hover:brightness-110 active:scale-[0.98]"
            >
              <Rocket className="size-4" />
              Deploy Agent
            </Link>
          )}
        </div>
      </div>

      {/* Bottom section */}
      <div className="mt-auto border-t border-stone-100 shrink-0">
        {/* Plan badge + User */}
        <div className={cn("py-3", collapsed ? "px-2" : "px-3")}>
          {/* Plan pill */}
          {collapsed ? (
            <div className="flex justify-center mb-2">
              <div
                className="flex size-7 items-center justify-center rounded-lg bg-orange-50"
                title={`${planLabel} Plan`}
              >
                <Sparkles className="size-3.5 text-orange-500" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1">
                <Sparkles className="size-3 text-orange-500" />
                <span className="text-[11px] font-semibold text-orange-600">
                  {planLabel}
                </span>
              </div>
            </div>
          )}

          {/* User row */}
          {collapsed ? (
            <div className="flex flex-col items-center gap-2">
              <Link href="/dashboard/settings" title={user.name}>
                <Avatar className="size-9 ring-2 ring-stone-100 transition-all hover:ring-orange-200">
                  <AvatarImage src={user.image} alt={user.name} />
                  <AvatarFallback className="bg-stone-100 text-[11px] font-semibold text-stone-600">
                    {user.initials}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                title="Sign out"
                className="flex size-9 items-center justify-center rounded-xl text-stone-400 transition-colors hover:bg-red-50 hover:text-red-500"
              >
                <LogOut className="size-4" strokeWidth={1.8} />
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 px-1 mb-2">
                <Avatar className="size-9 ring-2 ring-stone-100 shrink-0">
                  <AvatarImage src={user.image} alt={user.name} />
                  <AvatarFallback className="bg-stone-100 text-[11px] font-semibold text-stone-600">
                    {user.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-[13px] font-semibold text-stone-900 leading-tight">
                    {user.name}
                  </p>
                  <p className="truncate text-[11px] text-stone-400 leading-tight mt-0.5">
                    {user.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-[12px] font-medium text-stone-400 transition-colors hover:bg-red-50 hover:text-red-500"
              >
                <LogOut className="size-4" strokeWidth={1.8} />
                Sign out
              </button>
            </>
          )}
        </div>
      </div>

      {/* Collapse toggle button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 z-10 flex size-6 items-center justify-center rounded-full border border-stone-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-stone-300 active:scale-90"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="size-3 text-stone-500" />
        ) : (
          <ChevronLeft className="size-3 text-stone-500" />
        )}
      </button>
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
    if (pathname.startsWith("/dashboard/marketplace")) return "Marketplace";
    if (pathname.startsWith("/dashboard/deploy")) return "Deploy";
    if (pathname.startsWith("/dashboard/billing")) return "Billing";
    if (pathname.startsWith("/dashboard/settings")) return "Settings";
    return "Dashboard";
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-stone-200/80 bg-white/80 backdrop-blur-md px-5 lg:px-8">
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
          href="/dashboard/marketplace"
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
  const { tier } = useUserPlan();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const planLabel = tier
    ? tier.charAt(0).toUpperCase() + tier.slice(1)
    : "Free";

  return (
    <div className="relative z-10 flex h-full w-72 flex-col bg-white shadow-2xl animate-in slide-in-from-left duration-200">
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
        <div className="flex flex-col gap-5">
          {navSections.map((section) => (
            <div key={section.label} className="flex flex-col gap-0.5">
              <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-400">
                {section.label}
              </p>
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[14px] font-medium transition-colors",
                      active
                        ? "bg-stone-900 text-white"
                        : "text-stone-600 hover:bg-stone-50 hover:text-stone-900",
                    )}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-orange-500" />
                    )}
                    <item.icon className="size-[18px]" strokeWidth={1.8} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Deploy CTA */}
        <div className="mt-5">
          <Link
            href="/dashboard/marketplace"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
          >
            <Rocket className="size-4" />
            Deploy Agent
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-stone-100 px-4 py-4">
        {/* Plan pill */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1">
            <Sparkles className="size-3 text-orange-500" />
            <span className="text-[11px] font-semibold text-orange-600">
              {planLabel} Plan
            </span>
          </div>
        </div>

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
