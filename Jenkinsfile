pipeline {
    agent any
    
    environment {
        PROJECT_NAME = 'blogcms'
    }
    
    parameters {
        booleanParam(
            name: 'FORCE_REBUILD',
            defaultValue: false,
            description: 'Force rebuild Docker images'
        )
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }
        
        stage('Setup Environment') {
            steps {
                script {
                    sh '''
                        # Copy production environment files
                        cp environments/.env.production backend/.env
                        cp environments/.env.production.frontend frontend/.env
                        
                        # Make scripts executable
                        chmod +x scripts/*.sh
                        
                        # Create necessary directories
                        mkdir -p logs uploads
                    '''
                }
            }
        }
        
        stage('Build & Deploy') {
            steps {
                script {
                    def buildArgs = params.FORCE_REBUILD ? '--no-cache' : ''
                    
                    sh """
                        echo "Building Docker images..."
                        docker-compose -f docker-compose.prod.yml build ${buildArgs}
                        
                        echo "Deploying to production..."
                        ./scripts/deploy.sh production
                    """
                }
            }
        }
        
        stage('Health Check') {
            steps {
                script {
                    sh '''
                        echo "Waiting for services to start..."
                        sleep 30
                        
                        echo "Running health checks..."
                        ./scripts/health-check.sh production
                    '''
                }
            }
        }
    }
    
    post {
        success {
            echo '🎉 Deployment to production successful!'
        }
        failure {
            echo '💥 Deployment failed!'
            // Optional: Send notification
        }
        always {
            // Cleanup
            sh 'docker image prune -f'
        }
    }
}