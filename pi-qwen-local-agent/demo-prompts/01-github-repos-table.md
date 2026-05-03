# Demo 1 — GitHub Repos Markdown Table

The exact task from the video. Tests: file reading, project context awareness, API integration, output formatting.

## Setup

In an empty directory with a `package.json` (any Node project will do):

```json
{
  "name": "pi-demo",
  "type": "module",
  "engines": { "node": ">=20" }
}
```

## Prompt

```
Read the package.json in this directory. Then write a small Node script that
hits the GitHub API, lists my last five public repos, and prints them as a
markdown table sorted by stars.
```

## What you should see Pi do

1. **Read** `package.json` to understand the project shape
2. Notice it's ES modules + Node 20+
3. **Write** a new file (e.g. `repos.js`) using the built-in `fetch` (not `node-fetch`)
4. **Bash** to run the script and print the output

## What "good" looks like

- A `repos.js` file that runs without errors
- Output is a proper markdown table, sorted by stars descending
- Uses `process.env.GITHUB_USER` or asks for a username — doesn't hardcode
- No unnecessary dependencies installed

## What weaker models do here

- Add `node-fetch` as a dependency (Qwen 3.6 should not — flag if it does)
- Write CommonJS even though `"type": "module"` is set
- Print as plain text instead of markdown table
- Forget the sort

## Expected runtime

~30-60 seconds end to end on a 36 GB M3 Mac.
