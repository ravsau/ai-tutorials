# Claude Code for Cloud Engineering: You're an AI Engineer Now

A CloudYeti lab demonstrating how to manage AWS infrastructure using Claude Code.

📺 **Watch the video:** [YouTube Link]

---

## Prerequisites

- AWS CLI configured with appropriate permissions
- Claude Code installed ([Setup Guide](https://code.claude.com/docs/en/setup))
- VS Code (optional - for visualizing files Claude creates)

---

## What We'll Build

Using only natural language prompts, we'll:

1. **Deploy Infrastructure** - VPC, EC2 instances, S3, CloudFront
2. **Manage EC2** - Stop/start instances with safety guardrails
3. **Deploy a Website** - Static site to S3 + CloudFront
4. **Bulk Operations** - Tag management across resources
5. **Clean Up** - Tear everything down

---

## Prompts

### 1. Deploy Infrastructure

```
I want to set up a lab environment in AWS for a CloudYeti tutorial.

Create and deploy a CloudFormation stack that includes:
- A VPC with a public subnet
- 3 EC2 instances: dev, staging, and prod (t3.micro, Amazon Linux 2023)
- Tag them all with Lab=CloudYeti-AI-Engineering
- Tag dev and staging with AutoStop=true
- Enable termination protection on the prod instance only
- An S3 bucket for static website hosting
- A CloudFront distribution pointing to that bucket with OAC

Name the stack "cloudyeti-ai-lab" and deploy it to us-east-1.

Show me the progress and give me all the resource IDs when done.
```

### 2. Stop Dev Instances

```
I need to stop all EC2 instances that are tagged with:
- Lab=CloudYeti-AI-Engineering  
- Environment=development

But DO NOT touch anything tagged Environment=production.

First show me what you're about to stop, then do it, then confirm they're stopped.
```

### 3. Check Instance Status

```
Show me the status of all my lab instances in a nice table - instance ID, name, environment tag, and current state.
```

### 4. Deploy Website

```
Create a sleek "Coming Soon" landing page for CloudYeti.

Requirements:
- Dark mode, professional tech aesthetic
- Animated background (subtle particles or gradients)
- CloudYeti branding with mountain/yeti theme
- Features: AWS Tutorials, AI Engineering, DevOps Labs
- CTA button linking to youtube.com/@CloudYeti
- Mobile responsive

Then upload it to my S3 bucket from the cloudyeti-ai-lab stack and invalidate the CloudFront cache.

Give me the live URL when done.
```

### 5. Start Instance + Get SSH Info

```
Start my dev instance back up (the one tagged Environment=development).

Once it's running, show me:
- The public IP address
- The instance state
- How I would SSH into it (just show the command, I'll handle keys separately)
```

### 6. Tag Audit & Bulk Update

```
Audit all my lab instances (Lab=CloudYeti-AI-Engineering).

Show me all their tags in a table, then add a new tag to ALL of them:
- Key: ManagedBy
- Value: ClaudeCode

Confirm when done.
```

### 7. Cleanup

```
Alright, clean up time.

Delete everything from the cloudyeti-ai-lab stack:
1. First, disable termination protection on the prod instance
2. Empty the S3 bucket (you can't delete a bucket with objects)
3. Delete the CloudFormation stack
4. Verify everything is gone

Don't leave any orphaned resources.
```

---

## The AI Engineering Workflow

1. **Define intent** - What do you want?
2. **Add constraints** - What should NOT happen?
3. **Verify** - Did it work?
4. **Iterate** - Refine and improve

---

## Resources

- 🔗 [Claude Code Setup](https://code.claude.com/docs/en/setup)
- 📺 [CloudYeti YouTube](https://youtube.com/@CloudYeti)
- 📝 [Blog Post: Everyone is an AI Engineer](https://blog.saurav.io/everyone-is-an-ai-engineer/)

---

**From Cloud Engineer to AI Engineer.** 🏔️
