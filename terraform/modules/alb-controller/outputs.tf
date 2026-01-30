# ============================================
# ALB Controller Module - Outputs
# ============================================

output "iam_role_arn" {
  description = "ALB Controller IAM role ARN"
  value       = aws_iam_role.alb_controller.arn
}
