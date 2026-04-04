"use client"

import { useEffect, useState, useRef } from "react"

const lines = [
  { text: "$ fireclaw deploy --tier standard --region eu", delay: 0, color: "text-green-400" },
  { text: "  Creating VPS from snapshot…", delay: 800, color: "text-neutral-400" },
  { text: "  ✓ VPS provisioned (4 vCPU · 8 GB RAM)", delay: 2200, color: "text-emerald-400" },
  { text: "  ✓ DNS record → john-abc123.fireclaw.ai", delay: 3000, color: "text-emerald-400" },
  { text: "  ✓ SSL certificate provisioned", delay: 3600, color: "text-emerald-400" },
  { text: "  ✓ OpenClaw gateway started on :18789", delay: 4200, color: "text-emerald-400" },
  { text: "", delay: 4800, color: "" },
  { text: "  🚀 Your OpenClaw is live!", delay: 5000, color: "text-white font-semibold" },
  { text: "  → https://john-abc123.fireclaw.ai", delay: 5400, color: "text-orange-400" },
]

export function DeployTerminal() {
  const [visibleCount, setVisibleCount] = useState(0)
  const hasStarted = useRef(false)

  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true

    lines.forEach((line, i) => {
      setTimeout(() => setVisibleCount(i + 1), line.delay)
    })
  }, [])

  return (
    <div className="px-5 py-4 font-mono text-[13px] leading-relaxed">
      {lines.slice(0, visibleCount).map((line, i) => (
        <div key={i} className={line.color}>
          {line.text || "\u00A0"}
        </div>
      ))}
      {visibleCount < lines.length && (
        <span className="inline-block h-4 w-1.5 animate-pulse bg-neutral-400" />
      )}
    </div>
  )
}
