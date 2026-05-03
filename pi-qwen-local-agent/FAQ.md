# FAQ — Pi + Qwen 3.6 + Ollama

Pre-seeded from competitor video comments and CloudYeti's prior local-AI uploads. Updated as new questions land in the YouTube comments.

> **PR welcome.** If you hit something not covered here, [open an issue](https://github.com/ravsau/ai-tutorials/issues/new) or PR an answer.

---

## Hardware

### Will this work on my 16/18GB Mac?

Probably not for the 27B model. macOS itself uses ~6-8 GB, leaving ~8-10 GB for the model. The 27B Q4 quant is ~16 GB on disk and needs ~24-36 GB to run smoothly.

**Smaller alternatives that work on tight RAM:**
- `qwen3.6:8b-nvfp4` — fits in 16 GB, still useful
- `qwen3.5:9b-nvfp4` — proven working baseline
- `gemma4:e4b-q4` — small, fast, [Philipp Schmid demoed it with Pi](https://x.com/_philschmid)

### Will this work on RTX 3090 / 4090 / 5090?

Yes, but harder. [@Web3Twon got it running on a 3090](https://x.com/Web3Twon) and called the result "minimal, fast, and wickedly capable." Most working setups on consumer NVIDIA cards report needing 80+ GB of VRAM for the 27B. With a single consumer card you'll likely need to:

- Use a smaller quant (Q3 or IQ3)
- Use `llama.cpp` directly with `-ngl` for partial GPU offload
- Or run the 8B variant instead of 27B

Mac's unified memory is what makes 36 GB workable in this exact lab.

### Linux + multiple GPUs?

Possible with model sharding (vLLM, llama.cpp tensor-split). Out of scope for this lab — open an issue if you want to contribute Linux setup notes.

### What about Strix Halo / AMD APU?

Unknown. If you've made it work, PR your benchmarks to [`benchmarks/`](./benchmarks/).

---

## Models & Quants

### Why Qwen 3.6 27B specifically?

Three reasons:
1. As of May 2026, it's the strongest open-weight model that fits in 36 GB of memory at Q4
2. Tool calling is reliable post the Unsloth chat-template fix (March 2026)
3. HuggingFace's Julien Chaumond publicly said it gets "very close" to Opus on his real codebase

You can swap in others — Gemma 4, Llama 3.1, GLM-4 — but check Pi compatibility first.

### Why not the bigger MoE variants — Qwen 3.6 30B-A3B Coder or 35B-A3B?

The MoE variants are *faster* (only 3B params active per token), but they're not better for agentic coding.

From a [r/LocalLLM thread](https://www.reddit.com/r/LocalLLM/) in late April 2026 comparing the three:

- **matt-k-wong:** *"qwen 3.6 27b dense will be better for agentic coding."*
- **Technical-Earth-3254:** *"The 27B, while miles ahead of both these MoE [for coding], will be super slow when not fitted entirely in VRAM."*
- **uniqueusername649:** *"It loops for me on the MLX version [of 35B-A3B] even with higher temps... GGUF with 0.6 rarely ever loops."*

The pattern: MoE models are great when speed matters, but on multi-step agentic tasks they get stuck in loops more often. 27B dense is slower per token but completes tasks more reliably.

**Useful pattern if you have the RAM:** run 30B-A3B by default for speed, escalate to 27B when it gets stuck. (matt-k-wong's suggestion in the same thread.) Out of scope for this lab.

### Why temperature 0.6 specifically?

Qwen 3.6 has a known looping behavior at low temperatures. The default in many setups is 0.1, which makes it spin in circles on agentic tasks. The Reddit thread above is full of developers confirming `temp: 0.6, topP: 0.95, topK: 20, minP: 0.0` as the stable config.

If you see the model repeating the same tool call or "thinking" in circles, check your temperature first.

### Q4 vs Q6 vs Q8 — which quant?

| Quant | Disk | Quality | When to use |
|---|---|---|---|
| Q4_K_M | ~16 GB | Good | 32-36 GB RAM Macs (this lab's default) |
| Q5_K_M | ~20 GB | Better | 48 GB+ RAM, want a quality bump |
| Q6_K_L | ~22 GB | Even better | 64 GB+ RAM, multi-turn agent work |
| Q8_0 | ~28 GB | Near-full | 96 GB+ RAM, willing to trade speed for quality |
| Q3_K_M / IQ3 | ~12 GB | Degraded | 24 GB RAM Macs, accept noticeably weaker output |

### Why Unsloth's quants specifically?

Unsloth pushed a chat-template fix in early March 2026 that resolved tool-call parsing bugs with Qwen 3.6 in Ollama, LM Studio, and Open WebUI. Pulling from the official Qwen repo without that fix can leave you with a model that "prints" tool calls instead of executing them.

### GGUF or MLX — which should I run?

For Qwen 3.6 27B dense: either is fine. MLX is ~2x faster on Apple Silicon (per the Ollama 0.19+ MLX backend release).

For Qwen 3.6 35B-A3B (the MoE variant): **GGUF is more stable**. There's a known looping issue with the MLX version of 35B-A3B even at correct temps. If you're going MoE, stick to GGUF until that's resolved upstream.

If you're following this lab (27B dense), pull the MLX-tagged variant if Ollama has it for that quant; fall back to standard GGUF otherwise.

### Smaller variants that work?

- `qwen3.5:9b-nvfp4` — fast, 16 GB-friendly
- `qwen3.6:8b-nvfp4` — even smaller, less capable
- `gemma4:e4b-q4` — Google's small model, Pi-compatible
- `qwen3.6:35b-a3b` — MoE variant, only activates 3B params per token, surprisingly fast on bigger Macs

---

## Pi (the agent)

### What's actually inside Pi?

Four built-in tools: `read`, `write`, `edit`, `bash`. Small system prompt. That's the entire default surface area. Compare with Claude Code's ~25,000-token system prompt with full tool catalog (file ops, web search, browser, database, MCP, …).

The minimalism is the point. Local models can't afford the overhead.

### Can I extend Pi with custom tools?

Yes — Pi supports extensions. Keep them targeted; one of the reasons Pi works is that you only load the tools you need. [@chetan2309 reports using fewer than 5 extensions](https://x.com/chetan2309) for daily coding work.

### Why Pi instead of OpenCode / Cline / Aider?

| Harness | Strength | Pairs with local models? |
|---|---|---|
| **Pi** | Minimal, prefix-cache-friendly, extensible | Yes — purpose-built for it |
| OpenCode | Polished UI, many providers | Variable — tool calls can drop on smaller Qwen quants |
| Cline | Forgiving tool-call parser | Yes — Yaroslav reports it works where Qwen Code didn't |
| Aider | Mature, repo-aware | Yes, but more cloud-oriented |

Pi was Mario's design choice for *minimalism specifically to support local models*. The others are more general.

### Pi can edit itself? Really?

Yes — if you give Pi the path to its own source, it will. Several developers report extending Pi *with Pi*. Be careful with that loop.

---

## Setup & Tooling

### Why Ollama instead of llama.cpp directly?

Ollama is a wrapper around llama.cpp. You can absolutely use llama.cpp directly (Pi supports that path too via OpenAI-compatible API). Ollama just makes it easier:
- One command to pull a model
- Automatic memory management
- HF model pulls in one line (`hf.co/...`)

For maximum performance and tuning, llama.cpp gives you more knobs.

### What's `contextWindow: 65536` and why does it matter?

Ollama's default context is 2,048 tokens. Any agent harness blows through that on the first prompt. Bump to 65,536 (or higher on bigger Macs) to stop the agent from "forgetting" mid-task. This is the single most common reason people say "it doesn't work."

### Where does Ollama store the models?

Mac default: `~/.ollama/models`. Each model is a few directories of binary files. To clean up: `ollama rm <model-tag>`.

### Tool calls aren't executing — Pi prints them but doesn't run them. Fix?

Known issue. Two things to try:
1. **Update Ollama** to 0.19 or later. Earlier versions had a chat-template parser bug.
2. **Use the Unsloth GGUF** (this lab's default) — it has the chat-template fix.

If still broken, switch harness temporarily: Cline + Ollama with the same model is more lenient with malformed tool calls.

### Why is the first response slow?

Cold start. Ollama loads ~16 GB of weights from disk into memory the first time you query a model. Takes 15-30 sec depending on your SSD speed. After the first call, subsequent ones are immediate.

To keep the model in memory between sessions:

```bash
killall ollama
OLLAMA_KEEP_ALIVE=30m ollama serve
```

### Does this work for Python / Rust / Go / TypeScript?

Yes. Qwen 3.6 27B handles all four reasonably. TypeScript and Python are strongest; Rust and Go are slightly weaker on complex generic-heavy code.

---

## Performance & Cost

### How fast is this really?

On a 36 GB M3 Mac running Qwen 3.6 27B Q4 via Pi: ~20 tokens/second (per Paras Chopra's reported benchmark). Faster on M3/M4 Pro/Max with more memory bandwidth. Roughly 2x faster again if you switch to MLX-tagged variants — see [the MLX video](https://youtu.be/HDlMRaJq8FE).

### What's the per-task cost?

Effectively electricity only. A typical agent task is ~30-90 sec of GPU + CPU activity. On a Mac that's measured in fractions of a cent.

### Will my Mac thermal-throttle?

For sustained heavy use, yes — especially MacBook Air. M-series Pro/Max chips with active cooling handle continuous inference fine. Mac Studio is the most stable option for all-day agent work.

### Battery drain?

Heavy. Plan for ~2-3 hr of agent use on a fully-charged MacBook Pro. Plug in for serious work.

---

## When to use this vs Claude Code

### When local wins

- Privacy-sensitive code (compliance, client work, IP)
- High-volume tasks where API costs would dominate
- Offline / airplane / poor-connectivity situations
- Self-contained scripts, single-file features
- Learning what's actually under the hood

### When cloud frontier wins

- Long, multi-file refactors (>500 LOC across files)
- Vision / multimodal workflows
- Tasks where your billable hour is worth more than the API spend
- Tight deadlines where you can't afford a 70%-correct answer

### The honest answer

Both. Route the easy 80% local, keep the hard 20% on cloud frontier models. A future video covers the routing logic.

---

## Reporting issues

Open an issue at [github.com/ravsau/ai-tutorials](https://github.com/ravsau/ai-tutorials/issues/new). Include:
- Hardware (chip, RAM)
- Ollama version (`ollama --version`)
- Pi version (`pi --version`)
- Model tag and quant
- The exact error or symptom

If you found a fix, PR an addition to this FAQ.
