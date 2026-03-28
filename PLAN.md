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
