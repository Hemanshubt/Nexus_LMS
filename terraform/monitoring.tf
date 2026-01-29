# ================================
# SNS & CloudWatch - Monitoring & Alerts
# ================================

resource "aws_sns_topic" "alerts" {
  name_prefix       = "${var.project_name}-alerts-"
  kms_master_key_id = aws_kms_key.sns.id
  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

variable "alert_email" {
  description = "Email address for alerts"
  type        = string
  default     = ""
}

resource "aws_sns_topic_subscription" "alerts_email" {
  count     = var.alert_email != "" ? 1 : 0
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

resource "aws_kms_key" "sns" {
  description             = "SNS encryption key"
  deletion_window_in_days = 7
  enable_key_rotation     = true
  tags = { Name = "${var.project_name}-sns-key" }
}

data "aws_caller_identity" "current" {}

# CloudWatch Alarms
resource "aws_cloudwatch_metric_alarm" "rds_cpu" {
  alarm_name          = "${var.project_name}-rds-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_actions       = [aws_sns_topic.alerts.arn]
  dimensions = { DBInstanceIdentifier = module.rds.db_instance_identifier }
}

resource "aws_cloudwatch_log_group" "app" {
  name              = "/aws/eks/${var.project_name}/application"
  retention_in_days = 30
}
