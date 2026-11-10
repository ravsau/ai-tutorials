#!/usr/bin/env bash
# Start Qwen3.8-Flash-Next with llama.cpp. The first start downloads the model (resumes if stopped).
# Usage:  ./start.sh                     picks the file size from your RAM
#         QUANT=UD-IQ3_XXS ./start.sh    choose the file yourself (see the table in README.md)
#         CTX=32768 PORT=8081 ./start.sh more context, other port
#         ./start.sh --cpu-moe           NVIDIA PC: keep the experts in system RAM (any extra flags go to llama-server)
set -euo pipefail

if [[ "$(uname)" == "Darwin" ]]; then
  RAM_GB=$(( $(sysctl -n hw.memsize) / 1073741824 ))
else
  RAM_GB=$(( $(awk '/MemTotal/ {print $2}' /proc/meminfo) / 1048576 ))
fi

if [[ -z "${QUANT:-}" ]]; then
  if   (( RAM_GB >= 500 )); then QUANT=Q8_0
  elif (( RAM_GB >= 250 )); then QUANT=UD-Q6_K_XL
  elif (( RAM_GB >= 180 )); then QUANT=UD-Q5_K_XL
  elif (( RAM_GB >= 120 )); then QUANT=UD-IQ4_XS
  elif (( RAM_GB >= 90  )); then QUANT=UD-IQ2_XS
  else
    echo "This machine has ${RAM_GB} GB of RAM. Qwen3.8-Flash-Next needs about 90 GB or more."
    echo "Try a smaller model instead, for example Qwen3.6-35B-A3B (see the other folders in this repo)."
    exit 1
  fi
fi

CTX=${CTX:-65536}
PORT=${PORT:-8080}
echo "RAM: ${RAM_GB} GB  |  file: ${QUANT}  |  context: ${CTX}  |  http://127.0.0.1:${PORT}"

exec llama-server \
  -hf "unsloth/Qwen3.8-Flash-Next-GGUF:${QUANT}" \
  --alias qwen3.8-flash-next \
  -c "${CTX}" -ngl 99 -fa on --jinja \
  --temp 1.0 --top-p 0.95 --top-k 20 --min-p 0.0 \
  --host 127.0.0.1 --port "${PORT}" \
  "$@"
