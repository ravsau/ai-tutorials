# Gemma 4 + Ollama + MLX MTP Speed Test

Companion lab for the CloudYeti video:

**Gemma 4 Just Got 90% Faster on Mac (Ollama + MLX)**

This repo is intentionally practical: it gives you a repeatable setup checklist, benchmark script, prompts, and a place to record results without overstating what the Ollama announcement means.

## The accurate message

Ollama announced that **Gemma 4 is nearly 90% faster on Apple Silicon with Ollama using MLX**.

The important nuance:

- MTP / speculative decoding is **not new**.
- llama.cpp already has visible `draft-mtp` / MTP support.
- The story here is that **MTP support is now showing up in Ollama's Apple Silicon / MLX path for Gemma 4**.
- Ollama says it is **enabled by default for Gemma 4**, auto-tunes draft tokens at runtime, and more models are coming.

So the video should not say "Ollama invented MTP." The right framing is:

> Gemma 4 is the headline, but MTP support in Ollama's MLX path is the bigger local-AI story.

## Before recording

Do this before you press record so the demo does not fall apart live.

### 1. Update Ollama

On macOS with Homebrew:

```bash
brew update
brew upgrade ollama
ollama --version
```

If you use the desktop app, update from the app / Ollama download page instead.

### 2. Start Ollama

```bash
ollama serve
```

If the desktop app is already running, this may say the port is already in use. That's fine.

### 3. Pull the right Gemma 4 model

For this video, the best primary test is the **MLX 12B tag** because the tweet specifically says "Apple Silicon with Ollama using MLX" and the benchmark image references **Gemma 4 12B nvfp4 on an M5 Max**.

Use this as the main on-camera model:

```bash
ollama pull gemma4:12b-mlx
```

Then, because you have a 128GB Mac, optionally test the larger MLX tags as a second act:

```bash
ollama pull gemma4:26b-mlx
ollama pull gemma4:31b-mlx
```

Model choice for the video:

| Model | Use in video? | Why |
|---|---|---|
| `gemma4:12b-mlx` | Primary test | Best match to the Ollama tweet/chart. Cleanest proof of the claim. |
| `gemma4:26b-mlx` | Optional practical test | MoE model with 4B active params; likely interesting speed/quality tradeoff. |
| `gemma4:31b-mlx` | Optional 128GB Mac flex | Dense larger model; best for showing your hardware moat, but less direct match to the 90% chart. |
| `gemma4:12b` / `26b` / `31b` non-MLX | Backend comparison only | Useful if you clearly label it as MLX vs non-MLX, not MTP vs non-MTP. |

### 4. Smoke test the model

```bash
ollama run gemma4:12b-mlx "Explain multi-token prediction in one paragraph."
```

If you are using another local tag, replace `gemma4:12b-mlx` with that tag.

### 5. Run the benchmark script

```bash
python3 scripts/benchmark_ollama.py --model gemma4:12b-mlx --runs 3
```

Optional larger-model tests:

```bash
python3 scripts/benchmark_ollama.py --model gemma4:26b-mlx --runs 3
python3 scripts/benchmark_ollama.py --model gemma4:31b-mlx --runs 3
```

Optional backend comparison, if you want to show MLX vs non-MLX:

```bash
python3 scripts/benchmark_ollama.py --model gemma4:12b --runs 3
python3 scripts/benchmark_ollama.py --model gemma4:12b-mlx --runs 3
```

Do **not** call that last comparison "MTP vs non-MTP" unless you have verified that MTP is disabled in the non-MLX run.

The script writes JSON results into `results/` and prints a markdown table you can paste into the video notes.

## Should you download a non-MTP Gemma?

Only if you can do it honestly.

A true before/after requires one of these:

1. An older Ollama build from before Gemma 4 MTP support, tested with the same model + same prompt.
2. A real runtime flag to disable MTP, if Ollama exposes one.
3. A separate backend/runtime that clearly does not use MTP for the same model.

If you do not have one of those, do **not** label a random Gemma model as "non-MTP." Instead, compare:

- Ollama's published chart: `95.0 tok/s with MTP` vs `50.2 tok/s without MTP`.
- Your local Gemma 4 result on your Mac.
- Optional: your pre-existing Gemma 4 tags / sizes to see practical local performance.

The honest line for the video:

> I can't claim a perfect before/after unless I can disable MTP or run an older Ollama build. So I'm using Ollama's published MTP-vs-non-MTP chart as the claim, then testing what the current Ollama + MLX path gives me on my Mac.

## What to record

1. Ollama post/chart.
2. `ollama --version`.
3. `ollama list | grep gemma4`.
4. Pull command or proof the model is already installed.
5. Smoke test prompt.
6. Benchmark script results.
7. One real coding-style prompt.
8. Verdict: who should care, who should wait.

## Current local result

On Saurav's 128GB Apple Silicon Mac, `gemma4:26b-mlx` produced:

| Prompt | Runs | Median decode tok/s | Saved result |
|---|---:|---:|---|
| Short MTP explainer | 3 | 83.96 | `results/gemma4-26b-mlx-20260702T003518Z.md` |
| Coding-style benchmark prompt | 3 | 102.00 | `results/gemma4-26b-mlx-20260702T004002Z.md` |

For the video, emphasize **decode tok/s**. Prompt/prefill tok/s on repeated runs can look unrealistic because the prompt path appears cached.

## Files

- `scripts/benchmark_ollama.py` — repeatable Ollama benchmark via `/api/generate`.
- `scripts/prepare.sh` — setup/checklist helper.
- `prompts/` — copy-paste prompts for speed and quality tests.
- `transcript.md` — rough transcript sketch for recording.
- `results/` — benchmark output folder.

## Companion video assets

CloudYeti video planning artifact lives in the content factory:

`/Users/saurav-air/100Projects-air/content-factory/strategy/channels/cloudyeti/video-plans/cp-174-gemma4-ollama-mlx-recording-dashboard.html`

## License

MIT. Use, modify, and PR improvements.
