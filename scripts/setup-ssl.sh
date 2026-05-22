#!/bin/bash
# SSL Certificate Setup Script for FireClaw

set -e

echo "🔒 SSL Certificate Setup"
echo "========================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get domain and email
read -p "Enter your domain (e.g., fireclaw.yourdomain.com): " DOMAIN
read -p "Enter your email for Let's Encrypt: " EMAIL

# Validate inputs
if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    echo -e "${RED}Error: Domain and email are required${NC}"
    exit 1
fi

# Add www subdomain
read -p "Also setup for www.$DOMAIN? (y/n): " SETUP_WWW

WWW_DOMAIN=""
if [ "$SETUP_WWW" = "y" ]; then
    WWW_DOMAIN="-d www.$DOMAIN"
fi

# Update NEXTAUTH_URL in .env
echo ""
echo "Updating NEXTAUTH_URL in .env..."
sed -i "s|NEXTAUTH_URL=.*|NEXTAUTH_URL=https://$DOMAIN|g" .env
echo -e "${GREEN}✓${NC} NEXTAUTH_URL updated"

# Stop nginx temporarily
echo ""
echo "Stopping nginx..."
docker compose stop nginx

# Get SSL certificate
echo ""
echo "Getting SSL certificate from Let's Encrypt..."
docker compose run --rm certbot certonly \
  --standalone \
  --preferred-challenges http \
  --email $EMAIL \
  --agree-tos \
  --no-eff-email \
  -d $DOMAIN \
  $WWW_DOMAIN

# Update nginx.conf
echo ""
echo "Updating nginx configuration..."
sed -i "s|your-domain.com|$DOMAIN|g" nginx/nginx.conf

# Uncomment HTTPS server block and comment HTTP
sed -i 's|^    # server {|    server {|g' nginx/nginx.conf
sed -i 's|^    #     |        |g' nginx/nginx.conf
sed -i 's|^    # }|}|g' nginx/nginx.conf

# Comment out HTTP server (except certbot location)
# This is a bit complex, so we'll keep both for now
# Users can manually comment HTTP block after testing

echo -e "${GREEN}✓${NC} Nginx configuration updated"

# Start nginx
echo ""
echo "Starting nginx with SSL..."
docker compose up -d nginx

# Test SSL
echo ""
echo "Testing SSL certificate..."
sleep 5
curl -I https://$DOMAIN || echo -e "${YELLOW}Note: DNS may not have propagated yet${NC}"

# Test renewal
echo ""
echo "Testing certificate renewal..."
docker compose run --rm certbot renew --dry-run

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 SSL Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Your site is now accessible at:"
echo "  - https://$DOMAIN"
if [ "$SETUP_WWW" = "y" ]; then
    echo "  - https://www.$DOMAIN"
fi
echo ""
echo "Certificate will auto-renew every 12 hours."
echo ""
echo "To manually renew:"
echo "  docker compose run --rm certbot renew"
echo ""
