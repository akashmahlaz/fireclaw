"use client"

import { useState, useEffect } from "react"

interface Deal {
  id: string
  name: string
  stage: string
  stageEmoji: string
  stageColor: string
  amount: number | null
  source: string
  applyLink: string
  description: string
  created: string
  updated: string
}

interface Stage {
  stageId: string
  label: string
  emoji: string
  color: string
  deals: Deal[]
}

interface Contact {
  id: string
  name: string
  email: string
  phone: string
  company: string
  stage: string
  status: string
}

interface Stats {
  totalDeals: number
  activeDeals: number
  totalValue: number
  byStage: { label: string; emoji: string; count: number; color: string }[]
  totalContacts: number
}

export default function CRMDashboard() {
  const [pipeline, setPipeline] = useState<Stage[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<"pipeline" | "list" | "contacts">("pipeline")
  const [filter, setFilter] = useState<string>("all")

  useEffect(() => {
    fetch("/api/crm")
      .then((r) => r.json())
      .then((d) => {
        setPipeline(d.pipeline || [])
        setContacts(d.contacts || [])
        setStats(d.stats || null)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#0a0a0a", color: "#fff" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔥</div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>Loading CRM...</div>
        </div>
      </div>
    )
  }

  const allDeals = pipeline.flatMap((s) => s.deals)
  const filteredPipeline = filter === "all" ? pipeline : pipeline.filter((s) => s.label === filter)

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#e5e5e5", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{ padding: "24px 32px", borderBottom: "1px solid #1e1e1e", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#fff", margin: 0, letterSpacing: -1 }}>🔥 FireClaw CRM</h1>
          <p style={{ color: "#737373", fontSize: 14, marginTop: 4 }}>Lead Pipeline & Outreach Tracker</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {(["pipeline", "list", "contacts"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid " + (view === v ? "#f97316" : "#262626"),
                background: view === v ? "#f97316" : "#171717",
                color: view === v ? "#fff" : "#a3a3a3",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                textTransform: "capitalize",
              }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ padding: "20px 32px", display: "flex", gap: 16, flexWrap: "wrap" }}>
        <StatCard label="Total Deals" value={stats?.totalDeals || 0} emoji="📊" />
        <StatCard label="Active" value={stats?.activeDeals || 0} emoji="🔥" />
        <StatCard label="Pipeline Value" value={`$${(stats?.totalValue || 0).toLocaleString()}`} emoji="💰" />
        <StatCard label="Contacts" value={stats?.totalContacts || 0} emoji="👥" />
        {stats?.byStage
          .filter((s) => s.count > 0 && s.label !== "Lost")
          .map((s) => (
            <StatCard key={s.label} label={s.label} value={s.count} emoji={s.emoji} color={s.color} onClick={() => setFilter(filter === s.label ? "all" : s.label)} active={filter === s.label} />
          ))}
      </div>

      {/* Pipeline View */}
      {view === "pipeline" && (
        <div style={{ padding: "0 32px 32px", display: "flex", gap: 16, overflowX: "auto", minHeight: 400 }}>
          {filteredPipeline
            .filter((s) => s.label !== "Lost")
            .map((stage) => (
              <div key={stage.stageId} style={{ minWidth: 300, maxWidth: 340, flex: "0 0 300px" }}>
                <div style={{ padding: "12px 16px", borderRadius: "12px 12px 0 0", background: "#171717", borderBottom: `2px solid ${stage.color}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>
                    {stage.emoji} {stage.label}
                  </span>
                  <span style={{ background: "#262626", padding: "2px 10px", borderRadius: 12, fontSize: 12, fontWeight: 700 }}>{stage.deals.length}</span>
                </div>
                <div style={{ background: "#111", borderRadius: "0 0 12px 12px", padding: 8, display: "flex", flexDirection: "column", gap: 8, maxHeight: 600, overflowY: "auto" }}>
                  {stage.deals.map((deal) => (
                    <DealCard key={deal.id} deal={deal} />
                  ))}
                  {stage.deals.length === 0 && <div style={{ padding: 24, textAlign: "center", color: "#525252", fontSize: 13 }}>No deals</div>}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* List View */}
      {view === "list" && (
        <div style={{ padding: "0 32px 32px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #262626" }}>
                <th style={thStyle}>Stage</th>
                <th style={thStyle}>Deal</th>
                <th style={thStyle}>Amount</th>
                <th style={thStyle}>Source</th>
                <th style={thStyle}>Apply</th>
                <th style={thStyle}>Updated</th>
              </tr>
            </thead>
            <tbody>
              {allDeals
                .sort((a, b) => a.stageColor.localeCompare(b.stageColor))
                .map((deal) => (
                  <tr key={deal.id} style={{ borderBottom: "1px solid #1a1a1a" }}>
                    <td style={tdStyle}>
                      <span style={{ background: deal.stageColor + "22", color: deal.stageColor, padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                        {deal.stageEmoji} {deal.stage}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 600, color: "#fff" }}>{deal.name}</td>
                    <td style={tdStyle}>{deal.amount ? `$${deal.amount.toLocaleString()}` : "—"}</td>
                    <td style={tdStyle}>
                      <span style={{ background: "#262626", padding: "2px 8px", borderRadius: 4, fontSize: 11 }}>{deal.source}</span>
                    </td>
                    <td style={tdStyle}>
                      {deal.applyLink ? (
                        <a href={deal.applyLink} target="_blank" rel="noopener noreferrer" style={{ color: "#f97316", textDecoration: "none", fontSize: 12 }}>
                          Apply →
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td style={{ ...tdStyle, color: "#737373", fontSize: 12 }}>{new Date(deal.updated).toLocaleDateString()}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Contacts View */}
      {view === "contacts" && (
        <div style={{ padding: "0 32px 32px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
            {contacts.map((c) => (
              <div key={c.id} style={{ background: "#171717", border: "1px solid #262626", borderRadius: 12, padding: 16 }}>
                <div style={{ fontWeight: 700, color: "#fff", fontSize: 15 }}>{c.name || "Unknown"}</div>
                {c.company && <div style={{ color: "#a3a3a3", fontSize: 13, marginTop: 2 }}>{c.company}</div>}
                <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                  {c.email && (
                    <a href={`mailto:${c.email}`} style={{ color: "#60a5fa", fontSize: 13, textDecoration: "none" }}>
                      ✉️ {c.email}
                    </a>
                  )}
                  {c.phone && <div style={{ color: "#a3a3a3", fontSize: 13 }}>📞 {c.phone}</div>}
                </div>
                <div style={{ marginTop: 8 }}>
                  <span style={{ background: c.stage === "customer" ? "#22c55e22" : "#3b82f622", color: c.stage === "customer" ? "#22c55e" : "#3b82f6", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                    {c.stage || "lead"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lost deals section */}
      {view === "pipeline" && (
        <div style={{ padding: "0 32px 32px" }}>
          <details>
            <summary style={{ cursor: "pointer", color: "#737373", fontSize: 13, fontWeight: 600 }}>❌ Lost ({pipeline.find((s) => s.label === "Lost")?.deals.length || 0})</summary>
            <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
              {pipeline
                .find((s) => s.label === "Lost")
                ?.deals.map((d) => (
                  <span key={d.id} style={{ background: "#1a1a1a", padding: "4px 12px", borderRadius: 8, fontSize: 12, color: "#737373" }}>
                    {d.name}
                  </span>
                ))}
            </div>
          </details>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, emoji, color, onClick, active }: { label: string; value: string | number; emoji: string; color?: string; onClick?: () => void; active?: boolean }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: active ? "#262626" : "#171717",
        border: `1px solid ${active ? color || "#f97316" : "#262626"}`,
        borderRadius: 12,
        padding: "14px 20px",
        minWidth: 120,
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s",
      }}
    >
      <div style={{ fontSize: 12, color: "#737373", fontWeight: 600 }}>{emoji} {label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: color || "#fff", marginTop: 4 }}>{value}</div>
    </div>
  )
}

function DealCard({ deal }: { deal: Deal }) {
  return (
    <div style={{ background: "#171717", border: "1px solid #262626", borderRadius: 10, padding: 14, transition: "border-color 0.2s" }}>
      <div style={{ fontWeight: 600, fontSize: 13, color: "#fff", lineHeight: 1.3 }}>{deal.name}</div>
      <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
        {deal.amount && (
          <span style={{ background: "#22c55e22", color: "#22c55e", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700 }}>${deal.amount.toLocaleString()}</span>
        )}
        <span style={{ background: "#262626", padding: "2px 8px", borderRadius: 4, fontSize: 11 }}>{deal.source}</span>
      </div>
      {deal.applyLink && (
        <a href={deal.applyLink} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: 8, color: "#f97316", fontSize: 12, textDecoration: "none", fontWeight: 600 }}>
          Apply →
        </a>
      )}
      <div style={{ marginTop: 6, fontSize: 11, color: "#525252" }}>Updated {new Date(deal.updated).toLocaleDateString()}</div>
    </div>
  )
}

const thStyle: React.CSSProperties = { textAlign: "left", padding: "10px 12px", color: "#737373", fontWeight: 600, fontSize: 12 }
const tdStyle: React.CSSProperties = { padding: "10px 12px" }
