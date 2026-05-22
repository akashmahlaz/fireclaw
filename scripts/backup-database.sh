#!/bin/bash
# MongoDB Backup Script for FireClaw

set -e

echo "💾 MongoDB Backup"
echo "================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Create backup directory
BACKUP_DIR="/opt/backups"
mkdir -p $BACKUP_DIR

# Generate backup filename with timestamp
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_NAME="fireclaw-backup-$TIMESTAMP"

echo "Creating backup: $BACKUP_NAME"
echo ""

# Get MongoDB password from .env
MONGO_PASSWORD=$(grep MONGO_ROOT_PASSWORD .env | cut -d '=' -f2)

# Create backup inside container
docker exec fireclaw-mongodb-1 mongodump \
  -u admin \
  -p "$MONGO_PASSWORD" \
  --authenticationDatabase admin \
  --out /data/backup/$BACKUP_NAME

# Copy to host
docker cp fireclaw-mongodb-1:/data/backup/$BACKUP_NAME $BACKUP_DIR/

# Compress backup
cd $BACKUP_DIR
tar -czf $BACKUP_NAME.tar.gz $BACKUP_NAME
rm -rf $BACKUP_NAME

# Clean up old backups (keep last 7 days)
find $BACKUP_DIR -name "fireclaw-backup-*.tar.gz" -mtime +7 -delete

echo ""
echo -e "${GREEN}✓${NC} Backup created: $BACKUP_DIR/$BACKUP_NAME.tar.gz"

# Show backup size
BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_NAME.tar.gz" | cut -f1)
echo "Backup size: $BACKUP_SIZE"

# List all backups
echo ""
echo "Available backups:"
ls -lh $BACKUP_DIR/fireclaw-backup-*.tar.gz 2>/dev/null || echo "No backups found"

echo ""
echo "To restore from this backup:"
echo "  ./scripts/restore-backup.sh $BACKUP_NAME.tar.gz"
echo ""
