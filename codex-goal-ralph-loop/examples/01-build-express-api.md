# Example 1 — Build an Express API From Scratch

A multi-step task that exercises Codex's full Plan → Execute → Test → Refine loop. Good first `/goal` to try because the success criteria is unambiguous (tests pass) and Codex has to make real architectural choices.

## Setup

Empty directory. Codex will scaffold everything.

## Goal prompt

```
/goal Build a small Express API with three endpoints in TypeScript:

  GET /health         → returns { status: "ok", uptime: <seconds> }
  POST /tasks         → creates a task; body: { title, priority }; returns { id, ...task }
  GET /tasks/:id      → returns the task or 404

Use:
  - Express 4.x with the @types/express types
  - In-memory storage (a Map) — no database
  - Jest + supertest for tests
  - tsx for the dev runner

Write Jest tests in tests/ that cover:
  - GET /health returns 200 with status:ok
  - POST /tasks with valid body returns 201 and a generated id
  - POST /tasks with missing title returns 400
  - GET /tasks/:id returns 404 for unknown id

Initialize the project with package.json, tsconfig.json, and a clean src/ layout.
Run `npm test` to verify all tests pass before stopping.
```

## What Codex should do

1. Run `npm init -y` and add dependencies (`express`, `@types/express`, `tsx`, `jest`, `ts-jest`, `supertest`)
2. Scaffold `tsconfig.json` for Node + TypeScript
3. Write `src/server.ts` with the three endpoints
4. Write the four Jest tests
5. Run `npm test`
6. Fix any failures and re-run until green
7. Stop when all tests pass

## Approximate runtime

10-25 minutes depending on how many test failures it has to fix. The first run rarely passes all tests.

## Watch for

- **Loop detection:** if it makes the same fix three times, the goal needs more constraint
- **Scope creep:** Codex sometimes adds extras (auth, validation libraries) that weren't asked for. The `Don't add features outside the spec` constraint helps.
- **Stop condition adherence:** Codex should stop the moment tests pass — not keep "polishing"

## Copy-paste version

Save the prompt above as `goal.txt` and feed it inline:

```bash
codex
> /goal $(cat goal.txt)
```
