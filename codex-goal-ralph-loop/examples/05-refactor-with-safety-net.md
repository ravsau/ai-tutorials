# Example 5 — Refactor Behind a Safety Net

`/goal` for refactors works only when you have tests as a safety net. The tests are the verification step; without them, "is the refactor done?" has no clear answer and Codex will loop forever or stop at a half-state.

## Setup

A repo with a passing test suite that covers the area being refactored.

## Goal prompt

```
/goal Refactor src/db.ts from callback-style to async/await. Constraints:

  - Do not change function signatures from the caller's perspective
  - Do not modify any file under tests/
  - Keep all existing public exports

Steps:
  1. Run `npm test` first to confirm the baseline is green
  2. Convert each function in src/db.ts from `(args, callback) => callback(err, result)`
     to `async (args) => { return result; throw err; }`
  3. Update internal call sites (within src/) that use the old style
  4. Run `npm test` after each function conversion
  5. If any test breaks, fix the conversion before moving to the next function

Stop when:
  - src/db.ts has zero callback-style functions remaining
  - All tests still pass
  - No new lint errors

Do not use util.promisify wrappers — write actual async functions.
```

## What Codex should do

1. Run baseline tests
2. Read `src/db.ts` to identify callback functions
3. Refactor one function
4. Run tests
5. If green, refactor next function
6. If red, fix before continuing
7. Stop when all functions are async/await and tests pass

## Approximate runtime

15-40 minutes for a typical 200-300 line file. Heavier refactors stall on `/goal`'s context window.

## Watch for

- **Half-refactored state:** if `/goal` stops while some functions are still callback-style, the goal needs a clearer "all done" check
- **Test breakage cascade:** changing function shape can break unrelated tests. The "stop and fix before moving on" instruction prevents the cascade

## When `/goal` is the WRONG tool for refactor

Skip `/goal` and use `/plan` (or just talk to Codex normally) when:

- No test coverage on the refactor target
- The refactor requires architectural judgment (e.g., "split this monolithic class into smaller pieces — but you decide where the seams are")
- The "done" condition is subjective (e.g., "make this more readable")

`/goal` is for clear targets, not creative work.

## Variation — Type narrowing pass

```
/goal Add explicit return types to every exported function in src/.
Constraints: do not modify behavior, do not change parameter types,
do not break existing tests. Run `npx tsc --noEmit` and `npm test`
after each file. Stop when both commands pass with zero errors and
no exported function has an inferred return type.
```
