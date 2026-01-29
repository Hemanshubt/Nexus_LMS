# ================================
# Nexus LMS - DevOps Deployment Guide
# Docker | Kubernetes | Terraform | AWS | GitLab CI/CD
# ================================

## 📋 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Quick Start](#quick-start)
4. [Infrastructure Setup](#infrastructure-setup)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Kubernetes Deployment](#kubernetes-deployment)
7. [Monitoring & Alerts](#monitoring--alerts)
8. [Security Best Practices](#security-best-practices)
9. [Troubleshooting](#troubleshooting)

---

## 🏗️ Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              AWS Cloud                                        │
├──────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                        VPC (10.0.0.0/16)                                │ │
│  │  ┌────────────────────┐  ┌────────────────────┐  ┌──────────────────┐  │ │
│  │  │  Public Subnet AZ1 │  │  Public Subnet AZ2 │  │ Public Subnet AZ3│  │ │
│  │  │   NAT Gateway      │  │   NAT Gateway      │  │  NAT Gateway     │  │ │
│  │  └────────────────────┘  └────────────────────┘  └──────────────────┘  │ │
│  │                                                                          │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐ │ │
│  │  │                     EKS Cluster (Private Subnets)                   │ │ │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │ │ │
│  │  │  │ Server Pods  │  │ Client Pods  │  │ ALB Ingress  │              │ │ │
│  │  │  │ (3 replicas) │  │ (2 replicas) │  │  Controller  │              │ │ │
│  │  │  └──────────────┘  └──────────────┘  └──────────────┘              │ │ │
│  │  └────────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                          │ │
│  │  ┌────────────────────────────────────────────────────────────────────┐ │ │
│  │  │                   Database Subnets                                   │ │ │
│  │  │  ┌──────────────────┐        ┌──────────────────┐                   │ │ │
│  │  │  │  RDS PostgreSQL  │        │  ElastiCache     │                   │ │ │
│  │  │  │  (Multi-AZ)      │        │  Redis           │                   │ │ │
│  │  │  └──────────────────┘        └──────────────────┘                   │ │ │
│  │  └────────────────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │     ECR      │  │      S3      │  │  CloudFront  │  │ Secrets Manager  │  │
│  │ (Container   │  │  (Uploads)   │  │    (CDN)     │  │   (Secrets)      │  │
│  │  Registry)   │  │              │  │              │  │                  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## ✅ Prerequisites

### Required Tools
```bash
# AWS CLI
aws --version  # >= 2.x

# Terraform
terraform --version  # >= 1.6.0

# kubectl
kubectl version --client  # >= 1.28

# Docker
docker --version  # >= 24.x

# Helm (optional)
helm version  # >= 3.x
```

### AWS Account Setup
1. Create an AWS account or use existing one
2. Create an IAM user with programmatic access
3. Configure AWS CLI: `aws configure`
4. Ensure you have permissions for: EKS, RDS, ElastiCache, S3, ECR, VPC, IAM

---

## 🚀 Quick Start

### 1. Clone and Configure
```bash
# Clone the repository
git clone https://github.com/your-org/nexus-lms.git
cd nexus-lms

# Copy environment template
cp .env.example .env
# Edit .env with your configuration
```

### 2. Local Development with Docker Compose
```bash
# Start all services locally
docker-compose up -d

# View logs
docker-compose logs -f

# Access the application
# Client: http://localhost
# Server: http://localhost:3000
```

### 3. Create S3 Backend for Terraform
```bash
# Create S3 bucket for Terraform state
aws s3 mb s3://nexus-lms-terraform-state --region ap-south-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket nexus-lms-terraform-state \
  --versioning-configuration Status=Enabled

# Create DynamoDB table for state locking
aws dynamodb create-table \
  --table-name nexus-lms-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region ap-south-1
```

---

## 🏭 Infrastructure Setup

### Initialize Terraform
```bash
cd terraform

# Initialize Terraform
terraform init

# Review the plan
terraform plan -var-file=prod.tfvars

# Apply infrastructure
terraform apply -var-file=prod.tfvars
```

### Configure kubectl for EKS
```bash
# Update kubeconfig
aws eks update-kubeconfig \
  --name nexus-lms-eks-prod \
  --region ap-south-1

# Verify connection
kubectl cluster-info
kubectl get nodes
```

---

## 🔄 CI/CD Pipeline

### GitLab CI/CD Configuration

#### 1. Set CI/CD Variables in GitLab
Navigate to: Settings → CI/CD → Variables

| Variable | Description | Protected | Masked |
|----------|-------------|-----------|--------|
| `AWS_ACCOUNT_ID` | Your AWS Account ID | ✅ | ❌ |
| `AWS_ROLE_ARN` | IAM Role ARN for OIDC | ✅ | ❌ |
| `VITE_API_URL` | API URL for client | ❌ | ❌ |

#### 2. Configure OIDC Authentication
```hcl
# In GitLab: Settings → CI/CD → Token Access
# Enable "Allow access token to be used in pipelines"

# AWS IAM Trust Policy for GitLab OIDC
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/gitlab.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "gitlab.com:sub": "project_path:your-org/nexus-lms:ref_type:branch:ref:main"
        }
      }
    }
  ]
}
```

### Pipeline Stages
1. **Validate**: Linting, type checking, Terraform validation
2. **Test**: Unit tests, integration tests with coverage
3. **Security**: Dependency scanning, container scanning, SAST
4. **Build**: Docker image building and pushing to ECR
5. **Deploy Infrastructure**: Terraform plan and apply
6. **Deploy Staging**: Automatic deployment to staging
7. **Deploy Production**: Manual deployment to production

---

## ☸️ Kubernetes Deployment

### Manual Deployment
```bash
# Apply all manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/rbac.yaml
kubectl apply -f k8s/server-deployment.yaml
kubectl apply -f k8s/client-deployment.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/network-policies.yaml
kubectl apply -f k8s/pdb.yaml

# Check deployment status
kubectl get pods -n nexus-lms
kubectl get svc -n nexus-lms
kubectl get ingress -n nexus-lms
```

### Rollback
```bash
# View rollout history
kubectl rollout history deployment/nexus-lms-server -n nexus-lms

# Rollback to previous version
kubectl rollout undo deployment/nexus-lms-server -n nexus-lms

# Rollback to specific revision
kubectl rollout undo deployment/nexus-lms-server -n nexus-lms --to-revision=2
```

---

## 📊 Monitoring & Alerts

### CloudWatch Alarms
- **EKS**: CPU utilization, memory utilization
- **RDS**: CPU, connections, storage space
- **Redis**: CPU, memory usage
- **ALB**: 4xx errors, 5xx errors, latency

### View Logs
```bash
# Application logs
kubectl logs -f deployment/nexus-lms-server -n nexus-lms

# CloudWatch Logs
aws logs tail /aws/eks/nexus-lms/application --follow
```

### Container Insights
Enable Container Insights in EKS for detailed metrics.

---

## 🔒 Security Best Practices

### Implemented Security Measures
- ✅ **Network Policies**: Zero-trust network model
- ✅ **Pod Security**: Non-root containers, read-only filesystems
- ✅ **RBAC**: Minimal permissions for service accounts
- ✅ **IRSA**: IAM roles for service accounts
- ✅ **Encryption**: At-rest and in-transit encryption
- ✅ **Secrets Management**: AWS Secrets Manager integration
- ✅ **Container Scanning**: Trivy vulnerability scanning
- ✅ **WAF**: AWS WAF protection for ALB

### Secret Rotation
```bash
# Rotate database password
aws secretsmanager rotate-secret \
  --secret-id nexus-lms-rds-password

# Update Kubernetes secret (if using External Secrets Operator)
kubectl rollout restart deployment/nexus-lms-server -n nexus-lms
```

---

## 🔧 Troubleshooting

### Common Issues

#### Pod not starting
```bash
# Check pod status
kubectl describe pod <pod-name> -n nexus-lms

# Check events
kubectl get events -n nexus-lms --sort-by='.lastTimestamp'
```

#### Database connection issues
```bash
# Test from pod
kubectl exec -it <pod-name> -n nexus-lms -- sh
nc -zv <rds-endpoint> 5432
```

#### Image pull errors
```bash
# Verify ECR permissions
aws ecr get-login-password --region ap-south-1 | \
  docker login --username AWS --password-stdin <account>.dkr.ecr.ap-south-1.amazonaws.com

# Check image exists
aws ecr describe-images --repository-name nexus-lms-server
```

---

## 📁 Project Structure

```
nexus-lms/
├── .gitlab-ci.yml          # GitLab CI/CD pipeline
├── docker-compose.yml      # Local development
├── .env.example            # Environment template
│
├── client/                 # Frontend application
│   ├── Dockerfile
│   ├── nginx.conf
│   └── src/
│
├── server/                 # Backend application
│   ├── Dockerfile
│   └── src/
│
├── k8s/                    # Kubernetes manifests
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secrets.yaml
│   ├── server-deployment.yaml
│   ├── client-deployment.yaml
│   ├── ingress.yaml
│   ├── network-policies.yaml
│   ├── rbac.yaml
│   ├── pdb.yaml
│   └── values.yaml
│
└── terraform/              # Infrastructure as Code
    ├── main.tf
    ├── variables.tf
    ├── outputs.tf
    ├── vpc.tf
    ├── eks.tf
    ├── rds.tf
    ├── elasticache.tf
    ├── ecr.tf
    ├── s3.tf
    └── monitoring.tf
```

---

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Contact DevOps team at devops@example.com

---

**Last Updated**: January 2026
