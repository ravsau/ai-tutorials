# OpenCode + OpenRouter: One Coding Agent, Every Model

Setup and configs that accompany the CloudYeti video: plugging **OpenCode** (an open-source
terminal coding agent) into **OpenRouter** (one API key → hundreds of models, with routing and
fallback), so you can switch the model behind your coding workflow without rebuilding your setup.

**Why this stack:** most coding agents bundle the agent *and* a fixed model path. OpenCode is the
agent shell; OpenRouter is the model layer. Together you get a curated model menu, provider
fallback when one is rate-limited, and the freedom to send cheap tasks to a cheap model and hard
tasks to a frontier model — the same idea whether you're solo or on a team.

> Steps below follow the official OpenCode + OpenRouter docs
> ([openrouter.ai/docs/use-cases/opencode](https://openrouter.ai/docs/use-cases/opencode)).
> Use a **fresh** OpenRouter key and keep it private.

## Setup

### 1. Install OpenCode

```bash
curl -fsSL https://opencode.ai/install | bash
opencode --version
```

### 2. OpenRouter API key

Create a key at [openrouter.ai/keys](https://openrouter.ai/keys), add a few dollars of credits.

### 3. Connect (beginner path)

Start OpenCode inside a real project, then connect:

```bash
cd /path/to/your/project
opencode
```

Inside OpenCode:

```text
/connect      # choose OpenRouter, paste your key (it's stored locally)
/models       # pick the model you want to use
```

That's it — OpenCode is no longer tied to one model.

### 4. The config file (the power feature)

For a repeatable, team-friendly setup, define a **curated model menu** instead of picking from
hundreds each time. Copy [`opencode.json`](opencode.json) into your project root:

```bash
curl -fsSL https://raw.githubusercontent.com/ravsau/ai-tutorials/main/opencode-openrouter/opencode.json -o opencode.json
```

It's just this:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "openrouter": {
      "models": {
        "anthropic/claude-sonnet-latest": {},
        "google/gemini-flash-latest": {},
        "deepseek/deepseek-v4-flash": {},
        "qwen/qwen3.6-coder": {}
      }
    }
  }
}
```

A sensible 4-model menu:

| Role | Model | When |
|------|-------|------|
| Strong default | `anthropic/claude-sonnet-latest` | hard coding tasks |
| Cheap + fast | `google/gemini-flash-latest` | simple edits, boilerplate |
| Cheap open | `deepseek/deepseek-v4-flash` | budget runs (fractions of a cent) |
| Coder | `qwen/qwen3.6-coder` | code-specific tasks |

Swap these for whatever fits your budget — check live prices and quantization per provider at
`openrouter.ai/api/v1/models/<model>/endpoints`.

### 5. Provider routing & fallback

OpenRouter picks a provider per request and can fall back if one is down. To pin or order
providers (e.g. force a specific quantization, or avoid a rate-limited one), add routing to the
request — see [OpenRouter provider routing](https://openrouter.ai/docs/features/provider-routing).
If a provider is rate-limited, fallback keeps your coding session alive instead of killing it.

## Reproduce the video test

Run the **same task on two models** and compare time, cost, files changed, and quality. The task
is in [`task.md`](task.md). Switch models with `/models` between runs, and reset the repo (or use a
fresh branch) so the comparison is clean.

## Files

| File | What |
|------|------|
| [`opencode.json`](opencode.json) | Curated 4-model OpenRouter menu — drop into your project root |
| [`task.md`](task.md) | The identical test task to give each model |

## Notes / gotchas

- Model IDs on OpenRouter are `provider/model` (e.g. `deepseek/deepseek-v4-flash`). The `~` prefix
  some docs show is optional shorthand; the plain slug works.
- OpenRouter's docs are agent-readable: `openrouter.ai/llms.txt` is a clean index, and appending
  `.md` to any docs page returns the markdown (e.g. `openrouter.ai/docs/use-cases/opencode.md`).
- Cost is per-request and provider-dependent; turn on cost display and watch
  `openrouter.ai/activity` to see the real spend per model.
