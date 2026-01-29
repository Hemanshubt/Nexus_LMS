# ================================
# ElastiCache Redis - Caching Layer
# ================================

resource "aws_elasticache_subnet_group" "redis" {
  name       = "${var.project_name}-redis-subnet-group"
  subnet_ids = module.vpc.private_subnets

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_elasticache_replication_group" "redis" {
  replication_group_id = "${var.project_name}-redis"
  description          = "Redis cluster for ${var.project_name}"

  # Engine
  engine               = "redis"
  engine_version       = "7.0"
  node_type            = var.redis_node_type
  port                 = 6379
  parameter_group_name = aws_elasticache_parameter_group.redis.name

  # Cluster mode disabled (single shard with replicas)
  num_cache_clusters = var.redis_num_cache_nodes
  automatic_failover_enabled = var.redis_num_cache_nodes > 1

  # Network
  subnet_group_name  = aws_elasticache_subnet_group.redis.name
  security_group_ids = [aws_security_group.redis.id]

  # Encryption
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  kms_key_id                = aws_kms_key.redis.arn

  # Auth
  auth_token = random_password.redis_auth.result

  # Maintenance
  maintenance_window       = "sun:05:00-sun:06:00"
  snapshot_window         = "04:00-05:00"
  snapshot_retention_limit = 7
  auto_minor_version_upgrade = true

  # Notifications
  notification_topic_arn = aws_sns_topic.alerts.arn

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }

  lifecycle {
    ignore_changes = [engine_version]
  }
}

resource "aws_elasticache_parameter_group" "redis" {
  family = "redis7"
  name   = "${var.project_name}-redis-params"

  parameter {
    name  = "maxmemory-policy"
    value = "allkeys-lru"
  }

  parameter {
    name  = "notify-keyspace-events"
    value = "Ex"
  }

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# Redis Auth Token
resource "random_password" "redis_auth" {
  length  = 64
  special = false  # ElastiCache has restrictions on special characters
}

# Store Redis credentials in Secrets Manager
resource "aws_secretsmanager_secret" "redis" {
  name_prefix = "${var.project_name}-redis-"
  description = "Redis credentials for ${var.project_name}"

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_secretsmanager_secret_version" "redis" {
  secret_id = aws_secretsmanager_secret.redis.id
  secret_string = jsonencode({
    auth_token = random_password.redis_auth.result
    host       = aws_elasticache_replication_group.redis.primary_endpoint_address
    port       = 6379
    url        = "rediss://:${random_password.redis_auth.result}@${aws_elasticache_replication_group.redis.primary_endpoint_address}:6379"
  })
}

# KMS Key for Redis encryption
resource "aws_kms_key" "redis" {
  description             = "Redis encryption key for ${var.project_name}"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  tags = {
    Name        = "${var.project_name}-redis-key"
    Environment = var.environment
  }
}

resource "aws_kms_alias" "redis" {
  name          = "alias/${var.project_name}-redis-${var.environment}"
  target_key_id = aws_kms_key.redis.key_id
}

# Security Group for Redis
resource "aws_security_group" "redis" {
  name_prefix = "${var.project_name}-redis-"
  description = "Security group for ElastiCache Redis"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [module.eks.node_security_group_id]
    description     = "Redis from EKS nodes"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "All outbound traffic"
  }

  tags = {
    Name        = "${var.project_name}-redis-sg"
    Environment = var.environment
  }

  lifecycle {
    create_before_destroy = true
  }
}
