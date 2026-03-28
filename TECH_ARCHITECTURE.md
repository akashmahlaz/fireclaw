# FireClaw — Technical Architecture

## System Overview

```
┌───────────────────────────────────────────────────────┐
│                  fireclaw.ai (Vercel)                  │
│                                                       │
│  ┌─────────┐  ┌──────────┐  ┌───────────┐           │
│  │ Landing  │  │Dashboard │  │  Admin    │           │
│  │  Page    │  │(per user)│  │  Panel    │           │
│  └─────────┘  └──────────┘  └───────────┘           │
│                                                       │
│  ┌─────────────────────────────────────────────┐     │
│  │              API Routes                       │     │
│  │  /api/deploy    — provision new instance      │     │
│  │  /api/instances — list/manage instances        │     │
│  │  /api/billing   — Stripe webhooks             │     │
│  │  /api/health    — instance health monitoring   │     │
│  │  /api/whatsapp  — QR code proxy               │     │
│  └─────────────────────────────────────────────┘     │
└───────────────────────┬───────────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────────┐
│              Provisioning Engine                       │
│                                                       │
│  AWS SDK v3:                                          │
│  - EC2: RunInstances (from pre-baked AMI)             │
│  - EC2: AllocateAddress (Elastic IP)                  │
│  - EC2: AssociateAddress                              │
│  - Route53/Cloudflare: Create DNS record              │
│  - SSM: Run setup commands (or SSH)                   │
│                                                       │
│  Job Queue (BullMQ + Redis):                          │
│  - PROVISION_INSTANCE                                 │
│  - CONFIGURE_OPENCLAW                                 │
│  - SETUP_DNS                                          │
│  - HEALTH_CHECK                                       │
│  - TERMINATE_INSTANCE                                 │
└───────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
│Instance │  │Instance │  │Instance │  │Instance │
│  001    │  │  002    │  │  003    │  │  ...    │
│         │  │         │  │         │  │         │
│Ubuntu   │  │Ubuntu   │  │Ubuntu   │  │Ubuntu   │
│Node.js  │  │Node.js  │  │Node.js  │  │Node.js  │
│OpenClaw │  │OpenClaw │  │OpenClaw │  │OpenClaw │
│Caddy    │  │Caddy    │  │Caddy    │  │Caddy    │
│Chromium │  │Chromium │  │Chromium │  │Chromium │
└─────────┘  └─────────┘  └─────────┘  └─────────┘
```

---

## Database Schema (MongoDB)

### users
```json
{
  "_id": "ObjectId",
  "email": "user@example.com",
  "name": "John Doe",
  "passwordHash": "...",
  "plan": "starter|pro|agency",
  "stripeCustomerId": "cus_xxx",
  "stripeSubscriptionId": "sub_xxx",
  "maxInstances": 1,
  "createdAt": "Date",
  "lastLoginAt": "Date"
}
```

### instances
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "name": "My AI Assistant",
  "status": "provisioning|starting|ready|error|stopped|terminated",
  "ec2InstanceId": "i-0abc123",
  "ec2InstanceType": "t3.medium",
  "elasticIp": "43.204.239.201",
  "region": "ap-south-1",
  "domain": "myagent.fireclaw.ai",
  "gatewayToken": "random-secure-token",
  "dashboardUrl": "https://myagent.fireclaw.ai",
  "openclawVersion": "2026.3.24",
  "aiProvider": "openai|anthropic|github-copilot",
  "aiModel": "gpt-5.4",
  "whatsappLinked": false,
  "whatsappNumber": "+1234567890",
  "healthStatus": "healthy|unhealthy|unknown",
  "lastHealthCheck": "Date",
  "monthlyDataTransferMb": 0,
  "createdAt": "Date",
  "startedAt": "Date",
  "stoppedAt": "Date"
}
```

### billing_events
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "type": "subscription_created|payment_succeeded|payment_failed|subscription_cancelled",
  "stripeEventId": "evt_xxx",
  "amount": 2900,
  "currency": "usd",
  "createdAt": "Date"
}
```

---

## Provisioning Flow (Detailed)

### Step 1: User Triggers Deploy
```
POST /api/deploy
Body: {
  "name": "My Assistant",
  "region": "ap-south-1",
  "plan": "starter",
  "aiProvider": "openai",
  "aiApiKey": "sk-xxx"  // encrypted in transit
}
```

### Step 2: Backend Validates & Queues
```javascript
// Check user has active subscription
// Check instance limit not exceeded
// Encrypt the API key
// Add to provisioning queue
await queue.add('PROVISION_INSTANCE', {
  userId, name, region, plan, encryptedApiKey
})
// Return jobId for status polling
```

### Step 3: Provisioning Worker Runs
```javascript
async function provisionInstance(job) {
  const { userId, name, region, plan } = job.data
  
  // 1. Launch EC2 from pre-baked AMI
  const instance = await ec2.runInstances({
    ImageId: AMI_IDS[region],  // pre-baked FireClaw AMI
    InstanceType: PLAN_TYPES[plan],
    KeyName: 'fireclaw-master',
    SecurityGroupIds: [SG_ID],
    UserData: Buffer.from(generateUserDataScript(job.data)).toString('base64'),
    TagSpecifications: [{
      ResourceType: 'instance',
      Tags: [
        { Key: 'Name', Value: `fireclaw-${userId}` },
        { Key: 'FireClawUserId', Value: userId },
      ]
    }]
  })
  
  // 2. Allocate Elastic IP
  const eip = await ec2.allocateAddress({ Domain: 'vpc' })
  await ec2.associateAddress({
    InstanceId: instance.InstanceId,
    AllocationId: eip.AllocationId
  })
  
  // 3. Create DNS record
  await cloudflare.createDNSRecord({
    type: 'A',
    name: `${slug}.fireclaw.ai`,
    content: eip.PublicIp
  })
  
  // 4. Wait for healthy
  await waitForHealthy(`https://${slug}.fireclaw.ai/api/health`)
  
  // 5. Update database
  await db.instances.updateOne({ _id: instanceId }, {
    status: 'ready',
    dashboardUrl: `https://${slug}.fireclaw.ai`
  })
}
```

### Step 4: User-Data Script (runs on EC2 boot)
```bash
#!/bin/bash
set -e

# Config is injected by provisioning engine
GATEWAY_TOKEN="{{GATEWAY_TOKEN}}"
AI_PROVIDER="{{AI_PROVIDER}}"
AI_API_KEY="{{AI_API_KEY}}"
DOMAIN="{{DOMAIN}}"

# OpenClaw is already installed (pre-baked AMI)
# Just write the config
mkdir -p /home/ubuntu/.openclaw/credentials

cat > /home/ubuntu/.openclaw/openclaw.json << EOF
{
  "gateway": {
    "port": 18789,
    "mode": "local",
    "bind": "loopback",
    "auth": { "mode": "token", "token": "${GATEWAY_TOKEN}" },
    "trustedProxies": ["127.0.0.1/32"],
    "controlUi": {
      "allowedOrigins": ["https://${DOMAIN}"],
      "dangerouslyDisableDeviceAuth": true
    }
  },
  "agents": {
    "defaults": {
      "model": { "primary": "${AI_PROVIDER}/gpt-5.4" },
      "workspace": "/home/ubuntu/.openclaw/workspace"
    }
  },
  "channels": {
    "whatsapp": {
      "enabled": true,
      "dmPolicy": "open",
      "allowFrom": ["*"]
    }
  }
}
EOF

# Configure Caddy for HTTPS
cat > /etc/caddy/Caddyfile << EOF
${DOMAIN} {
    reverse_proxy 127.0.0.1:18789 {
        header_up Host {host}
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_host}
        header_up X-Forwarded-Proto {scheme}
    }
}
EOF

systemctl restart caddy

# Start OpenClaw
sudo -u ubuntu openclaw daemon install
sudo -u ubuntu openclaw daemon start

# Self-pair CLI
sleep 3
(sleep 2 && sudo -u ubuntu openclaw devices approve --latest) &
sudo -u ubuntu openclaw gateway probe || true
```

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/signup` | POST | Create account |
| `/api/auth/login` | POST | Login |
| `/api/deploy` | POST | Deploy new instance |
| `/api/instances` | GET | List user's instances |
| `/api/instances/[id]` | GET | Instance details |
| `/api/instances/[id]/stop` | POST | Stop instance |
| `/api/instances/[id]/start` | POST | Start instance |
| `/api/instances/[id]/terminate` | POST | Delete instance |
| `/api/instances/[id]/health` | GET | Health check |
| `/api/instances/[id]/logs` | GET | Recent logs |
| `/api/instances/[id]/whatsapp-qr` | GET | Get QR code for WhatsApp linking |
| `/api/billing/checkout` | POST | Create Stripe checkout |
| `/api/billing/webhook` | POST | Stripe webhook |
| `/api/billing/portal` | GET | Stripe customer portal |
| `/api/admin/instances` | GET | All instances (admin) |
| `/api/admin/metrics` | GET | Platform metrics |

---

## Security Considerations

1. **AI API keys** — encrypted at rest, never stored in plaintext
2. **Instance isolation** — each client gets their own EC2, no shared infra
3. **Gateway tokens** — unique per instance, rotatable
4. **SSH keys** — master key for provisioning only, removed after setup
5. **HTTPS everywhere** — Caddy auto-TLS
6. **No raw IP access** — only via subdomain with HTTPS
7. **Rate limiting** — on all API endpoints
8. **Billing enforcement** — stop instance if payment fails
