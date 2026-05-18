"use client"

import { useState } from "react"
import Image from "next/image"
import { signOut } from "next-auth/react"
import {
  User,
  KeyRound,
  Bell,
  Shield,
  Copy,
  Check,
  Plus,
  Trash2,
  Fingerprint,
  Globe,
  AlertTriangle,
  Eye,
  EyeOff,
  LogOut,
} from "lucide-react"
import { BlurFade } from "@/components/ui/blur-fade"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export function SettingsClient({
  user,
}: {
  user: { name: string; email: string; image: string }
}) {
  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "FC"

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <BlurFade inView delay={0}>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your account, API keys, and security.</p>
        </div>
      </BlurFade>

      <BlurFade inView delay={0.05}>
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile" className="gap-1.5">
              <User className="size-3.5" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="api-keys" className="gap-1.5">
              <KeyRound className="size-3.5" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-1.5">
              <Bell className="size-3.5" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-1.5">
              <Shield className="size-3.5" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* Profile */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>
                  This is how others see you on the platform and in shared dashboards.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="size-16">
                    <AvatarImage src={user.image} alt={user.name} />
                    <AvatarFallback className="text-lg font-bold">{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <Badge variant="secondary" className="mt-1.5 text-xs">
                      <Fingerprint className="mr-1 size-3" />
                      Google Account
                    </Badge>
                  </div>
                </div>
                <Separator />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="display-name">Display name</Label>
                    <Input
                      id="display-name"
                      defaultValue={user.name}
                      placeholder="Your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      value={user.email}
                      disabled
                      className="cursor-not-allowed opacity-60"
                    />
                    <p className="text-xs text-muted-foreground">Managed by your Google account.</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button size="sm">Save changes</Button>
              </CardFooter>
            </Card>

            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <AlertTriangle className="size-4" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Permanently delete your FireClaw account. All agents, data, and billing will be cancelled immediately.
                  This cannot be undone.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button variant="destructive" size="sm">
                  Delete my account
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* API Keys */}
          <TabsContent value="api-keys" className="space-y-4">
            <ApiKeysTab />
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-4">
            <NotificationsTab />
          </TabsContent>

          {/* Security */}
          <TabsContent value="security" className="space-y-4">
            <SecurityTab user={user} />
          </TabsContent>
        </Tabs>
      </BlurFade>
    </div>
  )
}

/* ── API Keys ── */
function ApiKeysTab() {
  const [keys, setKeys] = useState([
    { id: "1", name: "Production Key", key: "fc_live_sk_...a8f2", created: "May 12, 2025", lastUsed: "2 hours ago" },
    { id: "2", name: "Development Key", key: "fc_test_sk_...c3d1", created: "Apr 28, 2025", lastUsed: "3 days ago" },
  ])
  const [copied, setCopied] = useState<string | null>(null)
  const [visible, setVisible] = useState<Record<string, boolean>>({})

  const copyKey = (id: string, key: string) => {
    navigator.clipboard.writeText(key)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const toggleVisible = (id: string) =>
    setVisible((v) => ({ ...v, [id]: !v[id] }))

  const deleteKey = (id: string) =>
    setKeys((k) => k.filter((x) => x.id !== id))

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Use API keys to authenticate with the FireClaw REST API and CLI.
              </CardDescription>
            </div>
            <Button size="sm" variant="outline">
              <Plus className="mr-1.5 size-3.5" />
              New Key
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {keys.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <KeyRound className="mx-auto mb-3 size-8 text-muted-foreground" />
              <p className="text-sm font-medium">No API keys yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Create a key to start using the FireClaw API.</p>
            </div>
          ) : (
            <div className="divide-y">
              {keys.map((k) => (
                <div key={k.id} className="flex items-start gap-4 px-6 py-4">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted">
                    <KeyRound className="size-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-1 min-w-0">
                    <p className="text-sm font-medium">{k.name}</p>
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-xs text-muted-foreground">
                        {visible[k.id] ? k.key : "••••••••••••••••••••••••"}
                      </code>
                      <button
                        onClick={() => toggleVisible(k.id)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {visible[k.id] ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Created {k.created} · Last used {k.lastUsed}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => copyKey(k.id, k.key)}
                    >
                      {copied === k.id ? (
                        <Check className="size-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => deleteKey(k.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Alert>
        <Shield className="size-4" />
        <AlertTitle>Keep your keys secure</AlertTitle>
        <AlertDescription>
          Never share API keys publicly. Treat them like passwords — if compromised, delete and regenerate immediately.
        </AlertDescription>
      </Alert>
    </>
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
    weeklyDigest: true,
  })

  const toggle = (key: keyof typeof prefs) =>
    setPrefs((p) => ({ ...p, [key]: !p[key] }))

  const groups = [
    {
      title: "Infrastructure",
      description: "Events related to your agents and deployments.",
      items: [
        { key: "deploySuccess" as const, label: "Deployment succeeded", desc: "Notify when an agent finishes setting up and goes live." },
        { key: "deployFailure" as const, label: "Deployment failed", desc: "Notify when a provisioning job hits an error." },
      ],
    },
    {
      title: "Billing",
      description: "Payment and subscription notifications.",
      items: [
        { key: "billing" as const, label: "Billing alerts", desc: "Invoice receipts, payment failures, and plan changes." },
      ],
    },
    {
      title: "Security",
      description: "Account security events.",
      items: [
        { key: "security" as const, label: "Security alerts", desc: "New device sign-in, API key creation or deletion." },
      ],
    },
    {
      title: "Product",
      description: "Updates and product news.",
      items: [
        { key: "marketing" as const, label: "New features & announcements", desc: "Release notes and major product updates." },
        { key: "weeklyDigest" as const, label: "Weekly digest", desc: "Summary of your agent activity each week." },
      ],
    },
  ]

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <Card key={group.title}>
          <CardHeader>
            <CardTitle className="text-base">{group.title}</CardTitle>
            <CardDescription>{group.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {group.items.map((item) => (
              <div key={item.key} className="flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">{item.label}</Label>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Switch
                  checked={prefs[item.key]}
                  onCheckedChange={() => toggle(item.key)}
                  className="shrink-0 mt-0.5"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
      <div className="flex justify-end">
        <Button size="sm">Save preferences</Button>
      </div>
    </div>
  )
}

/* ── Security ── */
function SecurityTab({ user }: { user: { name: string; email: string; image: string } }) {
  return (
    <div className="space-y-4">
      {/* Auth method */}
      <Card>
        <CardHeader>
          <CardTitle>Authentication method</CardTitle>
          <CardDescription>How you sign in to your FireClaw account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 rounded-xl border bg-muted/30 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg border bg-background">
              <svg className="size-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Google OAuth 2.0</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50">
              <Check className="mr-1 size-3" />
              Active
            </Badge>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Your account is secured through Google. To change your password or 2FA, manage it in your{" "}
            <a href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:no-underline">
              Google Account settings
            </a>.
          </p>
        </CardContent>
      </Card>

      {/* Active sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Active sessions</CardTitle>
          <CardDescription>Devices currently signed in to your account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-4 rounded-lg border p-3.5">
            <Globe className="size-4 shrink-0 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">Current browser</p>
              <p className="text-xs text-muted-foreground">Last active just now</p>
            </div>
            <Badge variant="secondary" className="text-xs">This session</Badge>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:border-destructive hover:bg-destructive/5 hover:text-destructive"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="mr-1.5 size-3.5" />
            Sign out all sessions
          </Button>
        </CardFooter>
      </Card>

      {/* Delete account */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-4" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Permanently delete your account, all agents, and billing data. This cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="border-destructive/30 bg-destructive/5">
            <AlertTriangle className="size-4" />
            <AlertTitle>This will permanently delete everything</AlertTitle>
            <AlertDescription>
              All running agents will be destroyed, your subscription cancelled, and your data removed within 30 days.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <Button variant="destructive" size="sm">
            Delete my account
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
