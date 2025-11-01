pipeline {
    agent any

    environment {
        PROJECT_NAME = 'blogcms'
        NODE_ENV = 'production'
        PORT = '3000'
        POSTGRES_HOST = 'postgres'
        POSTGRES_PORT = '5432'
        POSTGRES_DB = 'blogcms_prod'
        POSTGRES_USER = 'bloguser'
        API_PREFIX = 'api/v1'
        CORS_ORIGINS = 'http://192.168.100.128:3200,http://192.168.100.128:3000'
        MAX_FILE_SIZE = '5242880'
        UPLOAD_DIR = './uploads'
        JWT_EXPIRES_IN = '1d'

        // Frontend variables
        NEXT_PUBLIC_API_URL = 'http://192.168.100.128:3000'
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
                        string(credentialsId: 'cms-jwt-secret', variable: 'JWT_SECRET'),
                        string(credentialsId: 'minio-access-key', variable: 'MINIO_ACCESS_KEY'),
                        string(credentialsId: 'minio-secret-key', variable: 'MINIO_SECRET_KEY'),
                    ]) {
                        sh '''
                            echo "Creating production environment files..."

                            # Create .env.prod.backend file
                            cat > .env.prod.backend << 'EOF'
NODE_ENV=production
PORT=3000
POSTGRES_DB=blogcms_prod
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=bloguser
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
DATABASE_URL=postgresql://bloguser:${POSTGRES_PASSWORD}@postgres:5432/blogcms_prod
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=24h
API_PREFIX=api/v1
CORS_ORIGINS=http://192.168.100.128:3200
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
LOG_LEVEL=info

# MinIO Internal Configuration (for backend API calls)
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_BUCKET_NAME=blogcms-uploads
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=${MINIO_ACCESS_KEY}
MINIO_SECRET_KEY=${MINIO_SECRET_KEY}

# MinIO Public URL (for file access)
MINIO_PUBLIC_URL=https://api.minio.jamesnd.dev
EOF

                            # Create .env.prod.cms file
                            cat > .env.prod.cms << 'EOF'
NEXT_PUBLIC_API_URL=http://backend:3000
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
EOF

                            mkdir -p logs uploads

                            echo "Backend environment file created successfully!"
                            echo "Frontend environment file created successfully!"
                            echo "Checking .env.prod.backend content:"
                            cat .env.prod.backend
                            echo ""
                            echo "Checking .env.prod.cms content:"
                            cat .env.prod.cms
                        '''
                    }
                }
            }
        }

        stage('Build & Deploy') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'cms-db-password', variable: 'POSTGRES_PASSWORD'),
                        string(credentialsId: 'cms-jwt-secret', variable: 'JWT_SECRET'),
                        string(credentialsId: 'minio-access-key', variable: 'MINIO_ACCESS_KEY'),
                        string(credentialsId: 'minio-secret-key', variable: 'MINIO_SECRET_KEY'),
                    ]) {
                        sh '''
                            echo "Building and deploying..."

                            # Export environment variables for docker-compose
                            export POSTGRES_PASSWORD="${POSTGRES_PASSWORD}"
                            export POSTGRES_DB="blogcms_prod"
                            export POSTGRES_USER="bloguser"
                            export JWT_SECRET=${JWT_SECRET}
                            export MINIO_ACCESS_KEY=${MINIO_ACCESS_KEY}
                            export MINIO_SECRET_KEY=${MINIO_SECRET_KEY}

                            echo "Environment variables set"

                            # Stop any existing services
                            docker-compose -f docker-compose.prod.yml stop || echo "No existing services"

                            # Build and start services
                            docker-compose -f docker-compose.prod.yml up -d --build

                            echo "Services started!"
                            docker-compose -f docker-compose.prod.yml ps
                        '''
                    }
                }
            }
        }

        stage('Database Migration') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'cms-db-password', variable: 'POSTGRES_PASSWORD')
                    ]) {
                        sh '''
                            echo "Running database migrations..."

                            # Wait for database to be ready
                            sleep 10

                            # Run migrations inside the backend container
                            docker exec blogcms_backend_prod npx prisma migrate deploy

                            echo "Migrations completed successfully!"
                        '''
                    }
                }
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                    echo "Waiting for services to be healthy..."

                    # Wait for backend API to be ready
                    for i in {1..30}; do
                        if curl -f http://localhost:3000/api/v1/health > /dev/null 2>&1; then
                            echo "✓ Backend API is healthy"
                            break
                        fi
                        echo "Waiting for backend... ($i/30)"
                        sleep 2
                    done

                    # Wait for frontend to be ready
                    for i in {1..30}; do
                        if curl -f http://localhost:3200 > /dev/null 2>&1; then
                            echo "✓ Frontend is healthy"
                            break
                        fi
                        echo "Waiting for frontend... ($i/30)"
                        sleep 2
                    done

                    echo ""
                    echo "Containers status:"
                    docker ps | grep blogcms
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
                echo ""
                echo "✓ Frontend CMS: http://192.168.100.128:3200"
                echo "✓ Backend API: http://192.168.100.128:3000/api/v1"
                echo "✓ Health Check: http://192.168.100.128:3000/api/v1/health"
                echo ""
                echo "Services running:"
                echo "- blogcms_cms_prod (Next.js on port 3200)"
                echo "- blogcms_backend_prod (NestJS on port 3000)"
                echo "- blogcms_postgres (PostgreSQL on port 5433)"
                echo "- blogcms_minio (MinIO on ports 9000, 9001)"
            '''
        }
        failure {
            echo '💥 Deployment failed!'
            sh '''
                echo "=== DEBUGGING INFO ==="
                echo "Container status:"
                docker ps -a | grep blogcms || echo "No containers found"

                echo ""
                echo "=== FRONTEND LOGS ==="
                docker logs blogcms_cms_prod --tail 50 || echo "No frontend logs"

                echo ""
                echo "=== BACKEND LOGS ==="
                docker logs blogcms_backend_prod --tail 50 || echo "No backend logs"

                echo ""
                echo "=== POSTGRES LOGS ==="
                docker logs blogcms_postgres --tail 20 || echo "No postgres logs"

                echo ""
                echo "=== MINIO LOGS ==="
                docker logs blogcms_minio --tail 20 || echo "No MinIO logs"

                echo ""
                echo "=== ENVIRONMENT FILE CHECK ==="
                if [ -f ".env.prod.backend" ]; then
                    echo "Backend environment file exists"
                else
                    echo "Backend environment file not found"
                fi
                if [ -f ".env.prod.cms" ]; then
                    echo "Frontend environment file exists"
                else
                    echo "Frontend environment file not found"
                fi
            '''
        }
        always {
            sh '''
                rm -f .env.prod.backend .env.prod.cms
            '''
        }
    }

    parameters {
        booleanParam(
            name: 'CLEAN_DEPLOY',
            defaultValue: false,
            description: 'Clean deployment - remove all containers and volumes'
        )
    }
}
