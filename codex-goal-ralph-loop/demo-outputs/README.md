# Demo Outputs — `/goal` Test Runs

Real outputs from running the [example goals](../examples/) on Saurav's Codex CLI v0.128.0+ setup. Added after the video records.

## Expected files (added after recording)

| File | What it contains |
|---|---|
| `01-express-api-session.txt` | Full Codex session for Example 1 (build Express API) |
| `01-express-api-result/` | The actual repo Codex built |
| `02-fix-tests-session.txt` | Session for Example 2 (fix failing tests) |
| `02-fix-tests-diff.diff` | Diff Codex committed to fix the bugs |
| `07-walk-away-readme.md` | Generated README from Example 7 |
| `runtime-stats.md` | How long each goal took, how many iterations, observed loop count |

## Why this folder exists

Per the comment requests on the [Qwen 3.6 video](https://youtu.be/VjCPqmESUCg) — viewers wanted to see the actual generated outputs side-by-side. Same pattern here.

The video's verdict on `/goal` should be backed by real evidence, not just claims. If `/goal` ran for 15 minutes and produced a clean repo, you can read the diff. If it looped 12 times to fix a single bug, the session file will show it.

## Reproducing on your own Codex CLI

Each example in [`../examples/`](../examples/) is a self-contained `/goal` prompt you can paste into your Codex CLI (after enabling the feature). Your tokens-used and exact runtime will vary, but the pattern (Plan → Execute → Test → Refine) and the success/failure outcomes should reproduce.

PRs welcome with your own outputs from different setups — open one and we'll merge it as a comparison datapoint.
