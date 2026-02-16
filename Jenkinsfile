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

        stage('Install Dependencies') {
            steps {
                sh '''
                cd $APP_DIR
                npm ci
                '''
            }
        }

        stage('Restart Backend (PM2)') {
            steps {
                sh '''
                cd $APP_DIR
                pm2 describe cargo-backend > /dev/null 2>&1 \
                && pm2 restart cargo-backend \
                || pm2 start src/server.js --name cargo-backend

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

