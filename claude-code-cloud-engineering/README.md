# Claude Code for Cloud Engineering: You're an AI Engineer Now

(Single CloudFormation Stack: EC2 + Serverless API)

A CloudYeti lab demonstrating how to manage AWS infrastructure using Claude Code, deploying EC2 + Lambda + API Gateway in one CloudFormation stack.

📺 **Watch the video:** [YouTube Link]

---

## Prerequisites

- AWS CLI configured with appropriate permissions
- Claude Code installed ([Setup Guide](https://code.claude.com/docs/en/setup))
- VS Code (optional — for visualizing files Claude creates)

---

## What We'll Build (One Stack)

Using only natural language prompts, we'll:

1. **Deploy 3 EC2 instances** (default VPC)
2. **Deploy a Serverless API** (Lambda + API Gateway HTTP API)
3. **Stop/start EC2 instances** safely using tags
4. **Perform bulk tag audits** and updates
5. **Clean up everything** with one stack delete

---

## Prompts

### 1️⃣ Create ONE CloudFormation Template (EC2 + API)

**Goal:** Generate a single file that creates the foundational infrastructure.

```
Create a single CloudFormation YAML template named cloudyeti-lab.yml.

In the same stack, create:

EC2
- 3 t3.micro EC2 instances in the default VPC (us-east-1)
- Amazon Linux 2023
- Names:
  - cloudyeti-dev
  - cloudyeti-staging
  - cloudyeti-prod
- Tags:
  - All: Lab=CloudYeti-AI-Engineering
  - Dev: Environment=development
  - Staging: Environment=staging
  - Prod: Environment=production
- Keep SSH locked down by default.

Serverless API
- Lambda function: cloudyeti-greeting (Node.js 20 or Python 3.12)
- Behavior:
  - POST JSON with optional "name"
  - If name provided: Hello {name}, welcome to CloudYeti! You're now an AI Engineer 🏔️
  - Else: Hello Cloud Engineer! Provide your name to get a personalized greeting.
- API Gateway HTTP API
  - Route: POST /greet → Lambda

General
- Use default VPC + subnets
- Tag all resources with Lab=CloudYeti-AI-Engineering
- Include reasonable CloudFormation Outputs

Just create the template.
```

### 2️⃣ Deploy the Stack

```
Deploy the CloudFormation stack.

- Stack name: cloudyeti-ai-engineering-lab
- Region: us-east-1

After deployment:
- Show all CloudFormation Outputs
- Highlight EC2 instance IDs and API endpoint
```

### 3️⃣ Stop Dev Instance (Tag-Based Safety)

```
Stop all EC2 instances with tags:
- Lab=CloudYeti-AI-Engineering
- Environment=development

Steps:
1. Show what will be stopped (instance ID + name)
2. Stop the instance
3. Confirm it is stopped
```

### 4️⃣ Check Instance Status

```
Show a table of all EC2 instances with:
- Instance ID
- Name
- Environment tag
- Current state

Only include instances tagged:
Lab=CloudYeti-AI-Engineering
```

### 5️⃣ Test the API

```
Using the API endpoint from CloudFormation Outputs:

- Send a POST request to /greet
- Body: {"name": "CloudYeti"}

Show:
- The curl command
- The JSON response
```

### 6️⃣ Start Dev Instance + SSH Info

```
Start the cloudyeti-dev instance.

Once running, show:
- Instance state
- Public IP (if any)
- SSH command to connect

If SSH is blocked by design:
- Explain the safest temporary way to allow SSH
- Explain how to close it again
```

### 7️⃣ Tag Audit & Bulk Update

```
Audit all resources in the stack cloudyeti-ai-engineering-lab.

Show:
- EC2 instances and tags
- Lambda function and tags
- API Gateway and tags

Then add this tag to ALL supported resources:
- ManagedBy=ClaudeCode

Confirm when complete.
```

### 8️⃣ Cleanup (One Command)

**Note:** One stack delete removes everything.

```
Delete the CloudFormation stack:
- Stack name: cloudyeti-ai-engineering-lab
- Region: us-east-1

Before deleting:
- Show the stack resources that will be removed

After deleting:
- Confirm stack deletion
- Confirm no EC2 instances remain with Lab=CloudYeti-AI-Engineering
- Confirm the API endpoint no longer responds
```

---

## The AI Engineering Workflow

1. **Define intent** — What do you want?
2. **Add constraints** — What should NOT happen?
3. **Verify** — Did it work?
4. **Iterate** — Improve safely

---

## Why One Stack Matters

- **Idempotent deployments** — Predictable, repeatable
- **Easy updates** — Change template → deploy
- **No orphaned resources** — Everything created together, deleted together
- **One-command cleanup** — Delete stack, everything's gone

---

## Resources

- 🔗 [Claude Code Setup](https://code.claude.com/docs/en/setup)
- 📺 [CloudYeti YouTube](https://youtube.com/@CloudYeti)
- 📝 [Blog: Everyone is an AI Engineer](https://blog.saurav.io/everyone-is-an-ai-engineer)

---

**From Cloud Engineer to AI Engineer.** 🏔️
