pipeline {
    agent any
    
    environment {
        PROJECT_NAME = 'blogcms'
        NODE_ENV = 'production'
        PORT = '3000'
        POSTGRES_HOST = 'postgres'
        POSTGRES_PORT = '5432'
        POSTGRES_NAME = 'blogcms_prod'
        POSTGRES_USER = 'bloguser'
        POSTGRES_DB = 'blogcms-prod'
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
                        string(credentialsId: 'cms-db-password', variable: 'POSTGRES_PASSWORD'),
                        string(credentialsId: 'cms-jwt-secret', variable: 'JWT_SECRET')
                    ]) {
                        sh '''
                            echo "Creating production environment files..."
                            
                            # Create .env.prod.backend file
                            cat > .env.prod.backend << EOF
                                NODE_ENV=${NODE_ENV}
                                PORT=${PORT}
                                POSTGRES_DB=${POSTGRES_DB}
                                POSTGRES_HOST=${POSTGRES_HOST}
                                POSTGRES_PORT=${POSTGRES_PORT}
                                POSTGRES_NAME=${POSTGRES_NAME}
                                POSTGRES_USER=${POSTGRES_USER}
                                POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
                                DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_NAME}
                                JWT_SECRET=${JWT_SECRET}
                                JWT_EXPIRES_IN=24h
                                API_PREFIX=api/v1
                                CORS_ORIGINS=${CORS_ORIGINS}
                                MAX_FILE_SIZE=10485760
                                UPLOAD_DIR=./uploads
                                LOG_LEVEL=info
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
                        string(credentialsId: 'cms-db-password', variable: 'POSTGRES_PASSWORD')
                    ]) {
                        sh '''
                            echo "Building and deploying with POSTGRES_PASSWORD..."
                            
                            # Export POSTGRES_PASSWORD so docker-compose can use it
                            export POSTGRES_PASSWORD="${POSTGRES_PASSWORD}"
                            
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
                docker logs blogcms_postgres_prod --tail 20 || echo "Postgres logs not available"
            '''
        }
        always {
            sh '''
                rm -f .env.prod.backend
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