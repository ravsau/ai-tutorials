# Loop Engineering Starter

The simplest possible loop in Claude Code. One command. One file. That's it.

## The command

```
/loop 2m /goal Check tasks.md and implement every pending task
```

## How it works

1. Add a task to `tasks.md`
2. Claude checks the file every 2 minutes
3. It implements the task and marks it done
4. Add another task from a different session — the loop picks it up

## Expanding from here

- Add a state file to survive restarts
- Add a verifier (tests, lint) so the agent can't ship broken code
- Add MCP connectors (GitHub, Slack) so the loop acts in your real tools
- Move to `/schedule` for cloud runs that survive after you close the laptop

## Who this is for

You write code and want to stop being the person who prompts the agent.
This is the first step.
