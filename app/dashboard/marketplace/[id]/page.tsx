import { auth } from "@/auth"
import { notFound, redirect } from "next/navigation"
import { AGENT_TEMPLATES, getTemplate } from "@/lib/agent-catalog"
import { AgentDetailClient } from "@/components/dashboard/agent-detail-client"

type Props = { params: Promise<{ id: string }> }

export async function generateStaticParams() {
  return AGENT_TEMPLATES.map((t) => ({ id: t.id }))
}

export default async function MarketplaceAgentPage({ params }: Props) {
  const session = await auth()
  if (!session?.user?.id) redirect("/auth/signin")

  const { id } = await params
  const template = AGENT_TEMPLATES.find((t) => t.id === id)
  if (!template) notFound()

  // getTemplate returns first if not found — we already checked, so safe.
  return <AgentDetailClient template={getTemplate(id)} />
}
