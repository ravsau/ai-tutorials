#!/usr/bin/env bash
#
# Local runtime-path comparison — MLX/NVFP4 vs GGUF/Q4_K_M for the same
# Qwen3.5-35B-A3B model family. Captures environment metadata so results
# are reproducible.
#
# Usage:
#   bash bench.sh            # default 3 trials per model
#   TRIALS=5 bash bench.sh   # custom trial count

set -euo pipefail

PROMPT="Write a Python function that implements a debounce decorator. Include type hints, a 5-line docstring, and two unit tests."

MLX_MODEL="qwen3.5:35b-a3b-coding-nvfp4"
GGML_MODEL="qwen3.5:35b-a3b"

TRIALS="${TRIALS:-3}"
OUT_DIR="$(cd "$(dirname "$0")" && pwd)/results"
mkdir -p "$OUT_DIR"

# ──────────────────────────────────────────────────────────────────
# Environment metadata
# ──────────────────────────────────────────────────────────────────
{
  echo "=== Run metadata ==="
  echo "Date:           $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "Ollama version: $(ollama --version 2>&1 | head -1)"
  echo "macOS:          $(sw_vers -productVersion 2>/dev/null || echo unknown)"
  echo "Chip:           $(sysctl -n machdep.cpu.brand_string 2>/dev/null || echo unknown)"
  echo "Memory (GB):    $(( $(sysctl -n hw.memsize 2>/dev/null || echo 0) / 1073741824 ))"
  echo "Trials:         $TRIALS"
  echo ""
  echo "=== Model IDs ==="
  ollama show "$MLX_MODEL"  | head -10 | sed "s/^/  [$MLX_MODEL] /"
  echo ""
  ollama show "$GGML_MODEL" | head -10 | sed "s/^/  [$GGML_MODEL] /"
  echo ""
} > "$OUT_DIR/metadata.txt"

cat "$OUT_DIR/metadata.txt"

# ──────────────────────────────────────────────────────────────────
# Run trials
# ──────────────────────────────────────────────────────────────────
run_trials () {
  local model="$1"
  local label="$2"
  local out="$OUT_DIR/bench-${label}.txt"
  : > "$out"

  for i in $(seq 1 "$TRIALS"); do
    echo "▶ [$label] trial $i/$TRIALS..."
    {
      echo "=== Trial $i ==="
      ollama run "$model" --verbose "$PROMPT" 2>&1
      echo ""
    } >> "$out"
  done
}

run_trials "$MLX_MODEL"  "mlx"
run_trials "$GGML_MODEL" "ggml"

# ──────────────────────────────────────────────────────────────────
# Parse + summarize
# ──────────────────────────────────────────────────────────────────
summarize () {
  local label="$1"
  local out="$OUT_DIR/bench-${label}.txt"

  # Extract numeric eval rate + prompt eval rate per trial
  awk '
    /^prompt eval rate:/ { gsub(/[^0-9.]/,"",$4); pe[++p]=$4 }
    /^eval rate:/         { gsub(/[^0-9.]/,"",$3); er[++e]=$3 }
    /^eval count:/        { gsub(/[^0-9]/,"",$3);  ec[++c]=$3 }
    END {
      for (i=1;i<=p;i++) printf "  trial %d: prefill=%s tok/s  decode=%s tok/s  tokens=%s\n", i, pe[i], er[i], ec[i]

      # min / max / mean on decode
      if (e > 0) {
        mn = er[1]; mx = er[1]; sum = 0
        for (i=1;i<=e;i++) { sum += er[i]; if (er[i]<mn) mn=er[i]; if (er[i]>mx) mx=er[i] }
        printf "  decode  min=%.2f  mean=%.2f  max=%.2f  tok/s\n", mn, sum/e, mx
      }
      # same for prefill
      if (p > 0) {
        mn = pe[1]; mx = pe[1]; sum = 0
        for (i=1;i<=p;i++) { sum += pe[i]; if (pe[i]<mn) mn=pe[i]; if (pe[i]>mx) mx=pe[i] }
        printf "  prefill min=%.2f  mean=%.2f  max=%.2f  tok/s\n", mn, sum/p, mx
      }
    }
  ' "$out"
}

echo ""
echo "=== Results ==="
echo ""
echo "--- MLX / NVFP4 (qwen3.5:35b-a3b-coding-nvfp4) ---"
summarize mlx
echo ""
echo "--- GGUF / Q4_K_M (qwen3.5:35b-a3b) ---"
summarize ggml
echo ""
echo "Full output: $OUT_DIR/"
