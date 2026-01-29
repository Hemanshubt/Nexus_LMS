# 🏗️ Nexus LMS: Comprehensive Deployment & DevOps Guide

This document provides a "Long-Form" detailed roadmap for deploying the Nexus LMS platform. It covers everything from local containerization to global cloud infrastructure.

---

## 📑 Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites & Environment Setup](#2-prerequisites)
3. [Containerization Strategy (Docker)](#3-containerization)
4. [Infrastructure as Code (Terraform)](#4-infrastructure-as-code)
5. [Kubernetes Orchestration (EKS)](#5-kubernetes-orchestration)
6. [CI/CD Pipeline (GitLab)](#6-cicd-pipeline)
7. [Secrets & Configuration Management](#7-secrets-management)
8. [The Deployment Sequence](#8-deployment-sequence)
9. [Post-Deployment & Scaling](#9-post-deployment)

---

## 1. Architecture Overview <a name="1-architecture-overview"></a>
The system is built using a **highly available, secure cloud architecture**:
*   **Frontend**: React (Vite) served via Nginx in a Kubernetes Pod.
*   **Backend**: Node.js (Express) with Prisma ORM, deployed as multiple replicas.
*   **Database**: Managed AWS RDS PostgreSQL (Multi-AZ ready).
*   **Storage**: Cloudinary for media assets.
*   **Orchestration**: AWS EKS (Elastic Kubernetes Service) with Managed Node Groups.
*   **Networking**: Custom VPC with 2 Public Subnets (Load Balancers) and 2 Private Subnets (App & DB).

---

## 2. Prerequisites <a name="2-prerequisites"></a>

### 2.1 Cloud Accounts
*   **AWS Account**: Root or Admin user access.
*   **GitLab**: Repository hosted on GitLab.com or a private instance.
*   **Cloudinary**: Account for image/video hosting.
*   **Razorpay**: Test/Live credentials for payments.

### 2.2 Local Tools
Ensure these are in your system PATH:
```bash
aws --version          # AWS CLI v2
terraform --version    # v1.5+
kubectl version        # Same version as cluster (1.29)
docker --version       # For local testing
```

---

## 3. Containerization Strategy <a name="3-containerization"></a>

### 3.1 Server (Node.js)
The Server Dockerfile (`server/Dockerfile`) uses a two-stage build:
1.  **Build Stage**: Installs all dependencies (including dev), generates Prisma Client, and transpiles TypeScript to JavaScript.
2.  **Production Stage**: Copies only the `dist` folder, `node_modules` (runtime only), and `prisma` schema. This reduces image size from ~1GB to ~150MB.

### 3.2 Client (React)
The Client Dockerfile (`client/Dockerfile`) uses a different approach:
1.  **Build Stage**: Runs `npm run build` which produces static HTML/JS/CSS assets.
2.  **Serve Stage**: Uses an `nginx:alpine` image. It copies the build files to `/usr/share/nginx/html` and uses a custom `nginx.conf` to handle Single Page Application (SPA) routing.

---

## 4. Infrastructure as Code (Terraform) <a name="4-infrastructure-as-code"></a>

The infrastructure is modularized for clarity:
*   `provider.tf`: Configures the AWS provider and region.
*   `vpc.tf`: Defines the network skeleton. It creates subnets across two Availability Zones (AZs) for high availability.
*   `eks.tf`: Defines the Kubernetes cluster. It specifies `t3.medium` instances for the nodes to handle the LMS workload.
*   `ecr.tf`: Provisions private Docker registries (`nexus-lms-client` and `nexus-lms-server`).
*   `rds.tf`: Provisions the PostgreSQL database. **Crucial**: It is placed in a private subnet and only allows traffic from the EKS nodes via security groups.

---

## 5. Kubernetes Orchestration (EKS) <a name="5-kubernetes-orchestration"></a>

### Deployments (`k8s/server.yaml`, `k8s/client.yaml`)
*   **Replicas**: Set to 2 by default to ensure no downtime during updates.
*   **Probes**: 
    *   **Liveness**: Restarts the container if the app crashes or freezes.
    *   **Readiness**: Ensures the app is fully initialized (DB connected, etc.) before sending traffic to it.

### Services
*   **Client Service**: Type `LoadBalancer`. AWS will automatically provision an **Elastic Load Balancer (ELB)** and provide a public DNS.
*   **Server Service**: Type `ClusterIP`. Only accessible within the cluster, protecting your API from direct internet exposure.

---

## 6. CI/CD Pipeline (GitLab) <a name="6-cicd-pipeline"></a>

The pipeline (`.gitlab-ci.yml`) is split into four logic gates:
1.  **Docker Build**: Builds the images and pushes them to ECR. It uses "Docker-in-Docker" (dind) and injects build-time variables (like Razorpay Client ID).
2.  **Infra Apply**: Runs `terraform apply`. Infrastructure is only changed if the code in the `terraform/` folder is modified.
3.  **K8s Prepare**: Decodes configuration templates and injects secrets.
4.  **Deployment**: Uses `kubectl set image` or `kubectl apply` to roll out the new containers to EKS.

---

## 7. Secrets & Configuration Management <a name="7-secrets-management"></a>

**NEVER commit plain-text secrets.**

### Manual Setup in K8s:
1.  Navigate to `k8s/config.yaml`.
2.  Convert your local `.env` values to Base64:
    ```bash
    echo -n "your_database_url_here" | base64
    ```
3.  Paste the string into the `data` section of the Secret.
4.  Apply manually once: `kubectl apply -f k8s/config.yaml`.

---

## 8. The Deployment Sequence <a name="8-deployment-sequence"></a>

Follow this exact order for the first-time setup:

1.  **Variables**: Add all keys listed in `DEPLOYMENT.md` to GitLab CI/CD Variables.
2.  **First Push**: Push code to the `main` branch. 
3.  **Monitor Infra**: Wait for the `infrastructure` stage to finish (check AWS Console -> EKS).
4.  **DB Migration**: Once RDS is up, run the first migration from inside a pod or a temporary JumpServer (GitLab handles this via EKS update).
5.  **DNS Mapping**: 
    *   Get Load Balancer DNS: `kubectl get svc client-service`.
    *   Point your domain (e.g., `lms.yourdomain.com`) to this DNS via a CNAME record in Route53 or GoDaddy.

---

## 9. Post-Deployment & Scaling <a name="9-post-deployment"></a>

### Monitoring
*   Use **CloudWatch Container Insights** to view CPU/Memory usage.
*   Use `kubectl logs -l app=nexus-server` to view application logs.

### Horizontal Scaling
If traffic increases, scale your backend in seconds:
```bash
kubectl scale deployment server-deployment --replicas=10
```

### Updates
To update the app, simply push a code change. The Kubernetes **Rolling Update** strategy will:
1.  Start a new Pod with the new image.
2.  Wait for it to pass the Readiness check.
3.  Terminate one old Pod.
4.  Repeat until all Pods are new.

---
*End of Document. For specific command issues, refer to the individual tool documentation or contact the DevOps lead.*
