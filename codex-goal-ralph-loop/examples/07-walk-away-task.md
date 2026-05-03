# Example 7 — The "Walk Away" Task (good for the video demo)

Pick something that takes long enough that you can plausibly leave the room and come back to a finished result. This is the format that makes the best demo footage.

## Setup

A real codebase you actually use. The point of this one is realism — a polished result on synthetic test cases is less convincing than a real result on real code.

## Goal prompt — option A (documentation)

```
/goal Generate a complete README.md for this repository. Steps:

  1. Read the existing source code under src/ to understand what
     this project does
  2. Read package.json to identify the tech stack and scripts
  3. Look at any existing tests to understand the public API
  4. Write a README that includes:
     - One-line description of what this project does
     - Tech stack (list the major dependencies)
     - Quick start (install, run, test)
     - Project structure (a tree of the main directories)
     - API reference for any exported functions or HTTP endpoints
     - Contribution notes (link to CONTRIBUTING.md if it exists)
  5. Verify the README accurately matches the code by reading it back

Constraints:
  - Do not invent features that don't exist
  - If you can't determine something, mark it as TODO
  - Use plain language, not buzzwords
  - Include code blocks for actual commands

Stop when the README is written and you've reviewed it once for accuracy.
```

## Goal prompt — option B (test backfill)

```
/goal This project has a tests/ directory but coverage is thin. Steps:

  1. Run `npm test -- --coverage` and identify files under src/ with
     less than 80% line coverage
  2. For each undercoverred file, add tests in tests/ that:
     - Cover the happy path of every exported function
     - Cover at least one error case per function
     - Use the same testing patterns as existing tests (read them first)
  3. Run `npm test -- --coverage` after each file to confirm coverage
     went up
  4. Stop when every file under src/ has at least 80% line coverage

Constraints:
  - Do not modify any source file in src/
  - Do not weaken assertions — write specific expected values
  - Do not add tests for files in vendor/ or node_modules/
```

## Goal prompt — option C (dependency upgrade)

```
/goal Run `npm outdated` and upgrade every minor and patch version that
is behind. Skip major version upgrades — those need human review.
Steps:

  1. Run `npm test` first to confirm baseline is green
  2. For each package showing a minor/patch upgrade in `npm outdated`:
     a. Upgrade it: `npm install <pkg>@latest --save-exact`
     b. Run `npm test`
     c. If tests pass, commit the upgrade with message "deps: bump <pkg> to <version>"
     d. If tests fail, revert the change and note the package in
        .codex/upgrade-blockers.md with the failing test
  3. After all minor/patch upgrades are done, write a summary at
     .codex/upgrade-report.md listing what was upgraded and what was
     blocked

Stop when no minor/patch upgrades remain or every remaining one is blocked.

Do not upgrade across major versions. Do not skip the test run between
upgrades.
```

## Why these are good demo material

All three have:
- Long enough runtime to show "walking away" is real (15+ minutes)
- Visible end state (README file, coverage report, commit history)
- Clear stop condition
- Real value if it works (not toy demos)

## Approximate runtimes

| Variant | Runtime |
|---|---|
| README generation | 5-15 minutes |
| Test backfill | 30-90 minutes |
| Dependency upgrade | 10-30 minutes (mostly waiting for tests) |

## Watch for in the demo

- **Pause and resume:** part of the demo could be `/pause` mid-run, show that the state persisted, then `/resume`
- **`/side` usage:** ask a question while the goal is running, demonstrate that the goal continues
- **Final review:** read the output (the README, the coverage report, the commit log) on camera so viewers see what was actually built
