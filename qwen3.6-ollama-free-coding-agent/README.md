# $0 Coding Agent: Qwen 3.6 + Ollama

Run a fully agentic coding CLI on your own laptop. No API keys. No token meter. No cloud.

This sets up **Qwen Code** (open-source agentic CLI from the Qwen team) with **Ollama** running Qwen 3.6 locally. The result: a Claude Code-style workflow where the model reads files, edits code, runs commands, and iterates — on your hardware.

**Companion video:** [CloudYeti YouTube](https://youtube.com/@cloudyeti)

---

## What you get

- Full agentic workflow: reads files, writes code, runs commands, iterates
- Tool-calling, thinking mode, 256K context
- Zero cost per token. Runs offline.

## What you need

| Requirement | Details |
|---|---|
| RAM | 32GB+ recommended. 16GB works with smaller models. |
| Disk | ~24GB for the model |
| Node.js | v20+ |
| Ollama | Latest (v0.19+) |

---

## Setup (10 minutes)

### 1. Install Ollama

```bash
# macOS / Linux
curl -fsSL https://ollama.com/install.sh | sh

# macOS via Homebrew
brew install ollama
```

### 2. Pull Qwen 3.6

```bash
ollama pull qwen3.6
```

**Smaller machines?** Use these instead:

| Your RAM | Model | Command |
|----------|-------|---------|
| 32GB+ | Qwen 3.6 (recommended) | `ollama pull qwen3.6` |
| 16GB | Qwen3-Coder 8B | `ollama pull qwen3-coder:8b` |
| 16GB | Qwen 2.5 Coder 7B | `ollama pull qwen2.5-coder:7b` |
| 8GB | Qwen 2.5 Coder 3B | `ollama pull qwen2.5-coder:3b` |

### 3. Smoke test

```bash
ollama run qwen3.6
```

Type a prompt. If it responds, you're good. `/bye` to exit.

### 4. Install Qwen Code

```bash
npm install -g @qwen-code/qwen-code
```

### 5. Configure

```bash
mkdir -p ~/.qwen
cp settings.json ~/.qwen/settings.json
```

Or create `~/.qwen/settings.json` manually — see [settings.json](settings.json) in this repo.

### 6. Fix the context window (important)

Ollama defaults to 4096 tokens. Your agent will silently lose context without this:

```bash
export OLLAMA_CONTEXT_LENGTH=65536
```

On macOS desktop app:
```bash
launchctl setenv OLLAMA_CONTEXT_LENGTH 65536
# Quit and reopen Ollama
```

### 7. Launch

```bash
qwen
```

Select your model with `/model`. Done. You have a free local coding agent.

---

## Demo prompts

### 3D Aquarium

```
Build me a 3D aquarium as a single HTML file using Three.js from CDN.
Glass tank with water, at least 5 fish swimming around with simple animation,
some plants or coral at the bottom, soft lighting. Make it interactive so
I can rotate the camera with my mouse.
```

### Designer Portfolio Website

```
Build a portfolio website for a UI designer as a single HTML file.
Modern, dark theme, smooth scroll, sections for hero, about, projects grid
with hover effects, and contact. Use a clean sans-serif font from Google Fonts.
Make it look like something you'd see on Awwwards.
No placeholder images needed, use solid color blocks.
```

### MacOS-Style Desktop (stress test)

```
Build a MacOS-style desktop environment as a single HTML file.
Top menu bar with clock, dock at the bottom with app icons, draggable windows
that can be opened and closed, a simple notepad app, a calculator app, and
a file manager that shows fake files. Dark mode. Make the windows draggable
and resizable.
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `ECONNREFUSED 127.0.0.1:11434` | Ollama isn't running. `ollama serve` or open the app. |
| Model not in `/model` picker | Check `~/.qwen/settings.json`. ID must match `ollama list` exactly. |
| Responses cut off mid-sentence | Context too low. Set `OLLAMA_CONTEXT_LENGTH=65536`. |
| Tool calls fail | Update Ollama: `ollama --version` — want 0.19+. |
| Out of memory | Reduce context to 16384 or use a smaller model. |
| Slow inference | Check GPU is active. Apple Silicon: Activity Monitor → GPU. NVIDIA: `nvidia-smi`. |

---

## Going further

- **Swap models:** Add more entries to `settings.json` and switch via `/model`
- **MCP servers:** Qwen Code supports MCP. Add filesystem, git, or custom tools.
- **Use with other agents:** Works with Cline, Continue.dev, or any OpenAI-compatible client pointing at `localhost:11434/v1`

---

Built by [CloudYeti](https://cloudyeti.io) — AI + Cloud for engineering teams.
