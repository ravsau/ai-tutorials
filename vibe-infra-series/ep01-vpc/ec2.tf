data "aws_ami" "al2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023*-x86_64"]
  }

  filter {
    name   = "state"
    values = ["available"]
  }
}

resource "aws_instance" "web_test" {
  ami                    = data.aws_ami.al2023.id
  instance_type          = "t2.micro"
  subnet_id              = aws_subnet.public[0].id
  vpc_security_group_ids = [aws_security_group.web.id]

  user_data = <<-EOF
    #!/bin/bash
    yum install -y httpd
    echo "<h1>Hello from CloudYeti VPC!</h1><p>Instance: $(curl -s http://169.254.169.254/latest/meta-data/instance-id)</p>" > /var/www/html/index.html
    systemctl enable httpd
    systemctl start httpd
  EOF

  tags = merge(local.common_tags, {
    Name = "${var.project}-web-test"
  })
}

output "web_test_public_ip" {
  description = "Public IP of the test web server"
  value       = aws_instance.web_test.public_ip
}
