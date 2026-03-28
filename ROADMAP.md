# FireClaw — MVP Roadmap

## Phase 1: Landing Page + Waitlist (Week 1)

### Goal: Start collecting leads before building

- [ ] Landing page at fireclaw.ai
  - Hero: "Deploy Your AI Assistant in 60 Seconds"
  - Demo video/GIF showing the deploy flow
  - Pricing section (Starter $29 / Pro $79 / Agency $149)
  - "Join Waitlist" CTA → collects email
  - FAQ section
- [ ] Set up domain: fireclaw.ai
- [ ] Deploy landing page to Vercel
- [ ] Set up email collection (MongoDB or Mailchimp)
- [ ] Share on Twitter/LinkedIn/ProductHunt upcoming

### Deliverables:
- Live landing page
- Email list growing

---

## Phase 2: Core Platform (Week 2-3)

### Goal: Users can sign up, pay, and see a dashboard

- [ ] Auth system (Better Auth — email + Google)
- [ ] Stripe integration
  - Checkout flow
  - Subscription management
  - Webhook handlers (payment success/failure)
- [ ] User dashboard
  - "Deploy New Agent" button
  - List of instances (name, status, domain, health)
  - Instance detail page (logs, WhatsApp status, restart button)
- [ ] MongoDB schemas (users, instances, billing)

### Deliverables:
- Users can sign up and pay
- Dashboard shows (empty) instance list

---

## Phase 3: Provisioning Engine (Week 3-4)

### Goal: Click "Deploy" → real OpenClaw instance in 90 seconds

- [ ] Create pre-baked AMI from existing AWS instance
- [ ] Build provisioning API
  - Launch EC2 from AMI
  - Allocate Elastic IP
  - Generate unique gateway token
  - Inject client config via user-data script
  - Configure DNS (sslip.io for MVP, Cloudflare later)
  - Poll for health → mark as ready
- [ ] Health monitoring
  - Cron job pings each instance every 60s
  - Dashboard shows green/red status
  - Auto-restart if unhealthy
- [ ] Instance lifecycle
  - Start / Stop / Terminate
  - Billing enforcement (stop on payment failure)

### Deliverables:
- Working 1-click deploy
- Instances are live and reachable

---

## Phase 4: WhatsApp Integration (Week 4-5)

### Goal: User scans QR in dashboard → WhatsApp connected

- [ ] WhatsApp QR proxy
  - Dashboard calls instance's OpenClaw API
  - Fetches QR code
  - Displays in browser
  - User scans → WhatsApp linked
- [ ] WhatsApp status display
  - Connected/Disconnected indicator
  - "Reconnect" button
  - Phone number display

### Deliverables:
- Full self-service: deploy + link WhatsApp, zero manual steps

---

## Phase 5: Polish + Launch (Week 5-6)

### Goal: Ready for public launch

- [ ] Onboarding wizard (name your agent, pick personality)
- [ ] Agent templates
  - Personal Assistant
  - Customer Support Bot
  - Job Apply Agent
  - Research Assistant
- [ ] Email notifications
  - Welcome email
  - Instance ready email
  - Payment receipt
  - Instance down alert
- [ ] Admin panel
  - All instances overview
  - Revenue metrics
  - User management
- [ ] Documentation site
- [ ] Product Hunt launch

### Deliverables:
- Public launch
- First paying customers

---

## Phase 6: Scale (Ongoing)

- [ ] Multi-region (Mumbai, Singapore, US-East, Frankfurt)
- [ ] Custom domains (user brings their own domain)
- [ ] White-label (remove FireClaw branding)
- [ ] Agent marketplace (buy/sell skills)
- [ ] Mobile app (manage agents from phone)
- [ ] Team features (multiple users per account)
- [ ] Usage analytics (messages sent, uptime, etc.)
- [ ] Auto-scaling (upgrade instance type based on usage)

---

## Tech Debt / Nice-to-Haves

- [ ] Terraform for infrastructure-as-code
- [ ] Docker containers instead of raw EC2 (for density)
- [ ] Kubernetes for orchestration at 100+ instances
- [ ] Automated backups (daily snapshot of each instance)
- [ ] Migration tool (move instance between regions)
- [ ] API for power users (deploy via CLI/API)
