export type AgentTemplateId =
  | "customer-support"
  | "research-analyst"
  | "content-studio"
  | "document-intake"
  | "market-trends"
  | "shopping-assistant"
  | "business-analyst"
  | "custom-agent";

export type PlanId = "starter" | "growth" | "agency" | "custom";
export type InfrastructureTier = "starter" | "standard" | "pro" | "enterprise";

export interface AgentTemplate {
  id: AgentTemplateId;
  name: string;
  category: string;
  description: string;
  runtime: "openclaw" | "adk-python" | "adk-typescript" | "managed-custom";
  minimumPlan: PlanId;
  defaultModelProvider: "minimax";
  requiredSecrets: string[];
  healthCheck: string;
  status: "deployable" | "custom-setup";
}

export interface FireclawPlan {
  id: PlanId;
  name: string;
  price: string;
  period: string;
  agentLimit: number;
  includedAiCredits: string;
  infrastructureTier: InfrastructureTier;
  description: string;
  highlighted?: boolean;
  features: string[];
}

export const FIRECLAW_PLANS: FireclawPlan[] = [
  {
    id: "starter",
    name: "Starter",
    price: "$7",
    period: "/deploy/mo",
    agentLimit: 1,
    includedAiCredits: "Included MiniMax usage for light workflows",
    infrastructureTier: "starter",
    description: "For one working business agent.",
    features: [
      "1 deployed agent",
      "Managed MiniMax model included",
      "fireclaw.ai subdomain and SSL",
      "Automatic cost-optimized region",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    price: "$21",
    period: "/mo",
    agentLimit: 3,
    includedAiCredits: "Higher MiniMax usage cap",
    infrastructureTier: "standard",
    description: "For teams running multiple workflows.",
    highlighted: true,
    features: [
      "3 deployed agents",
      "All curated ADK templates",
      "Usage limits per agent",
      "Email support",
    ],
  },
  {
    id: "agency",
    name: "Agency",
    price: "$70",
    period: "/mo",
    agentLimit: 10,
    includedAiCredits: "Agency MiniMax usage pool",
    infrastructureTier: "pro",
    description: "For agencies deploying agents for clients.",
    features: [
      "10 deployed agents",
      "Client-ready agent dashboard",
      "Custom domain support",
      "Priority implementation support",
    ],
  },
  {
    id: "custom",
    name: "Custom",
    price: "Custom",
    period: "",
    agentLimit: 100,
    includedAiCredits: "Custom AI budget and model routing",
    infrastructureTier: "enterprise",
    description: "For custom agents, higher limits, and advanced models.",
    features: [
      "Custom agent builds",
      "Claude/OpenAI/BYO model options",
      "Workflow and integration design",
      "Dedicated rollout support",
    ],
  },
];

export const AGENT_TEMPLATES: AgentTemplate[] = [
  {
    id: "customer-support",
    name: "Customer Support",
    category: "Support",
    description: "Answers FAQs, triages tickets, and escalates unresolved customer issues.",
    runtime: "adk-typescript",
    minimumPlan: "starter",
    defaultModelProvider: "minimax",
    requiredSecrets: [],
    healthCheck: "/healthz",
    status: "deployable",
  },
  {
    id: "research-analyst",
    name: "Research Analyst",
    category: "Research",
    description: "Finds sources, compares claims, and turns research into structured briefs.",
    runtime: "adk-python",
    minimumPlan: "growth",
    defaultModelProvider: "minimax",
    requiredSecrets: [],
    healthCheck: "/healthz",
    status: "deployable",
  },
  {
    id: "content-studio",
    name: "Content Studio",
    category: "Content",
    description: "Drafts blogs, social posts, newsletters, and campaign copy from a brief.",
    runtime: "openclaw",
    minimumPlan: "starter",
    defaultModelProvider: "minimax",
    requiredSecrets: [],
    healthCheck: "/healthz",
    status: "deployable",
  },
  {
    id: "document-intake",
    name: "Document Intake",
    category: "Operations",
    description: "Reads uploaded documents and extracts useful structured business data.",
    runtime: "adk-python",
    minimumPlan: "growth",
    defaultModelProvider: "minimax",
    requiredSecrets: [],
    healthCheck: "/healthz",
    status: "deployable",
  },
  {
    id: "market-trends",
    name: "Market Trends",
    category: "Marketing",
    description: "Tracks topics, summarizes changes, and produces trend reports.",
    runtime: "adk-python",
    minimumPlan: "growth",
    defaultModelProvider: "minimax",
    requiredSecrets: [],
    healthCheck: "/healthz",
    status: "deployable",
  },
  {
    id: "shopping-assistant",
    name: "Shopping Assistant",
    category: "Commerce",
    description: "Compares products, explains tradeoffs, and helps buyers choose.",
    runtime: "openclaw",
    minimumPlan: "starter",
    defaultModelProvider: "minimax",
    requiredSecrets: [],
    healthCheck: "/healthz",
    status: "deployable",
  },
  {
    id: "business-analyst",
    name: "Business Analyst",
    category: "Analytics",
    description: "Turns business questions and spreadsheets into decisions and reports.",
    runtime: "adk-python",
    minimumPlan: "agency",
    defaultModelProvider: "minimax",
    requiredSecrets: [],
    healthCheck: "/healthz",
    status: "deployable",
  },
  {
    id: "custom-agent",
    name: "Custom Agent",
    category: "Custom",
    description: "A founder-led build for your workflow, data, channel, and integrations.",
    runtime: "managed-custom",
    minimumPlan: "custom",
    defaultModelProvider: "minimax",
    requiredSecrets: ["Depends on workflow"],
    healthCheck: "Defined during implementation",
    status: "custom-setup",
  },
];

export function getPlan(id: string | undefined): FireclawPlan {
  return FIRECLAW_PLANS.find((plan) => plan.id === id) ?? FIRECLAW_PLANS[0];
}

export function getTemplate(id: string | undefined): AgentTemplate {
  return AGENT_TEMPLATES.find((template) => template.id === id) ?? AGENT_TEMPLATES[0];
}

export function isTemplateAvailableOnPlan(templateId: string, planId: string): boolean {
  const template = getTemplate(templateId);
  const plan = getPlan(planId);
  const minIndex = FIRECLAW_PLANS.findIndex((item) => item.id === template.minimumPlan);
  const planIndex = FIRECLAW_PLANS.findIndex((item) => item.id === plan.id);
  return planIndex >= minIndex;
}
