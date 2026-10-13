pipeline {
  agent none

  environment {
    IMAGE = 'kevinmateog/flix-frontend'
    NAMESPACE = 'flix-frontend-ci'
    PLAYWRIGHT_BASE_URL = 'http://127.0.0.1:18080'
  }

  stages {
    stage('Install and build') {
      agent any
      steps {
        sh '''
          set -eu
          npm ci
          npm run build
        '''
      }
    }

    stage('Playwright dependencies') {
      agent any
      steps {
        sh '''
          set -eu
          npm install --no-save --ignore-scripts @playwright/test@1.52.0
          npx playwright install --with-deps chromium
        '''
      }
    }

    stage('Build and push image') {
      agent any
      steps {
        script {
          withCredentials([
            usernamePassword(
              credentialsId: 'dockerHub',
              usernameVariable: 'DOCKERHUB_USERNAME',
              passwordVariable: 'DOCKERHUB_TOKEN'
            )
          ]) {
            sh '''
              set -eu
              echo "$DOCKERHUB_TOKEN" | docker login --username "$DOCKERHUB_USERNAME" --password-stdin
              docker build --build-arg BACKEND=http://backend:3000 \
                -t "$IMAGE:$BUILD_NUMBER" -t "$IMAGE:latest" .
              docker push "$IMAGE:$BUILD_NUMBER"
              docker push "$IMAGE:latest"
              docker logout
            '''
          }
        }
      }
    }

    stage('Deploy stack in Minikube') {
      agent any
      steps {
        script {
          withCredentials([
            string(credentialsId: 'flix-ci-db-password', variable: 'DB_PASSWORD'),
            string(credentialsId: 'flix-ci-better-auth-secret', variable: 'BETTER_AUTH_SECRET'),
            string(credentialsId: 'flix-ci-tmdb-api-key', variable: 'TMDB_API_KEY')
          ]) {
            sh '''
              set -eu
              minikube status >/dev/null 2>&1 || minikube start --driver=docker
              minikube image load "kevinmateog/flix-frontend:$BUILD_NUMBER"
              kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -
              kubectl -n "$NAMESPACE" create secret generic flix-secrets \
                --from-literal=POSTGRES_PASSWORD="$DB_PASSWORD" \
                --from-literal=BETTER_AUTH_SECRET="$BETTER_AUTH_SECRET" \
                --from-literal=TMDB_API_KEY="$TMDB_API_KEY" \
                --dry-run=client -o yaml | kubectl apply -f -

              cat <<YAML | kubectl apply -f -
              apiVersion: apps/v1
              kind: Deployment
              metadata:
                name: db
                namespace: $NAMESPACE
              spec:
                selector:
                  matchLabels: { app: db }
                template:
                  metadata:
                    labels: { app: db }
                  spec:
                    containers:
                      - name: postgres
                        image: postgres:17-alpine
                        env:
                          - { name: POSTGRES_DB, value: flix }
                          - { name: POSTGRES_USER, value: flix_user }
                          - name: POSTGRES_PASSWORD
                            valueFrom: { secretKeyRef: { name: flix-secrets, key: POSTGRES_PASSWORD } }
                        readinessProbe:
                          exec: { command: ["pg_isready", "-U", "flix_user", "-d", "flix"] }
                          periodSeconds: 5
              ---
              apiVersion: v1
              kind: Service
              metadata:
                name: db
                namespace: $NAMESPACE
              spec:
                selector: { app: db }
                ports: [{ port: 5432, targetPort: 5432 }]
              ---
              apiVersion: apps/v1
              kind: Deployment
              metadata:
                name: backend
                namespace: $NAMESPACE
              spec:
                selector:
                  matchLabels: { app: backend }
                template:
                  metadata:
                    labels: { app: backend }
                  spec:
                    containers:
                      - name: backend
                        image: kevinmateog/flix-backend:latest
                        ports: [{ containerPort: 3000 }]
                        env:
                          - { name: PORT, value: "3000" }
                          - name: DATABASE_URL
                            value: postgresql://flix_user:$DB_PASSWORD@db:5432/flix
                          - { name: BETTER_AUTH_URL, value: http://localhost:3000 }
                          - { name: BETTER_AUTH_TRUSTED_ORIGINS, value: http://localhost:5173 }
                          - name: BETTER_AUTH_SECRET
                            valueFrom: { secretKeyRef: { name: flix-secrets, key: BETTER_AUTH_SECRET } }
                          - name: TMDB_API_KEY
                            valueFrom: { secretKeyRef: { name: flix-secrets, key: TMDB_API_KEY } }
                        readinessProbe:
                          httpGet: { path: /, port: 3000 }
                          initialDelaySeconds: 15
                          periodSeconds: 5
              ---
              apiVersion: v1
              kind: Service
              metadata:
                name: backend
                namespace: $NAMESPACE
              spec:
                selector: { app: backend }
                ports: [{ port: 3000, targetPort: 3000 }]
              ---
              apiVersion: apps/v1
              kind: Deployment
              metadata:
                name: frontend
                namespace: $NAMESPACE
              spec:
                selector:
                  matchLabels: { app: frontend }
                template:
                  metadata:
                    labels: { app: frontend }
                  spec:
                    containers:
                      - name: frontend
                        image: kevinmateog/flix-frontend:$BUILD_NUMBER
                        imagePullPolicy: Never
                        ports: [{ containerPort: 5173 }]
                        env:
                          - { name: PORT, value: "5173" }
                          - { name: HOSTNAME, value: 0.0.0.0 }
              ---
              apiVersion: v1
              kind: Service
              metadata:
                name: frontend
                namespace: $NAMESPACE
              spec:
                selector: { app: frontend }
                ports: [{ port: 5173, targetPort: 5173 }]
              YAML

              kubectl -n "$NAMESPACE" wait --for=condition=available \
                deployment/db deployment/backend deployment/frontend --timeout=240s
            '''
          }
        }
      }
    }

    stage('Playwright smoke tests') {
      agent any
      steps {
        sh '''
          set -eu
          kubectl -n "$NAMESPACE" port-forward service/frontend 18080:5173 \
            > frontend-port-forward.log 2>&1 &
          PF_PID=$!
          trap 'kill "$PF_PID" 2>/dev/null || true' EXIT

          for attempt in $(seq 1 30); do
            curl --fail --silent "$PLAYWRIGHT_BASE_URL/login" >/dev/null && break
            sleep 2
          done

          PLAYWRIGHT_BASE_URL="$PLAYWRIGHT_BASE_URL" npx playwright test
        '''
      }
    }
  }

  post {
    always {
      sh '''
        set +e
        kubectl delete namespace "$NAMESPACE" --ignore-not-found=true --wait=false
      '''
      archiveArtifacts artifacts: 'playwright-report/**,test-results/**,frontend-port-forward.log', allowEmptyArchive: true
    }
  }
}
