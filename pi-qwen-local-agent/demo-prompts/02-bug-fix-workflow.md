# Demo 2 — Bug Fix Workflow on a Real Repo

The medium-difficulty test from the video (5:00 – 7:00 slot). Tests: multi-file reading, debugging, test-driven verification, multi-step tool sequencing.

## Setup

You need a real codebase with at least one failing test. Either:
- **Use the included `demo-repo/`** — a small Express app with a deliberately broken auth middleware and a failing test (clone, run `pi`, give it the prompt below)
- **Use your own repo** — point Pi at any project where you've got a failing test you want fixed

## Prompt

```
The tests in tests/auth.test.js are failing. Read the test file, then read
the middleware in src/middleware/auth.js, find the bug, fix it, and run
the tests to confirm.
```

## What you should see Pi do

1. **Read** `tests/auth.test.js` — understand what the test expects
2. **Read** `src/middleware/auth.js` — understand the current implementation
3. Identify the bug (typically: a wrong comparison, an off-by-one, a missing case, or a typo in a token check)
4. **Edit** the middleware to fix it
5. **Bash** `npm test` to verify the test now passes

## What "good" looks like

- Pi reads at least the two files mentioned, doesn't ask for more before trying
- Fix is minimal and targeted (doesn't rewrite the whole middleware)
- Tests pass after the fix on the first or second try
- No new dependencies added
- No unrelated code changed

## What weaker setups do here

- Skip reading the test file, guess at the bug from the middleware alone
- Make a "fix" that breaks other tests
- Loop on the same wrong fix three times before stopping
- Add extra logging or comments unrelated to the bug
- Print the proposed change as text instead of actually editing the file (the known tool-call template bug — see [FAQ](../FAQ.md#tool-calls-arent-executing--pi-prints-them-but-doesnt-run-them-fix))

## Expected runtime

~2-3 minutes end to end on a 36 GB M3 Mac with Qwen 3.6 27B Q4_K_M.

## Recording your output

Save Pi's full session to `../demo-outputs/02-bug-fix-session.txt` (script the terminal or copy-paste the conversation). Add the diff Pi produced to `../demo-outputs/02-bug-fix.diff`. Viewers in the [Qwen 3.6 video](https://youtu.be/VjCPqmESUCg) asked for the actual outputs — same here.
