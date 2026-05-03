# Example 6 — PRD-Driven Build (the Ralph + PRD pattern)

The most powerful `/goal` use case: hand Codex a Product Requirements Document and let it build the whole thing. This is what @KTLYST_labs described on X — running `/goal` against a PRD for days and getting a working system out.

## Setup

A `prd.md` file in the repo root that describes what to build. The more specific, the better.

## Goal prompt

```
/goal Read prd.md in this directory. Implement the system it describes.

Plan:
  1. Read the PRD fully and confirm understanding by writing a summary
     to .codex/understanding.md (so I can sanity-check before you go far)
  2. Initialize the project (package.json, tsconfig, src layout)
  3. Build features in the order specified by the PRD's "Milestones" section
  4. After each milestone, run the PRD's specified tests (or write them
     if not yet written) and confirm green before moving to the next

Constraints:
  - Stick to the tech stack named in the PRD
  - Do not add features outside the PRD's scope
  - Do not skip milestones — finish each before starting the next
  - If the PRD is ambiguous, write a question to .codex/questions.md
    and continue with your best judgment

Stop when:
  - All milestones are complete
  - All tests pass
  - The "Done" criteria in the PRD are met

This may take hours. Pause if I send /pause. Resume from where you stopped.
```

## What you need in `prd.md` for this to work

Without a tight PRD, `/goal` will drift. The minimum:

1. **Goal statement** — what is being built and why
2. **Tech stack** — explicit (e.g., "TypeScript, Express, PostgreSQL, Jest")
3. **Milestones** — ordered, each with a clear "done" check
4. **Done criteria** — what does "the whole thing is finished" look like
5. **Out of scope** — what NOT to build (auth, payments, etc.)

Skeleton:

```markdown
# PRD — [Project Name]

## Goal
What is being built and the user it serves.

## Tech stack
- Runtime: Node.js 20+
- Framework: Express
- Database: PostgreSQL
- Tests: Jest + supertest

## Milestones
1. **M1 — Project scaffold.** Done when `npm test` runs and a single
   placeholder test passes.
2. **M2 — Database schema.** Done when migrations run cleanly and
   `psql` shows the expected tables.
3. **M3 — CRUD endpoints.** Done when each endpoint has a test and
   all tests pass.
4. **M4 — Auth.** Done when …

## Done criteria
- All milestone tests pass
- README has run instructions
- `npm run build` succeeds with zero errors

## Out of scope
- Email sending
- Payment integration
- Admin UI
```

## Approximate runtime

Hours to days, depending on PRD scope. @KTLYST_labs reported their PRD-driven build ran "for a couple of days" autonomously.

## Why this works

`/goal` + a PRD = a closed-loop system:

- The PRD is the spec
- Codex builds against the spec
- Tests in the PRD are the verification
- Milestones are the loop's natural pause points

Without the PRD, `/goal` has no anchor to verify against and will either stop too early or wander.

## Connection to existing tools

Saurav's `/ralph` skill converts PRDs to a JSON format for the Ralph autonomous agent. `/goal` is the OpenAI-native version of that workflow — feed a PRD, get a working system. Both Ralph (the original bash loop) and `/ralph` (the structured-PRD skill) and `/goal` (the OpenAI implementation) are variants of the same idea.
