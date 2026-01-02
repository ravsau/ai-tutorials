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

1. **Deploy EC2 Infrastructure** - VPC and EC2 instances via CloudFormation
2. **Manage EC2** - Stop/start instances with safety guardrails
3. **Deploy a Serverless API** - Lambda + API Gateway
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
- Tag dev and staging with AutoStop=true, Environment=development and Environment=staging
- Tag prod with Environment=production
- Enable termination protection on the prod instance only

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

### 4. Deploy Serverless API

```
Create and deploy a serverless API with the following:

- A Lambda function called "cloudyeti-greeting" that:
  - Takes a JSON body with a "name" field
  - Returns a JSON response: {"message": "Hello {name}, welcome to CloudYeti! You're now an AI Engineer 🏔️"}
  - If no name provided, return {"message": "Hello Cloud Engineer! Provide your name to get a personalized greeting."}

- An API Gateway HTTP API that triggers the Lambda
- Give me the live endpoint URL when done

Deploy everything to us-east-1 and tag with Lab=CloudYeti-AI-Engineering.
```

### 5. Test the API

```
Test the API for me - send a POST request with {"name": "CloudYeti"} and show me the response.
```

### 6. Start Instance + Get SSH Info

```
Start my dev instance back up (the one tagged Environment=development).

Once it's running, show me:
- The public IP address
- The instance state
- How I would SSH into it (just show the command, I'll handle keys separately)
```

### 7. Tag Audit & Bulk Update

```
Audit all my lab instances (Lab=CloudYeti-AI-Engineering).

Show me all their tags in a table, then add a new tag to ALL of them:
- Key: ManagedBy
- Value: ClaudeCode

Confirm when done.
```

### 8. Cleanup

```
Alright, clean up time.

Delete everything from the lab:
1. First, disable termination protection on the prod instance
2. Delete the cloudyeti-ai-lab CloudFormation stack
3. Delete the Lambda function and API Gateway we created
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
- 📝 [Blog Post: Everyone is an AI Engineer](https://blog.saurav.io/everyone-is-an-ai-engineer)

---

**From Cloud Engineer to AI Engineer.** 🏔️
