# FireClaw Deployment Scripts

Helper scripts for deploying and managing FireClaw on Hetzner Cloud.

## Scripts

### 1. `deploy-hetzner.sh`
**Main deployment script** - Sets up the entire server from scratch.

```bash
sudo ./scripts/deploy-hetzner.sh
```

**What it does:**
- Updates system packages
- Installs Docker & Docker Compose
- Installs additional tools (git, curl, nano, ufw, fail2ban)
- Configures firewall
- Generates random passwords
- Builds and starts Docker containers

### 2. `setup-ssl.sh`
**SSL certificate setup** - Gets Let's Encrypt SSL certificate.

```bash
./scripts/setup-ssl.sh
```

**What it does:**
- Prompts for domain and email
- Gets SSL certificate from Let's Encrypt
- Updates nginx configuration
- Restarts nginx with HTTPS

### 3. `backup-database.sh`
**Database backup** - Creates MongoDB backup.

```bash
./scripts/backup-database.sh
```

**What it does:**
- Creates timestamped MongoDB backup
- Compresses backup
- Stores in `/opt/backups/`
- Automatically cleans old backups (keeps last 7 days)

**Setup automated daily backups:**

```bash
# Add to crontab
crontab -e

# Add this line (runs daily at 2 AM)
0 2 * * * cd /opt/fireclaw && ./scripts/backup-database.sh >> /var/log/fireclaw-backup.log 2>&1
```

### 4. `health-check.sh`
**System health check** - Verifies all services are running.

```bash
./scripts/health-check.sh
```

**What it checks:**
- Docker containers status
- MongoDB connection
- Disk space usage
- Memory usage
- HTTP/HTTPS response
- Resource usage

**Setup automated monitoring:**

```bash
# Add to crontab
crontab -e

# Add this line (runs every 15 minutes)
*/15 * * * * cd /opt/fireclaw && ./scripts/health-check.sh >> /var/log/fireclaw-health.log 2>&1
```

## Quick Start

1. **Fresh server setup:**
   ```bash
   sudo ./scripts/deploy-hetzner.sh
   ```

2. **Edit environment variables:**
   ```bash
   nano .env
   ```

3. **Restart services:**
   ```bash
   docker compose down
   docker compose up -d
   ```

4. **Setup SSL:**
   ```bash
   ./scripts/setup-ssl.sh
   ```

5. **Verify everything works:**
   ```bash
   ./scripts/health-check.sh
   ```

## Troubleshooting

### Make scripts executable

If you get "Permission denied" error:

```bash
chmod +x scripts/*.sh
```

### View logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f fireclaw
```

### Restart services

```bash
docker compose restart
```

### Rebuild from scratch

```bash
docker compose down -v
docker compose up -d --build
```

## Security Notes

1. Always edit `.env` file before first run
2. Change default MongoDB password
3. Use strong NEXTAUTH_SECRET
4. Keep system updated: `apt update && apt upgrade -y`
5. Monitor logs regularly
6. Setup automated backups

## Support

See [DEPLOY.md](../DEPLOY.md) for detailed deployment guide.
