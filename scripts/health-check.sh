#!/bin/bash
set -e

ENVIRONMENT=${1:-staging}
MAX_RETRIES=10
RETRY_INTERVAL=10

if [ "$ENVIRONMENT" == "production" ]; then
    BACKEND_PORT=3000
    FRONTEND_PORT=3200
else
    BACKEND_PORT=3001
    FRONTEND_PORT=3201
fi

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

check_service() {
    local service_name=$1
    local health_url=$2
    local max_retries=$3
    
    log "Checking health of $service_name at $health_url"
    
    for i in $(seq 1 $max_retries); do
        if curl -f -s --max-time 10 "$health_url" > /dev/null 2>&1; then
            log "✅ $service_name is healthy"
            return 0
        else
            log "❌ $service_name health check failed (attempt $i/$max_retries)"
            if [ $i -lt $max_retries ]; then
                sleep $RETRY_INTERVAL
            fi
        fi
    done
    
    error "❌ $service_name failed health check after $max_retries attempts"
    return 1
}

log "Starting health checks for $ENVIRONMENT environment..."

OVERALL_HEALTH=0

# Check backend
if ! check_service "Backend" "http://localhost:$BACKEND_PORT/health" $MAX_RETRIES; then
    OVERALL_HEALTH=1
fi

# Check frontend
if ! check_service "Frontend" "http://localhost:$FRONTEND_PORT/api/health" $MAX_RETRIES; then
    OVERALL_HEALTH=1
fi

if [ $OVERALL_HEALTH -eq 0 ]; then
    log "🎉 All health checks passed! Environment $ENVIRONMENT is healthy."
    exit 0
else
    error "💥 Some health checks failed! Environment $ENVIRONMENT has issues."
    exit 1
fi