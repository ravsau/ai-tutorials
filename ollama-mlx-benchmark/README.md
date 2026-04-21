# Ollama MLX vs GGUF — Local Coding Agent Comparison

Companion lab for the CloudYeti video: **$0 Claude Code on Mac: Ollama MLX Is Finally Ready (Qwen 3.5)**

Run the same Qwen 3.5-35B-A3B model through two different Ollama runtime paths — MLX/NVFP4 and GGUF/Q4_K_M — and measure the tokens/sec difference on your own Mac. One command to launch Claude Code against your local model at the end.

## What this lab is (and isn't)

It's a **local runtime-path comparison**: same model family, same prompt, same hardware. The two tags differ in quant format (NVFP4 vs Q4_K_M) and default sampling params, so this isn't a pure backend-only A/B — it's "what the viewer actually experiences when they run each tag."

For a statistical benchmark you'd run hundreds of prompts across chips. This is a reproducible snapshot that shows the direction and rough magnitude of the speedup.

## Reference results

### On an M3 Max 128GB, Ollama 0.20.5 (from this lab, 3 trials each)

| Metric | GGUF / Q4_K_M | MLX / NVFP4 | Speedup |
|---|---|---|---|
| **Decode** (min / mean / max, tok/s) | 35.85 / **36.72** / 37.56 | 77.64 / **78.97** / 80.53 | **~2.15x** |
| **Prefill cold** (trial 1, tok/s) | ~176 | ~67 | — |
| **Prefill warm** (trial 3, tok/s) | ~204 | **~1,495** | **~7.3x** |

Two things to notice:

1. **Decode is consistently ~2x faster on MLX** — tight variance (77.64 to 80.53), not a fluke.
2. **MLX's real win is KV cache efficiency.** Prefill starts slow on trial 1 (67 tok/s) and ramps to 1,495 tok/s by trial 3 as the cache warms. GGUF prefill stays flat around 200 tok/s regardless. For agentic workflows where the same context gets reused turn after turn, that cache effect compounds.

Your `results/` folder has per-trial numbers + environment metadata after you run it.

### Ollama's official MLX preview numbers

From [Ollama's MLX blog post](https://ollama.com/blog/mlx), for the same model family:

| | Prefill | Decode |
|---|---|---|
| Previous Q4_K_M | 1,154 tok/s | 58 tok/s |
| MLX NVFP4 | 1,810 tok/s | 112 tok/s |

The blog doesn't specify exact chip/RAM. Absolute numbers differ from this lab because of hardware — M3 Max has less memory bandwidth than later M-series chips. The **direction and rough magnitude of the speedup are consistent**.

## Prerequisites

- Apple Silicon Mac (M1 or newer)
- **32 GB+ unified memory** (MLX preview hard requirement)
- Ollama `0.19.0` or newer (`ollama --version`)
  - If you're on Ollama `0.20.5` via Homebrew and MLX models fail to load: see [#15479](https://github.com/ollama/ollama/issues/15479) / [#15480](https://github.com/ollama/ollama/issues/15480). Install the official `Ollama.app` or a patched newer release. The official app on `0.20.5` works for me.
- ~45 GB free disk space (two models)

## Step 1 — Pull the two models

```bash
ollama pull qwen3.5:35b-a3b-coding-nvfp4   # MLX / NVFP4 path
ollama pull qwen3.5:35b-a3b                 # GGUF / Q4_K_M path
```

Both are the same Qwen 3.5-35B-A3B family. The tag suffix determines which runtime Ollama loads.

## Step 2 — Verify which backend each model uses

Patrick Devine (Ollama engineer) [confirmed on X (Apr 2026)](https://x.com/pdev110):

| Runtime | Tag suffixes |
|---|---|
| MLX | `nvfp4`, `mxfp8`, `mlx-bf16` |
| GGUF / llama.cpp | `q4_K_M`, `q8_0`, `bf16` |

Or check yourself: `ollama show <tag>` shows the quant format. With the model loaded, the Ollama process shows `--mlx-engine` in its args for MLX models.

## Step 3 — Run the benchmark

```bash
bash bench.sh           # default 3 trials per model
TRIALS=5 bash bench.sh  # custom trial count
```

The script records environment metadata (Ollama version, chip, memory, macOS, model IDs) alongside the per-trial numbers in `results/`. Easier to compare your output to someone else's later.

Output files:
- `results/metadata.txt` — your exact environment
- `results/bench-mlx.txt` — MLX trials (raw `--verbose` output)
- `results/bench-ggml.txt` — GGUF trials

## Step 4 — Optimize the MLX model for daily use

Many Ollama integrations (including some coding agents) don't pass `num_ctx` and end up with a smaller effective context than the model supports. Create a Modelfile to bake in an explicit context window + sampling params:

```
FROM qwen3.5:35b-a3b-coding-nvfp4

PARAMETER num_ctx 65536
PARAMETER num_predict -1
PARAMETER temperature 0.6
PARAMETER top_p 0.95
PARAMETER top_k 20
PARAMETER repeat_penalty 1.0
```

Build it:

```bash
ollama create qwen3-agent -f Modelfile
```

Now `qwen3-agent` has 64k context by default. Qwen 3.5 natively supports up to 262,144 tokens — push higher if your RAM allows.

## Step 5 — Wire it into Claude Code (one command)

Ollama now exposes a native Anthropic-compatible endpoint (`http://localhost:11434/v1/messages`), so Claude Code talks to it directly — no LiteLLM proxy, no extra config.

**Easiest path:**

```bash
ollama launch claude --model qwen3-agent
```

Claude Code opens, already pointed at your local model.

**Manual (if you want to set it up yourself):**

```bash
export ANTHROPIC_AUTH_TOKEN=ollama
export ANTHROPIC_BASE_URL=http://localhost:11434
claude --model qwen3-agent
```

Both work. From here on, zero API cost.

## Common issues

- **Tool calls printed as `</tool_call>` text, not executed** → template-parser mismatch. Use `qwen3-coder:30b` instead of plain `qwen3`. Keep active tool count ≤ 5. Full write-up: [local-ai-troubleshooting](https://github.com/ravsau/local-ai-troubleshooting).
- **Model "forgets" what you said mid-session** → client is passing a small `num_ctx`. The Modelfile from Step 4 fixes this by baking the context size into the model.
- **Slower than expected** → check MLX is actually loaded. `ollama ps` should show `100% GPU` and the Ollama runner process should include `--mlx-engine` in its args.
- **MLX load error on Ollama 0.20.4 / 0.20.5 Homebrew** → known regression (Issues [#15479](https://github.com/ollama/ollama/issues/15479), [#15480](https://github.com/ollama/ollama/issues/15480)). Use the official `Ollama.app` install or a patched release.

## What's next

- Open an issue if your numbers are wildly different from this reference — helps everyone calibrate
- PRs welcome for other model pairs (Qwen 3.6, Gemma 4 MLX when it stabilizes, different hardware)
- For live troubleshooting: [local-ai-troubleshooting](https://github.com/ravsau/local-ai-troubleshooting)

## Links

- [CloudYeti YouTube](https://www.youtube.com/@CloudYeti)
- [1:1 AI/Cloud cost consultation](https://cloudyeti.io/meet)
- [Ollama MLX blog post](https://ollama.com/blog/mlx)
- [Ollama Anthropic-compatibility docs](https://docs.ollama.com/api/anthropic-compatibility)
- [Patrick Devine on MLX variant routing](https://x.com/pdev110)
