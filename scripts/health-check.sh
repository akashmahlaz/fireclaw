#!/bin/bash
# Health Check Script for FireClaw

set -e

echo "🏥 FireClaw Health Check"
echo "========================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if containers are running
echo "Checking Docker containers..."
echo ""

CONTAINERS=("fireclaw" "mongodb" "nginx")
for container in "${CONTAINERS[@]}"; do
    if docker compose ps | grep -q "$container.*Up"; then
        echo -e "${GREEN}✓${NC} $container is running"
    else
        echo -e "${RED}✗${NC} $container is NOT running"
        ISSUES=1
    fi
done

echo ""

# Check MongoDB connection
echo "Checking MongoDB connection..."
MONGO_PASSWORD=$(grep MONGO_ROOT_PASSWORD .env | cut -d '=' -f2)
if docker exec fireclaw-mongodb-1 mongosh -u admin -p "$MONGO_PASSWORD" --authenticationDatabase admin --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} MongoDB is accessible"
else
    echo -e "${RED}✗${NC} MongoDB connection failed"
    ISSUES=1
fi

echo ""

# Check disk space
echo "Checking disk space..."
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -lt 80 ]; then
    echo -e "${GREEN}✓${NC} Disk usage: $DISK_USAGE%"
else
    echo -e "${YELLOW}⚠${NC} Disk usage: $DISK_USAGE% (Warning: >80%)"
fi

echo ""

# Check memory usage
echo "Checking memory usage..."
MEMORY_USAGE=$(free | awk 'NR==2 {printf "%.0f", $3/$2 * 100}')
if [ $MEMORY_USAGE -lt 90 ]; then
    echo -e "${GREEN}✓${NC} Memory usage: $MEMORY_USAGE%"
else
    echo -e "${YELLOW}⚠${NC} Memory usage: $MEMORY_USAGE% (Warning: >90%)"
fi

echo ""

# Check HTTP response
echo "Checking HTTP response..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200\|302"; then
    echo -e "${GREEN}✓${NC} HTTP is responding"
else
    echo -e "${RED}✗${NC} HTTP is not responding"
    ISSUES=1
fi

echo ""

# Check HTTPS response (if SSL is setup)
DOMAIN=$(grep NEXTAUTH_URL .env | cut -d '/' -f3)
if [ ! -z "$DOMAIN" ] && [ "$DOMAIN" != "localhost:3000" ]; then
    echo "Checking HTTPS response..."
    if curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN | grep -q "200\|302"; then
        echo -e "${GREEN}✓${NC} HTTPS is responding"
    else
        echo -e "${YELLOW}⚠${NC} HTTPS not accessible (might be DNS issue)"
    fi
    echo ""
fi

# Show Docker stats
echo "Docker Resource Usage:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"

echo ""

# Final status
if [ -z "$ISSUES" ]; then
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}✓ All systems healthy!${NC}"
    echo -e "${GREEN}========================================${NC}"
else
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}✗ Some issues detected${NC}"
    echo -e "${RED}========================================${NC}"
    echo ""
    echo "Check logs with: docker compose logs -f"
    exit 1
fi

echo ""
