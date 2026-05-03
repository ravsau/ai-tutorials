# Example 4 — Build a CLI Tool From Scratch

Single-file scope. Good demo because the success condition is observable in your terminal — you literally run the tool at the end.

## Setup

Empty directory.

## Goal prompt

```
/goal Build a small CLI tool called `tokens` that estimates the token
count of a file using a simple word-count approximation (1 token ≈ 0.75
words). Requirements:

  - Single Node.js script: tokens.js (or tokens.ts compiled)
  - Usage: tokens <file> outputs "<file>: ~N tokens (M words, L lines)"
  - tokens --help prints usage
  - tokens with no args reads from stdin
  - Error message and exit code 1 if file does not exist

Test it on three real files of different sizes (the script itself, a
README, and one larger source file) and verify output is sane. Make it
executable with `chmod +x` and a `#!/usr/bin/env node` shebang.

Stop when:
  - tokens README.md prints a sensible result
  - tokens --help works
  - cat README.md | tokens works (stdin path)
  - tokens nonexistent.txt prints an error and exits with code 1
```

## What Codex should do

1. Write `tokens.js` with all four behaviors
2. Add the shebang
3. `chmod +x tokens.js`
4. Run all four test cases
5. Fix any failures
6. Stop

## Approximate runtime

5-10 minutes. CLI tools are simpler than APIs.

## Watch for

- **Over-engineering:** Codex might want to use a heavy library (commander, yargs). Prompt as-written allows it; if you want minimal, add `Use only Node built-ins, no dependencies.`
- **Stdin edge case:** the `cat | tokens` path is the test that usually catches a bug. Good signal that the loop is working.

## Variation — Wrap an existing CLI

```
/goal Build a wrapper script that runs `git status --porcelain` and
prints a colored summary: green for staged, yellow for modified, red
for untracked, with counts. Use ANSI codes directly, no dependencies.
Test it in this repo and a sibling repo. Stop when output matches
expected colors and counts.
```
