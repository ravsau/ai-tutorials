#!/usr/bin/env bash
set -euo pipefail

MODEL="${1:-gemma4:12b-mlx}"

echo "== Gemma 4 + Ollama + MLX MTP prep =="
echo "Model: $MODEL"
echo

echo "1) Ollama binary"
if ! command -v ollama >/dev/null 2>&1; then
  echo "ERROR: ollama not found. Install from https://ollama.com or: brew install ollama"
  exit 1
fi
ollama --version || true

echo
echo "2) Ollama server check"
if curl -fsS http://localhost:11434/api/tags >/dev/null 2>&1; then
  echo "Ollama server is running."
else
  echo "Ollama server is not reachable. Start it in another terminal:"
  echo "  ollama serve"
  echo "Then rerun this script."
  exit 2
fi

echo
echo "3) Installed Gemma 4 models"
ollama list | grep -i gemma4 || true

echo
echo "4) Pull/check requested model"
echo "If this tag does not exist in your Ollama library, pick one from: ollama list | grep gemma4"
ollama pull "$MODEL"

echo
echo "5) Smoke test"
ollama run "$MODEL" "Explain multi-token prediction in one paragraph for a Mac local-AI user."

echo
echo "6) Benchmark"
python3 scripts/benchmark_ollama.py --model "$MODEL" --runs 3
