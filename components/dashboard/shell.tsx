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
  ChevronsUpDown,
  BadgeCheck,
  Sparkles,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useSyncPlanStore } from "@/hooks/use-sync-plan";

/* ── Navigation config ── */
const platformNav = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Agents", href: "/dashboard/agents", icon: Bot },
  { label: "Choose Agent", href: "/dashboard/deploy", icon: Rocket },
];

const accountNav = [
  { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

/* ── Props ── */
interface DashboardShellProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
  children: React.ReactNode;
}

/* ── Main export ── */
export function DashboardShell({ user, children }: DashboardShellProps) {
  useSyncPlanStore();

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "FC";

  return (
    <SidebarProvider>
      <AppSidebar
        user={{
          name: user.name ?? "User",
          email: user.email ?? "",
          image: user.image ?? "",
          initials,
        }}
      />
      <SidebarInset>
        <PageHeader />
        <main className="flex flex-1 flex-col overflow-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

/* ── Sidebar ── */
function AppSidebar({
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
    <Sidebar collapsible="icon" className="border-r border-neutral-100">
      {/* Brand */}
      <SidebarHeader className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href="/dashboard" />}
              tooltip="FireClaw"
              className="hover:bg-orange-50/60"
            >
              <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-linear-to-br from-orange-500 to-orange-600 shadow-sm">
                <Flame className="size-5 text-white" />
              </div>
              <div className="grid flex-1 text-left leading-tight">
                <span className="font-heading text-base font-extrabold tracking-tight text-neutral-900">
                  FireClaw
                </span>
                <span className="text-[11px] font-medium text-neutral-400">
                  Agent Platform
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* Platform */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            Platform
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {platformNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={isActive(item.href)}
                    tooltip={item.label}
                    className="rounded-lg font-medium text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900 data-[active=true]:bg-orange-50 data-[active=true]:text-orange-700"
                  >
                    <item.icon className="size-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Account */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={isActive(item.href)}
                    tooltip={item.label}
                    className="rounded-lg font-medium text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900 data-[active=true]:bg-orange-50 data-[active=true]:text-orange-700"
                  >
                    <item.icon className="size-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User footer */}
      <SidebarFooter className="border-t border-neutral-100 p-2">
        <NavUser user={user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

/* ── User dropdown ── */
function NavUser({
  user,
}: {
  user: { name: string; email: string; image: string; initials: string };
}) {
  const { isMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="rounded-lg data-[state=open]:bg-neutral-100"
              />
            }
          >
            <Avatar className="size-8 rounded-lg ring-1 ring-neutral-200">
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback className="rounded-lg bg-orange-100 text-xs font-bold text-orange-700">
                {user.initials}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold text-neutral-900">
                {user.name}
              </span>
              <span className="truncate text-xs text-neutral-400">
                {user.email}
              </span>
            </div>
            <ChevronsUpDown className="ml-auto size-4 text-neutral-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-xl border-neutral-200 shadow-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={6}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2.5 px-2 py-2 text-left text-sm">
                <Avatar className="size-9 rounded-lg ring-1 ring-neutral-200">
                  <AvatarImage src={user.image} alt={user.name} />
                  <AvatarFallback className="rounded-lg bg-orange-100 text-xs font-bold text-orange-700">
                    {user.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-neutral-900">
                    {user.name}
                  </span>
                  <span className="truncate text-xs text-neutral-400">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="gap-2.5">
                <Sparkles className="size-4 text-orange-500" />
                Upgrade plan
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                render={<Link href="/dashboard/settings" />}
                className="gap-2.5"
              >
                <BadgeCheck className="size-4" />
                Account settings
              </DropdownMenuItem>
              <DropdownMenuItem
                render={<Link href="/dashboard/billing" />}
                className="gap-2.5"
              >
                <CreditCard className="size-4" />
                Billing
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/" })}
              className="gap-2.5 text-red-600 focus:bg-red-50 focus:text-red-600"
            >
              <LogOut className="size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

/* ── Page header with breadcrumbs ── */
function PageHeader() {
  const pathname = usePathname();
  const segments = pathname
    .replace(/^\/dashboard\/?/, "")
    .split("/")
    .filter(Boolean);

  const labels: Record<string, string> = {
    agents: "Agents",
    deploy: "Choose Agent",
    billing: "Billing",
    settings: "Settings",
    new: "New Agent",
  };

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-neutral-100 bg-white/80 backdrop-blur-sm transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-3 px-5">
        <SidebarTrigger className="-ml-1 text-neutral-500 hover:text-neutral-900" />
        <Separator
          orientation="vertical"
          className="mr-1 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {segments.length === 0 ? (
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium text-neutral-900">
                  Overview
                </BreadcrumbPage>
              </BreadcrumbItem>
            ) : (
              <>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink
                    href="/dashboard"
                    className="text-neutral-400 hover:text-neutral-600"
                  >
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {segments.map((seg, i) => {
                  const isLast = i === segments.length - 1;
                  const label =
                    labels[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1);
                  const href =
                    "/dashboard/" + segments.slice(0, i + 1).join("/");
                  return (
                    <React.Fragment key={seg}>
                      <BreadcrumbSeparator className="hidden text-neutral-300 md:block" />
                      <BreadcrumbItem>
                        {isLast ? (
                          <BreadcrumbPage className="font-medium text-neutral-900">
                            {label}
                          </BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink
                            href={href}
                            className="text-neutral-400 hover:text-neutral-600"
                          >
                            {label}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </React.Fragment>
                  );
                })}
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}
