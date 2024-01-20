# Running the app in Kind

## Prerequisites
- Docker: Ensure **Docker** is installed on your system. You can download and install Docker from [Docker's official website](https://www.docker.com/get-started/).
- Kind: Install **kind** on your machine. Follow the installation instructions on the [kind website](https://kind.sigs.k8s.io/docs/user/quick-start/#installation).

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
  replicas: 2
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
        - containerPort: 8080
" | kubectl apply -f -
```

**Create a service to expose the application:**
```bash
echo "
apiVersion: v1
kind: Service
metadata:
  name: sitevisor-service
spec:
  type: NodePort
  selector:
    app: sitevisor
  ports:
    - protocol: TCP
      port: 3000
      targetPort: 8080
" | kubectl apply -f -
```

**Set up port forwarding to access the service in Kind cluster:**
```bash
kubectl port-forward service/sitevisor-service 3000:3000
```

**Access the application:**

Open your browser and go to http://localhost:3000.

**Cleanup**
```bash
kind delete cluster
```