export type AgentTemplateId =
  | "openclaw"
  | "ad-chain-verify"
  | "seo-agent"
  | "customer-support"
  | "research-analyst"
  | "content-studio"
  | "document-intake"
  | "market-trends"
  | "shopping-assistant"
  | "business-analyst"
  | "sales-outreach"
  | "hr-screener"
  | "finance-analyst"
  | "code-reviewer"
  | "legal-assistant"
  | "custom-agent";

export type PlanId = "starter" | "growth" | "agency" | "custom";
export type InfrastructureTier = "starter" | "standard" | "pro" | "enterprise";
export type AgentTemplateStatus = "deployable" | "coming-soon" | "custom-setup";

export interface AgentPricingTier {
  label: string;
  price: string;
  period: string;
  includes: string;
  highlighted?: boolean;
}

export interface AgentTemplate {
  id: AgentTemplateId;
  name: string;
  /** Short marketing line shown on marketplace cards and detail page hero. */
  tagline: string;
  /** Emoji fallback; only used if logoUrl is missing. */
  icon: string;
  /** Path under /public for the agent’s square brand mark (svg/png). */
  logoUrl?: string;
  /** Path under /public for a wider preview image on the detail hero. */
  imageUrl?: string;
  /** Marks a hero/priority agent (OpenClaw, Ad-Chain Verify, SEO). */
  featured?: boolean;
  category: string;
  description: string;
  capabilities: string[];
  /** Optional display-only pricing tiers (used by AdTech-style agents). */
  pricingTiers?: AgentPricingTier[];
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
  // ── Priority 1: OpenClaw (general-purpose, Fireclaw's modified build) ──
  {
    id: "openclaw",
    name: "OpenClaw",
    tagline: "Your own personal AI assistant. Any OS. Any platform.",
    icon: "🦞",
    logoUrl: "/agents/openclaw-logo.svg",
    imageUrl: "/hero1.png",
    featured: true,
    category: "General",
    description:
      "Fireclaw's managed deployment of the open-source OpenClaw assistant — a typed, local-first workflow shell that turns skills and tools into composable pipelines. Runs as a dedicated agent on your own subdomain with HTTPS, monitoring, and one-click upgrades.",
    capabilities: [
      "General-purpose chat, research, and task execution",
      "Composable skills + tool calling via the OpenClaw plugin API",
      "Runs on a dedicated server with HTTPS, DNS, and health checks",
      "Your own subdomain on fireclaw.ai (custom domain on Agency+)",
      "One-click upgrades to the latest OpenClaw release",
    ],
    runtime: "openclaw",
    minimumPlan: "starter",
    defaultModelProvider: "minimax",
    requiredSecrets: [],
    healthCheck: "/healthz",
    status: "deployable",
  },
  // ── Priority 2: Ad-Chain Verify (ad-tech, paid client lined up) ──
  {
    id: "ad-chain-verify",
    name: "Ad-Chain Verify",
    tagline:
      "Programmatic ad supply-chain verification, on autopilot.",
    icon: "📶",
    logoUrl: "/agents/ad-chain-verify-mark.svg",
    imageUrl: "/meta-ads-agent.png",
    featured: true,
    category: "AdTech",
    description:
      "An OpenClaw build tuned for ad operations teams. Crawls ads.txt, app-ads.txt, and sellers.json at scale, cross-references reseller relationships, and ships proof-first compliance reports for every campaign you run.",
    capabilities: [
      "Processes Android apps, iOS apps, and websites in bulk batches",
      "Fetches and parses ads.txt / app-ads.txt with retry + caching",
      "Verifies supply path via sellers.json cross-referencing",
      "Spawns parallel sub-agents for 5,000+ entry runs",
      "Outputs structured Excel/CSV compliance reports + JSON evidence",
      "Scheduled re-checks with diff alerts when ad inventory changes",
    ],
    pricingTiers: [
      {
        label: "Starter",
        price: "$49",
        period: "/mo",
        includes: "Up to 500 verified pages · daily schedule",
      },
      {
        label: "Growth",
        price: "$99",
        period: "/mo",
        includes: "1,500 verified pages · GEO routing · priority support",
        highlighted: true,
      },
      {
        label: "Scale",
        price: "$199",
        period: "/mo",
        includes: "5,000 verified pages · multi-GEO · diff alerts",
      },
    ],
    runtime: "openclaw",
    minimumPlan: "growth",
    defaultModelProvider: "minimax",
    requiredSecrets: [],
    healthCheck: "Agent responds to 'process next batch' command",
    status: "deployable",
  },
  // ── Priority 3: SEO Agent ──
  {
    id: "seo-agent",
    name: "SEO Agent",
    tagline:
      "Connect your site. Get audits, fixes, and backlinks — on a schedule.",
    icon: "🔍",
    logoUrl: "/agents/seo-agent-mark.svg",
    imageUrl: "/seo-agent.png",
    featured: true,
    category: "Marketing",
    description:
      "An OpenClaw build with site-connect capabilities: it crawls your pages, runs technical + on-page audits, surfaces ranking gaps against competitors, and runs auto backlink campaigns from your dashboard.",
    capabilities: [
      "Site connect via sitemap or GSC — full technical SEO audit",
      "On-page audits: title, meta, headings, internal links, schema",
      "Keyword gap analysis against top-ranking competitors",
      "Auto backlink outreach campaigns with reply tracking",
      "Content briefs for target queries with intent + entities",
      "Scheduled re-audits with weekly progress digests",
    ],
    runtime: "openclaw",
    minimumPlan: "growth",
    defaultModelProvider: "minimax",
    requiredSecrets: [],
    healthCheck: "/healthz",
    status: "deployable",
  },
  // ── Other Fireclaw agents (coming soon until priority three are live) ──
  {
    id: "customer-support",
    name: "Customer Support",
    tagline: "24/7 frontline support agent that answers, triages, and escalates.",
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
    status: "coming-soon",
  },
  {
    id: "content-studio",
    name: "Content Studio",
    tagline: "Briefs in, finished drafts out — across blog, social, and email.",
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
    status: "coming-soon",
  },
  {
    id: "shopping-assistant",
    name: "Shopping Assistant",
    tagline: "Turns browsers into buyers with product comparisons and guided checkout.",
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
    status: "coming-soon",
  },
  {
    id: "research-analyst",
    name: "Research Analyst",
    tagline: "Web research turned into structured briefs your team can act on.",
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
    status: "coming-soon",
  },
  {
    id: "market-trends",
    name: "Market Trends",
    tagline: "Weekly trend digests pulled from news, social, and competitors.",
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
    status: "coming-soon",
  },
  {
    id: "document-intake",
    name: "Document Intake",
    tagline: "PDFs in, structured data out — piped straight into your stack.",
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
    status: "coming-soon",
  },
  {
    id: "business-analyst",
    name: "Business Analyst",
    tagline: "Ask questions of your data — get charts, tables, and answers.",
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
    status: "coming-soon",
  },
  // ── Coming Soon ──────────────────────────────────────────────────────────────────────────
  {
    id: "sales-outreach",
    name: "Sales Outreach",
    tagline: "From cold prospect to booked meeting — fully personalised.",
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
    tagline: "Score applicants against your spec and auto-schedule interviews.",
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
    tagline: "Reads your books, spots risk, forecasts cash — every month.",
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
    tagline: "PR reviews in seconds — bugs, security, and refactor suggestions.",
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
    tagline: "Contract review and plain-English answers — without the legal fees.",
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
    id: "custom-agent",
    name: "Custom Agent",
    tagline: "A founder-led build around your exact workflow and integrations.",
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
