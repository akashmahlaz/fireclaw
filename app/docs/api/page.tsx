import Navbar from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"

export const metadata = {
  title: "API Reference — FireClaw",
}

const endpoints = [
  {
    method: "GET",
    path: "/api/agents",
    description: "List all agents for the authenticated user.",
    auth: true,
    response: `[{ "id": "...", "name": "My Agent", "status": "running", "domain": "my-agent.fireclaw.ai" }]`,
  },
  {
    method: "POST",
    path: "/api/agents",
    description: "Create and deploy a new agent. Triggers provisioning on Hetzner Cloud.",
    auth: true,
    body: `{ "name": "My Agent", "tier": "standard" }`,
    response: `{ "id": "...", "name": "My Agent", "status": "provisioning" }`,
  },
  {
    method: "GET",
    path: "/api/agents/:id",
    description: "Get details for a specific agent including status, domain, and server info.",
    auth: true,
    response: `{ "id": "...", "name": "My Agent", "status": "running", "domain": "my-agent.fireclaw.ai", "ip": "..." }`,
  },
  {
    method: "PATCH",
    path: "/api/agents/:id",
    description: "Perform actions on an agent: reboot, shutdown, power on, or delete.",
    auth: true,
    body: `{ "action": "reboot" }`,
    response: `{ "success": true }`,
  },
  {
    method: "GET",
    path: "/api/agents/:id/metrics",
    description: "Retrieve CPU, memory, disk, and network metrics from Hetzner.",
    auth: true,
    response: `{ "cpu": [...], "memory": [...], "disk": [...], "network": [...] }`,
  },
  {
    method: "GET",
    path: "/api/subscription",
    description: "Get the current user's subscription tier, status, and quota.",
    auth: true,
    response: `{ "tier": "standard", "status": "active", "agentLimit": 3, "agentCount": 1 }`,
  },
]

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: "bg-emerald-50 text-emerald-700",
    POST: "bg-blue-50 text-blue-700",
    PATCH: "bg-amber-50 text-amber-700",
    DELETE: "bg-red-50 text-red-700",
  }
  return (
    <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${colors[method] || "bg-neutral-100 text-neutral-600"}`}>
      {method}
    </span>
  )
}

export default function ApiDocs() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-20">
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-[3px] text-neutral-400">
            API Reference
          </p>
          <h1 className="mt-3 text-[32px] font-black tracking-[-0.03em] text-neutral-900">
            REST API
          </h1>
          <p className="mx-auto mt-3 max-w-md text-[14px] text-neutral-500">
            Programmatic access to manage your FireClaw agents. All endpoints require authentication via session cookie.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
          <p className="text-[13px] text-neutral-600">
            <strong className="text-neutral-900">Base URL:</strong>{" "}
            <code className="rounded bg-white px-2 py-0.5 font-mono text-[12px] text-neutral-700">
              https://fireclaw.ai
            </code>
          </p>
          <p className="mt-2 text-[13px] text-neutral-600">
            <strong className="text-neutral-900">Authentication:</strong>{" "}
            Session-based (cookie). All requests must include a valid session cookie from signing in.
          </p>
          <p className="mt-2 text-[13px] text-neutral-600">
            <strong className="text-neutral-900">Rate Limits:</strong>{" "}
            5 agent creations/hour, 10 payment operations/hour per user.
          </p>
        </div>

        <div className="mt-10 space-y-6">
          {endpoints.map((ep, i) => (
            <div key={i} className="rounded-2xl border border-neutral-200 bg-white p-6">
              <div className="flex items-center gap-3">
                <MethodBadge method={ep.method} />
                <code className="font-mono text-[13px] font-semibold text-neutral-900">
                  {ep.path}
                </code>
              </div>
              <p className="mt-2 text-[13px] text-neutral-500">{ep.description}</p>

              {ep.body && (
                <div className="mt-4">
                  <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[1px] text-neutral-400">
                    Request Body
                  </p>
                  <pre className="overflow-x-auto rounded-xl bg-neutral-50 p-4 font-mono text-[12px] text-neutral-700">
                    {ep.body}
                  </pre>
                </div>
              )}

              <div className="mt-4">
                <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[1px] text-neutral-400">
                  Response
                </p>
                <pre className="overflow-x-auto rounded-xl bg-neutral-50 p-4 font-mono text-[12px] text-neutral-700">
                  {ep.response}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  )
}
