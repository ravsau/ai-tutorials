# Gemma 4 26B MLX benchmark on Mac

Companion repo for the CloudYeti video.

This repo has one job: benchmark `gemma4:26b-mlx` through Ollama on Apple Silicon and save the results.

The video angle is still MTP: Ollama's MLX models are starting to get multi-token prediction support on Apple Silicon, beginning with Gemma 4.

This repo does not try to prove a before/after MTP baseline. It keeps the claim practical:

> Ollama's MLX path now has MTP support for Gemma 4. This repo tests the current `gemma4:26b-mlx` model on my Mac and gives you a script to test yours.

## Requirements

- macOS on Apple Silicon
- Ollama installed and running
- Python 3

Check Ollama:

```bash
ollama --version
ollama serve
```

If you use the Ollama desktop app, it may already be running. If `ollama serve` says the port is already in use, that is fine.

## Run the benchmark

From this folder:

```bash
python3 benchmark.py
```

That will:

1. check that Ollama is reachable
2. pull/check `gemma4:26b-mlx`
3. run two prompts three times each
4. print decode tokens per second
5. save JSON and Markdown files in `results/`

If the model is already installed and you want to skip the pull step:

```bash
python3 benchmark.py --no-pull
```

To change run count:

```bash
python3 benchmark.py --runs 5 --no-pull
```

## What number matters?

Focus on decode tok/s.

That is the speed you feel while the model is writing back to you. Prompt/prefill tok/s can look inflated on repeated local runs because prompt work may be cached.

## My local result

On Saurav's 128GB Apple Silicon Mac, `gemma4:26b-mlx` produced:

| Prompt | Runs | Median decode tok/s | Saved result |
|---|---:|---:|---|
| Short explainer | 3 | 83.96 | `results/gemma4-26b-mlx-20260702T003518Z.md` |
| Coding-style prompt | 3 | 102.00 | `results/gemma4-26b-mlx-20260702T004002Z.md` |

## Simple video framing

Use this language:

> Ollama's MLX path now has MTP support for Gemma 4. I pulled the Gemma 4 26B MLX model, ran it with a small benchmark script, and got about 84 tok/s on a short prompt and 102 tok/s on a coding-style prompt. I am not recreating Ollama's exact chart. I am testing the MLX version you would actually download after this announcement.

Avoid saying:

- "I proved MTP vs non-MTP"
- "This exactly recreates Ollama's benchmark"

## Files

- `benchmark.py` — the only script you need
- `results/` — saved benchmark outputs
- `transcript.md` — short recording script

## License

MIT. Use, modify, and post your own Mac results.
