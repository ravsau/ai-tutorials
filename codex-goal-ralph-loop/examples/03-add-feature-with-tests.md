# Example 3 — Add a Feature With Tests (TDD-style)

Tests as the executable spec. You write the test first, Codex makes it pass. `/goal` will iterate until both the new test and existing tests are green.

## Setup

Existing repo with a passing test suite.

## Goal prompt

```
/goal Add CSV export functionality to this app. Steps:

  1. Add a new test file at tests/csv-export.test.ts that tests:
     - exportToCSV(items) returns a valid CSV string
     - The CSV includes a header row with the column names: id, title, createdAt
     - Each item becomes a row with values matching the columns
     - Special characters (commas, quotes, newlines) in titles are properly escaped
     - An empty array returns just the header row

  2. Implement the function in src/csv-export.ts

  3. Wire it into the existing /api/tasks/export endpoint in src/server.ts so
     a GET request returns the CSV with Content-Type: text/csv

  4. Add a Jest test for the endpoint that confirms it returns 200, the
     correct content-type, and a valid CSV body

Run `npm test` after each change. Continue until all tests pass — including
existing tests, do not break them. Stop when the suite is green.
```

## What Codex should do

1. Read existing project structure and patterns
2. Write the test file first
3. Watch the new tests fail (expected)
4. Implement the function
5. Wire it into the endpoint
6. Run all tests
7. Fix anything broken in existing tests
8. Stop when green

## Approximate runtime

10-20 minutes. CSV escaping has edge cases that often cause 1-2 iterations.

## Watch for

- **Library temptation:** Codex may want to install `papaparse` or similar. The prompt as written allows that; if you want pure-JS, add `Implement CSV escaping yourself, do not add new dependencies.`
- **Edge case coverage:** the special-character test usually catches the first attempt's escaping bug. That's the loop working as intended.

## Variation — Bug fix with regression test

Same pattern but inverted:

```
/goal There is a bug in src/parser.ts where input with trailing whitespace
causes a TypeError. Reproduce it with a new test in tests/parser.test.ts,
fix the bug in the source, confirm the new test passes and no existing
tests broke. Stop when green.
```
