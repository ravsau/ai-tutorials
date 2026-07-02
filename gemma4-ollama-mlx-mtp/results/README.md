# Results

Run from the repo root:

```bash
python3 benchmark.py
```

Or skip the pull step if `gemma4:26b-mlx` is already installed:

```bash
python3 benchmark.py --no-pull
```

The script saves a `.json` file and a `.md` file here for each benchmark run.

## Current local results

| Prompt | Runs | Median decode tok/s | Notes |
|---|---:|---:|---|
| Short explainer | 3 | 83.96 | saved in `gemma4-26b-mlx-20260702T003518Z.md` |
| Coding-style prompt | 3 | 102.00 | saved in `gemma4-26b-mlx-20260702T004002Z.md` |

## Honest recording language

> I am testing `gemma4:26b-mlx` on my Mac. I am not presenting this as a perfect MTP-on versus MTP-off baseline or an exact recreation of Ollama's chart.
