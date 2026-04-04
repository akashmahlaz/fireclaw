import { useQuery } from "@tanstack/react-query"

export interface AgentSummary {
  id: string
  name: string
  status: "provisioning" | "running" | "stopped" | "error"
  region: string
  serverIp: string | null
  template: string
  messageCount: number
  createdAt: string
}

export interface AgentDetail extends AgentSummary {
  serverId: string | null
  domain: string | null
  gatewayToken: string | null
  updatedAt: string
  provisionLog?: { step: string; status: "ok" | "pending" | "error"; ts: number }[]
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}`)
  return res.json()
}

/** Fetch all agents for the current user */
export function useAgents() {
  return useQuery<AgentSummary[]>({
    queryKey: ["agents"],
    queryFn: () => fetchJson("/api/agents"),
  })
}

/** Fetch a single agent by ID */
export function useAgent(id: string | null, opts?: { refetchInterval?: number | false }) {
  return useQuery<AgentDetail>({
    queryKey: ["agent", id],
    queryFn: () => fetchJson(`/api/agents/${id}`),
    enabled: !!id,
    refetchInterval: opts?.refetchInterval,
  })
}

/** Fetch live availability data */
export function useAvailability() {
  return useQuery({
    queryKey: ["availability"],
    queryFn: () => fetchJson("/api/hetzner/availability"),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })
}

/** Fetch current user's subscription + quota */
export function useSubscription() {
  return useQuery<{
    subscription: {
      tier: string
      status: string
      agentLimit: number
      currentPeriodEnd: string
    } | null
    quota: {
      allowed: boolean
      used: number
      limit: number
      tier: string | null
    }
  }>({
    queryKey: ["subscription"],
    queryFn: () => fetchJson("/api/subscription"),
    staleTime: 60 * 1000, // 1 minute
  })
}
