pipeline {
    agent any
    
    environment {
        PROJECT_NAME = 'blogcms'
        NODE_ENV = 'production'
        PORT = '3000'
        DATABASE_HOST = 'postgres'
        DATABASE_PORT = '5432'
        DATABASE_NAME = 'blogcms_prod'
        DATABASE_USER = 'bloguser'
        API_PREFIX = 'api/v1'
        CORS_ORIGINS = 'http://192.168.1.128:3200,http://192.168.1.128:3000'
        MAX_FILE_SIZE = '5242880'
        UPLOAD_DIR = './uploads'
        JWT_EXPIRES_IN = '1d'
        
        // Frontend variables
        NEXT_PUBLIC_API_URL = 'http://192.168.1.128:3000'
        NEXT_PUBLIC_APP_NAME = 'Blog CMS'
        NEXT_PUBLIC_APP_VERSION = '1.0.0'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Setup Environment') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'cms-db-password', variable: 'DATABASE_PASSWORD'),
                        string(credentialsId: 'cms-jwt-secret', variable: 'JWT_SECRET')
                    ]) {
                        sh '''
                            echo "Creating production environment files..."
                            
                            # Create backend .env file
                            cat > environments/.env.production.backend << EOF
NODE_ENV=production
PORT=3000
DATABASE_HOST=${DATABASE_HOST}
DATABASE_PORT=${DATABASE_PORT}
DATABASE_NAME=${DATABASE_NAME}
DATABASE_USER=${DATABASE_USER}
POSTGRES_PASSWORD=${DATABASE_PASSWORD}
DATABASE_URL=postgresql://${DATABASE_USER}:${DATABASE_PASSWORD}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=24h
API_PREFIX=api/v1
CORS_ORIGINS=http://192.168.1.128:3200
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
LOG_LEVEL=info
EOF

                            # Create frontend .env file
                            cat > environments/.env.production.frontend << EOF
NODE_ENV=production
PORT=3200
NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
NEXT_PUBLIC_API_PREFIX=api/v1
NEXT_PUBLIC_APP_NAME=${NEXT_PUBLIC_APP_NAME}
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_JWT_STORAGE_KEY=blog_cms_token_prod
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
NEXT_PUBLIC_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp,image/gif
EOF

                            chmod +x scripts/*.sh
                            mkdir -p logs uploads
                            
                            echo "Environment files created successfully!"
                        '''
                    }
                }
            }
        }
        
        stage('Build & Deploy') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'cms-db-password', variable: 'DATABASE_PASSWORD')
                    ]) {
                        sh '''
                            echo "Building and deploying with DATABASE_PASSWORD..."
                            
                            # Export DATABASE_PASSWORD so docker-compose can use it
                            export DATABASE_PASSWORD="${DATABASE_PASSWORD}"
                            
                            # Use correct compose file name (check if it's .prod.yml or .production.yml)
                            if [ -f "docker-compose.prod.yml" ]; then
                                COMPOSE_FILE="docker-compose.prod.yml"
                            elif [ -f "docker-compose.production.yml" ]; then
                                COMPOSE_FILE="docker-compose.production.yml"
                            else
                                echo "Error: No production compose file found!"
                                exit 1
                            fi
                            
                            echo "Using compose file: $COMPOSE_FILE"
                            
                            # Build images
                            docker-compose -f "$COMPOSE_FILE" build
                            
                            # Stop existing services (if any)
                            docker-compose -f "$COMPOSE_FILE" down || echo "No existing services to stop"
                            
                            # Start services
                            docker-compose -f "$COMPOSE_FILE" up -d
                            
                            echo "Services started successfully!"
                            docker-compose -f "$COMPOSE_FILE" ps
                        '''
                    }
                }
            }
        }
        
        stage('Health Check') {
            steps {
                sh '''
                    echo "Waiting for services to start..."
                    sleep 45
                    
                    echo "Checking service status..."
                    docker ps | grep blogcms || echo "No blogcms containers found"
                    
                    echo "Testing backend connectivity..."
                    for i in {1..5}; do
                        if curl -f -s --max-time 5 "http://localhost:3000/health" > /dev/null 2>&1; then
                            echo "✅ Backend is responding"
                            break
                        else
                            echo "⏳ Backend not ready, attempt $i/5"
                            sleep 10
                        fi
                    done
                    
                    echo "Testing frontend connectivity..."
                    for i in {1..5}; do
                        if curl -f -s --max-time 5 "http://localhost:3200" > /dev/null 2>&1; then
                            echo "✅ Frontend is responding"
                            break
                        else
                            echo "⏳ Frontend not ready, attempt $i/5"
                            sleep 10
                        fi
                    done
                    
                    echo "Deployment health check completed!"
                '''
            }
        }
    }
    
    post {
        success {
            echo '🎉 Deployment successful!'
            sh '''
                echo "=== DEPLOYMENT SUMMARY ==="
                docker ps | grep blogcms
                echo "Backend: http://192.168.1.128:3000"
                echo "Frontend: http://192.168.1.128:3200"
            '''
        }
        failure {
            echo '💥 Deployment failed!'
            sh '''
                echo "=== DEBUGGING INFO ==="
                echo "Container status:"
                docker ps -a | grep blogcms || echo "No blogcms containers found"
                
                echo "=== LOGS ==="
                docker logs blogcms_backend_prod --tail 20 || echo "Backend logs not available"
                docker logs blogcms_frontend_prod --tail 20 || echo "Frontend logs not available" 
                docker logs blogcms_postgres_prod --tail 20 || echo "Postgres logs not available"
            '''
        }
        always {
            sh '''
                rm -f environments/.env.production.backend
                rm -f environments/.env.production.frontend
            '''
        }
    }
    
    parameters {
        booleanParam(
            name: 'CLEAN_DEPLOY',
            defaultValue: false,
            description: 'Stop and remove existing containers before deploying'
        )
    }
}