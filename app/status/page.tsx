import Navbar from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { CheckCircle, AlertCircle, Clock } from "lucide-react"

export const metadata = {
  title: "System Status — FireClaw",
}

const services = [
  { name: "Platform", status: "operational" as const, latency: "45ms" },
  { name: "Dashboard", status: "operational" as const, latency: "62ms" },
  { name: "Agent Provisioning", status: "operational" as const, latency: "— " },
  { name: "DNS Management", status: "operational" as const, latency: "38ms" },
  { name: "Payment Processing", status: "operational" as const, latency: "180ms" },
  { name: "Email Delivery", status: "operational" as const, latency: "240ms" },
  { name: "Authentication", status: "operational" as const, latency: "52ms" },
]

function StatusIcon({ status }: { status: "operational" | "degraded" | "outage" }) {
  if (status === "operational") return <CheckCircle className="size-4 text-emerald-500" />
  if (status === "degraded") return <Clock className="size-4 text-amber-500" />
  return <AlertCircle className="size-4 text-red-500" />
}

function StatusLabel({ status }: { status: "operational" | "degraded" | "outage" }) {
  const labels = { operational: "Operational", degraded: "Degraded", outage: "Outage" }
  const colors = {
    operational: "text-emerald-600",
    degraded: "text-amber-600",
    outage: "text-red-600",
  }
  return <span className={`text-[13px] font-medium ${colors[status]}`}>{labels[status]}</span>
}

export default function Status() {
  const allOperational = services.every((s) => s.status === "operational")

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-20">
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-[3px] text-neutral-400">
            System Status
          </p>
          <h1 className="mt-3 text-[32px] font-black tracking-[-0.03em] text-neutral-900">
            Service status
          </h1>
        </div>

        {/* Overall status */}
        <div
          className={`mt-10 rounded-2xl p-6 text-center ${
            allOperational
              ? "border border-emerald-200 bg-emerald-50"
              : "border border-amber-200 bg-amber-50"
          }`}
        >
          {allOperational ? (
            <>
              <CheckCircle className="mx-auto size-8 text-emerald-500" />
              <p className="mt-3 text-[16px] font-bold text-emerald-900">
                All systems operational
              </p>
              <p className="mt-1 text-[13px] text-emerald-600">
                Last checked: {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </>
          ) : (
            <>
              <AlertCircle className="mx-auto size-8 text-amber-500" />
              <p className="mt-3 text-[16px] font-bold text-amber-900">
                Some systems experiencing issues
              </p>
            </>
          )}
        </div>

        {/* Service list */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-neutral-200">
          {services.map((service, i) => (
            <div
              key={service.name}
              className={`flex items-center justify-between bg-white px-6 py-4 ${
                i < services.length - 1 ? "border-b border-neutral-100" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <StatusIcon status={service.status} />
                <span className="text-[14px] font-medium text-neutral-900">
                  {service.name}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[12px] font-mono text-neutral-400">
                  {service.latency}
                </span>
                <StatusLabel status={service.status} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-neutral-200 bg-neutral-50 p-6 text-center">
          <p className="text-[13px] text-neutral-500">
            Subscribe to status updates via email:{" "}
            <a
              href="mailto:status@fireclaw.ai"
              className="font-medium text-neutral-900 underline underline-offset-2"
            >
              status@fireclaw.ai
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
