# Demo Outputs — Pi + Qwen 3.6 Test Runs

Real outputs from running the [demo prompts](../demo-prompts/) on Saurav's 128GB M3 Mac with Qwen 3.6 27B Q4_K_M via `ollama launch pi`.

Viewers in the [Qwen 3.6 video](https://youtu.be/VjCPqmESUCg) asked for the actual generated outputs side-by-side. Same here.

## Expected files (will be added once recording is done)

| File | What it contains |
|---|---|
| `01-github-repos-session.txt` | Pi's session for Test 1 — GitHub repos markdown table prompt |
| `01-github-repos-output.md` | The actual table Pi produced |
| `02-bug-fix-session.txt` | Pi's session for Test 2 — debugging the auth middleware |
| `02-bug-fix.diff` | The diff Pi committed to fix the bug |
| `03-hard-refactor-session.txt` | Pi's session for Test 3 — fetch → @platform/http refactor |
| `03-hard-refactor.diff` | What Pi produced (partially correct, honest result) |
| `03-hard-refactor-test-results.txt` | Which tests passed vs failed after Pi's refactor |
| `03-hard-refactor-claude.diff` | Same prompt to Claude Code on Sonnet/Opus, for comparison |

## Why this folder exists

The video's verdict ("80% of work moves local, 20% stays on Claude") rests on these outputs being real and reproducible. If a viewer wants to see exactly what Pi produced at each step, they can read the diffs and sessions here without having to re-run anything.

## Reproducing on your own machine

Each demo prompt's markdown file has the exact prompt + setup. Clone this repo, install the [setup](../README.md), and run the same prompts. Your tokens-per-second and exact code will vary, but the *pattern* (works for Test 1 + 2, partial on Test 3) should reproduce on any 32-128GB Apple Silicon Mac.

PRs welcome with your own outputs from different hardware — open one and we'll add it as a comparison datapoint.
