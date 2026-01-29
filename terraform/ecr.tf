# ================================
# ECR - Container Registry
# ================================

module "ecr_server" {
  source  = "terraform-aws-modules/ecr/aws"
  version = "~> 1.6"

  repository_name = "${var.project_name}-server"

  repository_lifecycle_policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 30 images"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["v"]
          countType     = "imageCountMoreThan"
          countNumber   = 30
        }
        action = {
          type = "expire"
        }
      },
      {
        rulePriority = 2
        description  = "Delete untagged images older than 7 days"
        selection = {
          tagStatus   = "untagged"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 7
        }
        action = {
          type = "expire"
        }
      }
    ]
  })

  repository_image_scan_on_push = true
  repository_encryption_type    = "KMS"
  repository_kms_key           = aws_kms_key.ecr.arn

  repository_read_write_access_arns = [
    module.gitlab_runner_role.iam_role_arn
  ]

  tags = {
    Environment = var.environment
    Project     = var.project_name
    Component   = "server"
  }
}

module "ecr_client" {
  source  = "terraform-aws-modules/ecr/aws"
  version = "~> 1.6"

  repository_name = "${var.project_name}-client"

  repository_lifecycle_policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 30 images"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["v"]
          countType     = "imageCountMoreThan"
          countNumber   = 30
        }
        action = {
          type = "expire"
        }
      },
      {
        rulePriority = 2
        description  = "Delete untagged images older than 7 days"
        selection = {
          tagStatus   = "untagged"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 7
        }
        action = {
          type = "expire"
        }
      }
    ]
  })

  repository_image_scan_on_push = true
  repository_encryption_type    = "KMS"
  repository_kms_key           = aws_kms_key.ecr.arn

  repository_read_write_access_arns = [
    module.gitlab_runner_role.iam_role_arn
  ]

  tags = {
    Environment = var.environment
    Project     = var.project_name
    Component   = "client"
  }
}

# KMS Key for ECR encryption
resource "aws_kms_key" "ecr" {
  description             = "ECR encryption key for ${var.project_name}"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  tags = {
    Name        = "${var.project_name}-ecr-key"
    Environment = var.environment
  }
}

resource "aws_kms_alias" "ecr" {
  name          = "alias/${var.project_name}-ecr-${var.environment}"
  target_key_id = aws_kms_key.ecr.key_id
}

# IAM Role for GitLab Runner
module "gitlab_runner_role" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-assumable-role-with-oidc"
  version = "~> 5.32"

  create_role = true
  role_name   = "${var.project_name}-gitlab-runner"

  provider_url = "gitlab.com"  # Or your GitLab instance URL

  oidc_fully_qualified_subjects = [
    "project_path:${var.gitlab_project_path}:ref_type:branch:ref:main",
    "project_path:${var.gitlab_project_path}:ref_type:branch:ref:develop"
  ]

  role_policy_arns = [
    aws_iam_policy.gitlab_runner.arn
  ]

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

variable "gitlab_project_path" {
  description = "GitLab project path (e.g., group/project)"
  type        = string
  default     = "your-org/nexus-lms"
}

# IAM Policy for GitLab Runner
resource "aws_iam_policy" "gitlab_runner" {
  name_prefix = "${var.project_name}-gitlab-runner-"
  description = "Policy for GitLab Runner CI/CD"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:PutImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload"
        ]
        Resource = [
          module.ecr_server.repository_arn,
          module.ecr_client.repository_arn
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "eks:DescribeCluster",
          "eks:ListClusters"
        ]
        Resource = module.eks.cluster_arn
      },
      {
        Effect = "Allow"
        Action = [
          "sts:GetCallerIdentity"
        ]
        Resource = "*"
      }
    ]
  })
}
