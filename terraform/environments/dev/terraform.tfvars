# ============================================
# Development Environment Configuration
# ============================================

aws_region  = "ap-south-1"
environment = "dev"
vpc_cidr    = "10.0.0.0/16"

kubernetes_version = "1.29"

node_groups = {
  general = {
    instance_types = ["t3.medium"]
    capacity_type  = "ON_DEMAND"
    min_size       = 1
    max_size       = 5
    desired_size   = 2
    disk_size      = 30
    labels = {
      role = "general"
    }
  }
  spot = {
    instance_types = ["t3.medium", "t3.large"]
    capacity_type  = "SPOT"
    min_size       = 0
    max_size       = 5
    desired_size   = 1
    disk_size      = 30
    labels = {
      role = "spot"
    }
  }
}

rds_engine_version    = "16.1"
rds_instance_class    = "db.t3.micro"
rds_allocated_storage = 20
database_name         = "nexus_lms_dev"
database_username     = "nexus_admin"

domain_name            = ""
create_ssl_certificate = false
