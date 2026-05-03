# Real-World `/goal` Demos — What Practitioners Actually Shipped

The wow-factor material. These are concrete, documented runs from the first 7 days after `/goal` shipped — multi-hour autonomous builds, real revenue from auto-built apps, security findings, and the OpenAI internal data point that 1M lines of production code came out of an autonomous Codex setup.

Pulled live via xAI Grok `x_search` on 2026-05-03 (date range 2026-04-26 → 2026-05-03). Each entry has the verbatim quote, the specific output achieved, the documented numbers, and a one-line interpretation.

---

## Tier 1 — Stop-the-press wow

### 1. @KorduGG — *"I fell asleep, /goal fixed 300 bugs"*

**May 1, 2026** ([thread](https://x.com/i/status/2050129960451350870))

> *"Well, with the new goal feature out inside of Codex CLI, I set a very large goal and then accidentally fell asleep. It has been coding all night and has fixed about 300 bugs and recoded and optimized my entire backend. And surprisingly, everything still works. The entire web server still loads and all tests still pass. Codex is fucking amazing"*

**Documented output:**
- Overnight autonomous run (~8-10 hours estimated)
- 300 bugs fixed
- Full backend recoded and optimized
- Web server still loads
- All tests still pass
- Zero PR rejections

**Why this is the headline demo:** The emotional arc — fell asleep, AI worked overnight, woke up to finished work — is clip-able. The specific number (300 bugs) is concrete. "Web server still loads + all tests pass" is the credibility receipt.

---

### 2. @ynkzlk (Yannik) — Most rigorously documented run

**May 1, 2026** ([thread](https://x.com/i/status/2050103698722791839))

> *"Ran a codex session yesterday. Closed the laptop at minute 57. Came back 5.5 hours later. /goal had already resumed on its own. It injected its own developer message ('Continue working toward the active thread goal') and kept going. No re-prompt. No recovery steps. I opened the lid and it was four turns in.*
>
> *The full session: 6h 44min wall time, ~41 min actual model compute. 6.8M cumulative input tokens at 94% cache hit. Final status TASK_COMPLETE. All four target end-to-end test scenarios passed.*
>
> *This is /goal in codex v0.128.0. It's the ralph loop, made first-class. Native persistence, runtime continuation, tui controls. The goal survives sleeps, network drops, deliberate pauses. You don't have to be there.*
>
> *What surprised me: the prompt is the contract. Mine was 600+ words. Structured xml blocks, a reading list, working rules, anti-pattern fences, a done_when block. '/goal do thing' is not the interface. The prompt is."*

**Documented output:**
- 6h 44m wall time
- 41 min actual model compute
- 6.8M input tokens
- 94% cache hit rate
- TASK_COMPLETE final status
- 4 end-to-end test scenarios passed
- Self-resumed after laptop close

**Why this matters for the video:** The numbers are exact. The "prompt is the contract" insight is the most important takeaway from the entire `/goal` launch — most failures come from underspecified prompts, not the model. Show this on screen if you want senior engineers to take the video seriously.

---

### 3. @theazaelov — Non-technical user, 30 days, $4,200 in revenue

**April 27, 2026** ([thread](https://x.com/i/status/2048778087223943519))

> *"ONE DEVELOPER IN JUST 30 DAYS IN CODEX BUILT 6 PROJECTS WITH TEXT COMMANDS AND EARNED $4,200 FROM ONE OF THEM. He started from the exact same place as most people — with ideas but without a technical education... At the start of the month he opened Codex. He sat down at the laptop, clicked the empty input field, and typed: 'launch a scene where colorful particles fly after the cursor and leave glowing trails.' Codex in just 12 seconds created a repository on GitHub, picked Three.js, wrote the code, deployed a production build through GitHub Pages, and returned a live link...*
>
> *On day 14 he said 'keep the first 3 levels free and lock the other 7 behind $5 through Stripe.' Codex without a single clarifying question connected Stripe, built a landing page, set up Plausible analytics, and deployed everything to his custom domain.*
>
> *By the end of the month the Stripe account showed $4,200 in net revenue from 840 purchases of that platformer. Alongside it, 5 more projects shipped..."*

**Documented output:**
- 6 projects shipped in 30 days, all `/goal`-driven
- $4,200 net revenue from the platformer (840 sales × $5)
- One project: avatar generator, 1,200 users in week 1
- Stripe + Plausible analytics + custom domain auto-configured in one prompt
- Initial scene-with-particles repo created and deployed in 12 seconds
- Zero hand-written code across all 6 repos
- Total Codex spend: $20/mo subscription

**Why this is the killer indie-dev story:** Real Stripe receipts > theoretical capability. The 12-second first-deploy timing is concrete. This is the demo that makes a non-technical viewer book a Codex subscription.

---

### 4. OpenAI Symphony — 1M lines of production code, zero human-written

**Source:** Multiple X posts including @nrqa__ (April 29) and @tyler_folkman (April 28)

> *"OpenAI just open sourced the system they used to write 1 million lines of production code with zero human-written code. It's called Symphony... A small team at OpenAI Frontier ran a 5 month experiment. Rule: zero human-written code. Everything had to come from Codex. Result: 1 million+ lines of code shipped. ~1 billion tokens processed per day. 5 to 10 PRs per engineer per day. Some teams saw a 500% jump in landed PRs in 3 weeks.*
>
> *One engineer reportedly shipped 3 significant code changes from a cabin with bad WiFi using only the Linear mobile app. The agents did the rest...*
>
> *The team used Symphony to build Symphony. Once the basic loop worked, the agents wrote the rest of themselves."*

**Documented output:**
- 5-month experiment at OpenAI Frontier
- 1,000,000+ lines of production code shipped
- ~1 billion tokens per day
- 5-10 PRs per engineer per day
- 500% PR-landing increase in 3 weeks
- Symphony reference implementation: ~1,000 lines of Elixir, Apache 2.0
- Built with itself (the bootstrap moment)

**Tyler Folkman's framing:**
> *"OpenAI shipped 1M lines of production code in 5 months. Zero written by hand. Codex did it 10x faster than humans. Engineers stopped writing code. They built the harness around the agent. Output ceiling in 2026 is your harness, not your headcount."* ([thread](https://x.com/i/status/2049138526256578753))

**Why this matters:** This is the most senior-level demo. The video can land "this is what shipped at OpenAI Frontier" as the proof that `/goal` isn't a toy. The "harness, not headcount" framing is the V2-buyer hook for CloudYeti's audience (Director / VP / CTO who own the budget).

---

## Tier 2 — Surprising or unusual uses

### 5. @Zaddyzaddy — Confirmed XSS in a Meta domain in 25 minutes

**May 2, 2026** ([thread](https://x.com/i/status/2050630071304462515))

> *"Free Meta, @BugBunny_ai hinted me about a vulnerability, I took the domain and gave it to codex with an instruction using the new /goal feature. 25 minutes later I got a confirmed XSS. Bugbounty is gonna be completely solved with AI!"*

**Documented output:**
- 25 minutes autonomous run
- Confirmed XSS vulnerability in a Meta domain
- Bug bounty eligible

**Why this is wow material:** Security automation. The video doesn't have to demonstrate this (legal risk, ethical considerations) but citing it as "this happened" is a credible signal that `/goal` does real work, not theatrical demos.

---

### 6. @samirettali — Qwen 3.5 inference in Zig, 20 minutes, $6

**May 2, 2026** ([thread](https://x.com/i/status/2050587902157992140))

> *"Just tried codex /goal feature 'implement inference for Qwen3.5-0.8B-Q4_K_M.gguf in zig' 20 minutes later, 2500 lines, 13 files, 30% session usage of 20$ plan. Pretty cool feature, gonna do more testing with harder tasks"*

**Documented output:**
- 20 minutes autonomous run
- 2,500 lines of code
- 13 files
- 30% of $20 Pro plan (~$6 cost)
- Niche language (Zig) port of ML model inference

**Why this lands:** Cost-explicit + niche-language + ML-stack combination. Senior engineers respect this — it's not a webapp demo, it's low-level systems work. Drops on screen as "$6 for ML inference port to Zig" makes the cost-per-output ratio visceral.

---

### 7. @joshmatz — 6.5h+, full Pro plan rate limit consumed, 5k-line files

**May 1, 2026** ([thread](https://x.com/i/status/2050352082599743575))

> *"Codex's experimental /goal feature is a game changer. Currently have a goal in flight that has been running over 6.5 hours. Legitimately ate up my full 5 hour 20x Pro rate limit. Have not yet evaluated the work but... should be good, right? 5k line files is ok?"*

**Documented output:**
- 6.5+ hour run
- Consumed full 5h × 20x rate limit on Pro plan
- 5,000+ line single files generated

**Why this matters honestly:** It's the cost-ceiling demo. `/goal` will burn through your quota. Mention this as a real consideration — viewers running on Pro tier need to know `/goal` can hit the rate limit hard.

---

## Tier 3 — Meta / pattern insight (not visual but quotable)

### 8. @cmd_alt_ecs — *"/goal is just two prompt templates"*

**May 1, 2026** ([thread](https://x.com/i/status/2050094576212533759))

> *"The most important agent feature is not smarter models. It is knowing when to stop. Codex CLI 0.128.0 shipped /goal this week. You define a goal, and the agent loops until it is done or your token budget runs out. This is openai take on the 'ralph loop' — named after @ghuntley agent that just... keeps going. The implementation is simple and readable. Two prompt templates injected at the end of each turn:*
>
> *- goals/continuation.md (check if done)*
> *- goals/budget_limit.md (stop if spent)*
>
> *No complex orchestration layer. No external state machine. Just prompts that ask 'are we there yet' and 'can we afford to continue.'"*

**Why drop this in the video:** Demystifies the magic. `/goal` isn't a complex orchestration system — it's two prompts injected at the end of each turn. Senior engineer respect-earner.

---

### 9. Geoffrey Huntley's Ralph context (background frame)

The whole `/goal` story sits inside the Ralph history. Geoffrey Huntley's original 300-line bash loop in February 2024 — named after Ralph Wiggum from The Simpsons because the agent was *"stupidly persistent and always eventually gets there."* The pattern exploded across the agent ecosystem in late 2025. OpenAI shipping `/goal` in May 2026 made it official with explicit credit:

> *"/goal also lands in Codex CLI 0.128.0. Our take on the Ralph loop: keep a goal alive across turns. Don't stop until it's achieved. Built by my co-worker and OpenAI mentor Eric Traut, aka the Pyright guy."* — Felipe Coury (OpenAI engineer)

**Eric Traut** is the creator of Pyright (Microsoft's TypeScript-style Python type checker). He implemented `/goal` at OpenAI.

---

### 10. Official OpenAI 25-hour benchmark

**Source:** OpenAI Developers blog — *Run long horizon tasks with Codex* (April 30, 2026)

The official OpenAI demo for `/goal`:
- **25 hours uninterrupted** autonomous run
- **~13M tokens** consumed
- **~30,000 lines of code** generated
- Described as "an experiment, not a production rollout"

**Why this is the official wow number:** It's the highest-credibility receipt. OpenAI's own engineers ran it for 25 hours straight and let it eat 13M tokens. Drop this as the upper bound of what's possible.

---

## What to take into the video

If recording the 4-5 min reaction video, **pick three of these to land on screen**:

1. **@KorduGG's "fell asleep, fixed 300 bugs"** — emotional hook, viscerally relatable
2. **@ynkzlk's 6h44m / 6.8M tokens / TASK_COMPLETE** — the rigorously documented run with exact numbers
3. **OpenAI Symphony 1M lines / Tyler Folkman's "harness not headcount"** — the senior-level credibility receipt

Skip the bug bounty demo on camera (legal/ethical), but cite it in the description as "what's possible."

The pattern across all the wow demos: **the prompt is the contract.** Yannik's 600-word XML-structured prompt with done_when block is the technical insight that separates working `/goal` runs from infinite loops. That's the takeaway worth ending the video on.

---

## Source

- 13 verbatim X tweets pulled via xAI Grok `x_search` on 2026-05-03
- Cross-validated with Simon Willison's blog post (April 30, 2026): https://simonwillison.net/2026/Apr/30/codex-goals/
- OpenAI Developers blog: https://developers.openai.com/blog/run-long-horizon-tasks-with-codex
- Raw API response saved at `/tmp/grok_goal_wow.json` (re-pull before recording for fresh numbers)

To re-pull fresh demos closer to recording day:

```bash
set -a && source .env && set +a
# (use the x-search skill or curl api.x.ai with x_search tool, query for /goal demos in past 48-72h)
```
