#!/bin/bash
# FireClaw Quick Deploy Script for Hetzner

set -e

echo "🔥 FireClaw Deployment Script"
echo "=============================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo -e "${RED}Please run as root (use sudo)${NC}"
  exit 1
fi

echo -e "${GREEN}✓${NC} Running as root"

# Update system
echo ""
echo "Updating system packages..."
apt update && apt upgrade -y
echo -e "${GREEN}✓${NC} System updated"

# Install Docker
echo ""
echo "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    echo -e "${GREEN}✓${NC} Docker installed"
else
    echo -e "${YELLOW}!${NC} Docker already installed"
fi

# Install Docker Compose
echo ""
echo "Installing Docker Compose..."
if ! docker compose version &> /dev/null; then
    apt install -y docker-compose-plugin
    echo -e "${GREEN}✓${NC} Docker Compose installed"
else
    echo -e "${YELLOW}!${NC} Docker Compose already installed"
fi

# Install additional tools
echo ""
echo "Installing additional tools..."
apt install -y git curl wget nano ufw fail2ban
echo -e "${GREEN}✓${NC} Tools installed"

# Setup firewall
echo ""
echo "Setting up firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
echo -e "${GREEN}✓${NC} Firewall configured"

# Setup fail2ban
echo ""
echo "Configuring fail2ban..."
systemctl enable fail2ban
systemctl start fail2ban
echo -e "${GREEN}✓${NC} Fail2ban enabled"

# Create .env file if doesn't exist
echo ""
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    
    # Generate random passwords
    MONGO_PASSWORD=$(openssl rand -base64 32)
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    
    # Update .env with generated values
    sed -i "s|CHANGE_THIS_PASSWORD|$MONGO_PASSWORD|g" .env
    sed -i "s|generate_random_secret_here_min_32_chars|$NEXTAUTH_SECRET|g" .env
    
    echo -e "${GREEN}✓${NC} .env file created with random passwords"
    echo ""
    echo -e "${YELLOW}⚠ IMPORTANT:${NC} Edit .env file and add your API keys:"
    echo "  - NEXTAUTH_URL"
    echo "  - AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET"
    echo "  - RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET"
    echo "  - RESEND_API_KEY"
    echo "  - HETZNER_API_TOKEN"
    echo ""
    echo "Run: nano .env"
    echo ""
else
    echo -e "${YELLOW}!${NC} .env file already exists"
fi

# Build and start services
echo ""
echo "Building and starting Docker containers..."
docker compose up -d --build

echo ""
echo -e "${GREEN}✓${NC} Docker containers started"

# Wait for services to be healthy
echo ""
echo "Waiting for services to be ready..."
sleep 10

# Check container status
echo ""
echo "Container Status:"
docker compose ps

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Edit .env file: nano .env"
echo "2. Update nginx/nginx.conf with your domain"
echo "3. Get SSL certificate: ./scripts/setup-ssl.sh"
echo "4. Check logs: docker compose logs -f"
echo ""
echo "Your app should be accessible at:"
echo "  - http://YOUR_SERVER_IP"
echo ""
echo "For SSL setup, see DEPLOY.md"
echo ""
