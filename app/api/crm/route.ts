import { NextResponse } from "next/server"

const MATON_API_KEY = process.env.MATON_API_KEY || ""
const BASE = "https://gateway.maton.ai/hubspot/crm/v3"

const STAGE_MAP: Record<string, { label: string; emoji: string; color: string; order: number }> = {
  appointmentscheduled: { label: "Lead", emoji: "🔵", color: "#3b82f6", order: 0 },
  qualifiedtobuy: { label: "Discovery Call", emoji: "🟡", color: "#eab308", order: 1 },
  presentationscheduled: { label: "Proposal Sent", emoji: "📝", color: "#f97316", order: 2 },
  decisionmakerboughtin: { label: "Negotiation", emoji: "🔄", color: "#a855f7", order: 3 },
  contractsent: { label: "Signed", emoji: "✍️", color: "#06b6d4", order: 4 },
  "3506747072": { label: "Delivered", emoji: "📦", color: "#14b8a6", order: 5 },
  closedwon: { label: "Paid", emoji: "✅", color: "#22c55e", order: 6 },
  closedlost: { label: "Lost", emoji: "❌", color: "#ef4444", order: 7 },
}

export async function GET() {
  try {
    // Fetch deals
    const dealsRes = await fetch(
      `${BASE}/objects/deals?limit=100&properties=dealname,dealstage,amount,pipeline,description,createdate,hs_lastmodifieddate`,
      { headers: { Authorization: `Bearer ${MATON_API_KEY}` } }
    )
    const dealsData = await dealsRes.json()

    // Fetch contacts
    const contactsRes = await fetch(
      `${BASE}/objects/contacts?limit=100&properties=firstname,lastname,email,phone,company,lifecyclestage,hs_lead_status`,
      { headers: { Authorization: `Bearer ${MATON_API_KEY}` } }
    )
    const contactsData = await contactsRes.json()

    // Process deals into pipeline stages
    const pipeline: Record<string, any[]> = {}
    let totalValue = 0
    let activeDeals = 0

    for (const deal of dealsData.results || []) {
      const p = deal.properties
      const stageId = p.dealstage || "appointmentscheduled"
      const stageInfo = STAGE_MAP[stageId] || { label: stageId, emoji: "❓", color: "#6b7280", order: 99 }

      if (!pipeline[stageId]) pipeline[stageId] = []

      const amount = parseFloat(p.amount || "0")
      if (stageId !== "closedlost") {
        totalValue += amount
        activeDeals++
      }

      // Extract source from description
      let source = "Unknown"
      const desc = (p.description || "").toLowerCase()
      if (desc.includes("hn ") || desc.includes("hacker news")) source = "HN"
      else if (desc.includes("remotive")) source = "Remotive"
      else if (desc.includes("jobicy")) source = "Jobicy"
      else if (desc.includes("linkedin")) source = "LinkedIn"
      else if (desc.includes("github")) source = "GitHub"
      else if (desc.includes("wwr") || desc.includes("weworkremotely")) source = "WWR"
      else if (desc.includes("web3")) source = "Web3"
      else if (desc.includes("reddit")) source = "Reddit"

      // Extract apply link from description
      let applyLink = ""
      for (const word of (p.description || "").split(/\s+/)) {
        if (word.startsWith("http") || word.startsWith("https")) {
          applyLink = word
          break
        }
      }

      pipeline[stageId].push({
        id: deal.id,
        name: p.dealname,
        stage: stageInfo.label,
        stageEmoji: stageInfo.emoji,
        stageColor: stageInfo.color,
        stageOrder: stageInfo.order,
        amount: amount || null,
        source,
        applyLink,
        description: p.description || "",
        created: p.createdate,
        updated: p.hs_lastmodifieddate,
      })
    }

    // Sort pipeline by stage order
    const sortedPipeline = Object.entries(pipeline)
      .map(([stageId, deals]) => ({
        stageId,
        ...(STAGE_MAP[stageId] || { label: stageId, emoji: "❓", color: "#6b7280", order: 99 }),
        deals: deals.sort((a: any, b: any) => new Date(b.updated).getTime() - new Date(a.updated).getTime()),
      }))
      .sort((a, b) => a.order - b.order)

    // Process contacts
    const contacts = (contactsData.results || []).map((c: any) => ({
      id: c.id,
      name: `${c.properties.firstname || ""} ${c.properties.lastname || ""}`.trim(),
      email: c.properties.email,
      phone: c.properties.phone,
      company: c.properties.company,
      stage: c.properties.lifecyclestage,
      status: c.properties.hs_lead_status,
    }))

    // Summary stats
    const stats = {
      totalDeals: (dealsData.results || []).length,
      activeDeals,
      totalValue,
      byStage: sortedPipeline.map((s) => ({ label: s.label, emoji: s.emoji, count: s.deals.length, color: s.color })),
      totalContacts: contacts.length,
    }

    return NextResponse.json({ pipeline: sortedPipeline, contacts, stats })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
