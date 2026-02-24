pipeline {
    agent any

    environment {
        APP_DIR = "/var/www/cargocrm/cargocrm-backend-node"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/aryutechnologies2025/cargocrm-backend-node.git'
            }
        }

        stage('Deploy Code to Production') {
            steps {
                sh '''
                echo "Syncing code to production directory..."
                rsync -av --delete --exclude=node_modules --exclude=.env ./ $APP_DIR/
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                cd $APP_DIR
                npm ci --omit=dev
                '''
            }
        }
        
        stage('Security Scan - Semgrep (Cloud)') {
            environment {
                SEMGREP_APP_TOKEN = credentials('semgrep-token')
            }
            steps {
                sh 'semgrep ci || true'
            }
        }

        stage('Restart Backend (PM2)') {
            steps {
                sh '''
                cd $APP_DIR

                if pm2 describe cargo-backend > /dev/null
                then
                    pm2 restart cargo-backend --update-env
                else
                    pm2 start src/server.js --name cargo-backend
                fi

                pm2 save
                '''
            }
        }
    }

    post {
        success {
            echo 'Backend Deployment Successful'
        }
        failure {
            echo 'Backend Deployment Failed'
        }
    }
}

