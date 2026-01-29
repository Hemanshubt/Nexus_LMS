# ================================
# Terraform Outputs
# ================================

output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "eks_cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = module.eks.cluster_endpoint
}

output "ecr_server_url" {
  description = "ECR repository URL for server"
  value       = module.ecr_server.repository_url
}

output "ecr_client_url" {
  description = "ECR repository URL for client"
  value       = module.ecr_client.repository_url
}

output "rds_endpoint" {
  description = "RDS endpoint"
  value       = module.rds.db_instance_endpoint
  sensitive   = true
}

output "redis_endpoint" {
  description = "Redis endpoint"
  value       = aws_elasticache_replication_group.redis.primary_endpoint_address
  sensitive   = true
}

output "s3_uploads_bucket" {
  description = "S3 uploads bucket name"
  value       = aws_s3_bucket.uploads.id
}

output "cloudfront_domain" {
  description = "CloudFront distribution domain"
  value       = aws_cloudfront_distribution.uploads.domain_name
}

output "gitlab_runner_role_arn" {
  description = "IAM role ARN for GitLab Runner"
  value       = module.gitlab_runner_role.iam_role_arn
}
