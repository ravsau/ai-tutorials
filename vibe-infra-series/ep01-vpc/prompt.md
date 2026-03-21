# Episode 1 Prompt

```
I'm starting a new project on AWS. Create the foundational VPC
using Terraform. Here's what I need:

- VPC CIDR: 10.0.0.0/16
- 2 public subnets (10.0.1.0/24 in us-east-1a, 10.0.2.0/24 in us-east-1b)
- 2 private subnets (10.0.3.0/24 in us-east-1a, 10.0.4.0/24 in us-east-1b)
- Internet Gateway with public route table routing 0.0.0.0/0 to IGW
- Private route table with NO internet route (fully isolated)
- Public subnets auto-assign public IPs, private subnets do not
- Security group "web-sg": inbound 80 and 443 from anywhere, all outbound
- Security group "app-sg": inbound 8080 from web-sg only, all outbound
- VPC Flow Logs to CloudWatch Logs with 7-day retention
- Tag everything with Environment=dev and Project=cloudyeti-app
- Use variables for region and CIDR blocks
- Output VPC ID, all subnet IDs, and security group IDs
- Do NOT create a NAT gateway
```
