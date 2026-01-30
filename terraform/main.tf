terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}

# VPC Module
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"

  name = "nexus-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["${var.region}a", "${var.region}b", "${var.region}c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = true

  tags = {
    Environment = "prod"
    Project     = "nexus-lms"
  }
}

# EKS Cluster
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 19.0"

  cluster_name    = "nexus-cluster"
  cluster_version = "1.27"

  cluster_endpoint_public_access = true

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  eks_managed_node_groups = {
    general = {
      desired_size = 2
      min_size     = 1
      max_size     = 3

      labels = {
        role = "general"
      }

      instance_types = ["t3.medium"]
      capacity_type  = "ON_DEMAND"
    }
  }

  tags = {
    Environment = "prod"
  }
}

# ECR Repositories
resource "aws_ecr_repository" "server" {
  name = "nexus-lms-server"
}

resource "aws_ecr_repository" "client" {
  name = "nexus-lms-client"
}

# RDS Postgres
module "db" {
  source = "terraform-aws-modules/rds/aws"

  identifier = "nexus-db"

  engine            = "postgres"
  engine_version    = "15"
  instance_class    = "db.t3.micro"
  allocated_storage = 20

  db_name  = "nexus_lms"
  username = "postgres"
  port     = "5432"

  vpc_security_group_ids = [module.vpc.default_security_group_id]
  subnet_ids             = module.vpc.private_subnets

  # Disable deletion protection for demo purposes
  deletion_protection = false

  tags = {
    Environment = "prod"
  }
}
