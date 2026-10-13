pipeline {
  agent none

  stages {
    // All Node stages share the same image and workspace (reuseNode) so node_modules
    // built in one stage are binary-compatible with the next. The Playwright image is
    // Ubuntu + Node 22 with Chromium preinstalled; Alpine (musl) can't run Playwright.
    // Keep the image tag in sync with the @playwright/test version below.
    stage('Npm Install') {
      agent {
        docker {
          image 'mcr.microsoft.com/playwright:v1.52.0-noble'
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
          image 'mcr.microsoft.com/playwright:v1.52.0-noble'
          reuseNode true
        }
      }
      steps {
        sh 'npm run build'
      }
    }

    stage('Playwright Install') {
      agent {
        docker {
          image 'mcr.microsoft.com/playwright:v1.52.0-noble'
          reuseNode true
        }
      }
      steps {
        // Browsers already ship in the image; only the test runner package is needed.
        sh 'npm install --no-save --ignore-scripts @playwright/test@1.52.0'
      }
    }

    stage('Playwright Test') {
      agent {
        docker {
          image 'mcr.microsoft.com/playwright:v1.52.0-noble'
          reuseNode true
        }
      }
      steps {
        sh '''
          set -eu
          npm run start -- -p 5173 > frontend.log 2>&1 &
          FRONTEND_PID=$!
          trap 'kill "$FRONTEND_PID" 2>/dev/null || true' EXIT

          for attempt in $(seq 1 30); do
            curl --fail --silent http://127.0.0.1:5173/login >/dev/null && break
            if [ "$attempt" -eq 30 ]; then
              echo "Frontend did not start on port 5173"; cat frontend.log; exit 1
            fi
            sleep 2
          done

          PLAYWRIGHT_BASE_URL=http://127.0.0.1:5173 npx playwright test
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

  }
}
