# Example 2 — Fix a Test Suite That's Red

The classic "make the tests pass" task. `/goal` shines here because Plan → Execute → Test → Refine maps directly onto how a developer fixes a broken test suite.

## Setup

A repo with a failing test suite. Could be:
- Your own project with a known bug
- A practice repo with deliberately broken tests
- An open-source project's test suite running locally

## Goal prompt

```
/goal The test suite in this repo currently has failing tests. Run `npm test`
to see what is failing. Fix the failing tests by editing the source code,
not by changing the test assertions. Constraints:

  - Do not modify any file under tests/ or *.test.* files
  - Do not skip, comment out, or .skip() any test
  - Do not delete or rename test cases
  - Use minimal edits — fix only what is broken

After each round of edits, run `npm test`. Continue until 0 tests fail.
Stop the moment all tests pass.

If you find a test that appears intentionally broken (e.g. a TODO marker),
note it in a comment in the source file but still make the test pass.
```

## What Codex should do

1. Run `npm test` to see failures
2. Read the failing test files to understand expected behavior
3. Read the corresponding source files
4. Identify the bug
5. Make a minimal edit
6. Re-run tests
7. If still failing, iterate
8. Stop when green

## Approximate runtime

5-30 minutes depending on bug count and depth. Single-bug fixes often complete in 2-3 iterations.

## Watch for

- **Test-modification temptation:** `/goal` will sometimes try to "fix" by changing assertions. The "Do not modify under tests/" constraint prevents this.
- **Fix-breaks-other-test cycle:** if Codex's fix breaks a previously-passing test, it loops trying to fix both. Usually resolves within 5-7 iterations; if it doesn't, the bug requires architectural understanding `/goal` doesn't have.

## Why this is a good fit

This is the Ralph loop's home turf. Stupidly persistent test-fixing is exactly what Geoffrey Huntley's original 300-line bash script did. `/goal` is the official version of that workflow.
