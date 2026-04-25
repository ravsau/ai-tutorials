# Section 1: The Agentic Shift in Cloud Engineering

**Companion playlist:** [Agentic AI for Cloud Ops on AWS](https://www.youtube.com/playlist?list=PLQP5dDPLts67hOAy4IxfzwyrWwNSYbwzm)

This is the intro module. You don't need any AWS setup or tools installed to follow along — just watch. We'll set everything up together in Section 2.

If you want to try the demo yourself, keep reading.

## Deploy the Demo

```bash
./run-demo.sh deploy    # Deploy healthy VPC + EC2 web server
./run-demo.sh test      # Confirm it works
./run-demo.sh break     # Simulate infra misconfiguration (SG + NACL)
./run-demo.sh test      # Confirm it's broken
./run-demo.sh destroy   # Clean up when done
```

## Agent Prompts

Use these with any terminal-based agent that has AWS CLI access: Claude Code, OpenAI Codex, Gemini CLI, Kiro, etc.

**Prompt 1 — Investigate:**
```
Our web server at <IP> is unreachable. It was working earlier today.
The team says they tightened security but nobody knows what changed.
Investigate why traffic can't reach it. Check the instance, security
groups, NACLs, and route tables.
```

**Prompt 2 — Fix it:**
```
Fix both issues you found. Update the security group to allow port 80
and remove the NACL deny rule blocking port 80. Then verify the web
server is reachable.
```

Replace `<IP>` with the public IP from `./run-demo.sh deploy` output.

## Diagrams

Visual references for Lecture 1.2 — open these in [Excalidraw](https://excalidraw.com) by dragging the file in.

| File | What it shows |
|------|---------------|
| `1-four-pillars-of-an-agent.excalidraw` | The 4 things that make something agentic: Goal, Tools, Reasoning Loop, Autonomy |
| `2-agentic-spectrum.excalidraw` | The spectrum from plain LLM call → ChatGPT/Claude web → fully agentic (Claude Code) |
| `3-agent-vs-script-vs-llm.excalidraw` | 2-axis chart: LLM can reason but can't act, script can act but can't reason, agent does both |
| `4-agent-loop-cloud-ops.excalidraw` | The agentic loop: goal → model → action → tools → observation → back to model → output |
