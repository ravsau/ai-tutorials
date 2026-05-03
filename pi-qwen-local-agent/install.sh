#!/usr/bin/env bash
# Pi + Qwen 3.6 + Ollama — local coding agent setup script
# Usage: bash install.sh
# Verified on macOS (Apple Silicon). Linux paths differ — see README hardware notes.

set -euo pipefail

PI_SETTINGS_DIR="$HOME/.pi"
MODEL_TAG="hf.co/unsloth/Qwen3.6-27B-GGUF:Q4_K_M"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "==> Pi + Qwen 3.6 + Ollama installer"
echo

# 1. Ollama
if ! command -v ollama >/dev/null 2>&1; then
  echo "==> Installing Ollama via Homebrew"
  if ! command -v brew >/dev/null 2>&1; then
    echo "  ❌ Homebrew not found. Install from https://brew.sh or grab Ollama desktop from https://ollama.com"
    exit 1
  fi
  brew install ollama
else
  echo "==> Ollama already installed ($(ollama --version 2>/dev/null | head -1))"
fi

# 2. Make sure ollama serve is running
if ! pgrep -x ollama >/dev/null 2>&1; then
  echo "==> Starting ollama serve in the background (logs at /tmp/ollama.log)"
  nohup ollama serve >/tmp/ollama.log 2>&1 &
  sleep 2
fi

# 3. Pull Qwen 3.6
echo "==> Pulling $MODEL_TAG (~16 GB on disk — this can take 5-15 minutes on first run)"
ollama pull "$MODEL_TAG"

# 4. Install Pi
if ! command -v pi >/dev/null 2>&1; then
  echo "==> Installing Pi (https://pi.dev)"
  curl -fsSL https://pi.dev/install.sh | sh
else
  echo "==> Pi already installed ($(pi --version 2>/dev/null | head -1 || echo 'version unknown'))"
fi

# 5. Drop in settings.json
mkdir -p "$PI_SETTINGS_DIR"
if [ -f "$PI_SETTINGS_DIR/settings.json" ]; then
  echo "==> $PI_SETTINGS_DIR/settings.json already exists; backing up to settings.json.bak"
  cp "$PI_SETTINGS_DIR/settings.json" "$PI_SETTINGS_DIR/settings.json.bak"
fi
cp "$SCRIPT_DIR/settings.json" "$PI_SETTINGS_DIR/settings.json"
echo "==> Wrote $PI_SETTINGS_DIR/settings.json"

echo
echo "✅ Done. Run \`pi\` to start the agent."
echo "   First launch loads ~16 GB of weights into memory; allow 15-30 sec for the first response."
echo "   Try one of the prompts in ./demo-prompts/ to verify it's working."
