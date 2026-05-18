# 🔥 FireClaw — The Plan (Research-Backed v2)

## What Is FireClaw?

~~One-click deploy your personal AI assistant.~~ ← Hostinger already does this at $5.99/mo.

**FireClaw is the multi-agent management platform for OpenClaw.**

Deploy, manage, and monitor multiple AI agents from one dashboard. Built for agencies, teams, and power users who need more than a single agent.

Think: **Vercel for AI agents** — not another Hostinger.

---

## Why Not Just Use Hostinger?

Hostinger offers 1-click OpenClaw at **$5.99/mo** with 100K+ agents deployed. They win on:
- Price ($5.99 vs anything we could charge for single agent)
- Brand trust (4M+ users)
- Infrastructure (global data centers)

**But Hostinger can't do:**
- ❌ Manage 10 agents from one dashboard
- ❌ White-label agents for your clients
- ❌ Pre-built agent templates (sales bot, support bot)
- ❌ Cross-agent analytics
- ❌ Agency billing (charge your clients through your dashboard)
- ❌ Agent marketplace / skill store
- ❌ India-first pricing in ₹

**FireClaw's wedge: Multi-agent management, agency tools, and templates.**

---

## The Pitch (30 seconds)

> "Managing AI agents for your clients? Deploy 10 OpenClaw agents in 5 minutes, manage them all from one dashboard, white-label them, and charge your clients — starting at ₹1,999/month."

---

## Revenue Model (Research-Backed)

### Pricing (India-First)

| Plan | Agents | Price/mo | Infra Cost | Margin |
|------|--------|----------|------------|--------|
| **Personal** | 1 | ₹499 (~$6) | ~$8 (shared) | ~25% |
| **Business** | 3 | ₹1,999 (~$24) | ~$20 (shared) | ~17% |
| **Agency** | 10 | ₹4,999 (~$60) | ~$50 (shared) | ~17% |
| **Enterprise** | Unlimited | Custom | Custom | 30%+ |

**Why these prices work:**
- Personal at ₹499 matches Hostinger's $5.99 in value
- Business/Agency have NO equivalent competitor (Hostinger = 1 agent/plan)
- Margins improve with density (more agents per server)

### Infrastructure Strategy (NOT 1 EC2 per agent)

Instead of dedicated instances, use **shared containerized infrastructure:**

| Server | Type | Cost/mo | Agents Hosted | Cost/Agent |
|--------|------|---------|---------------|------------|
| Shared | t3.xlarge (4 vCPU, 16 GB) | ~$122 | 10-15 | $8-12 |
| Shared | t3.2xlarge (8 vCPU, 32 GB) | ~$244 | 25-30 | $8-10 |
| Dedicated | t3.micro (for personal) | ~$11 | 1 | $11 |

*With 1yr Reserved Instances: costs drop 35-40%.*

### Add-On Revenue
| Add-On | Price |
|--------|-------|
| Extra agent | ₹299/mo |
| WhatsApp messages (over 1000/mo) | ₹1/message |
| Premium templates | ₹499-999 one-time |
| White-label branding | Included in Agency+ |
| Bundled AI credits (no BYOK needed) | ₹499/mo for 10K messages |

### Revenue Projections

| Milestone | Users | MRR | ARR |
|-----------|-------|-----|-----|
| Month 3 | 60 | ₹75K (~$900) | ~$10.8K |
| Month 6 | 250 | ₹300K (~$3.6K) | ~$43K |
| Month 12 | 700 | ₹1M (~$12K) | ~$144K |
| Month 24 | 3,000 | ₹5M (~$60K) | ~$720K |

---

## Target Customers (Revised)

### Phase 1 — Indian Agencies & Freelancers (Month 1-3)
- Digital marketing agencies deploying chatbots for clients
- Freelance developers offering "AI assistant" as a service
- **Why they pay:** Managing 5-10 client agents from one place saves hours/week

### Phase 2 — SMBs & Startups (Month 3-6)
- Small businesses wanting AI for support/sales
- Startups that need AI agents across departments
- **Why they pay:** Templates get them started in minutes, not days

### Phase 3 — Global Agencies (Month 6+)
- International agencies managing AI fleets
- White-label resellers
- **Why they pay:** White-label + client billing = new revenue stream for them

---

## Competitive Landscape (Research-Backed)

| Competitor | What | Price | Gap |
|-----------|------|-------|-----|
| **Hostinger OpenClaw** | 1-click single agent | $5.99/mo | No multi-agent, no agency tools |
| **Dante AI** | AI chatbots | $40-400/mo | Chatbot only, not full agent, expensive |
| **Botpress** | Chatbot builder | $0-495/mo | Visual builder, not OpenClaw, no WhatsApp focus |
| **Chatfuel** | WhatsApp/IG bots | $69/mo | Simple bots, not AI agents |
| **Tidio** | Customer service AI | $24-749/mo | Support-focused, not general agents |
| **ManyChat** | Marketing automation | $15-100/mo | Flow-based, not AI agents |
| **Railway/Render** | Generic PaaS | $5-85/mo | Not AI-specific, complex |

**FireClaw's unique position:** Only platform for managing multiple OpenClaw agents with agency tools.

---

## Phases (Revised)

### Phase 1: MVP — Agency Dashboard (3 weeks)
- Landing page targeting Indian agencies
- Multi-agent deploy from one dashboard
- 3 pre-built templates (sales bot, support bot, personal assistant)
- Stripe + Razorpay billing
- 10-20 beta agencies
- **Goal:** Prove agencies will pay for multi-agent management

### Phase 2: Templates & Marketplace (3 weeks)
- 10+ agent templates
- Skill marketplace (install skills per agent)
- White-label setup
- Client billing (agencies charge their clients through us)
- **Goal:** 100 paying users

### Phase 3: Scale (Ongoing)
- Multi-region (Mumbai, Singapore, US-East)
- Agent analytics dashboard
- Mobile app for monitoring
- API for programmatic agent management
- Community template submissions
- **Goal:** ₹1M MRR

---

## Tech Stack (Revised)

### Frontend (fireclaw.ai)
- Next.js 16 + TypeScript
- Tailwind CSS + shadcn/ui
- Stripe + Razorpay for payments
- authjs for authentication 

### Backend (Provisioning Engine)
- Node.js API
- **Docker + Docker Compose** (not bare EC2 per agent)
- AWS SDK v3 (EC2 for host servers, not per agent)
- MongoDB Atlas (user data, agent registry)
- Bull/BullMQ (provisioning queue)

### Agent Infrastructure
- **Shared host servers** running Docker
- Each agent = isolated Docker container with OpenClaw
- Caddy reverse proxy (routing subdomains to containers)
- Automated health checks + restart
- Central logging (agent metrics → dashboard)

### Why Docker Over Bare EC2
| Approach | Cost for 10 agents | Management |
|----------|-------------------|------------|
| 10x t3.micro | ~$106/mo | 10 servers to manage |
| 1x t3.xlarge + Docker | ~$125/mo | 1 server, 10 containers |
| 2x t3.large + Docker | ~$132/mo | 2 servers, 5 containers each (HA) |

Docker is similar cost but dramatically simpler to manage and scale.

---

## Key Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Hostinger drops price or adds multi-agent | Move fast, build community moat |
| OpenClaw changes licensing | We contribute upstream, stay aligned |
| Low margins on Personal plan | Personal is acquisition funnel → upsell to Business/Agency |
| Container density limits | Auto-scale to new host servers |
| India market slow to adopt | Parallel global launch at USD pricing |

---

## Key Metrics

- **Agents deployed** — total across all users
- **Agents per user** — avg (target: 2.5+)
- **MRR** — monthly recurring revenue
- **Provisioning time** — target: <60 seconds
- **Uptime per agent** — target: 99.5%+
- **Churn** — target: <5%/month
- **CAC** — cost to acquire (target: <₹500)
- **LTV** — lifetime value (target: >₹15,000)

---

## Multi-Provider API Key + Live Model Selection

### Overview
Two places users configure AI providers with the same flow:
1. **FireClaw Deployment Wizard** — during onboarding (Next.js app)
2. **OpenClaw Dashboard** — topbar key icon popover (Lit UI)

### Flow
1. User opens provider panel → sees list of supported providers worldwide
2. User selects a provider → enters their API key
3. System **fetches live models** from the provider API using that key
4. Models displayed with auto-select on the latest/best model
5. User confirms → key + selected model saved to OpenClaw config
6. Gateway restarts → agent uses the new model

### Supported Providers (Worldwide)
| Provider | Config Key | Models API | API Key Prefix |
|----------|-----------|------------|----------------|
| OpenAI | openai | GET /v1/models | sk- |
| Anthropic | anthropic | GET /v1/models | sk-ant- |
| Google Gemini | google | GET /v1beta/models | AI... |
| Groq | groq | GET /openai/v1/models | gsk_ |
| Mistral | mistral | GET /v1/models | — |
| OpenRouter | openrouter | GET /api/v1/models | sk-or- |
| DeepSeek | deepseek | GET /models | sk- |
| Together AI | together | GET /v1/models | — |
| Fireworks AI | fireworks | GET /inference/v1/models | — |
| Perplexity | perplexity | GET /models | pplx- |
| Cohere | cohere | GET /v2/models | — |
| xAI (Grok) | xai | GET /v1/models | xai- |
| MiniMax | minimax | GET /v1/models | — |
| Cerebras | cerebras | GET /v1/models | csk- |
| SambaNova | sambanova | GET /v1/models | — |
| Qwen (DashScope) | qwen | GET /compatible-mode/v1/models | sk- |

### Suggestion Banner
Show a recommendation: "Try MiniMax — powerful models at affordable pricing" (shown when no key is configured).

### Config Patch Format
```json
{
  "models": {
    "providers": {
      "<provider>": {
        "apiKey": "<key>",
        "api": "openai-completions"
      }
    }
  },
  "agents": {
    "defaults": {
      "model": "<provider>/<model-id>"
    }
  }
}
```

### Live Model Fetching
- Client-side fetch to provider APIs (most support CORS or use OpenAI-compatible endpoints)
- Fallback: proxy through OpenClaw gateway if CORS blocked
- Parse response → display model list → auto-select latest
- Show model metadata: name, context window, pricing tier

---

## Infrastructure Roadmap

### Phase A: Shared VPS Multi-Tenancy (Cost Optimisation)

**Problem:** Current architecture creates one Hetzner VPS per agent (€3.79/agent on CX21).
Starter plan at $7/agent barely covers infra cost. Margins are too thin.

**Solution:** Shared VPS — pack 3 agents onto one CX32.

#### Architecture

```
CX32 host (4 vCPU, 8GB, €9.29/mo)  ← "cluster server"
├── nginx (port 443) — routes by subdomain
├── agent-abc123  (openclaw container, port 18789, 2GB RAM limit)
├── agent-def456  (openclaw container, port 18790, 2GB RAM limit)
└── agent-ghi789  (openclaw container, port 18791, 2GB RAM limit)
```

Each agent gets subdomain: `{agent-id}.agents.fireclaw.app` → nginx → `localhost:1878N`

#### Cost comparison

| Model | Server | Cost/agent |
|-------|--------|-----------|
| Current (dedicated) | CX21 per agent | €3.79 |
| Shared Starter | 3 agents / CX32 | €3.10 |
| Shared Growth | 5 agents / CX42 | €2.90 |

#### DB changes needed

New `hosts` collection:
```ts
{
  _id: ObjectId,
  serverId: number,        // Hetzner server ID
  serverIp: string,
  tier: "shared" | "dedicated",
  maxSlots: number,        // 3 for CX32, 5 for CX42
  usedSlots: number,
  region: string,
  status: "active" | "draining" | "decommissioned"
}
```

`provision.ts` logic:
1. If plan === "starter" → find host with `usedSlots < maxSlots` in same region
2. If none found → create new CX32, add to `hosts`, set `maxSlots: 3`
3. Run docker container on host at next available port (18789 + usedSlots)
4. Increment `usedSlots`
5. If plan === "growth"+ → create dedicated CX21 as before

#### Plan tiers

| Plan | Infrastructure |
|------|---------------|
| Starter ($7/agent) | Shared CX32, 2GB RAM cap, 3 agents/server |
| Growth ($21 for 3) | Dedicated CX21 per agent |
| Agency ($70 for 10) | Dedicated CX32 per agent |

---

### Phase B: Fireclaw Platform on Hetzner (No Cold Starts)

**Problem:** Vercel cold starts (~500ms) hurt interactive dashboard. Vercel Pro + functions can spike to $100+/mo at scale. `maxDuration=800` is expensive on Vercel.

**Solution:** Self-host Fireclaw platform on Hetzner using Coolify.

#### Architecture

```
Hetzner CX42 (8 vCPU / 16GB / €29/mo)   ← "platform server"
├── Coolify (open-source PaaS, free)
│   ├── fireclaw-web  (Next.js, PM2, always-on)
│   ├── mongodb       (replica, backups to R2)
│   └── caddy         (SSL termination, routing)
└── GitHub webhook → Coolify → zero-downtime deploy
```

#### Benefits vs Vercel

| | Vercel | Hetzner + Coolify |
|---|---|---|
| Monthly cost | $20+ (spikes) | €29 fixed |
| Cold starts | 200–800ms | None (PM2 always-on) |
| Long-running functions | $$ (maxDuration) | Free (it's just Node) |
| Deploy | Push to main | Push to main (same) |
| SSL | Automatic | Automatic (Caddy) |
| Logs | Vercel dashboard | Coolify dashboard |

#### Migration steps
1. Provision CX42 in Frankfurt (same region as agent VPSes)
2. Install Coolify: `curl -fsSL https://get.coolify.io | bash`
3. Add GitHub repo → Coolify auto-detects Next.js
4. Set all `.env.local` vars in Coolify environment panel
5. Add DNS A record: `fireclaw.ai → CX42 IP`
6. Test → cut over → remove Vercel project

#### Storage
- MongoDB on the same CX42 (with daily dumps to Cloudflare R2)
- Agent media/files → Cloudflare R2 (free egress, S3-compatible)

---

### Phase C: OpenClaw Upstream PR — Multi-Provider API Key

**Status:** Draft PR openclaw/openclaw#83570 — CLOSED pending fixes.

**Fixes needed before re-opening:**

1. `api` type mapping — most providers (Groq, Mistral, Together, etc.) use the `/v1/chat/completions` endpoint which maps to `openai-completions`, NOT `openai-responses`. Only actual OpenAI should use `openai-responses`. Anthropic stays `anthropic-messages`.

2. Verify Google Gemini — needs `google-vertex` or `openai-completions` depending on endpoint used.

3. End-to-end test on a live OpenClaw instance before re-opening.

**Correct `api` mapping:**
```
openai       → openai-responses      (Responses API)
anthropic    → anthropic-messages
google       → openai-completions    (Gemini OpenAI-compat endpoint)
groq         → openai-completions
mistral      → openai-completions
openrouter   → openai-completions
deepseek     → openai-completions
together     → openai-completions
fireworks    → openai-completions
perplexity   → openai-completions
xai          → openai-completions
minimax      → openai-completions
qwen         → openai-completions
cohere       → openai-completions
voyage       → openai-completions    (embeddings only)
replicate    → openai-completions
```

---

### Phase D: MCP Server + CLI

#### MCP Server (`app/api/mcp/route.ts`)
Lets Claude Desktop, Cursor, and any MCP client manage Fireclaw agents programmatically.

Tools to expose:
- `deploy_agent(template, plan, name)` → starts provisioning, returns agent ID
- `list_agents()` → all agents for authenticated user
- `get_agent_status(id)` → status, logs, domain
- `update_agent_prompt(id, prompt)` → live system prompt push
- `delete_agent(id)` → destroys VPS and removes DB record

Auth: Bearer token from user profile API keys table.

#### CLI (`packages/cli/`)
npm package `fireclaw-cli` for paid users.

```bash
npx fireclaw login           # OAuth → stores API key in ~/.fireclaw
npx fireclaw deploy          # interactive: pick template → name → plan → deploy
npx fireclaw list            # table of all agents + status
npx fireclaw logs <id>       # stream provision + runtime logs
npx fireclaw ssh <id>        # proxy SSH to agent VPS (Growth+ plan)
npx fireclaw delete <id>     # destroy agent
```

DB addition needed: `api_keys` collection per user (hashed, last-used timestamp).
