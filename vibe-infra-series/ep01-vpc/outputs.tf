output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "IDs of public subnets"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "IDs of private subnets"
  value       = aws_subnet.private[*].id
}

output "web_sg_id" {
  description = "ID of the web security group"
  value       = aws_security_group.web.id
}

output "app_sg_id" {
  description = "ID of the app security group"
  value       = aws_security_group.app.id
}
