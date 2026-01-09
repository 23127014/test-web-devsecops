pipeline {
    agent any

    environment {
        DOCKER_HUB_USER = '23127014'
        IMAGE_NAME = 'test-web-devops'
        FULL_IMAGE_NAME = "${DOCKER_HUB_USER}/${IMAGE_NAME}"
        DOCKER_CREDENTIALS_ID = 'docker-login'
        CONTAINER_NAME = 'test-web-devops-container'
        APP_PORT = '3000'

        SEMGREP_APP_TOKEN = credentials('SEMGREP_APP_TOKEN')
        SEMGREP_BASELINE_REF = "master"
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

        stage('Semgrep SAST Scan') {
            steps {
                sh '''docker pull semgrep/semgrep && \
                docker run \
                -e SEMGREP_APP_TOKEN=$SEMGREP_APP_TOKEN \
                -e SEMGREP_REPO_URL=$SEMGREP_REPO_URL \
                -e SEMGREP_REPO_NAME=$SEMGREP_REPO_NAME \
                -e SEMGREP_BRANCH=$SEMGREP_BRANCH \
                -e SEMGREP_COMMIT=$SEMGREP_COMMIT \
                -e SEMGREP_PR_ID=$SEMGREP_PR_ID \
                -v "$(pwd):$(pwd)" --workdir $(pwd) \
                semgrep/semgrep semgrep ci '''
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
    }
}
