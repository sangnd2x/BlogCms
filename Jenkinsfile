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
                    // Use Jenkins credentials for sensitive data
                    withCredentials([
                        string(credentialsId: 'cms-db-password', variable: 'DATABASE_PASSWORD'),
                        string(credentialsId: 'cms-jwt-secret', variable: 'JWT_SECRET')
                    ]) {
                        sh '''
                            echo "Creating production environment files with secrets..."
                            
                            # Create backend .env file
                            cat > environments/.env.production.backend << EOF
NODE_ENV=production
PORT=3000
DATABASE_HOST=${DATABASE_HOST}
DATABASE_PORT=${DATABASE_PORT}
DATABASE_NAME=${DATABASE_NAME}
DATABASE_USER=${DATABASE_USER}
DATABASE_PASSWORD=${DATABASE_PASSWORD}
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
                        '''
                    }
                }
            }
        }
        
        stage('Build & Deploy') {
            steps {
                sh '''
                    docker-compose -f docker-compose.production.yml build
                    ./scripts/deploy.sh production
                '''
            }
        }
        
        stage('Health Check') {
            steps {
                sh '''
                    sleep 30
                    ./scripts/health-check.sh production
                '''
            }
        }
    }
    
    post {
        always {
            sh '''
                rm -f environments/.env.production.backend
                rm -f environments/.env.production.frontend
            '''
        }
    }
}