# Overall Ingress configuration

The deployment steps outlined in the guide for each component contain separate Ingress resources specified for each specific component, like the frontend, backend or Kafka Bridge.

To simplify management of the ingress resources, we can also create a combined Ingress resource to handle all services per namespace.


Ingress for SiteVisor frontend and backend services:
```bash
echo "
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: sitevisor-ingress
spec:
  ingressClassName: nginx
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
      - pathType: Prefix
        path: /api
        backend:
          service:
            name: sitevisor-backend-service
            port:
              number: 8000
      - pathType: Prefix
        path: /static/rest_framework
        backend:
          service:
            name: sitevisor-backend-service
            port:
              number: 8000
" | kubectl apply -f -
```

Ingress for Kafka related services:
```bash
echo "
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: kafka-ingress
  namespace: kafka
  annotations:
    nginx.ingress.kubernetes.io/proxy-read-timeout: '3600'
    nginx.ingress.kubernetes.io/proxy-send-timeout: '3600'
    nginx.ingress.kubernetes.io/server-snippets: |
      location /socket {
        proxy_set_header Upgrade $http_upgrade;
        proxy_http_version 1.1;
        proxy_set_header X-Forwarded-Host $http_host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header Host $host;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
      }
spec:
  rules:
  - host: sitevisor.local
    http:
      paths:
      - path: /topics
        pathType: Prefix
        backend:
          service:
            name: kafka-bridge-bridge-service
            port:
              number: 8088
      - path: /socket
        pathType: Prefix
        backend:
          service:
            name: kafka-websocket-proxy-service
            port:
              number: 8078
  ingressClassName: nginx
" | kubectl apply -f -
```