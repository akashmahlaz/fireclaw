export type AgentTemplateId =
  | "customer-support"
  | "research-analyst"
  | "content-studio"
  | "document-intake"
  | "market-trends"
  | "shopping-assistant"
  | "business-analyst"
  | "seo-agent"
  | "sales-outreach"
  | "hr-screener"
  | "finance-analyst"
  | "code-reviewer"
  | "legal-assistant"
  | "adtech-crawler"
  | "custom-agent";

export type PlanId = "starter" | "growth" | "agency" | "custom";
export type InfrastructureTier = "starter" | "standard" | "pro" | "enterprise";
export type AgentTemplateStatus = "deployable" | "coming-soon" | "custom-setup";

export interface AgentTemplate {
  id: AgentTemplateId;
  name: string;
  icon: string;
  category: string;
  description: string;
  capabilities: string[];
  runtime: "openclaw" | "managed-custom";
  minimumPlan: PlanId;
  defaultModelProvider: "minimax";
  requiredSecrets: string[];
  healthCheck: string;
  status: AgentTemplateStatus;
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
    icon: "🎧",
    category: "Support",
    description: "Answers FAQs, triages tickets, and escalates unresolved customer issues 24/7.",
    capabilities: [
      "Handles common questions instantly without human intervention",
      "Triages and prioritises tickets by urgency and topic",
      "Escalates edge cases with full context to your team",
    ],
    runtime: "openclaw",
    minimumPlan: "starter",
    defaultModelProvider: "minimax",
    requiredSecrets: [],
    healthCheck: "/healthz",
    status: "deployable",
  },
  {
    id: "content-studio",
    name: "Content Studio",
    icon: "✍️",
    category: "Content",
    description: "Drafts blogs, social posts, newsletters, and campaign copy from a short brief.",
    capabilities: [
      "Writes SEO-ready long-form blog posts and articles",
      "Generates LinkedIn, Twitter, and Instagram copy",
      "Adapts tone, voice, and format to your brand",
    ],
    runtime: "openclaw",
    minimumPlan: "starter",
    defaultModelProvider: "minimax",
    requiredSecrets: [],
    healthCheck: "/healthz",
    status: "deployable",
  },
  {
    id: "shopping-assistant",
    name: "Shopping Assistant",
    icon: "🛍️",
    category: "Commerce",
    description: "Compares products, explains tradeoffs, and guides buyers to confident decisions.",
    capabilities: [
      "Compares specs and prices across products in real time",
      "Explains pros, cons, and use-case fit clearly",
      "Handles objections and nudges buyers toward purchase",
    ],
    runtime: "openclaw",
    minimumPlan: "starter",
    defaultModelProvider: "minimax",
    requiredSecrets: [],
    healthCheck: "/healthz",
    status: "deployable",
  },
  {
    id: "seo-agent",
    name: "SEO Agent",
    icon: "🔍",
    category: "Marketing",
    description: "Audits your pages, surfaces ranking gaps, and delivers fixes that move you up search results.",
    capabilities: [
      "On-page audits: title, meta, headings, internal links",
      "Keyword gap analysis against top-ranking competitors",
      "Actionable content briefs for target queries",
    ],
    runtime: "openclaw",
    minimumPlan: "growth",
    defaultModelProvider: "minimax",
    requiredSecrets: [],
    healthCheck: "/healthz",
    status: "deployable",
  },
  {
    id: "research-analyst",
    name: "Research Analyst",
    icon: "🔬",
    category: "Research",
    description: "Finds credible sources, compares claims, and turns raw research into structured briefs your team can act on.",
    capabilities: [
      "Searches the web and synthesises findings into clear summaries",
      "Fact-checks claims against multiple authoritative sources",
      "Outputs structured reports, tables, and key takeaways",
    ],
    runtime: "openclaw",
    minimumPlan: "growth",
    defaultModelProvider: "minimax",
    requiredSecrets: [],
    healthCheck: "/healthz",
    status: "deployable",
  },
  {
    id: "market-trends",
    name: "Market Trends",
    icon: "📈",
    category: "Marketing",
    description: "Monitors industry topics, summarises key shifts, and produces weekly trend reports you can forward to clients.",
    capabilities: [
      "Tracks news, social signals, and competitor moves",
      "Surfaces emerging trends before they become mainstream",
      "Produces formatted weekly digest reports",
    ],
    runtime: "openclaw",
    minimumPlan: "growth",
    defaultModelProvider: "minimax",
    requiredSecrets: [],
    healthCheck: "/healthz",
    status: "deployable",
  },
  {
    id: "document-intake",
    name: "Document Intake",
    icon: "📄",
    category: "Operations",
    description: "Reads uploaded PDFs and docs, extracts key data, and routes summaries to the right place automatically.",
    capabilities: [
      "Parses contracts, invoices, reports, and forms",
      "Extracts structured data: dates, amounts, parties, clauses",
      "Summarises and routes outputs to Slack, email, or CRM",
    ],
    runtime: "openclaw",
    minimumPlan: "growth",
    defaultModelProvider: "minimax",
    requiredSecrets: [],
    healthCheck: "/healthz",
    status: "deployable",
  },
  {
    id: "business-analyst",
    name: "Business Analyst",
    icon: "📊",
    category: "Analytics",
    description: "Connects to your data, runs analysis on demand, and delivers decision-ready reports and dashboards.",
    capabilities: [
      "Answers business questions from spreadsheets and databases",
      "Identifies trends, anomalies, and growth levers",
      "Generates charts, tables, and executive summaries",
    ],
    runtime: "openclaw",
    minimumPlan: "agency",
    defaultModelProvider: "minimax",
    requiredSecrets: [],
    healthCheck: "/healthz",
    status: "deployable",
  },
  // ── Coming Soon ──────────────────────────────────────────────────────────────
  {
    id: "sales-outreach",
    name: "Sales Outreach",
    icon: "💼",
    category: "Sales",
    description: "Researches prospects, writes personalised outreach sequences, and books meetings on your calendar automatically.",
    capabilities: [
      "Researches leads from LinkedIn, websites, and news",
      "Writes personalised cold email + follow-up sequences",
      "Books discovery calls directly into your calendar",
    ],
    runtime: "openclaw",
    minimumPlan: "growth",
    defaultModelProvider: "minimax",
    requiredSecrets: [],
    healthCheck: "/healthz",
    status: "coming-soon",
  },
  {
    id: "hr-screener",
    name: "HR Screener",
    icon: "👥",
    category: "Operations",
    description: "Screens job applications, scores candidates against your criteria, and schedules interviews automatically.",
    capabilities: [
      "Parses CVs and scores candidates against your job spec",
      "Sends personalised screening questions to shortlisted applicants",
      "Schedules interviews and sends calendar invites",
    ],
    runtime: "openclaw",
    minimumPlan: "growth",
    defaultModelProvider: "minimax",
    requiredSecrets: [],
    healthCheck: "/healthz",
    status: "coming-soon",
  },
  {
    id: "finance-analyst",
    name: "Finance Analyst",
    icon: "💰",
    category: "Analytics",
    description: "Reads your P&L, cash flow, and invoices — then surfaces the insights that actually move the needle.",
    capabilities: [
      "Parses bank statements, invoices, and expense reports",
      "Spots spending anomalies and cash flow risks early",
      "Generates monthly financial summaries and forecasts",
    ],
    runtime: "openclaw",
    minimumPlan: "agency",
    defaultModelProvider: "minimax",
    requiredSecrets: [],
    healthCheck: "/healthz",
    status: "coming-soon",
  },
  {
    id: "code-reviewer",
    name: "Code Reviewer",
    icon: "💻",
    category: "Engineering",
    description: "Reviews pull requests, catches bugs, suggests improvements, and explains changes in plain English.",
    capabilities: [
      "Reviews PRs for bugs, security issues, and anti-patterns",
      "Suggests refactors with examples in your codebase style",
      "Writes commit summaries and changelogs automatically",
    ],
    runtime: "openclaw",
    minimumPlan: "growth",
    defaultModelProvider: "minimax",
    requiredSecrets: [],
    healthCheck: "/healthz",
    status: "coming-soon",
  },
  {
    id: "legal-assistant",
    name: "Legal Assistant",
    icon: "⚖️",
    category: "Operations",
    description: "Reviews contracts, flags risky clauses, and answers legal questions in plain language — not legal fees.",
    capabilities: [
      "Flags non-standard and high-risk contract clauses",
      "Answers legal questions with jurisdiction-aware context",
      "Drafts NDAs, terms, and standard agreement templates",
    ],
    runtime: "openclaw",
    minimumPlan: "agency",
    defaultModelProvider: "minimax",
    requiredSecrets: [],
    healthCheck: "/healthz",
    status: "coming-soon",
  },
  {
    id: "adtech-crawler",
    name: "AdTech Supply Chain Verifier",
    icon: "📡",
    category: "Ad Operations",
    description: "Crawls ads.txt, app-ads.txt, and sellers.json files for large lists of apps and websites to verify programmatic advertising supply chains.",
    capabilities: [
      "Processes Android apps, iOS apps, and websites in bulk",
      "Fetches and parses ads.txt / app-ads.txt files",
      "Verifies supply chain via sellers.json cross-referencing",
      "Spawns parallel sub-agents for 5,000+ entry batches",
      "Outputs structured Excel-ready compliance reports",
    ],
    runtime: "openclaw",
    minimumPlan: "growth",
    defaultModelProvider: "minimax",
    requiredSecrets: [],
    healthCheck: "Agent responds to 'process next batch' command",
    status: "deployable",
  },
  {
    id: "custom-agent",
    name: "Custom Agent",
    icon: "⚙️",
    category: "Custom",
    description: "A founder-led build for your specific workflow, data sources, channels, and integrations.",
    capabilities: [
      "Built around your exact use case and data",
      "Integrates with your existing tools and channels",
      "Dedicated implementation and onboarding support",
    ],
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
