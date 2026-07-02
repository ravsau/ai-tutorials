# Results

Paste benchmark outputs here after running:

```bash
python3 scripts/benchmark_ollama.py --model gemma4:12b-mlx --runs 3
python3 scripts/benchmark_ollama.py --model gemma4:26b-mlx --runs 3
python3 scripts/benchmark_ollama.py --model gemma4:31b-mlx --runs 3
```

Optional backend comparison, clearly labeled MLX vs non-MLX:

```bash
python3 scripts/benchmark_ollama.py --model gemma4:12b --runs 3
python3 scripts/benchmark_ollama.py --model gemma4:12b-mlx --runs 3
```

## Recording notes

| Model | Runs | Median decode tok/s | Median prompt tok/s | Notes |
|---|---:|---:|---:|---|
| `gemma4:12b-mlx` |  |  |  | primary tweet-match test |
| `gemma4:26b-mlx` | 3 | 83.96 | ignore cached prefill value | Short explainer prompt; saved in `results/gemma4-26b-mlx-20260702T003518Z.md` |
| `gemma4:26b-mlx` coding prompt | 3 | 102.00 | ignore cached prefill value | Coding-style prompt; saved in `results/gemma4-26b-mlx-20260702T004002Z.md` |
| `gemma4:31b-mlx` |  |  |  | optional 128GB Mac flex |
| `gemma4:12b` |  |  |  | optional MLX vs non-MLX only |

## Honest comparison language

Use this if you do not have a true non-MTP baseline:

> Ollama's public chart shows 95.0 tok/s with MTP versus 50.2 tok/s without MTP on Gemma 4 12B nvfp4 on an M5 Max. I can't claim a perfect before/after unless I can disable MTP or run an older Ollama build, so this lab measures what the current Ollama + MLX path gives me on my Mac.
