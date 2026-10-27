pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                echo 'Recuperation du code source...'
                checkout scm
            }
        }
        stage('Build Frontend') {
            steps {
                echo 'Construction de l image frontend...'
                sh 'docker build -t maryemelheni/garderie-frontend:latest ./frontend'
            }
        }
        stage('Build Backend') {
            steps {
                echo 'Construction de l image backend...'
                sh 'docker build -t maryemelheni/garderie-backend:latest ./backend'
            }
        }
        stage('Push Frontend') {
            steps {
                echo 'Push de l image frontend (ignore car deja sur Docker Hub)...'
            }
        }
        stage('Push Backend') {
            steps {
                echo 'Push de l image backend (ignore car deja sur Docker Hub)...'
            }
        }
    }
}