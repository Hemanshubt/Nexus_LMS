<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"/>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker"/>
  <img src="https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white" alt="Kubernetes"/>
  <img src="https://img.shields.io/badge/Terraform-7B42BC?style=for-the-badge&logo=terraform&logoColor=white" alt="Terraform"/>
  <img src="https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazonaws&logoColor=white" alt="AWS"/>
</p>

# 🎓 Nexus LMS Platform

A **production-grade Learning Management System (LMS)** SaaS platform built with specific focus on scalability, clean architecture, and modern tech stack. Fully containerized with enterprise-grade DevOps infrastructure.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Docker Development](#-docker-development)
- [Production Deployment](#-production-deployment)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚀 Features

| Feature | Description |
|---------|-------------|
| 👥 **User Roles** | Students, Instructors, and Admin with role-based access |
| 📚 **Course Management** | Create, edit, and publish courses with sections and lessons |
| 🎬 **Video Learning** | Interactive video player with progress tracking |
| 🔐 **Authentication** | Secure JWT-based auth with HTTP-only cookies |
| 💳 **Payments** | Razorpay integration for course purchases |
| 📊 **Analytics** | Instructor and admin dashboards |
| 📝 **Quizzes & Assignments** | Interactive assessments with auto-grading |
| 🏆 **Certificates** | Auto-generated completion certificates |
| ⭐ **Reviews & Comments** | Course ratings and discussions |
| 🔔 **Notifications** | Real-time notifications system |
| ☁️ **SaaS Ready** | Designed for multi-tenancy and scalability |

---

## 🛠️ Tech Stack

### Application Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite, TypeScript, TailwindCSS, Shadcn/UI |
| **State Management** | Zustand + React Query |
| **Forms** | React Hook Form + Zod |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | PostgreSQL |
| **ORM** | Prisma |
| **Authentication** | JWT (Access + Refresh Tokens) |
| **File Storage** | Cloudinary |
| **Payments** | Razorpay |

### DevOps Stack

| Component | Technology |
|-----------|------------|
| **Containerization** | Docker, Docker Compose |
| **Orchestration** | Kubernetes (AWS EKS) |
| **Infrastructure** | Terraform (AWS) |
| **CI/CD** | GitLab CI/CD |
| **Container Registry** | AWS ECR |
| **Database (Prod)** | AWS RDS PostgreSQL |
| **Load Balancer** | AWS ALB |
| **Secrets** | AWS Secrets Manager |

---

## 🏗 Architecture

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

## ⚡ Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL (Local or Cloud)
- Docker & Docker Compose (optional)

### 1. Clone & Install

```bash
git clone https://github.com/Hemanshubt/Nexus_LMS.git
cd Nexus_LMS
npm install
```

### 2. Environment Setup

**Backend** - Create `server/.env`:
```env
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/nexus_lms"
JWT_SECRET="your_super_secret_jwt_key"
JWT_REFRESH_SECRET="your_super_secret_refresh_key"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
RAZORPAY_KEY_ID="your_razorpay_key"
RAZORPAY_KEY_SECRET="your_razorpay_secret"
ZF_URL="http://localhost:5173"
```

**Frontend** - Create `client/.env`:
```env
VITE_API_URL=http://localhost:3000
```

### 3. Database Setup

```bash
cd server
npx prisma generate
npx prisma db push
```

### 4. Run Locally

**Terminal 1 (Backend):**
```bash
npm run dev:server
```
> Server runs on http://localhost:3000

**Terminal 2 (Frontend):**
```bash
npm run dev:client
```
> Client runs on http://localhost:5173

---

## 🐳 Docker Development

### Quick Start with Docker Compose

```bash
# Copy environment file
cp docker/.env.example docker/.env
# Edit docker/.env with your values

# Start all services
cd docker
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Services Started

| Service | URL | Description |
|---------|-----|-------------|
| Client | http://localhost:80 | React frontend |
| Server | http://localhost:3000 | Node.js API |
| PostgreSQL | localhost:5432 | Database |
| Redis | localhost:6379 | Cache (optional) |
| PgAdmin | http://localhost:5050 | Database admin |

### Helper Script

```bash
./scripts/docker-dev.sh up       # Start services
./scripts/docker-dev.sh down     # Stop services
./scripts/docker-dev.sh logs     # View logs
./scripts/docker-dev.sh db-push  # Push Prisma schema
```

---

## 🚀 Production Deployment

### Infrastructure Overview

| Component | AWS Service | Purpose |
|-----------|-------------|---------|
| Compute | EKS (Kubernetes) | Container orchestration |
| Database | RDS PostgreSQL | Managed database |
| Registry | ECR | Docker image storage |
| Load Balancer | ALB | Traffic distribution |
| Secrets | Secrets Manager | Credential storage |
| Infrastructure | Terraform | IaC management |

### Deploy with Terraform

```bash
cd terraform

# Initialize
terraform init

# Plan (review changes)
terraform plan -var-file="environments/dev/terraform.tfvars"

# Apply (create infrastructure)
terraform apply -var-file="environments/dev/terraform.tfvars"
```

### Deploy to Kubernetes

```bash
# Update kubeconfig
aws eks update-kubeconfig --region ap-south-1 --name nexus-lms-eks-dev

# Deploy using Kustomize
kubectl apply -k k8s/overlays/dev/
```

### CI/CD Pipeline (GitLab)

The project includes a complete GitLab CI/CD pipeline:

| Stage | Description |
|-------|-------------|
| **Validate** | Lint, TypeCheck, Terraform validate |
| **Test** | Unit tests with coverage |
| **Build** | Docker multi-stage builds |
| **Security** | Trivy & Snyk scanning |
| **Deploy Dev** | Auto-deploy on `develop` branch |
| **Deploy Staging** | Auto-deploy on `main` branch |
| **Deploy Prod** | Manual approval required |

📄 See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed deployment guide.

---

## 🧪 API Documentation

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/auth/register` | POST | Register new user |
| `/api/v1/auth/login` | POST | User login |
| `/api/v1/auth/logout` | POST | User logout |
| `/api/v1/auth/refresh` | POST | Refresh access token |

### Courses
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/courses` | GET | List all courses |
| `/api/v1/courses` | POST | Create course (Instructor) |
| `/api/v1/courses/:id` | GET | Get course details |
| `/api/v1/courses/:id/sections` | POST | Add section |
| `/api/v1/courses/:id/enroll` | POST | Enroll in course |

### Users
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/users/me` | GET | Get current user |
| `/api/v1/users/profile` | PUT | Update profile |

---

## 📁 Project Structure

```
nexus-lms/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/         # UI components
│   │   ├── pages/              # Page components
│   │   ├── hooks/              # Custom hooks
│   │   ├── services/           # API services
│   │   └── stores/             # Zustand stores
│   └── package.json
│
├── server/                     # Node.js backend
│   ├── src/
│   │   ├── controllers/        # Route controllers
│   │   ├── routes/             # Express routes
│   │   ├── middlewares/        # Custom middlewares
│   │   ├── services/           # Business logic
│   │   └── utils/              # Utilities
│   ├── prisma/                 # Database schema
│   └── package.json
│
├── docker/                     # Docker configuration
│   ├── Dockerfile.client       # Client build
│   ├── Dockerfile.server       # Server build
│   ├── docker-compose.yml      # Local development
│   └── nginx/                  # Nginx configs
│
├── k8s/                        # Kubernetes manifests
│   ├── base/                   # Base configurations
│   └── overlays/               # Environment overlays
│       ├── dev/
│       ├── staging/
│       └── production/
│
├── terraform/                  # Infrastructure as Code
│   ├── modules/                # Terraform modules
│   │   ├── vpc/
│   │   ├── eks/
│   │   ├── rds/
│   │   └── ecr/
│   └── environments/           # Environment configs
│
├── scripts/                    # Utility scripts
├── docs/                       # Documentation
└── .gitlab-ci.yml             # CI/CD pipeline
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 🔐 Demo Credentials

| Portal | Email | Password |
|--------|-------|----------|
| Admin Panel | admin@nexus.com | admin123 |
| Instructor Panel | instructor@nexus.com | instructor123 |
| Student | student@nexus.com | student123 |

---

## 📄 License

This project is licensed under the ISC License.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/Hemanshubt">Hemanshu</a>
</p>