#!/bin/bash
set -e

ENVIRONMENT=${1:-production}

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

if [[ "$ENVIRONMENT" != "production" ]]; then
    error "Invalid environment: $ENVIRONMENT. Use 'production'"
    exit 1
fi

log "Starting deployment to $ENVIRONMENT environment..."

# Determine compose file name
if [ -f "docker-compose.prod.yml" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
elif [ -f "docker-compose.production.yml" ]; then
    COMPOSE_FILE="docker-compose.production.yml"
else
    error "No production compose file found!"
    exit 1
fi

log "Using compose file: $COMPOSE_FILE"

# Check if compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
    error "Compose file $COMPOSE_FILE not found!"
    exit 1
fi

# Stop existing services
log "Stopping existing services..."
docker-compose -f $COMPOSE_FILE down || echo "No existing services to stop"

# Start services
log "Starting services..."
docker-compose -f $COMPOSE_FILE up -d

# Wait for services to be ready
log "Waiting for services to start..."
sleep 30

# Show running services
log "Services started:"
docker-compose -f $COMPOSE_FILE ps

log "Deployment completed successfully!"