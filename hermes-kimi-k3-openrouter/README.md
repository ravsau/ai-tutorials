# Hermes Agent + Kimi K3 via OpenRouter

Setup and configs that accompany the CloudYeti video: giving Kimi K3 (the #1 Frontend Code Arena model) a real production homepage to redesign, running in Hermes Agent through OpenRouter.

**Why this stack:** Kimi K3 is Moonshot's 2.8T-param open-weight MoE (1M context, native vision, released Jul 16 2026). Hermes Agent is the cleanest OpenRouter-native harness — one key, two config files, provider fallbacks built in. No env-var hacks.

## Setup

### 1. Install Hermes Agent

```bash
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash
hermes doctor
```

### 2. OpenRouter API key

Create a key at [openrouter.ai/keys](https://openrouter.ai/keys) and add credits, then:

```bash
echo 'OPENROUTER_API_KEY=sk-or-...' >> ~/.hermes/.env
```

### 3. Configure Kimi K3

Back up your existing config, then copy the [config.yaml](config.yaml) from this folder — no editor needed:

```bash
cp ~/.hermes/config.yaml ~/.hermes/config.yaml.backup 2>/dev/null
curl -fsSL https://raw.githubusercontent.com/ravsau/ai-tutorials/main/hermes-kimi-k3-openrouter/config.yaml -o ~/.hermes/config.yaml
```

Want to look at it first? `open ~/.hermes/config.yaml` (TextEdit) or `code ~/.hermes/config.yaml` (VS Code). It's just this:

```yaml
model:
  provider: openrouter
  default: moonshotai/kimi-k3

fallback_model:
  provider: openrouter
  model: anthropic/claude-sonnet-4

display:
  show_cost: true
```

### 4. Launch

```bash
hermes
```

Status bar should show `moonshotai/kimi-k3` with a `1M` context window.

## The redesign prompt

Run Hermes from inside your site's repo (on a branch!) and paste:

> Here's my production homepage for [your-site] — [one-line description]. Take a
> screenshot of the current site, critique it like a senior product designer,
> then redesign the homepage: modern, high-trust, conversion-focused. Keep the
> brand name and core copy intent. Iterate: after each change, screenshot the
> result, critique it, and improve. Do at least 3 iterations before declaring done.

## Gotchas

| Issue | Fix |
|---|---|
| "No API key" at startup | Key missing from `~/.hermes/.env` |
| 401 / 403 | Wrong key, or $0 OpenRouter credit balance |
| Model rejected at startup | Hermes needs ≥64K context — check for a model-slug typo (K3's 1M is fine) |
| Costs higher than expected | K3 always reasons at max effort — every request pays full thinking tokens |

## Pricing (July 2026)

- Input: $3.00/M tokens ($0.30/M cached)
- Output: $15.00/M tokens
- Check your actual spend at [openrouter.ai/activity](https://openrouter.ai/activity)
