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
                        string(credentialsId: 'cms-jwt-secret', variable: 'JWT_SECRET'),
                        string(credentialsId: 'minio-access-key', variable: 'MINIO_ACCESS_KEY'),
                        string(credentialsId: 'minio-secret-key', variable: 'MINIO_SECRET_KEY'),
                    ]) {
                        sh '''
                            echo "Creating production environment files..."

                            # Create .env.prod.backend file - FIXED: Proper EOF closing
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

                            mkdir -p logs uploads

                            echo "Environment file created successfully!"
                            echo "Checking .env.prod.backend content:"
                            cat .env.prod.backend
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
                            docker exec blogcms_backend_prod npm run migration:run:prod

                            echo "Migrations completed successfully!"
                        '''
                    }
                }
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                    echo "Containers status:"
                    docker ps
                '''
            }
        }
    }

    post {
        success {
            echo '🎉 Backend deployment successful!'
            sh '''
                echo "=== DEPLOYMENT SUMMARY ==="
                docker ps | grep blogcms
                echo "Backend API: http://192.168.1.128:3000/api/v1"
                echo "Health Check: http://192.168.1.128:3000/api/v1/health"
            '''
        }
        failure {
            echo '💥 Deployment failed!'
            sh '''
                echo "=== DEBUGGING INFO ==="
                echo "Container status:"
                docker ps -a | grep blogcms || echo "No containers found"

                echo "=== BACKEND LOGS ==="
                docker logs blogcms_backend_prod --tail 50 || echo "No backend logs"

                echo "=== POSTGRES LOGS ==="
                docker logs blogcms_postgres --tail 20 || echo "No postgres logs"

                echo "=== ENVIRONMENT FILE CHECK ==="
                if [ -f ".env.prod.backend" ]; then
                    echo "Environment file exists, first 10 lines:"
                    head -10 .env.prod.backend
                else
                    echo "Environment file not found"
                fi
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
            description: 'Clean deployment - remove all containers and volumes'
        )
    }
}
