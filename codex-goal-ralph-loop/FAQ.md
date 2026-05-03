# FAQ — `/goal` in Codex CLI

Pre-seeded from the X conversation around the launch (May 2-3, 2026). PR additions welcome.

---

## Why isn't `/goal` showing up in my Codex CLI?

Two reasons it might be missing:

1. **You're on an older Codex CLI version.** `/goal` shipped in v0.128.0 (May 2, 2026). Run `codex --version`. If you're below 0.128.0, update:
   ```bash
   npm install -g @openai/codex@latest
   ```

2. **The feature flag isn't enabled.** Even on the latest version, `/goal` is hidden behind a flag. Enable with one of:
   ```bash
   # Option 1: one-liner
   codex features enable goals
   ```
   ```toml
   # Option 2: edit ~/.codex/config.toml manually
   [features]
   goals = true
   ```

Restart Codex after enabling. Type `/` to see the slash command list — `/goal` should be there.

## Does `/goal` work in the Codex desktop app?

Yes, but you have to enable it via the CLI first. Once `[features] goals = true` is in `~/.codex/config.toml`, the desktop app picks it up. In the desktop app, you can either:

- Type the slash command: `/goal <objective>`
- Or write naturally: `Set a goal: <objective>`

A user on X (@BenjaminBadejo) noted that desktop-app threads might not auto-activate goal mode — you may need to explicitly say "set a goal" the first time in a thread.

## What's the difference between `/goal` and `/plan`?

| | `/plan` | `/goal` |
|---|---|---|
| Lifespan | Single conversation | Persists across sessions |
| Loop | One pass — propose plan, you approve, execute | Plan → Execute → Test → Refine in a loop |
| Stop condition | Plan is approved and executed | Goal is verifiably reached |
| Use case | "Help me figure out what to do" | "Just do this thing, don't stop until it's done" |

`/plan` is preparatory. `/goal` is autonomous execution. They compose naturally — use `/plan` when you're not sure what to ask for, then take that plan and run it as a `/goal`.

## How do I stop a goal that's running too long?

Inside the Codex session:

```
/pause
```

State persists. You can resume later:

```
/resume
```

Or reset entirely:

```
/reset
```

Closing the terminal also pauses the goal. Re-open Codex and `/resume` works across sessions.

## Can I ask Codex something while a goal is running?

Yes. Use `/side`:

```
/side what is the rate limit you set in the middleware?
```

Codex pauses briefly, answers, then resumes the goal. The goal state is unaffected.

## What happens if the goal is impossible?

`/goal` keeps trying. It does not have a "give up" reflex. If the task is impossible (broken environment, missing dependency it can't install, fundamentally wrong constraint), the loop will run until you `/pause` or `/reset`.

This burns tokens. Two safeguards:

1. **Watch the first 5 minutes.** If Codex is making the same fix repeatedly, the constraint is wrong. Pause and refine the goal.
2. **Set a soft timeout in your goal:** "Stop and report a blocker if you've made 5 failed attempts at the same step."

## Does `/goal` count against my Codex usage limits?

Yes. A `/goal` running for hours can consume a lot of tokens. One X user (@rafaelobitten) reported burning through three Pro accounts during 40 sprints of `/goal` testing.

Practical guidance:
- Use `/goal` for tasks where the value of completion > the token cost
- Pause and inspect mid-run for long-horizon tasks
- For very long runs, consider running on the Plus tier where the bill is metered usage rather than capped sessions

## Can `/goal` use external tools or only built-in ones?

It uses whatever Codex's tool set already supports. That includes:
- File reads, writes, edits
- Shell commands (so npm, git, anything CLI-accessible)
- Web search if enabled

It does NOT have a "permission to access X new tool" bootstrapping mechanism — what Codex could do before, `/goal` can do.

## What's "Ralph"? I keep seeing it mentioned.

Geoffrey Huntley (a solo dev, ex-Atlassian, ex-Sourcegraph) wrote a 300-line bash script in February 2024 that just ran the same prompt to an agent in a loop until the task was done. He named it Ralph after Ralph Wiggum from The Simpsons — "the stupidly persistent character who eventually gets there."

The pattern exploded across the agent-tool ecosystem in late 2025. OpenAI shipping `/goal` in May 2026 was the first time a major lab made it a first-class primitive. Felipe Coury (OpenAI engineer) explicitly credited Huntley: *"Our take on the Ralph loop."*

Connection to your existing tooling:
- The `/ralph` skill in CloudYeti's stack converts PRDs to a JSON format for autonomous agent runs — same family of pattern
- @KTLYST_labs on X reported running `/goal` against a PRD for "a couple of days" and getting a working system out — that's the Ralph loop + a structured spec

## Why is `/goal` better than just running `/plan` and then doing each step?

Three reasons:

1. **Verification is built in.** `/plan` proposes steps; you have to manually verify each one. `/goal` runs Plan → Execute → Test → Refine — verification is part of the loop, not a separate step you do.
2. **State persists.** A `/plan` is per-conversation. A `/goal` survives session restarts. You can start a goal at lunch, close your laptop, resume after dinner.
3. **No human-in-the-loop tax.** `/plan` requires you to approve each step. `/goal` runs uninterrupted until done. That's the point — autonomous execution on a clear objective.

## When should I NOT use `/goal`?

- **Creative work.** "Make this UI more beautiful" has no verification. The loop will run forever or stop arbitrarily.
- **Architectural decisions.** "Decide how to split this monolith" requires judgment. Use `/plan` to propose options, you decide, then `/goal` the chosen option.
- **Tasks without clear stop conditions.** If you can't write down what "done" looks like in concrete terms, `/goal` will guess — and probably wrong.
- **Tasks that need human approval mid-run** (e.g., production deploys). `/goal` runs uninterrupted by design.

## Can I see what other people are doing with `/goal`?

X is the best signal source — search "/goal codex" and filter to past 7 days. Notable practitioners as of May 2026:

- **@thsottiaux (Tibo, OpenAI Codex)** — the launch announcement
- **@KTLYST_labs** — PRD-driven multi-day autonomous builds
- **@hammadtariq** — running OpenClaw and Hermes in parallel with `/goal`
- **@PovilasKorop (AI Coding Daily)** — early YouTube hands-on testing
- **@hirokaji_** — Japanese-language deep technical breakdown

## How do I report bugs or request features for `/goal`?

OpenAI Codex GitHub: https://github.com/openai/codex

Or talk to Eric Traut on X — he implemented `/goal` and is responsive to bug reports.

---

**Last updated:** 2026-05-03. PR additions welcome at https://github.com/ravsau/ai-tutorials/issues
