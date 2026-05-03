# Demo 3 — Hard Refactor (Where It Falls Apart)

The deliberate failure-case test from the video (7:00 – 9:00 slot). The point is to find the ceiling — where Pi + Qwen 3.6 27B stops being reliable and you'd reach for Claude Code instead.

This is the test that earns the video's verdict. Without it, "Is Pi the agent for local coding?" gets a soft yes. With it, the answer becomes specific: yes for X workflows, no for Y workflows.

## Setup

You need a single TypeScript file long enough to push the context window. The included `demo-repo/src/api-client.ts` is ~500 lines with multiple `fetch()` call sites. Or substitute your own.

## Prompt

```
Take src/api-client.ts (about 500 lines). Convert every fetch call to use
the @platform/http package instead of native fetch. Update the response
handling to match the new package's API: it returns { data, error } instead
of throwing on non-2xx responses. Update the matching tests in
tests/api-client.test.ts too.
```

## What you should see Pi do (and where it breaks)

1. Read `src/api-client.ts`
2. Read `tests/api-client.test.ts`
3. Begin replacing fetch calls — first 2-3 are usually correct
4. Begin updating tests
5. **Around fetch call ~6-8 of N:** Pi may start losing track of which call it has already updated, may rewrite a function it already converted, or may inconsistently apply the new error-handling pattern (some sites use `try/catch`, some use the `{ data, error }` destructure)
6. Final result: ~70% correct based on Saurav's earlier testing — same finding multiple developers report on r/LocalLLM

## Why this fails (honest version)

Pi + Qwen 3.6 27B has a smaller working memory than Claude Opus or Sonnet. As the agent processes more of the file, earlier context gets compressed or lost. By the time it's at the bottom of a 500-line file, it has partially forgotten what it did at the top.

Claude Sonnet on the same task finishes cleanly in our testing. The 200K+ token context window is the difference.

## What "honest result" looks like for the video

Don't fake the fix. Show what actually happens:
- The first few replacements are correct
- Somewhere mid-file the agent loses the plot
- Final result is partially correct, with at least one inconsistency
- Tests show the gap — some pass, some fail
- This is the data point. Pi has a ceiling. The video's verdict ("80% local, 20% cloud") rests on this test being honest.

## Expected runtime

~3-5 minutes end to end. May time out or stall on harder portions.

## Recording your output

Save Pi's full session to `../demo-outputs/03-hard-refactor-session.txt`. Save the diff Pi produced to `../demo-outputs/03-hard-refactor.diff`. Save the test results (which passed, which failed) to `../demo-outputs/03-hard-refactor-test-results.txt`.

For comparison: try the same prompt against Claude Code on the same starting file, and save Claude's diff to `../demo-outputs/03-hard-refactor-claude.diff`. The side-by-side is the most useful artifact for viewers — it's the actual evidence behind the "80/20 routing" claim in the video.
