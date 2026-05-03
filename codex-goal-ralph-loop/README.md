# OpenAI's `/goal` — Codex Just Made the Ralph Loop Official

> Companion repo for the CloudYeti video on Codex CLI 0.128.0's `/goal` command. Setup, the Ralph backstory, and 7 example goals you can copy and adapt.

OpenAI shipped `/goal` in Codex CLI 0.128.0 on May 2, 2026. Tibo (@thsottiaux), an OpenAI Codex employee, called it *"the most consequential thing we have shipped in codex"* — the post hit 118,000 views in under 12 hours.

Here is what it actually does, where it came from, and how to use it well.

---

## What `/goal` does

You give Codex a goal. It runs a Plan → Execute → Test → Refine loop and **does not stop until the goal is reached**. State persists between sessions. You can pause, resume, and reset.

This is fundamentally different from `/plan`:

| | `/plan` | `/goal` |
|---|---|---|
| Lifespan | Single conversation | Persists across sessions |
| Behavior | Gather context, ask questions, propose steps | Plan, execute, test, refine — keep going until done |
| Stop condition | When you stop responding | When the goal is reached (or you explicitly pause/reset) |
| Use case | "Help me figure out what to do" | "Just do this thing" |

---

## The Ralph backstory (why this matters)

In February 2024, **Geoffrey Huntley** — a solo dev (ex-Atlassian, ex-Sourcegraph) — wrote a 300-line bash script that just kept feeding the same prompt to an agent in a loop until the task was done. He named it **Ralph** after Ralph Wiggum from The Simpsons — *"the stupidly persistent character who always eventually gets there."*

The pattern exploded in late 2025. Every serious agent-harness builder copied some version of it.

In May 2026, OpenAI made it official. Felipe Coury (OpenAI engineer) was explicit on X:

> *"/goal also lands in Codex CLI 0.128.0. Our take on the Ralph loop: keep a goal alive across turns. Don't stop until it's achieved. Built by my co-worker and OpenAI mentor Eric Traut, aka the Pyright guy."*

**Eric Traut** — the creator of Pyright (Microsoft's TypeScript-style type checker for Python) — implemented `/goal`. The credit chain is: Huntley wrote Ralph → community refined the pattern → Traut shipped it as an OpenAI primitive.

That backstory matters because it tells you what `/goal` is good at: **stupidly persistent task completion on a clear objective**, not creative ambiguous work.

---

## Enable it

`/goal` is behind a feature flag.

### Option 1 — one-liner

```bash
codex features enable goals
```

### Option 2 — config.toml

Add to `~/.codex/config.toml`:

```toml
[features]
goals = true
```

### Requirements

- **Codex CLI v0.128.0 or later** (run `codex --version`)
- Works in the **desktop app** *after* you enable it via the CLI

Update first if you don't see `/goal` in your slash command list:

```bash
npm install -g @openai/codex@latest
```

---

## Use it

### In the CLI

```bash
codex
> /goal Build a small Express API with three endpoints,
> write Jest tests for each, make all tests pass, then
> add input validation and rate limiting middleware.
```

Codex starts the Plan → Execute → Test → Refine loop. It will:

1. Plan the work into subtasks
2. Execute each subtask (write code, run commands, edit files)
3. Test the result
4. Refine if tests fail
5. Repeat until the goal is reached or you pause it

### Companion command — `/side`

While a `/goal` is running, you can use `/side` to ask Codex questions **without interrupting the goal**. The agent will pause briefly, answer, then resume.

```
> /side what is the rate limit you set?
```

### Pause, resume, reset

```
> /pause
> /resume
> /reset
```

State persists across sessions. You can close the terminal and resume tomorrow.

---

## How to write a `/goal` that actually works

Most `/goal` failures come from vague objectives, not model limitations. The bar:

- **Specific outcome:** what does "done" look like? (e.g., "all tests pass", "endpoint returns expected JSON")
- **Concrete constraints:** what should the code look/behave like? (e.g., "use Fastify, not Express")
- **Verification path:** how does Codex check it's done? (e.g., "run `npm test` and confirm 0 failures")
- **Out-of-scope:** what should it NOT touch? (e.g., "don't modify existing routes, only add new ones")

Bad goal:
> *"Add rate limiting to my API."*

Good goal:
> *"Add rate limiting middleware to the existing Express server in src/server.ts. Limit each IP to 100 requests per minute on the /api/* paths. Use the express-rate-limit package. Add a Jest test in tests/rate-limit.test.ts that verifies the 101st request returns 429. Run `npm test` to verify all tests pass before stopping."*

The good goal has: specific scope, exact tools, exact endpoints, exact threshold, named test file, explicit done condition. `/goal` runs in a loop — every detail you skip is a detail it might guess wrong on every iteration.

---

## See also

- [`REAL-WORLD-DEMOS.md`](./REAL-WORLD-DEMOS.md) ⭐ — **the wow material.** 13 documented runs from the first 7 days post-launch: 300 bugs fixed overnight, 6.8M tokens at 94% cache hit, $4,200 in Stripe revenue from auto-built apps, OpenAI's own 1M-lines-of-production-code Symphony experiment.
- [`examples/`](./examples/) — 7 ready-to-copy `/goal` prompts for common tasks
- [`FAQ.md`](./FAQ.md) — questions before they hit the YouTube comments
- [`demo-outputs/`](./demo-outputs/) — actual sessions from the video (added after recording)

## Citations

All claims above sourced via X (Twitter) on 2026-05-03 using xAI Grok `x_search`:

- **@thsottiaux (Tibo, OpenAI Codex), 2026-05-03** — *"/goal might be the most consequential thing we have shipped in codex."*
- **Felipe Coury (OpenAI engineer), 2026-05-02** — *"Our take on the Ralph loop. Keep a goal alive across turns. Don't stop until it's achieved. Built by my co-worker and OpenAI mentor Eric Traut, aka the Pyright guy."*
- **Geoffrey Huntley** — original Ralph creator (Feb 2024 bash loop, named after Ralph Wiggum)
- **Eric Traut** — Pyright creator, implemented `/goal`
- **@UnDrogado_poeta, 2026-05-02** — *"This is the official version of the Ralph loop, where the agent runs in a loop and doesn't exit until it fully solves the task."*
- **@hirokaji_, 2026-05-02** (translated) — *"prompt is a single request. plan is step decomposition. goal is the achievement condition that runs through the entire work. Codex is approaching a 'goal-bearing execution environment.'"*

## Companion video

[CloudYeti — OpenAI's /goal Just Made Ralph Official](https://youtube.com/@CloudYeti) *(link will be filled in when the video is published)*

If something here is wrong or out of date, [open an issue](https://github.com/ravsau/ai-tutorials/issues/new). I'd rather get corrected than be wrong.

## License

MIT.
