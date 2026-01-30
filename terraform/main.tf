# ============================================
# Nexus LMS - Terraform Main Configuration
# AWS Infrastructure as Code
# ============================================

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.24"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.12"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  # Backend configuration for state management
  # Uncomment and configure for production use
  # backend "s3" {
  #   bucket         = "nexus-lms-terraform-state"
  #   key            = "terraform.tfstate"
  #   region         = "ap-south-1"
  #   encrypt        = true
  #   dynamodb_table = "nexus-lms-terraform-locks"
  # }
}

# ─────────────────────────────────────────
# Provider Configuration
# ─────────────────────────────────────────
provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "nexus-lms"
      Environment = var.environment
      ManagedBy   = "terraform"
      Owner       = "devops"
    }
  }
}

# Kubernetes provider (configured after EKS is created)
provider "kubernetes" {
  host                   = module.eks.cluster_endpoint
  cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)

  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    command     = "aws"
    args        = ["eks", "get-token", "--cluster-name", module.eks.cluster_name]
  }
}

provider "helm" {
  kubernetes {
    host                   = module.eks.cluster_endpoint
    cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)

    exec {
      api_version = "client.authentication.k8s.io/v1beta1"
      command     = "aws"
      args        = ["eks", "get-token", "--cluster-name", module.eks.cluster_name]
    }
  }
}

# ─────────────────────────────────────────
# Data Sources
# ─────────────────────────────────────────
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

# ─────────────────────────────────────────
# Local Variables
# ─────────────────────────────────────────
locals {
  name            = "nexus-lms-${var.environment}"
  cluster_name    = "nexus-lms-eks-${var.environment}"
  
  azs = slice(data.aws_availability_zones.available.names, 0, 3)

  tags = {
    Project     = "nexus-lms"
    Environment = var.environment
  }
}

# ─────────────────────────────────────────
# VPC Module
# ─────────────────────────────────────────
module "vpc" {
  source = "./modules/vpc"

  name               = local.name
  environment        = var.environment
  vpc_cidr           = var.vpc_cidr
  availability_zones = local.azs
  
  tags = local.tags
}

# ─────────────────────────────────────────
# ECR Module (Container Registry)
# ─────────────────────────────────────────
module "ecr" {
  source = "./modules/ecr"

  environment = var.environment
  
  repositories = [
    "nexus-client",
    "nexus-server"
  ]
  
  tags = local.tags
}

# ─────────────────────────────────────────
# EKS Module (Kubernetes Cluster)
# ─────────────────────────────────────────
module "eks" {
  source = "./modules/eks"

  cluster_name       = local.cluster_name
  environment        = var.environment
  kubernetes_version = var.kubernetes_version
  
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  
  node_groups = var.node_groups
  
  tags = local.tags
}

# ─────────────────────────────────────────
# RDS Module (PostgreSQL Database)
# ─────────────────────────────────────────
module "rds" {
  source = "./modules/rds"

  name               = "${local.name}-db"
  environment        = var.environment
  
  vpc_id             = module.vpc.vpc_id
  database_subnets   = module.vpc.database_subnet_ids
  
  engine_version     = var.rds_engine_version
  instance_class     = var.rds_instance_class
  allocated_storage  = var.rds_allocated_storage
  
  database_name      = var.database_name
  master_username    = var.database_username
  
  # Security: Allow access from EKS nodes
  allowed_security_groups = [module.eks.node_security_group_id]
  
  multi_az           = var.environment == "prod" ? true : false
  deletion_protection = var.environment == "prod" ? true : false
  
  tags = local.tags
}

# ─────────────────────────────────────────
# ALB Controller (for Ingress)
# ─────────────────────────────────────────
module "alb_controller" {
  source = "./modules/alb-controller"

  cluster_name       = module.eks.cluster_name
  cluster_endpoint   = module.eks.cluster_endpoint
  oidc_provider_arn  = module.eks.oidc_provider_arn
  
  vpc_id = module.vpc.vpc_id
  region = var.aws_region
  
  tags = local.tags
  
  depends_on = [module.eks]
}

# ─────────────────────────────────────────
# Secrets Manager (for sensitive data)
# ─────────────────────────────────────────
resource "aws_secretsmanager_secret" "app_secrets" {
  name                    = "${local.name}/app-secrets"
  description             = "Application secrets for Nexus LMS"
  recovery_window_in_days = var.environment == "prod" ? 30 : 0

  tags = local.tags
}

resource "aws_secretsmanager_secret_version" "app_secrets" {
  secret_id = aws_secretsmanager_secret.app_secrets.id
  secret_string = jsonencode({
    DATABASE_URL       = "postgresql://${var.database_username}:${module.rds.master_password}@${module.rds.endpoint}:5432/${var.database_name}"
    JWT_SECRET         = random_password.jwt_secret.result
    JWT_REFRESH_SECRET = random_password.jwt_refresh_secret.result
  })
}

resource "random_password" "jwt_secret" {
  length  = 64
  special = false
}

resource "random_password" "jwt_refresh_secret" {
  length  = 64
  special = false
}

# ─────────────────────────────────────────
# S3 Bucket (for static assets/backups)
# ─────────────────────────────────────────
resource "aws_s3_bucket" "assets" {
  bucket = "${local.name}-assets-${data.aws_caller_identity.current.account_id}"

  tags = local.tags
}

resource "aws_s3_bucket_versioning" "assets" {
  bucket = aws_s3_bucket.assets.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "assets" {
  bucket = aws_s3_bucket.assets.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "assets" {
  bucket = aws_s3_bucket.assets.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
