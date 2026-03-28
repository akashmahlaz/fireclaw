# 🔥 FireClaw — The Plan

## What Is FireClaw?

**One-click deploy your personal AI assistant.**

FireClaw is a managed platform that lets anyone deploy their own OpenClaw AI agent in under 2 minutes. WhatsApp-first, always-on, fully isolated.

Think: **Hostinger for AI agents.**

---

## The Pitch (30 seconds)

> "Want an AI assistant on WhatsApp that remembers everything, runs 24/7, and is 100% yours? Click deploy, scan a QR code, and it's live. $29/month."

---

## How It Works (User Flow)

```
1. User visits fireclaw.ai
2. Signs up (email or Google)
3. Clicks "Deploy New Agent"
4. Picks a plan (Starter $29 / Pro $79 / Agency $149)
5. Enters: Agent name, WhatsApp number
6. Pays (Stripe/Razorpay)
7. We auto-provision an EC2 instance in ~90 seconds
8. User gets a dashboard URL + QR code
9. Scans QR → WhatsApp connected
10. Done. AI agent is live.
```

---

## Revenue Model

| Plan | Server | Our Cost | Price | Margin |
|------|--------|----------|-------|--------|
| Starter | t3.micro (1 vCPU, 1GB) | ~$8/mo | $29/mo | 72% |
| Pro | t3.medium (2 vCPU, 4GB) | ~$33/mo | $79/mo | 58% |
| Agency | t3.large (2 vCPU, 8GB) | ~$65/mo | $149/mo | 56% |

**AI costs:** Users bring their own API key (OpenAI/Anthropic/GitHub Copilot) — or we offer a bundled plan with usage-based AI ($0.01/message).

**100 clients on Starter = $2,900/mo revenue, $2,100 gross profit.**

---

## Target Customers

### Phase 1 — Founders & Solopreneurs
- Want a personal AI assistant on WhatsApp
- Don't know how to self-host
- Will pay $29-79/mo for convenience

### Phase 2 — Agencies & SMBs
- Want AI agents for each client
- Customer support bots, lead gen bots
- Deploy + manage multiple agents from one dashboard

### Phase 3 — Enterprises
- Dedicated instances, SLAs
- Custom domains, branding
- White-label option

---

## Competitive Landscape

| Competitor | What They Do | Gap |
|-----------|--------------|-----|
| Hostinger | 1-click WordPress hosting | No AI agents |
| Railway/Render | Deploy any app | Not AI-specific, complex |
| DigitalOcean App Platform | 1-click apps | No OpenClaw, no WhatsApp |
| Twilio | Communication APIs | Build-it-yourself |
| OpenClaw (self-hosted) | The AI agent itself | Requires technical setup |

**FireClaw's wedge:** We make OpenClaw deployment as easy as creating a Gmail account.

---

## Phases

### Phase 1: MVP (2-3 weeks)
- Landing page with waitlist + early access
- Manual-ish provisioning (automated script, human review)
- 10-20 beta users
- Prove willingness to pay

### Phase 2: Full Automation (2-3 weeks)
- Auto-provisioning API (EC2 + setup script + DNS)
- Self-service dashboard (deploy, manage, monitor)
- Stripe billing integration
- WhatsApp QR linking in dashboard

### Phase 3: Scale (ongoing)
- Multi-region (Mumbai, Singapore, US-East, EU)
- Agent templates (job apply bot, support bot, research bot)
- White-label for agencies
- Mobile app for managing agents
- Marketplace for skills/plugins

---

## Tech Stack

### Frontend (fireclaw.ai)
- Next.js 16 + TypeScript
- Tailwind CSS + shadcn/ui
- Stripe for payments
- Better-Auth for authentication

### Backend (Provisioning Engine)
- Node.js API routes
- AWS SDK v3 (EC2, Route53, IAM)
- MongoDB (user data, instance tracking)
- Bull/BullMQ (job queue for provisioning)

### Per-Client Instance
- Ubuntu 22.04 on EC2
- Node.js 22 + OpenClaw (npm)
- Caddy (reverse proxy + auto HTTPS)
- Systemd (auto-restart)

### Infrastructure
- AWS EC2 (client instances)
- Vercel (fireclaw.ai dashboard)
- MongoDB Atlas (SaaS database)
- Cloudflare or Route53 (DNS + subdomains)
- Stripe (billing)

---

## Key Metrics to Track

- **Provisioning time** — target: <90 seconds
- **Uptime per instance** — target: 99.5%+
- **MRR** — monthly recurring revenue
- **Churn** — % users who cancel per month
- **CAC** — cost to acquire one customer
- **LTV** — lifetime value per customer
