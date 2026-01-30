# ============================================
# Staging Environment Configuration
# ============================================

aws_region  = "ap-south-1"
environment = "staging"
vpc_cidr    = "10.1.0.0/16"

kubernetes_version = "1.29"

node_groups = {
  general = {
    instance_types = ["t3.medium", "t3.large"]
    capacity_type  = "ON_DEMAND"
    min_size       = 2
    max_size       = 8
    desired_size   = 2
    disk_size      = 50
    labels = {
      role = "general"
    }
  }
  spot = {
    instance_types = ["t3.medium", "t3.large", "t3.xlarge"]
    capacity_type  = "SPOT"
    min_size       = 0
    max_size       = 10
    desired_size   = 2
    disk_size      = 50
    labels = {
      role = "spot"
    }
  }
}

rds_engine_version    = "16.1"
rds_instance_class    = "db.t3.small"
rds_allocated_storage = 50
database_name         = "nexus_lms_staging"
database_username     = "nexus_admin"

domain_name            = "staging.nexus-lms.com"
create_ssl_certificate = true
