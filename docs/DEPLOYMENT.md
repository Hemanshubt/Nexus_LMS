# ============================================
# Nexus LMS - DevOps Deployment Guide
# ============================================

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Architecture Overview](#architecture-overview)
3. [Quick Start](#quick-start)
4. [Docker Setup](#docker-setup)
5. [AWS Infrastructure (Terraform)](#aws-infrastructure-terraform)
6. [Kubernetes Deployment](#kubernetes-deployment)
7. [GitLab CI/CD](#gitlab-cicd)
8. [Monitoring & Logging](#monitoring--logging)
9. [Security Best Practices](#security-best-practices)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools

| Tool | Version | Installation |
|------|---------|--------------|
| AWS CLI | v2.x | `choco install awscli` or [AWS Docs](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) |
| Terraform | v1.5+ | `choco install terraform` |
| kubectl | v1.29+ | `choco install kubernetes-cli` |
| Docker | v24+ | [Docker Desktop](https://www.docker.com/products/docker-desktop/) |
| Helm | v3.x | `choco install kubernetes-helm` |
| kustomize | v5.x | `choco install kustomize` |

### AWS Account Setup

1. Create an AWS account at [aws.amazon.com](https://aws.amazon.com)
2. Create an IAM user with programmatic access
3. Attach the following policies:
   - `AdministratorAccess` (for initial setup)
   - Or more restrictive: `AmazonEKSClusterPolicy`, `AmazonEC2FullAccess`, `AmazonRDSFullAccess`, `AmazonECRFullAccess`
4. Configure AWS CLI:
   ```bash
   aws configure
   # Enter your Access Key ID, Secret Access Key, Region (ap-south-1), and output format (json)
   ```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                               AWS Cloud                                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                            VPC (10.0.0.0/16)                            ││
│  │  ┌─────────────────────────────────────────────────────────────────────┐││
│  │  │                    EKS Cluster (Kubernetes)                         │││
│  │  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │││
│  │  │  │  nexus-client    │  │  nexus-server    │  │  AWS ALB         │  │││
│  │  │  │  (React/Nginx)   │  │  (Node/Express)  │  │  (Ingress)       │  │││
│  │  │  │  Replicas: 2-10  │  │  Replicas: 2-20  │  │  SSL/TLS         │  │││
│  │  │  └──────────────────┘  └──────────────────┘  └──────────────────┘  │││
│  │  └─────────────────────────────────────────────────────────────────────┘││
│  │                                    │                                     ││
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐   ││
│  │  │   Amazon ECR     │  │   Amazon RDS     │  │   AWS Secrets Mgr   │   ││
│  │  │   (Container     │  │   (PostgreSQL)   │  │   (Credentials)     │   ││
│  │  │    Registry)     │  │   Multi-AZ       │  │                     │   ││
│  │  └──────────────────┘  └──────────────────┘  └──────────────────────┘   ││
│  └─────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Quick Start

### Option 1: Local Development with Docker

```bash
# Start all services locally
cd scripts
./docker-dev.sh up

# View logs
./docker-dev.sh logs

# Stop services
./docker-dev.sh down
```

### Option 2: Full AWS Deployment

```bash
# Run the deployment script
cd scripts
./deploy.sh dev  # or staging, prod
```

---

## Docker Setup

### Building Images Locally

```bash
# Build client
docker build -t nexus-client:local -f docker/Dockerfile.client .

# Build server
docker build -t nexus-server:local -f docker/Dockerfile.server .
```

### Running with Docker Compose

```bash
cd docker

# Create .env file
cp .env.example .env
# Edit .env with your values

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Environment Variables

Create `docker/.env`:

```env
# Database
DB_USER=nexus
DB_PASSWORD=your_secure_password
DB_NAME=nexus_lms

# JWT
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

# Razorpay (optional)
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_secret
```

---

## AWS Infrastructure (Terraform)

### Initial Setup

```bash
cd terraform

# Initialize Terraform
terraform init

# Review the plan
terraform plan -var-file="environments/dev/terraform.tfvars"

# Apply (creates infrastructure)
terraform apply -var-file="environments/dev/terraform.tfvars"
```

### Resources Created

| Resource | Description | Estimated Cost (Dev) |
|----------|-------------|---------------------|
| VPC | Network with public/private subnets | Free |
| EKS | Kubernetes cluster | ~$73/month |
| EC2 (Nodes) | 2x t3.medium | ~$60/month |
| RDS | PostgreSQL db.t3.micro | ~$15/month |
| ECR | Container registry | ~$1/month |
| ALB | Load balancer | ~$20/month |
| **Total** | | **~$170/month** |

### State Management (Production)

For production, enable remote state:

```hcl
# In terraform/main.tf, uncomment:
backend "s3" {
  bucket         = "nexus-lms-terraform-state"
  key            = "terraform.tfstate"
  region         = "ap-south-1"
  encrypt        = true
  dynamodb_table = "nexus-lms-terraform-locks"
}
```

Create the S3 bucket and DynamoDB table first:

```bash
aws s3 mb s3://nexus-lms-terraform-state --region ap-south-1
aws s3api put-bucket-versioning --bucket nexus-lms-terraform-state --versioning-configuration Status=Enabled

aws dynamodb create-table \
  --table-name nexus-lms-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region ap-south-1
```

---

## Kubernetes Deployment

### Connect to Cluster

```bash
# Update kubeconfig
aws eks update-kubeconfig --region ap-south-1 --name nexus-lms-eks-dev

# Verify connection
kubectl get nodes
```

### Deploy Application

```bash
# Using Kustomize for development
kubectl apply -k k8s/overlays/dev/

# Check deployment status
kubectl get pods -n nexus-lms-dev
kubectl get services -n nexus-lms-dev
kubectl get ingress -n nexus-lms-dev
```

### Useful Commands

```bash
# View logs
kubectl logs -f deployment/nexus-server-dev -n nexus-lms-dev

# Scale deployment
kubectl scale deployment nexus-server-dev --replicas=5 -n nexus-lms-dev

# Rollback
kubectl rollout undo deployment/nexus-server-dev -n nexus-lms-dev

# Port forward for local access
kubectl port-forward svc/nexus-server-dev 3000:3000 -n nexus-lms-dev
```

---

## GitLab CI/CD

### Setting Up GitLab

1. Push code to GitLab repository
2. Configure CI/CD Variables in **Settings > CI/CD > Variables**:

| Variable | Description | Protected | Masked |
|----------|-------------|-----------|--------|
| `AWS_ACCESS_KEY_ID` | AWS access key | ✅ | ✅ |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | ✅ | ✅ |
| `AWS_DEFAULT_REGION` | AWS region (ap-south-1) | ✅ | ❌ |
| `ECR_REGISTRY` | ECR URL | ✅ | ❌ |
| `EKS_CLUSTER_DEV` | Dev cluster name | ✅ | ❌ |
| `EKS_CLUSTER_STAGING` | Staging cluster name | ✅ | ❌ |
| `EKS_CLUSTER_PROD` | Production cluster name | ✅ | ❌ |

### Pipeline Flow

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│ Validate │ → │   Test   │ → │  Build   │ → │ Security │
│ (lint,   │   │ (unit,   │   │ (docker) │   │  (trivy, │
│  types)  │   │  e2e)    │   │          │   │   snyk)  │
└──────────┘   └──────────┘   └──────────┘   └──────────┘
                                                   │
     ┌─────────────────────────────────────────────┘
     ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  Deploy Dev  │ → │Deploy Staging│ → │ Deploy Prod  │
│  (auto on    │   │  (auto on    │   │  (manual     │
│   develop)   │   │    main)     │   │   approval)  │
└──────────────┘   └──────────────┘   └──────────────┘
```

---

## Monitoring & Logging

### CloudWatch (Included)

- EKS control plane logs
- RDS Performance Insights
- VPC Flow Logs

### Recommended Add-ons

1. **Prometheus + Grafana** (Metrics)
   ```bash
   helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
   helm install prometheus prometheus-community/kube-prometheus-stack -n monitoring --create-namespace
   ```

2. **EFK Stack** (Logging)
   ```bash
   helm repo add elastic https://helm.elastic.co
   helm install elasticsearch elastic/elasticsearch -n logging --create-namespace
   helm install kibana elastic/kibana -n logging
   helm install fluent-bit fluent/fluent-bit -n logging
   ```

---

## Security Best Practices

### ✅ Implemented

- [x] Secrets stored in AWS Secrets Manager
- [x] RDS encryption at rest
- [x] VPC with private subnets
- [x] Network policies in Kubernetes
- [x] Non-root containers
- [x] Image vulnerability scanning
- [x] Pod security contexts
- [x] HTTPS/TLS termination at ALB

### 🔧 Recommended Additional Steps

1. **Enable AWS WAF** on ALB
2. **Implement Pod Security Policies**
3. **Enable AWS GuardDuty** for threat detection
4. **Regular security audits** with AWS Inspector
5. **Encrypt EBS volumes** for node storage

---

## Troubleshooting

### Common Issues

#### 1. Terraform: Provider authentication failed
```bash
# Verify AWS credentials
aws sts get-caller-identity

# Re-configure if needed
aws configure
```

#### 2. kubectl: Unable to connect to server
```bash
# Update kubeconfig
aws eks update-kubeconfig --region ap-south-1 --name YOUR_CLUSTER_NAME

# Check cluster status
aws eks describe-cluster --name YOUR_CLUSTER_NAME --query 'cluster.status'
```

#### 3. Pods stuck in Pending
```bash
# Check node resources
kubectl describe nodes

# Check pod events
kubectl describe pod POD_NAME -n nexus-lms-dev
```

#### 4. Database connection refused
```bash
# Verify RDS security group allows traffic from EKS nodes
# Check the DATABASE_URL secret is correct
kubectl get secret nexus-secrets -n nexus-lms-dev -o jsonpath='{.data.DATABASE_URL}' | base64 -d
```

#### 5. Images not pulling from ECR
```bash
# Verify ECR login
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.ap-south-1.amazonaws.com

# Check image exists
aws ecr describe-images --repository-name nexus-server
```

---

## Support

For issues and questions:
- Create a GitLab issue
- Check AWS documentation
- Review Kubernetes logs: `kubectl logs -f deployment/NAME -n NAMESPACE`
