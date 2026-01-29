# ================================
# EKS Cluster - Kubernetes Infrastructure
# ================================

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 19.21"

  cluster_name    = "${var.project_name}-eks-${var.environment}"
  cluster_version = var.eks_cluster_version

  # Networking
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  # Cluster endpoint access
  cluster_endpoint_public_access  = true
  cluster_endpoint_private_access = true
  cluster_endpoint_public_access_cidrs = ["0.0.0.0/0"]  # Restrict in production

  # Enable IRSA (IAM Roles for Service Accounts)
  enable_irsa = true

  # Cluster encryption
  cluster_encryption_config = {
    provider_key_arn = aws_kms_key.eks.arn
    resources        = ["secrets"]
  }

  # Cluster security group
  cluster_security_group_additional_rules = {
    ingress_nodes_ephemeral_ports_tcp = {
      description                = "Nodes on ephemeral ports"
      protocol                   = "tcp"
      from_port                  = 1025
      to_port                    = 65535
      type                       = "ingress"
      source_node_security_group = true
    }
  }

  # Node security group
  node_security_group_additional_rules = {
    ingress_self_all = {
      description = "Node to node all ports/protocols"
      protocol    = "-1"
      from_port   = 0
      to_port     = 0
      type        = "ingress"
      self        = true
    }
  }

  # Managed node groups
  eks_managed_node_groups = {
    # General purpose nodes
    general = {
      name            = "general-ng"
      use_name_prefix = true

      instance_types = var.eks_node_instance_types
      capacity_type  = "ON_DEMAND"

      min_size     = var.eks_node_min_size
      max_size     = var.eks_node_max_size
      desired_size = var.eks_node_desired_size

      # Node labels
      labels = {
        role        = "general"
        environment = var.environment
      }

      # Taints (none for general purpose)
      taints = []

      # Launch template config
      disk_size = 50
      disk_type = "gp3"

      # AMI type
      ami_type = "AL2_x86_64"

      # Update config
      update_config = {
        max_unavailable_percentage = 33
      }

      tags = {
        Environment = var.environment
        NodeGroup   = "general"
      }
    }

    # Spot instances for cost optimization (non-critical workloads)
    spot = {
      name            = "spot-ng"
      use_name_prefix = true

      instance_types = ["t3.medium", "t3.large", "t3a.medium", "t3a.large"]
      capacity_type  = "SPOT"

      min_size     = 0
      max_size     = 5
      desired_size = 1

      labels = {
        role        = "spot"
        environment = var.environment
      }

      taints = [
        {
          key    = "spot"
          value  = "true"
          effect = "NO_SCHEDULE"
        }
      ]

      disk_size = 50
      disk_type = "gp3"
      ami_type  = "AL2_x86_64"

      tags = {
        Environment = var.environment
        NodeGroup   = "spot"
      }
    }
  }

  # Cluster addons
  cluster_addons = {
    coredns = {
      most_recent = true
      configuration_values = jsonencode({
        computeType = "Fargate"
        replicaCount = 2
      })
    }
    kube-proxy = {
      most_recent = true
    }
    vpc-cni = {
      most_recent              = true
      before_compute           = true
      service_account_role_arn = module.vpc_cni_irsa.iam_role_arn
      configuration_values = jsonencode({
        env = {
          ENABLE_PREFIX_DELEGATION = "true"
          WARM_PREFIX_TARGET       = "1"
        }
      })
    }
    aws-ebs-csi-driver = {
      most_recent              = true
      service_account_role_arn = module.ebs_csi_irsa.iam_role_arn
    }
  }

  # Fargate profiles (optional - for serverless pods)
  fargate_profiles = {
    default = {
      name = "default"
      selectors = [
        {
          namespace = "kube-system"
          labels = {
            k8s-app = "kube-dns"
          }
        }
      ]
    }
  }

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# KMS Key for EKS encryption
resource "aws_kms_key" "eks" {
  description             = "EKS Secret Encryption Key for ${var.project_name}"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  tags = {
    Name        = "${var.project_name}-eks-key"
    Environment = var.environment
  }
}

resource "aws_kms_alias" "eks" {
  name          = "alias/${var.project_name}-eks-${var.environment}"
  target_key_id = aws_kms_key.eks.key_id
}

# IRSA for VPC CNI
module "vpc_cni_irsa" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version = "~> 5.32"

  role_name_prefix      = "${var.project_name}-vpc-cni-"
  attach_vpc_cni_policy = true
  vpc_cni_enable_ipv4   = true

  oidc_providers = {
    main = {
      provider_arn               = module.eks.oidc_provider_arn
      namespace_service_accounts = ["kube-system:aws-node"]
    }
  }

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# IRSA for EBS CSI Driver
module "ebs_csi_irsa" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version = "~> 5.32"

  role_name_prefix      = "${var.project_name}-ebs-csi-"
  attach_ebs_csi_policy = true

  oidc_providers = {
    main = {
      provider_arn               = module.eks.oidc_provider_arn
      namespace_service_accounts = ["kube-system:ebs-csi-controller-sa"]
    }
  }

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# IRSA for Application (Nexus LMS)
module "app_irsa" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version = "~> 5.32"

  role_name_prefix = "${var.project_name}-app-"

  oidc_providers = {
    main = {
      provider_arn               = module.eks.oidc_provider_arn
      namespace_service_accounts = ["nexus-lms:nexus-lms-sa"]
    }
  }

  role_policy_arns = {
    secrets_manager = aws_iam_policy.app_secrets.arn
    s3_access       = aws_iam_policy.app_s3.arn
  }

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# IAM Policy for Secrets Manager access
resource "aws_iam_policy" "app_secrets" {
  name_prefix = "${var.project_name}-secrets-"
  description = "Allow access to application secrets"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = [
          "arn:aws:secretsmanager:${var.aws_region}:*:secret:${var.project_name}/*"
        ]
      }
    ]
  })
}

# IAM Policy for S3 access (uploads, assets)
resource "aws_iam_policy" "app_s3" {
  name_prefix = "${var.project_name}-s3-"
  description = "Allow access to application S3 buckets"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.uploads.arn,
          "${aws_s3_bucket.uploads.arn}/*"
        ]
      }
    ]
  })
}
