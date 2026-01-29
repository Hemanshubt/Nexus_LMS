# 🚀 Nexus LMS Deployment Guide

This document provides a comprehensive, step-by-step walkthrough for deploying the Nexus LMS platform using a modern DevOps stack: **AWS, Terraform, Kubernetes (EKS), Docker, and GitLab CI/CD.**

---

## 📋 Prerequisites

Before starting, ensure you have the following installed and configured:

1.  **Local Tools**:
    *   [AWS CLI](https://aws.amazon.com/cli/) (v2+)
    *   [Terraform](https://www.terraform.io/downloads) (v1.5+)
    *   [kubectl](https://kubernetes.io/docs/tasks/tools/)
    *   [Docker](https://www.docker.com/)
2.  **Accounts**:
    *   An active AWS Account.
    *   A GitLab account with a project repository.
3.  **Permissions**:
    *   IAM user with `AdministratorAccess` (for initial setup) or specific policies for VPC, EKS, RDS, and ECR.

---

## 🛠️ Step 1: AWS Environment Preparation

### 1.1 Create IAM User for CI/CD
1.  Go to the AWS Console -> **IAM**.
2.  Create a user named `gitlab-ci-user`.
3.  Attach policy: `AdministratorAccess` (or detailed EKS/RDS roles).
4.  Generate **Access Key ID** and **Secret Access Key**. **Save these immediately.**

### 1.2 Setup S3 for Terraform State (Recommended)
By default, Terraform stores state locally. To share state in a team:
1.  Create an S3 bucket (e.g., `nexus-lms-tf-state`).
2.  Enable Versioning on the bucket.

---

## 🏗️ Step 2: Infrastructure Provisioning (Terraform)

### 2.1 Initialize Terraform
Navigate to the terraform directory:
```bash
cd terraform
terraform init
```

### 2.2 Review and Plan
Check what resources will be created:
```bash
# You will be prompted for variables or use a .tfvars file
terraform plan -var="db_password=YourSecurePassword123"
```

### 2.3 Apply Infrastructure
Provision the VPC, EKS Cluster, ECR Repos, and RDS Instance:
```bash
terraform apply -var="db_password=YourSecurePassword123" -auto-approve
```
*Note: This process takes 15–20 minutes as AWS provisions the EKS control plane.*

---

## 🐳 Step 3: Containerization & Registry

### 3.1 Authenticate Docker to ECR
Get the login command for your account (replace placeholders):
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com
```

### 3.2 Build and Push Images (Manual Test)
```bash
# Server
docker build -t nexus-lms-server ./server
docker tag nexus-lms-server:latest <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/nexus-lms-server:latest
docker push <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/nexus-lms-server:latest

# Client
docker build -t nexus-lms-client ./client
docker tag nexus-lms-client:latest <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/nexus-lms-client:latest
docker push <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/nexus-lms-client:latest
```

---

## ☸️ Step 4: Kubernetes Configuration

### 4.1 Connect to Cluster
Update your local `kubeconfig` to point to the new EKS cluster:
```bash
aws eks update-kubeconfig --region us-east-1 --name nexus-lms-cluster
```

### 4.2 Initialize Secrets & Config
Create the Kubernetes secrets for the backend (Update values in `k8s/config.yaml` with Base64 strings):
```bash
# Convert your string to base64
echo -n "your_secret_here" | base64

# Apply the config
kubectl apply -f k8s/config.yaml
```

---

## 🦊 Step 5: GitLab CI/CD Setup

### 5.1 Configure CI/CD Variables
Go to your GitLab project -> **Settings** -> **CI/CD** -> **Variables**:

| Key | Description | Type |
| :--- | :--- | :--- |
| `AWS_ACCESS_KEY_ID` | AWS Credentials | Variable |
| `AWS_SECRET_ACCESS_KEY` | AWS Credentials | Variable (Masked) |
| `AWS_ACCOUNT_ID` | Your 12-digit AWS ID | Variable |
| `DB_PASSWORD` | RDS Postgres Password | Variable (Masked) |
| `DATABASE_URL` | Full Postgres Connection String | Variable (Masked) |
| `JWT_SECRET` | Secret for Access Tokens | Variable (Masked) |
| `JWT_REFRESH_SECRET` | Secret for Refresh Tokens | Variable (Masked) |
| `CLOUDINARY_API_KEY` | Cloudinary Key | Variable |
| `CLOUDINARY_API_SECRET`| Cloudinary Secret | Variable (Masked) |
| `RAZORPAY_KEY_ID` | Razorpay ID (Used for build + runtime) | Variable |
| `RAZORPAY_KEY_SECRET` | Razorpay Secret | Variable (Masked) |

### 5.2 Trigger the Pipeline
Push your code to the `main` branch. GitLab will automatically:
1.  **Build**: Create Docker images and push to ECR.
2.  **Infrastructure**: Check/Update Terraform resources.
3.  **Deploy**: Update EKS deployments with the new images.

---

## 🔍 Step 6: Verification & Access

### 6.1 Check Deployment Status
```bash
kubectl get pods
kubectl get services
```

### 6.2 Get the Application URL
Find the `EXTERNAL-IP` of the `client-service`:
```bash
kubectl get svc client-service
```
Copy the DNS name (e.g., `a736...us-east-1.elb.amazonaws.com`) and paste it into your browser.

---

## 🛠️ Maintenance & Scaling

### Scaling the App
To increase the number of replicas manually:
```bash
kubectl scale deployment server-deployment --replicas=5
```

### Updating Secrets
If you change environment variables:
1.  Update `k8s/config.yaml`.
2.  Apply: `kubectl apply -f k8s/config.yaml`.
3.  Restart pods: `kubectl rollout restart deployment server-deployment`.

---

## ⚠️ Troubleshooting

1.  **EKS Node Connection**: If nodes don't join, check VPC NAT Gateway and Security Groups.
2.  **Database Connection**: Ensure the RDS Security Group allows inbound traffic from the EKS Node Security Group (handled automatically by our Terraform script).
3.  **Docker Build Failures**: Ensure the `package.json` names and paths in Dockerfiles match your local structure.

---
*Created by Antigravity AI*
