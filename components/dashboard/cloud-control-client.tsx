"use client"

import { useCallback, useMemo, useState } from "react"
import { RefreshCw, Database, Activity, Trash2, Plus, Play } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"

const resourceKinds = [
  "ssh_keys",
  "images",
  "volumes",
  "primary_ips",
  "networks",
  "placement_groups",
  "firewalls",
  "floating_ips",
] as const

const deleteKindMap: Record<(typeof resourceKinds)[number], string> = {
  ssh_keys: "ssh_key",
  images: "image",
  volumes: "volume",
  primary_ips: "primary_ip",
  networks: "network",
  placement_groups: "placement_group",
  firewalls: "firewall",
  floating_ips: "floating_ip",
}

export function CloudControlClient() {
  const [catalog, setCatalog] = useState<Record<string, unknown> | null>(null)
  const [catalogLoading, setCatalogLoading] = useState(false)

  const [resourceKind, setResourceKind] = useState<(typeof resourceKinds)[number]>("ssh_keys")
  const [resources, setResources] = useState<Array<Record<string, unknown>>>([])
  const [resourcesLoading, setResourcesLoading] = useState(false)
  const [resourceIdInput, setResourceIdInput] = useState("")

  const [createKind, setCreateKind] = useState("ssh_key")
  const [createPayload, setCreatePayload] = useState('{\n  "name": "example-key",\n  "public_key": "ssh-ed25519 ..."\n}')

  const [actions, setActions] = useState<Array<Record<string, unknown>>>([])
  const [actionsLoading, setActionsLoading] = useState(false)
  const [actionId, setActionId] = useState("")
  const [singleAction, setSingleAction] = useState<Record<string, unknown> | null>(null)

  const [log, setLog] = useState<string[]>([])

  const pushLog = useCallback((msg: string) => {
    setLog((prev) => [`${new Date().toLocaleTimeString()} - ${msg}`, ...prev].slice(0, 30))
  }, [])

  const catalogSummary = useMemo(() => {
    if (!catalog) return [] as Array<{ key: string; value: string }>
    return [
      { key: "Server types", value: String(Array.isArray(catalog.serverTypes) ? catalog.serverTypes.length : 0) },
      { key: "Locations", value: String(Array.isArray(catalog.locations) ? catalog.locations.length : 0) },
      { key: "Datacenters", value: String(Array.isArray(catalog.datacenters) ? catalog.datacenters.length : 0) },
      { key: "ISOs", value: String(Array.isArray(catalog.isos) ? catalog.isos.length : 0) },
      { key: "Certificates", value: String(Array.isArray(catalog.certificates) ? catalog.certificates.length : 0) },
      { key: "SSH Keys", value: String(Array.isArray(catalog.sshKeys) ? catalog.sshKeys.length : 0) },
      { key: "Placement Groups", value: String(Array.isArray(catalog.placementGroups) ? catalog.placementGroups.length : 0) },
      { key: "Primary IPs", value: String(Array.isArray(catalog.primaryIps) ? catalog.primaryIps.length : 0) },
    ]
  }, [catalog])

  async function refreshCatalog() {
    setCatalogLoading(true)
    try {
      const res = await fetch("/api/hetzner/catalog")
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to fetch catalog")
      setCatalog(data)
      pushLog("Catalog refreshed")
    } catch (err) {
      pushLog(`Catalog error: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setCatalogLoading(false)
    }
  }

  async function refreshResources(kind = resourceKind) {
    setResourcesLoading(true)
    try {
      const res = await fetch(`/api/hetzner/resources?kind=${encodeURIComponent(kind)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to fetch resources")
      setResources(Array.isArray(data.items) ? data.items : [])
      pushLog(`Loaded ${kind}`)
    } catch (err) {
      pushLog(`Resources error: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setResourcesLoading(false)
    }
  }

  async function createResource() {
    try {
      const parsed = JSON.parse(createPayload) as Record<string, unknown>
      const res = await fetch("/api/hetzner/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: createKind, ...parsed }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to create resource")
      pushLog(`Created resource kind=${createKind}`)
      await refreshResources(resourceKind)
    } catch (err) {
      pushLog(`Create error: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  async function deleteResource() {
    try {
      const id = Number(resourceIdInput)
      if (!id || Number.isNaN(id)) {
        pushLog("Delete error: enter a valid numeric resource id")
        return
      }
      const res = await fetch(
        `/api/hetzner/resources?kind=${encodeURIComponent(deleteKindMap[resourceKind])}&id=${id}`,
        { method: "DELETE" },
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to delete resource")
      pushLog(`Deleted ${deleteKindMap[resourceKind]} id=${id}`)
      await refreshResources(resourceKind)
    } catch (err) {
      pushLog(`Delete error: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  async function refreshActions() {
    setActionsLoading(true)
    try {
      const res = await fetch("/api/hetzner/actions?per_page=25")
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to fetch actions")
      setActions(Array.isArray(data.actions) ? data.actions : [])
      pushLog("Actions refreshed")
    } catch (err) {
      pushLog(`Actions error: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setActionsLoading(false)
    }
  }

  async function fetchActionById() {
    try {
      const id = Number(actionId)
      if (!id || Number.isNaN(id)) {
        pushLog("Action lookup error: enter a valid action id")
        return
      }
      const res = await fetch(`/api/hetzner/actions?id=${id}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to fetch action")
      setSingleAction(data.action ?? null)
      pushLog(`Fetched action id=${id}`)
    } catch (err) {
      pushLog(`Action lookup error: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-black tracking-[-0.03em] text-neutral-900">Cloud Control</h1>
          <p className="mt-1 text-[14px] text-neutral-500">Deep Hetzner control plane for catalog, resources, and actions.</p>
        </div>
        <Badge variant="secondary" className="text-xs">Hetzner API</Badge>
      </div>

      <Tabs defaultValue="catalog" className="space-y-4">
        <TabsList>
          <TabsTrigger value="catalog" className="gap-1.5"><Database className="size-4" />Catalog</TabsTrigger>
          <TabsTrigger value="resources" className="gap-1.5"><Plus className="size-4" />Resources</TabsTrigger>
          <TabsTrigger value="actions" className="gap-1.5"><Activity className="size-4" />Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="space-y-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Cloud Catalog</CardTitle>
                <CardDescription>Server types, locations, pricing, ISOs, certificates, and more.</CardDescription>
              </div>
              <Button onClick={refreshCatalog} disabled={catalogLoading} className="gap-2">
                <RefreshCw className="size-4" />
                {catalogLoading ? "Refreshing..." : "Refresh"}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {catalogSummary.map((item) => (
                  <div key={item.key} className="rounded-xl border border-neutral-200 bg-white p-3">
                    <div className="text-[11px] uppercase tracking-wider text-neutral-500">{item.key}</div>
                    <div className="mt-1 text-lg font-semibold text-neutral-900">{item.value}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resource Browser</CardTitle>
              <CardDescription>List, create, and delete core Hetzner resources.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Select value={resourceKind} onValueChange={(v) => setResourceKind(v as (typeof resourceKinds)[number])}>
                  <SelectTrigger className="sm:w-64"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {resourceKinds.map((kind) => (
                      <SelectItem key={kind} value={kind}>{kind}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={() => refreshResources()} disabled={resourcesLoading} className="gap-2">
                  <RefreshCw className="size-4" />{resourcesLoading ? "Loading..." : "Load"}
                </Button>
              </div>

              <div className="rounded-xl border border-neutral-200">
                <div className="max-h-80 overflow-auto p-3">
                  {resources.length === 0 ? (
                    <div className="text-sm text-neutral-500">No resources loaded.</div>
                  ) : (
                    <pre className="text-xs text-neutral-800">{JSON.stringify(resources, null, 2)}</pre>
                  )}
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-2 rounded-xl border border-neutral-200 p-3">
                  <div className="text-sm font-semibold">Create</div>
                  <Select value={createKind} onValueChange={(v) => setCreateKind(v ?? "ssh_key")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ssh_key">ssh_key</SelectItem>
                      <SelectItem value="volume">volume</SelectItem>
                      <SelectItem value="primary_ip">primary_ip</SelectItem>
                      <SelectItem value="network">network</SelectItem>
                      <SelectItem value="placement_group">placement_group</SelectItem>
                      <SelectItem value="firewall">firewall</SelectItem>
                      <SelectItem value="floating_ip">floating_ip</SelectItem>
                    </SelectContent>
                  </Select>
                  <Textarea value={createPayload} onChange={(e) => setCreatePayload(e.target.value)} className="min-h-36 font-mono text-xs" />
                  <Button onClick={createResource} className="gap-2"><Plus className="size-4" />Create Resource</Button>
                </div>

                <div className="space-y-2 rounded-xl border border-neutral-200 p-3">
                  <div className="text-sm font-semibold">Delete</div>
                  <Input
                    placeholder={`Enter ${deleteKindMap[resourceKind]} id`}
                    value={resourceIdInput}
                    onChange={(e) => setResourceIdInput(e.target.value)}
                  />
                  <Button variant="destructive" onClick={deleteResource} className="gap-2">
                    <Trash2 className="size-4" />Delete Resource
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Server Actions</CardTitle>
              <CardDescription>Observe global server actions and inspect action details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Button onClick={refreshActions} disabled={actionsLoading} className="gap-2">
                  <RefreshCw className="size-4" />{actionsLoading ? "Refreshing..." : "Refresh Actions"}
                </Button>
                <div className="flex items-center gap-2">
                  <Input placeholder="Action id" value={actionId} onChange={(e) => setActionId(e.target.value)} className="w-40" />
                  <Button variant="secondary" onClick={fetchActionById} className="gap-2"><Play className="size-4" />Fetch</Button>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-neutral-200 p-3">
                  <div className="mb-2 text-sm font-semibold">Recent Actions</div>
                  <div className="max-h-70 overflow-auto">
                    {actions.length === 0 ? (
                      <div className="text-sm text-neutral-500">No actions loaded.</div>
                    ) : (
                      <pre className="text-xs text-neutral-800">{JSON.stringify(actions, null, 2)}</pre>
                    )}
                  </div>
                </div>
                <div className="rounded-xl border border-neutral-200 p-3">
                  <div className="mb-2 text-sm font-semibold">Action Details</div>
                  <div className="max-h-70 overflow-auto">
                    {singleAction ? (
                      <pre className="text-xs text-neutral-800">{JSON.stringify(singleAction, null, 2)}</pre>
                    ) : (
                      <div className="text-sm text-neutral-500">Fetch an action by id.</div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Operation Log</CardTitle>
          <CardDescription>Latest client-side operation status.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-48 overflow-auto rounded-xl border border-neutral-200 p-3 text-xs text-neutral-700">
            {log.length === 0 ? "No operations yet." : log.map((line, idx) => <div key={`${line}-${idx}`}>{line}</div>)}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
