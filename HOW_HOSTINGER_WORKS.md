# How Hostinger (and Similar Platforms) Work

## The 1-Click Deploy Model

### What Happens When You Click "Install WordPress" on Hostinger

```
User clicks "Install WordPress"
       ↓
Frontend sends POST /api/install { app: "wordpress", domain: "user.com" }
       ↓
Backend creates a job in the provisioning queue
       ↓
Provisioning worker:
  1. Allocates server resources (LXC container or VM)
  2. Runs a pre-built setup script:
     - Install LAMP stack (Apache, MySQL, PHP)
     - Download WordPress
     - Create database + user
     - Configure wp-config.php
     - Set file permissions
  3. Configures DNS (A record → server IP)
  4. Issues SSL certificate (Let's Encrypt via Caddy/Certbot)
  5. Marks instance as "ready" in database
       ↓
Frontend polls status → shows "Your site is ready!" + login URL
       ↓
Total time: 60-120 seconds
```

### Key Technical Concepts

#### 1. Machine Images (AMIs / Templates)
Hostinger doesn't install everything from scratch every time. They use **pre-baked images**:
- A base Ubuntu image with Node.js, Caddy, OpenClaw already installed
- When deploying, they just launch this image and inject client-specific config
- This cuts provisioning from 15 min → 60 seconds

**For FireClaw:**
- Create a custom AWS AMI with Ubuntu 22.04 + Node.js 22 + OpenClaw + Caddy pre-installed
- On deploy, just launch from this AMI + inject client's config via user-data script
- Expected time: ~60-90 seconds

#### 2. User Data Scripts (Cloud-Init)
AWS EC2 supports "user data" — a bash script that runs on first boot:
```bash
#!/bin/bash
# This runs automatically when the instance starts
echo '{"gateway":{"auth":{"token":"CLIENT_TOKEN"}}}' > /root/.openclaw/openclaw.json
openclaw daemon start
```

#### 3. DNS Automation
Two approaches:
- **Wildcard DNS:** `*.fireclaw.ai` → load balancer → routes to correct instance
- **Per-client subdomain:** `client123.fireclaw.ai` → their specific IP

Best approach for FireClaw:
- Use **sslip.io** for MVP (free, instant, no DNS needed)
- Upgrade to **Cloudflare API** for production (auto-create subdomain records)

#### 4. SSL/HTTPS Automation
- **Caddy** handles this automatically — just point a domain at the server
- Let's Encrypt issues cert in seconds
- Auto-renews every 90 days
- Zero manual intervention

#### 5. Health Monitoring
Hostinger monitors every instance:
- HTTP health checks every 60 seconds
- Auto-restart if process crashes (systemd)
- Alert if instance is unreachable
- Auto-scale if CPU/memory exceeds threshold

**For FireClaw:**
- OpenClaw already has systemd service (auto-restart on crash)
- Add a health endpoint: `GET /api/health` → 200 OK
- Monitor from dashboard: show green/red status per client
- Bonus: webhook alerts to your Telegram when instance goes down

---

## How DigitalOcean 1-Click Apps Work

Same concept, slightly different:
1. They create "Droplet images" (pre-configured VMs)
2. User picks an image (e.g., "Docker on Ubuntu")
3. DO launches a droplet from that image
4. Runs a setup script that configures the specific app
5. User gets IP + SSH access

**Key difference from Hostinger:** DO gives raw VMs, Hostinger gives managed hosting. FireClaw should be like Hostinger — fully managed, user never touches a terminal.

---

## How Railway/Render Work

Different model — container-based:
1. User connects GitHub repo
2. Platform builds a Docker container
3. Deploys to shared infrastructure
4. Auto-scales based on traffic

**Why this won't work for FireClaw:**
- OpenClaw needs persistent state (WhatsApp sessions, memory files)
- Each instance needs its own IP for WhatsApp Web
- Container restarts would break WhatsApp sessions
- VMs (EC2) are more reliable for long-running stateful services

---

## FireClaw's Architecture (Based on Best Practices)

```
┌─────────────────────────────────────┐
│         fireclaw.ai (Vercel)        │
│    Next.js Dashboard + Landing      │
│    Stripe Billing + Auth            │
└──────────────┬──────────────────────┘
               │ API calls
               ▼
┌─────────────────────────────────────┐
│      Provisioning Engine (API)      │
│  - AWS SDK → Launch EC2 from AMI    │
│  - Inject client config             │
│  - Configure DNS (Cloudflare)       │
│  - Monitor health                   │
│  - Manage lifecycle (start/stop)    │
└──────────────┬──────────────────────┘
               │ Manages
               ▼
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│Client│ │Client│ │Client│ │Client│  ← Each is an isolated EC2
│  A   │ │  B   │ │  C   │ │  D   │
│      │ │      │ │      │ │      │
│Open- │ │Open- │ │Open- │ │Open- │
│Claw  │ │Claw  │ │Claw  │ │Claw  │
└──────┘ └──────┘ └──────┘ └──────┘
```

---

## The Secret Sauce: Pre-Baked AMI

**This is the single most important optimization.**

Instead of installing everything on every deploy (15+ min), you:
1. Create ONE EC2 instance manually
2. Install everything: Node.js, OpenClaw, Caddy, Chromium
3. Save it as a custom AMI (Amazon Machine Image)
4. Every new deploy just launches from this AMI (~30 sec)

```bash
# One-time: Create the golden AMI
aws ec2 create-image \
  --instance-id i-0524a90e2d5baa05b \
  --name "fireclaw-base-v1" \
  --description "Ubuntu 22.04 + Node 22 + OpenClaw + Caddy"
```

Then every deploy:
```bash
# Launch from pre-baked image (fast!)
aws ec2 run-instances \
  --image-id ami-FIRECLAW-BASE \
  --instance-type t3.medium \
  --user-data file://setup-client.sh
```

**Your existing AWS instance (43.204.239.201) can be the base for this AMI!**
