resource "aws_ecr_repository" "client" {
  name                 = "${var.project_name}-client"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "server" {
  name                 = "${var.project_name}-server"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}
