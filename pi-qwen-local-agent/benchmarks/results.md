# Qwen 3.6 27B Benchmark — Apple M3 Max 128GB

**Date:** 2026-05-16
**Model:** Qwen 3.6 27B dense, 4-bit quantization
**Prompt:** "Write a Python function that fetches the last 5 public repos from the GitHub REST API and prints them as a markdown table sorted by stars descending."
**Generation cap:** 256 tokens · **Temperature:** 0.6

## Results

| Backend | Quant | Prompt (prefill) | Decode (gen) | Notes |
|---------|-------|------------------|--------------|-------|
| 🥇 **llama.cpp** | `Qwen3.6-27B-UD-Q4_K_XL.gguf` | **139 t/s** | **9.45 t/s** | `llama-bench` synthetic baseline |
| 🥈 **MLX-lm** | `unsloth/Qwen3.6-27B-UD-MLX-4bit` | 58.3 t/s | 5.78 t/s | Warm run (kernels cached) |
| 🥉 **Ollama** | `qwen3.6:27b-q4_K_M` | 104 t/s | 4.18 t/s | Via HTTP API |
| MLX cold | same as above | 6.2 t/s | 2.94 t/s | First invocation, JIT compile dominated |

## Takeaways

1. **llama.cpp wins on dense 4-bit Qwen 3.6 27B.** 2.3x faster decode than Ollama, 1.6x faster than MLX warm.
2. **Ollama runtime overhead is real.** Same llama.cpp backend underneath, but the Ollama runtime adds materially to per-token latency.
3. **MLX cold-start is brutal but warm is competitive.** For a persistent server, MLX is fine. For one-shot CLI calls, the JIT compile kills you.
4. **The MLX advantage is on MoE + NVFP4 quants** (35B-A3B style), not dense 4-bit. For dense 27B at 4-bit, llama.cpp's Metal backend holds its own.

## How to reproduce

### llama.cpp synthetic
```bash
llama-bench -m ~/.cache/huggingface/hub/models--unsloth--Qwen3.6-27B-GGUF/snapshots/*/Qwen3.6-27B-UD-Q4_K_XL.gguf -p 512 -n 256 -r 1 -t 8
```

### Ollama via API
```bash
curl -s http://localhost:11434/api/generate -d '{
  "model": "qwen3.6:27b-q4_K_M",
  "prompt": "YOUR PROMPT HERE",
  "stream": false,
  "options": {"temperature": 0.6, "num_predict": 256}
}'
```
Response includes `prompt_eval_count`, `prompt_eval_duration`, `eval_count`, `eval_duration` (nanoseconds).

### MLX-lm
```bash
pip install mlx-lm
python -m mlx_lm generate \
  --model ~/.cache/huggingface/hub/models--unsloth--Qwen3.6-27B-UD-MLX-4bit/snapshots/*/ \
  --prompt "YOUR PROMPT HERE" \
  --max-tokens 256 \
  --temp 0.6
```
Run it twice — the first invocation is the JIT cold start; the second is the real performance.

## Hardware

- Apple M3 Max
- 128 GB unified memory
- llama.cpp built from ggml 0.10.2 (Metal + BLAS backends)
- mlx-lm 0.31.3
- Ollama latest as of 2026-05-16

## Caveats

- Single run per backend (no statistical averaging). For production decisions, average 3-5 runs.
- llama-bench prompt is synthetic (random tokens). Ollama and MLX used the real prompt above.
- All three got the same `--temp 0.6` to match the script's recommended sampling parameters.
- Quant variants are close but not identical: llama.cpp used Unsloth's dynamic UD-Q4_K_XL (slightly higher quality than vanilla Q4_K_M); Ollama used standard q4_K_M; MLX used unsloth's 4-bit MLX quant.
