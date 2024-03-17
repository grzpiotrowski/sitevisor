# Running the app in Kind

## Prerequisites
- Docker: Ensure **Docker** is installed on your system. You can download and install Docker from [Docker's official website](https://www.docker.com/get-started/).
- Kind: Install **kind** on your machine. Follow the installation instructions on the [kind website](https://kind.sigs.k8s.io/docs/user/quick-start/#installation).
- Added `127.0.0.1 sitevisor.local` ìn `/etc/hosts`

## Kind deployment
**Create the Kind cluster:**
```bash
kind create cluster
```

**Build and Load the Docker Image into kind:**
```bash
docker build -t sitevisor:dev .
```

**Load the Image into your kind Cluster:**
```bash
kind load docker-image sitevisor:dev
```

**Create the deployment:**
```bash
echo "
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sitevisor-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: sitevisor
  template:
    metadata:
      labels:
        app: sitevisor
    spec:
      containers:
      - name: sitevisor
        image: sitevisor:dev
        ports:
        - containerPort: 3000
" | kubectl apply -f -
```

**Create a service to expose the application:**
```bash
echo "
apiVersion: v1
kind: Service
metadata:
  name: sitevisor-frontend-service
spec:
  type: ClusterIP
  selector:
    app: sitevisor
  ports:
    - protocol: TCP
      port: 3000
      targetPort: 3000
" | kubectl apply -f -
```

**Ingress for SiteVisor frontend:**
```bash
echo "
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: sitevisor-frontend-ingress
spec:
  rules:
  - host: sitevisor.local
    http:
      paths:
      - pathType: Prefix
        path: /
        backend:
          service:
            name: sitevisor-frontend-service
            port:
              number: 3000
  ingressClassName: nginx
" | kubectl apply -f -
```

**Access the application:**

Open your browser and go to http://sitevisor.local:8080.

**Cleanup**
```bash
kind delete cluster
```