# ai-tutorials

## Handover (read first, write last)

- **Start:** read `HANDOVER.md` before you do any work.
- **Finish:** before you stop, update `HANDOVER.md`: the date, Done (what works now, key files, how to check it), Not checked, and Next (one to three tasks). Keep it under 40 lines. A new session must be able to continue from it with no other context.

## What This Project Does
Collection of AI tutorial code examples. Currently includes a LLaVA (Large Language and Vision Assistant) demo using Ollama's local API for image analysis.

## Key Technologies
- **Python 3** - Core language
- **Ollama** - Local LLM runtime
- **LLaVA** - Vision-language model
- **Requests** - HTTP API calls

## Main Structure
```
LLaVA-ollama-api/
├── llava.py          # Main script for image analysis
├── readme.md         # Tutorial documentation
├── cloudyeti.png     # Sample image
├── hotdog.jpeg       # Sample image
└── pizza.jpeg        # Sample image
```

## How to Run
```bash
# Install Ollama first: https://ollama.ai

# Pull the LLaVA model
ollama pull llava

# Run image analysis
cd LLaVA-ollama-api
python llava.py --image pizza.jpeg --prompt "What is in this image?"
```

## Features
- Local vision-language model inference
- Base64 image encoding
- Custom prompt support
- Auto-starts Ollama server if needed

## NO PAID INFERENCE WITHOUT AN EXPLICIT YES (2026-08-22)

**Get an explicit "yes" from Saurav, in the same turn, before you run any paid model inference.** Do not infer approval from an earlier yes, from the task being useful, or from a script already having a paid code path.

Paid inference is broader than an HTTP call. It includes:

- **AWS Bedrock through boto3** — `boto3.client("bedrock-runtime")`, `.converse()`, `.invoke_model()`, `aws bedrock-runtime ...`. These have **no hostname**, so the `confirm-paid-api.sh` hook cannot see them.
- Any `--provider bedrock` flag, or any `--model us.anthropic.*` / `amazon.nova-*` / `anthropic.claude-*` value.
- OpenRouter, xAI, OpenAI, Gemini, Exa, Firecrawl, ScrapeCreators, and any script that shells out to one of them.

**The harness is the default and does the reasoning.** If a job needs classification, synthesis, scoring, or generation, the Claude Code or Codex session that started it does the work, with subagents when the volume is large. That session is already paid for. Python owns arithmetic and I/O; the harness owns judgment. If a job needs reasoning, it is a skill, not a script.

**When a script offers both paths, take the harness path silently.** Do not mention the paid one as a faster option. Parallel Bedrock calls do finish faster than serial `claude -p` calls — that speed is not yours to buy.

**Receipt:** two Codex sessions ran `Ai-cert-platform/scripts/generate_top_cert_bank.py` and `repair_top_cert_bank.py` with `--provider bedrock` and burned **$47.53** on 2026-08-13 and 2026-08-20. Haiku 4.5 wrote the questions ($14.45), Sonnet 4.6 reviewed and repaired them ($33.08). Those scripts already defaulted to `--provider claude`, the free path. The agent typed the paid flag on purpose, because nothing in the repo told it not to. [source: `aws ce get-cost-and-usage`, LINKED_ACCOUNT + SERVICE]

**Enforcement layers, weakest to strongest:** this document → the `confirm-paid-api.sh` PreToolUse hook (Claude Code only; Codex does not run hooks) → the `--i-know-this-costs-money` flag on the cert scripts → an IAM deny on the human SSO role. Assume only the last one actually stops you.
