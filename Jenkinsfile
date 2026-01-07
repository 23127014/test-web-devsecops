pipeline {
    agent any

    environment {
        DOCKER_HUB_USER = '23127014'
        IMAGE_NAME = 'test-web-devops'
        FULL_IMAGE_NAME = "${DOCKER_HUB_USER}/${IMAGE_NAME}"
        DOCKER_CREDENTIALS_ID = 'docker-login'
        CONTAINER_NAME = 'test-web-devops-container'
        APP_PORT = '3000'
    }

    triggers {
        githubPush()
    }

    stages {
        stage('Build') {
            steps {
                script {
                    echo 'Building Docker image...'
                    sh "docker build -t ${FULL_IMAGE_NAME}:${BUILD_NUMBER} ."
                    sh "docker tag ${FULL_IMAGE_NAME}:${BUILD_NUMBER} ${FULL_IMAGE_NAME}:latest"
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                script {
                    echo 'Pushing image to Docker Hub...'
                    withCredentials([usernamePassword(credentialsId: DOCKER_CREDENTIALS_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh "echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin"
                        sh "docker push ${FULL_IMAGE_NAME}:${BUILD_NUMBER}"
                        sh "docker push ${FULL_IMAGE_NAME}:latest"
                    }
                }
            }
        }

        stage('Deploy and Run') {
            steps {
                script {
                    echo 'Deploying container...'
                    sh "docker stop ${CONTAINER_NAME} || true"
                    sh "docker rm ${CONTAINER_NAME} || true"

                    sh "docker run -d --restart unless-stopped --name ${CONTAINER_NAME} -p ${APP_PORT}:3000 ${FULL_IMAGE_NAME}:latest"
                }
            }
        }
    }
}
