# ============================================
# Nexus LMS - Terraform Variables
# ============================================

# ─────────────────────────────────────────
# General Configuration
# ─────────────────────────────────────────
variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "ap-south-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

# ─────────────────────────────────────────
# VPC Configuration
# ─────────────────────────────────────────
variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

# ─────────────────────────────────────────
# EKS Configuration
# ─────────────────────────────────────────
variable "kubernetes_version" {
  description = "Kubernetes version for EKS cluster"
  type        = string
  default     = "1.29"
}

variable "node_groups" {
  description = "EKS node group configurations"
  type = map(object({
    instance_types = list(string)
    capacity_type  = string
    min_size       = number
    max_size       = number
    desired_size   = number
    disk_size      = number
    labels         = map(string)
  }))
  default = {
    general = {
      instance_types = ["t3.medium"]
      capacity_type  = "ON_DEMAND"
      min_size       = 2
      max_size       = 10
      desired_size   = 2
      disk_size      = 50
      labels = {
        role = "general"
      }
    }
    spot = {
      instance_types = ["t3.medium", "t3.large"]
      capacity_type  = "SPOT"
      min_size       = 0
      max_size       = 20
      desired_size   = 2
      disk_size      = 50
      labels = {
        role = "spot"
      }
    }
  }
}

# ─────────────────────────────────────────
# RDS Configuration
# ─────────────────────────────────────────
variable "rds_engine_version" {
  description = "PostgreSQL engine version"
  type        = string
  default     = "16.1"
}

variable "rds_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.small"
}

variable "rds_allocated_storage" {
  description = "Allocated storage for RDS in GB"
  type        = number
  default     = 20
}

variable "database_name" {
  description = "Name of the database"
  type        = string
  default     = "nexus_lms"
}

variable "database_username" {
  description = "Master username for RDS"
  type        = string
  default     = "nexus_admin"
}

# ─────────────────────────────────────────
# Domain Configuration
# ─────────────────────────────────────────
variable "domain_name" {
  description = "Domain name for the application"
  type        = string
  default     = ""
}

variable "create_ssl_certificate" {
  description = "Whether to create an SSL certificate"
  type        = bool
  default     = false
}
