# FAQ & Troubleshooting — Qwen 3.6 + Ollama

Common questions from the [video comments](https://youtu.be/VjCPqmESUCg) and the community. Updated regularly.

---

## Setup Issues

### "API Error: 403 Access to model denied"
**Cause:** You're hitting Qwen's cloud API, not your local Ollama. Qwen discontinued their free OAuth tier on April 15, 2026.

**Fix:** Launch Qwen Code with the local flag:
```bash
qwen --auth-type openai --model qwen3.6
```
This tells Qwen Code to use Ollama (local) instead of Qwen's cloud. Make sure your `~/.qwen/settings.json` has `baseUrl` set to `http://localhost:11434/v1`. See [settings.json](settings.json) in this repo.

### "Qwen Code shows auth screen instead of starting"
**Cause:** Settings file wasn't created before launching Qwen Code.

**Fix:** Create the settings file FIRST, then launch:
```bash
mkdir -p ~/.qwen
# Copy settings.json from this repo to ~/.qwen/settings.json
qwen --auth-type openai --model qwen3.6
```

### What does `--auth-type openai` mean?
It does NOT mean you're using OpenAI. It tells Qwen Code to use the OpenAI-compatible SDK protocol. Ollama exposes an API at `localhost:11434/v1` that speaks this same protocol. It's the format, not the provider.

---

## Tool Calling Issues

### "Model prints tool calls but doesn't execute them"
**Cause:** Your Ollama version is too old. Versions before 0.17.5 had a bug where Qwen's XML-based tool calling was routed through the wrong pipeline (JSON-based).

**Fix:** Update Ollama to latest (0.19+):
```bash
# Linux
curl -fsSL https://ollama.com/install.sh | sh

# macOS Homebrew
brew upgrade ollama

# macOS app — quit and reopen, it auto-updates
```

Verify: `ollama --version` — want 0.19 or higher.

### "Tool calls work sometimes but fail other times"
**Cause:** Qwen 3.5/3.6 tool calling is good but not 100% consistent. Known issue — the model occasionally fumbles JSON output or tool arguments.

**Fix:** Budget for re-prompts. If a tool call fails, say "try again" or rephrase the request. This is the reality of local models vs frontier cloud models.

---

## Context & Memory Issues

### "Model forgets what I said / asks 'what are you talking about?'"
**Cause:** Ollama defaults to only 4,096 tokens context. System prompts from Qwen Code eat most of that, leaving almost nothing for your actual conversation.

**Fix:** Set context length BEFORE starting Ollama:
```bash
export OLLAMA_CONTEXT_LENGTH=65536
```

On Linux with systemd:
```bash
sudo systemctl set-environment OLLAMA_CONTEXT_LENGTH=65536
sudo systemctl restart ollama
```

On macOS desktop app:
```bash
launchctl setenv OLLAMA_CONTEXT_LENGTH 65536
# Quit and reopen Ollama app
```

### "Response truncated due to token limits" / "API Error: 400 invalid message content type: nil"
**Cause:** The `max_tokens` in your settings.json caps output per response. Default of 8192 is too low for large files (HTML apps, long code).

**Fix:** In `~/.qwen/settings.json`, bump `max_tokens`:
```json
"samplingParams": {
  "max_tokens": 32768
}
```

### "What context window should I use?"
Depends on your RAM:
- **32GB RAM:** 65536 (64K) is comfortable
- **64GB RAM:** 131072 (128K) works well
- **128GB RAM:** 196608 (192K) is workable, 262144 (256K) max but slow

Larger context = more RAM used for KV cache. Start at 64K, go higher only if you need it.

---

## GPU Issues

### "Model is very slow / not using GPU"
**Check 1:** Verify GPU is being used:
```bash
ollama ps
```
If it says CPU, your GPU isn't detected.

**Check 2 (NVIDIA):** Verify drivers:
```bash
nvidia-smi
```
If not found, install drivers. Need CUDA 11.8+.

**Check 3 (Apple Silicon):** Activity Monitor → GPU tab should show activity during inference.

**Fix (Linux NVIDIA):**
```bash
# Install/update NVIDIA drivers
sudo apt install nvidia-driver-535
sudo systemctl restart ollama
```

### "Model crashes when splitting between GPU and CPU"
**Cause:** Fixed in Ollama 0.17.5. Update Ollama.

---

## Hardware Questions

### "What hardware do I need?"
| Your RAM | Recommended Model | Command |
|----------|------------------|---------|
| 32GB+ | Qwen 3.6 (best) | `ollama pull qwen3.6` |
| 24GB | Qwen 3.5 35B | `ollama pull qwen3.5:35b` |
| 16GB | Qwen 3.5 9B | `ollama pull qwen3.5` |
| 8GB | Qwen 3.5 4B | `ollama pull qwen3.5:4b` |

### "Can I run this on Linux with NVIDIA?"
Yes. Need NVIDIA compute capability 5.0+ and CUDA 11.8+. RTX 3060 and above work well.

### "Does MLX work on my Mac?"
MLX requires Apple Silicon (M1+) with 32GB+ unified memory. Ollama 0.19+ activates MLX automatically. No config needed.

---

## Remote Setup

### "Can I run Ollama on a separate machine?"
Yes. On the remote machine, start Ollama:
```bash
OLLAMA_HOST=0.0.0.0 ollama serve
```

In your `~/.qwen/settings.json` on the local machine, change baseUrl:
```json
"baseUrl": "http://REMOTE_IP:11434/v1"
```

Make sure port 11434 is open between the machines.

---

## Comparisons

### "Qwen Code vs OpenCode — which is better?"
Both work with Ollama. OpenCode has better context compaction (smarter at handling long sessions). Qwen Code is from the same team as the Qwen models. If you hit context limits often, try OpenCode.

### "LM Studio vs Ollama — which is better?"
LM Studio has more settings UI and is easier for beginners. Ollama is CLI-first and integrates better with coding agents (Claude Code, Qwen Code, OpenCode). For agentic coding, Ollama is the standard.

### "Is this as good as Claude Code?"
For complex multi-step work, frontier cloud models (Claude Opus, GPT-5) are still better. For everyday tasks (prototyping, scripts, simple apps), Qwen 3.6 locally is surprisingly close. See the video for a side-by-side comparison.
