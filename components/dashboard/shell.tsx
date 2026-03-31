"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Server,
  Rocket,
  CreditCard,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
} from "lucide-react"
import { signOut } from "next-auth/react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "motion/react"

const nav = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Agents", href: "/dashboard/agents", icon: Server },
  { label: "Deploy", href: "/dashboard/deploy", icon: Rocket },
  { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
]

interface DashboardShellProps {
  user: { name?: string | null; email?: string | null; image?: string | null }
  children: React.ReactNode
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(href)
  }

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b border-neutral-100 px-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-neutral-900">
          <span className="text-[11px] font-black text-white">FC</span>
        </div>
        {!collapsed && (
          <span className="text-[14px] font-bold tracking-[-0.02em] text-neutral-900">
            FIRECLAW
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {nav.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-150",
                active
                  ? "bg-neutral-900 text-white shadow-sm"
                  : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
              )}
            >
              <item.icon className={cn("size-4 shrink-0", active ? "text-white" : "text-neutral-400 group-hover:text-neutral-600")} />
              {!collapsed && item.label}
            </Link>
          )
        })}
      </nav>

      {/* User + Logout */}
      <div className="border-t border-neutral-100 p-3">
        <div className={cn("flex items-center gap-3 rounded-lg px-3 py-2", collapsed && "justify-center")}>
          {user.image ? (
            <img src={user.image} alt="" className="size-7 rounded-full" />
          ) : (
            <div className="flex size-7 items-center justify-center rounded-full bg-neutral-200 text-[11px] font-bold text-neutral-600">
              {user.name?.charAt(0) ?? "U"}
            </div>
          )}
          {!collapsed && (
            <div className="flex-1 truncate">
              <p className="truncate text-[12px] font-semibold text-neutral-900">{user.name}</p>
              <p className="truncate text-[11px] text-neutral-400">{user.email}</p>
            </div>
          )}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className={cn(
            "mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-neutral-500 transition-colors hover:bg-red-50 hover:text-red-600",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="size-4" />
          {!collapsed && "Sign out"}
        </button>
      </div>
    </>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden flex-col border-r border-neutral-200 bg-white transition-all duration-200 lg:flex",
          collapsed ? "w-16" : "w-60"
        )}
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="absolute bottom-4 left-[inherit] -right-3 z-20 hidden size-6 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-sm transition-colors hover:bg-neutral-50 lg:flex"
          style={{ left: collapsed ? "3.5rem" : "14.25rem" }}
        >
          <ChevronLeft className={cn("size-3 text-neutral-500 transition-transform", collapsed && "rotate-180")} />
        </button>
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 z-50 flex h-full w-60 flex-col border-r border-neutral-200 bg-white lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <main className="flex flex-1 flex-col overflow-auto">
        {/* Top bar (mobile) */}
        <div className="flex h-14 items-center gap-4 border-b border-neutral-200 bg-white px-4 lg:hidden">
          <button onClick={() => setMobileOpen(true)}>
            <Menu className="size-5 text-neutral-600" />
          </button>
          <span className="text-[14px] font-bold tracking-[-0.02em] text-neutral-900">
            FIRECLAW
          </span>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
