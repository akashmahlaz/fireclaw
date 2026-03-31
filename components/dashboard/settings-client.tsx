"use client"

import { useState } from "react"
import Image from "next/image"
import {
  User,
  KeyRound,
  Bell,
  Shield,
  Copy,
  Check,
  Eye,
  EyeOff,
  Plus,
  Trash2,
} from "lucide-react"
import { BlurFade } from "@/components/ui/blur-fade"
import { cn } from "@/lib/utils"

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "api-keys", label: "API Keys", icon: KeyRound },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
] as const

type TabId = (typeof tabs)[number]["id"]

export function SettingsClient({
  user,
}: {
  user: { name: string; email: string; image: string }
}) {
  const [activeTab, setActiveTab] = useState<TabId>("profile")

  return (
    <div className="p-6 lg:p-8">
      <BlurFade inView delay={0}>
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-1 text-[22px] font-black tracking-[-0.02em] text-neutral-900">
            Settings
          </h1>
          <p className="mb-8 text-[13px] text-neutral-500">
            Manage your account, API keys, and preferences.
          </p>

          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Sidebar tabs */}
            <nav className="flex gap-1 lg:w-48 lg:shrink-0 lg:flex-col overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[13px] font-medium transition-all whitespace-nowrap",
                    activeTab === tab.id
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700",
                  )}
                >
                  <tab.icon className="size-3.5" />
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Content */}
            <div className="flex-1">
              {activeTab === "profile" && <ProfileTab user={user} />}
              {activeTab === "api-keys" && <ApiKeysTab />}
              {activeTab === "notifications" && <NotificationsTab />}
              {activeTab === "security" && <SecurityTab user={user} />}
            </div>
          </div>
        </div>
      </BlurFade>
    </div>
  )
}

/* ── Profile ── */
function ProfileTab({ user }: { user: { name: string; email: string; image: string } }) {
  const [name, setName] = useState(user.name)

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6">
      <h3 className="mb-5 text-[15px] font-bold text-neutral-900">Profile</h3>

      <div className="mb-6 flex items-center gap-4">
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name}
            width={56}
            height={56}
            className="shrink-0 rounded-full"
          />
        ) : (
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-[18px] font-bold text-neutral-500">
            {(user.name[0] ?? "?").toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-[14px] font-bold text-neutral-900">{user.name}</p>
          <p className="text-[12px] text-neutral-400">{user.email}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-neutral-500">
            Display Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-[13px] text-neutral-900 outline-none transition-colors focus:border-neutral-400 focus:bg-white"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-neutral-500">
            Email
          </label>
          <input
            value={user.email}
            disabled
            className="w-full rounded-xl border border-neutral-200 bg-neutral-100 px-4 py-2.5 text-[13px] text-neutral-400 cursor-not-allowed"
          />
          <p className="mt-1 text-[11px] text-neutral-400">Managed by Google OAuth.</p>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button className="rounded-xl bg-neutral-900 px-5 py-2.5 text-[13px] font-semibold text-white transition-all hover:bg-neutral-700 active:scale-[0.97]">
          Save Changes
        </button>
      </div>
    </div>
  )
}

/* ── API Keys ── */
function ApiKeysTab() {
  const [keys] = useState([
    { id: "1", name: "Production Key", key: "fc_live_sk_...a8f2", created: "May 12, 2025" },
    { id: "2", name: "Development Key", key: "fc_test_sk_...c3d1", created: "Apr 28, 2025" },
  ])
  const [copied, setCopied] = useState<string | null>(null)

  const copyKey = (id: string, key: string) => {
    navigator.clipboard.writeText(key)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-neutral-900">API Keys</h3>
        <button className="flex items-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2 text-[12px] font-semibold text-white hover:bg-neutral-700">
          <Plus className="size-3" />
          New Key
        </button>
      </div>

      <div className="divide-y divide-neutral-100">
        {keys.map((k) => (
          <div key={k.id} className="flex items-center justify-between py-3.5">
            <div>
              <p className="text-[13px] font-medium text-neutral-700">{k.name}</p>
              <p className="font-mono text-[12px] text-neutral-400">{k.key}</p>
              <p className="text-[11px] text-neutral-300">Created {k.created}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => copyKey(k.id, k.key)}
                className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
              >
                {copied === k.id ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              </button>
              <button className="rounded-lg p-2 text-red-400 hover:bg-red-50 hover:text-red-600">
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Notifications ── */
function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    deploySuccess: true,
    deployFailure: true,
    billing: true,
    security: true,
    marketing: false,
  })

  const toggle = (key: keyof typeof prefs) =>
    setPrefs((p) => ({ ...p, [key]: !p[key] }))

  const items = [
    { key: "deploySuccess" as const, label: "Deploy success", desc: "Notify when an agent finishes deploying." },
    { key: "deployFailure" as const, label: "Deploy failure", desc: "Notify when an agent deployment fails." },
    { key: "billing" as const, label: "Billing alerts", desc: "Invoice receipts and payment issues." },
    { key: "security" as const, label: "Security alerts", desc: "Login from new device or password change." },
    { key: "marketing" as const, label: "Product updates", desc: "New features and announcements." },
  ]

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6">
      <h3 className="mb-5 text-[15px] font-bold text-neutral-900">Notifications</h3>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.key} className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-neutral-700">{item.label}</p>
              <p className="text-[12px] text-neutral-400">{item.desc}</p>
            </div>
            <button
              onClick={() => toggle(item.key)}
              className={cn(
                "relative h-6 w-11 rounded-full transition-colors",
                prefs[item.key] ? "bg-orange-500" : "bg-neutral-200",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm transition-transform",
                  prefs[item.key] && "translate-x-5",
                )}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Security ── */
function SecurityTab({ user }: { user: { name: string; email: string; image: string } }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6">
        <h3 className="mb-4 text-[15px] font-bold text-neutral-900">Authentication</h3>
        <div className="flex items-center gap-4 rounded-xl bg-neutral-50 p-4">
          <div className="flex size-10 items-center justify-center rounded-xl bg-white">
            <svg className="size-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-medium text-neutral-700">Google OAuth</p>
            <p className="text-[12px] text-neutral-400">{user.email}</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600">
            Connected
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-red-100 bg-white p-6">
        <h3 className="mb-2 text-[15px] font-bold text-red-600">Danger Zone</h3>
        <p className="mb-4 text-[12px] text-neutral-500">
          Permanently delete your account and all data. This action cannot be undone.
        </p>
        <button className="rounded-xl bg-red-50 px-4 py-2.5 text-[13px] font-semibold text-red-600 transition-all hover:bg-red-100">
          Delete Account
        </button>
      </div>
    </div>
  )
}
