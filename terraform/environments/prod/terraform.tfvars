# ============================================
# Production Environment Configuration
# ============================================

aws_region  = "ap-south-1"
environment = "prod"
vpc_cidr    = "10.2.0.0/16"

kubernetes_version = "1.29"

node_groups = {
  general = {
    instance_types = ["t3.large", "t3.xlarge"]
    capacity_type  = "ON_DEMAND"
    min_size       = 3
    max_size       = 20
    desired_size   = 3
    disk_size      = 100
    labels = {
      role = "general"
    }
  }
  compute = {
    instance_types = ["c5.large", "c5.xlarge"]
    capacity_type  = "ON_DEMAND"
    min_size       = 2
    max_size       = 15
    desired_size   = 2
    disk_size      = 100
    labels = {
      role = "compute"
    }
  }
  spot = {
    instance_types = ["t3.large", "t3.xlarge", "c5.large"]
    capacity_type  = "SPOT"
    min_size       = 0
    max_size       = 30
    desired_size   = 5
    disk_size      = 100
    labels = {
      role = "spot"
    }
  }
}

rds_engine_version    = "16.1"
rds_instance_class    = "db.r6g.large"
rds_allocated_storage = 100
database_name         = "nexus_lms_prod"
database_username     = "nexus_admin"

domain_name            = "nexus-lms.com"
create_ssl_certificate = true
