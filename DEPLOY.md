# 🚀 FireClaw Deployment Guide for Hetzner Cloud

This guide will help you deploy FireClaw on Hetzner Cloud.

## Prerequisites

- Hetzner Cloud account
- Domain name (optional, for SSL)
- SSH key pair
- Basic knowledge of Linux and Docker

## 📋 What You'll Need

1. **Hetzner Cloud Server** (CX21 or higher recommended)
2. **Domain name** pointed to your server IP
3. **Environment variables** (see `.env.example`)
4. **API Keys:**
   - Google OAuth (optional)
   - Razorpay (for payments)
   - Resend (for emails)
   - Hetzner Cloud API token

---

## 🛠️ Step 1: Create a Hetzner Cloud Server

### Via Hetzner Cloud Console

1. Go to https://console.hetzner.cloud
2. Click **"New Project"** → Name it "FireClaw"
3. Click **"Add Server"**
4. Select:
   - **Location:** Choose closest to your users (e.g., Nuremberg, Helsinki)
   - **Image:** Ubuntu 22.04
   - **Type:** CX21 (2 vCPU, 4GB RAM, €5.83/mo) or higher
   - **Networking:** Enable IPv4 & IPv6
   - **SSH Key:** Add your public SSH key
   - **Firewall:** Create new firewall with rules:
     - TCP: 22 (SSH)
     - TCP: 80 (HTTP)
     - TCP: 443 (HTTPS)
5. Click **"Create & Buy"**
6. Note down the server's **IP address**

### Via Hetzner CLI (hcloud)

```bash
# Install hcloud CLI
brew install hcloud  # macOS
# or
curl -L https://github.com/hetznercloud/cli/releases/latest/download/hcloud-linux-amd64.tar.gz | tar xz

# Login
hcloud context create fireclaw

# Create SSH key
hcloud ssh-key create --name my-key --public-key-from-file ~/.ssh/id_rsa.pub

# Create firewall
hcloud firewall create --name fireclaw-fw \
  --rules-file firewall-rules.json

# Create server
hcloud server create \
  --name fireclaw-prod \
  --type cx21 \
  --image ubuntu-22.04 \
  --ssh-key my-key \
  --firewall fireclaw-fw \
  --location nbg1
```

---

## 🌐 Step 2: Point Your Domain to Hetzner Server

1. Go to your domain registrar (Namecheap, GoDaddy, Cloudflare, etc.)
2. Add an **A record**:
   - **Name:** `@` (or `fireclaw`)
   - **Type:** A
   - **Value:** Your Hetzner server IP
   - **TTL:** 3600
3. Optionally add **www** subdomain:
   - **Name:** `www`
   - **Type:** CNAME
   - **Value:** `fireclaw.yourdomain.com`

**Wait 5-30 minutes** for DNS propagation.

---

## 🔧 Step 3: Setup the Server

### SSH into your server

```bash
ssh root@YOUR_SERVER_IP
```

### Update system

```bash
apt update && apt upgrade -y
```

### Install Docker & Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose-plugin -y

# Verify installation
docker --version
docker compose version
```

### Install additional tools

```bash
apt install -y git curl wget nano ufw fail2ban
```

### Setup firewall (UFW)

```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ufw status
```

---

## 📦 Step 4: Clone and Setup FireClaw

### Clone repository

```bash
cd /opt
git clone https://github.com/yourusername/fireclaw.git
cd fireclaw
```

### Create environment file

```bash
cp .env.example .env
nano .env
```

**Edit the `.env` file with your values:**

```bash
# Database
MONGODB_URI=mongodb://admin:CHANGE_THIS_PASSWORD@mongodb:27017/fireclaw?authSource=admin

# NextAuth
NEXTAUTH_URL=https://fireclaw.yourdomain.com
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Google OAuth (get from https://console.cloud.google.com)
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret

# Razorpay (get from https://dashboard.razorpay.com)
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your_key_secret

# Resend (get from https://resend.com/api-keys)
RESEND_API_KEY=re_xxxxx

# Hetzner Cloud API (get from https://console.hetzner.cloud)
HETZNER_API_TOKEN=your_hetzner_api_token

# MongoDB Root Credentials
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=CHANGE_THIS_PASSWORD

# Port
PORT=3000
```

**Generate NEXTAUTH_SECRET:**

```bash
openssl rand -base64 32
```

---

## 🐳 Step 5: Deploy with Docker Compose

### Build and start services

```bash
docker compose up -d --build
```

### Check logs

```bash
docker compose logs -f
```

### Check status

```bash
docker compose ps
```

You should see:
- `fireclaw` - Running on port 3000
- `mongodb` - Running (internal)
- `nginx` - Running on ports 80/443
- `certbot` - Running (for SSL renewal)

---

## 🔒 Step 6: Setup SSL with Let's Encrypt

### Update nginx.conf with your domain

```bash
nano nginx/nginx.conf
```

Replace `your-domain.com` with your actual domain.

### Get SSL certificate

```bash
# Stop nginx temporarily
docker compose stop nginx

# Get certificate
docker compose run --rm certbot certonly \
  --standalone \
  --preferred-challenges http \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email \
  -d fireclaw.yourdomain.com \
  -d www.fireclaw.yourdomain.com

# Uncomment HTTPS server block in nginx.conf
nano nginx/nginx.conf
# Uncomment the HTTPS server block and comment HTTP

# Restart nginx
docker compose up -d nginx
```

### Test SSL renewal

```bash
docker compose run --rm certbot renew --dry-run
```

---

## ✅ Step 7: Verify Deployment

### Test HTTP access

```bash
curl http://YOUR_SERVER_IP
# or
curl http://fireclaw.yourdomain.com
```

### Test HTTPS access

```bash
curl https://fireclaw.yourdomain.com
```

### Check MongoDB connection

```bash
docker exec -it fireclaw-mongodb-1 mongosh -u admin -p YOUR_MONGO_PASSWORD --authenticationDatabase admin
```

### Check application logs

```bash
docker compose logs fireclaw
```

---

## 🔄 Updating the Application

### Pull latest changes

```bash
cd /opt/fireclaw
git pull origin main
```

### Rebuild and restart

```bash
docker compose down
docker compose up -d --build
```

### Zero-downtime deployment (advanced)

```bash
docker compose build fireclaw
docker compose up -d --no-deps --build fireclaw
```

---

## 📊 Monitoring & Maintenance

### View logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f fireclaw
docker compose logs -f mongodb
docker compose logs -f nginx
```

### Database backup

```bash
# Create backup directory
mkdir -p /opt/backups

# Backup script
docker exec fireclaw-mongodb-1 mongodump \
  -u admin \
  -p YOUR_MONGO_PASSWORD \
  --authenticationDatabase admin \
  --out /data/backup

# Copy to host
docker cp fireclaw-mongodb-1:/data/backup /opt/backups/backup-$(date +%Y%m%d-%H%M%S)
```

### Restore database

```bash
docker exec -i fireclaw-mongodb-1 mongorestore \
  -u admin \
  -p YOUR_MONGO_PASSWORD \
  --authenticationDatabase admin \
  /data/backup
```

### System resources

```bash
# Docker stats
docker stats

# Disk usage
df -h

# Memory usage
free -h
```

---

## 🚨 Troubleshooting

### Container won't start

```bash
docker compose logs fireclaw
docker compose logs mongodb
```

### Port already in use

```bash
# Check what's using port 80/443
sudo lsof -i :80
sudo lsof -i :443

# Stop the service
sudo systemctl stop apache2  # if Apache is running
```

### MongoDB connection issues

```bash
# Check MongoDB logs
docker compose logs mongodb

# Verify connection string in .env
cat .env | grep MONGODB_URI
```

### SSL certificate issues

```bash
# Check certbot logs
docker compose logs certbot

# Manually renew
docker compose run --rm certbot renew
```

### Out of disk space

```bash
# Clean Docker
docker system prune -a --volumes

# Clean old images
docker image prune -a
```

---

## 🔐 Security Best Practices

1. **Change default passwords** in `.env`
2. **Enable firewall** (UFW)
3. **Install fail2ban** to prevent brute-force
4. **Regular updates:**
   ```bash
   apt update && apt upgrade -y
   ```
5. **Setup automated backups**
6. **Use strong NEXTAUTH_SECRET**
7. **Enable rate limiting** (already configured in nginx)
8. **Monitor logs** regularly

---

## 📈 Performance Optimization

### Enable Redis caching (optional)

Add to `docker-compose.yml`:

```yaml
redis:
  image: redis:alpine
  restart: always
  networks:
    - fireclaw-network
```

### Increase MongoDB performance

Edit `docker-compose.yml`:

```yaml
mongodb:
  command: mongod --wiredTigerCacheSizeGB 1.5
```

### Scale horizontally

```bash
docker compose up -d --scale fireclaw=3
```

---

## 💰 Cost Estimation

| Resource | Cost (€/month) |
|----------|----------------|
| CX21 Server (2 vCPU, 4GB RAM) | €5.83 |
| IPv4 Address | Free |
| Backup Space (20GB) | €0.60 |
| **Total** | **~€6.43/month** |

For production, upgrade to **CX31** (€11.65/mo) or **CX41** (€23.31/mo).

---

## 📞 Support

- **Hetzner Docs:** https://docs.hetzner.com
- **Docker Docs:** https://docs.docker.com
- **Next.js Docs:** https://nextjs.org/docs

---

## 🎉 Done!

Your FireClaw application should now be running at:
- **HTTP:** http://fireclaw.yourdomain.com
- **HTTPS:** https://fireclaw.yourdomain.com

**Next steps:**
1. Test all features
2. Setup monitoring
3. Configure backups
4. Add custom domain
5. Invite users!
