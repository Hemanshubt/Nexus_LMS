resource "aws_db_instance" "postgres" {
  allocated_storage    = 20
  engine               = "postgres"
  engine_version       = "15.5"
  instance_class       = "db.t3.micro"
  db_name              = "lms_db"
  username             = "nexus_admin"
  password             = var.db_password
  parameter_group_name = "default.postgres15"
  skip_final_snapshot  = true
  
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  db_subnet_group_name    = module.vpc.database_subnet_group_name
}

resource "aws_security_group" "rds_sg" {
  name        = "${var.project_name}-rds-sg"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [module.eks.node_security_group_id]
  }
}
