pipeline {
    agent {
        docker {
            image 'node:22-alpine'
            // cache npm dans le workspace pour éviter les problèmes de droits
            args '-e npm_config_cache=/tmp/.npm'
        }
    }

    options {
        timestamps()
    }

    stages {
        stage('Checkout') {
            steps {
                // récupère le dépôt GitHub configuré dans le job
                checkout scm
                sh 'ls -la cv-onepage/portfolio-next'
            }
        }

        stage('Install dependencies') {
            steps {
                dir('cv-onepage/portfolio-next') {
                    sh 'node --version && npm --version'
                    sh 'npm ci'
                }
            }
        }

        stage('Build') {
            steps {
                dir('cv-onepage/portfolio-next') {
                    sh 'npm run build'
                }
            }
        }
    }

    post {
        success { echo 'Pipeline terminé avec succès.' }
        failure { echo 'Le pipeline a échoué, consulter les logs.' }
    }
}
