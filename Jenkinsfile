pipeline {
  agent none

  stages {
    stage('Npm Install') {
      agent any
      steps {
        sh 'npm ci'
      }
    }

    stage('Build') {
      agent any
      steps {
        sh 'npm run build'
      }
    }

    stage('Playwright Install') {
      agent any
      steps {
        sh '''
          npm install --no-save --ignore-scripts @playwright/test@1.52.0
          npx playwright install --with-deps chromium
        '''
      }
    }

    stage('Docker Build') {
      agent any
      steps {
        sh '''
          docker build --build-arg BACKEND=http://localhost:3000 \
            -t kevinmateog/flix-frontend:$BUILD_NUMBER \
            -t kevinmateog/flix-frontend:latest .
        '''
      }
    }

    stage('Docker Push') {
      agent any
      steps {
        withCredentials([usernamePassword(
          credentialsId: 'dockerHub',
          passwordVariable: 'dockerHubPassword',
          usernameVariable: 'dockerHubUser'
        )]) {
          sh 'echo "$dockerHubPassword" | docker login -u "$dockerHubUser" --password-stdin'
          sh 'docker push kevinmateog/flix-frontend:$BUILD_NUMBER'
          sh 'docker push kevinmateog/flix-frontend:latest'
          sh 'docker logout'
        }
      }
    }

    stage('Minikube Image Test') {
      agent any
      steps {
        sh '''
          set -eu
          minikube status >/dev/null 2>&1 || minikube start --driver=docker
          minikube image load kevinmateog/flix-frontend:$BUILD_NUMBER
          minikube image ls | grep -F kevinmateog/flix-frontend:$BUILD_NUMBER
        '''
      }
    }

    stage('Playwright Test') {
      agent any
      steps {
        sh '''
          set -eu
          npm run start > frontend.log 2>&1 &
          FRONTEND_PID=$!
          trap 'kill "$FRONTEND_PID" 2>/dev/null || true' EXIT

          for attempt in $(seq 1 30); do
            curl --fail --silent http://127.0.0.1:5173/login >/dev/null && break
            sleep 2
          done

          PLAYWRIGHT_BASE_URL=http://127.0.0.1:5173 npx playwright test
        '''
      }
    }
  }

}
