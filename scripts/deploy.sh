#!/bin/bash
set -e

# Configuration
ENVIRONMENT=${1:-staging}
PROJECT_NAME="blogcms"
COMPOSE_FILE="docker-compose.${ENVIRONMENT}.yml"
BACKUP_DIR="./backups"
LOG_DIR="./logs"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Check if environment is valid
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    error "Invalid environment: $ENVIRONMENT. Use 'staging' or 'production'"
    exit 1
fi

log "Starting deployment to $ENVIRONMENT environment..."

# Create necessary directories
mkdir -p $BACKUP_DIR
mkdir -p $LOG_DIR
mkdir -p uploads

# Check if compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
    error "Compose file $COMPOSE_FILE not found!"
    exit 1
fi

# Pre-deployment backup (production only)
if [ "$ENVIRONMENT" == "production" ]; then
    log "Creating pre-deployment backup..."
    
    # Backup database
    BACKUP_FILE="${BACKUP_DIR}/db-backup-$(date +'%Y%m%d-%H%M%S').sql"
    docker-compose -f $COMPOSE_FILE exec -T postgres pg_dump -U bloguser blogcms_prod > $BACKUP_FILE
    
    if [ $? -eq 0 ]; then
        log "Database backup created: $BACKUP_FILE"
    else
        error "Failed to create database backup"
        exit 1
    fi
    
    # Backup uploads directory
    tar -czf "${BACKUP_DIR}/uploads-backup-$(date +'%Y%m%d-%H%M%S').tar.gz" uploads/
    log "Uploads backup created"
fi

# Blue-Green Deployment Strategy
log "Implementing blue-green deployment..."

# Check if services are running
SERVICES_RUNNING=$(docker-compose -f $COMPOSE_FILE ps --services --filter "status=running")

if [ -n "$SERVICES_RUNNING" ]; then
    log "Services currently running: $SERVICES_RUNNING"
    
    # Scale up new instances (green)
    log "Scaling up new instances..."
    docker-compose -f $COMPOSE_FILE up -d --scale backend=2 --scale frontend=2 --no-recreate
    
    # Wait for new instances to be healthy
    log "Waiting for new instances to be healthy..."
    sleep 30
    
    # Health check for new instances
    if ! ./scripts/health-check.sh $ENVIRONMENT; then
        error "Health check failed for new instances"
        
        # Rollback - scale back down
        log "Rolling back..."
        docker-compose -f $COMPOSE_FILE up -d --scale backend=1 --scale frontend=1
        exit 1
    fi
    
    # Remove old instances (blue)
    log "Removing old instances..."
    docker-compose -f $COMPOSE_FILE up -d --scale backend=1 --scale frontend=1
else
    log "No services currently running, performing fresh deployment..."
    docker-compose -f $COMPOSE_FILE up -d
fi

# Wait for all services to be ready
log "Waiting for all services to be ready..."
sleep 45

# Final health check
log "Running final health checks..."
if ./scripts/health-check.sh $ENVIRONMENT; then
    log "✅ Deployment to $ENVIRONMENT completed successfully!"
    
    # Log deployment details
    echo "$(date +'%Y-%m-%d %H:%M:%S') - Deployment to $ENVIRONMENT completed - Build: ${BUILD_NUMBER:-manual}" >> "${LOG_DIR}/deployment.log"
    
    # Show running services
    log "Currently running services:"
    docker-compose -f $COMPOSE_FILE ps
    
else
    error "❌ Deployment failed - health checks failed"
    
    # If production, attempt automatic rollback
    if [ "$ENVIRONMENT" == "production" ] && [ -n "$SERVICES_RUNNING" ]; then
        warn "Attempting automatic rollback..."
        
        # Restore from backup if needed
        if [ -f "$BACKUP_FILE" ]; then
            log "Restoring database from backup..."
            cat $BACKUP_FILE | docker-compose -f $COMPOSE_FILE exec -T postgres psql -U bloguser blogcms_prod
        fi
        
        log "Rollback completed"
    fi
    
    exit 1
fi

# Cleanup old Docker images (keep last 3 builds)
log "Cleaning up old Docker images..."
docker images "${PROJECT_NAME}_backend" --format "table {{.Repository}}:{{.Tag}}\t{{.CreatedAt}}" | tail -n +4 | head -n -3 | awk '{print $1}' | xargs -r docker rmi

log "Deployment script completed!"