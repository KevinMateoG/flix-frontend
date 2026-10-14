pipeline {
  agent none

  stages {
    stage('Npm Install') {
      agent {
        docker {
          image 'node:22-bookworm'
          reuseNode true
        }
      }
      steps {
        sh 'npm ci'
      }
    }

    stage('Build') {
      agent {
        docker {
          image 'node:22-bookworm'
          reuseNode true
        }
      }
      steps {
        sh 'npm run build'
      }
    }

    stage('Playwright Test') {
      agent {
        docker {
          image 'node:22-bookworm'
          reuseNode true
        }
      }
      steps {
        sh '''
          set -eu
          npm install --no-save --package-lock=false --ignore-scripts @playwright/test@1.52.0
          ./node_modules/.bin/playwright install --with-deps chromium

          HOSTNAME=127.0.0.1 PORT=5173 node .next/standalone/server.js > frontend.log 2>&1 &
          FRONTEND_PID=$!
          trap 'kill "$FRONTEND_PID" 2>/dev/null || true' EXIT

          ready=false
          for attempt in $(seq 1 30); do
            if curl --fail --silent http://127.0.0.1:5173/login >/dev/null; then
              ready=true
              break
            fi
            sleep 2
          done

          if [ "$ready" != true ]; then
            cat frontend.log
            exit 1
          fi

          ./node_modules/.bin/playwright test
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
          sh 'docker push kevinmateog/flix-frontend:latest'
          sh 'docker logout'
        }
      }
    }
  }
}
