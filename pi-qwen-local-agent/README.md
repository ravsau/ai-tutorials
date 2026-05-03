# Is Pi THE Agent for Local Coding Models?

> Companion lab for the CloudYeti video answering that practical question. Setup, configs, and demo prompts shown on screen.

If you're running local AI models — Qwen, Llama, Gemma — the question isn't whether the model works. It's which agent harness should drive it. This lab tests Pi (Mario Zechner's open-source coding agent) with Qwen 3.6 27B on a Mac and answers: is this the one?

**Why Pi specifically (the load-bearing claim):** Pi ships four tools — read, write, edit, bash — and a small system prompt. Claude Code's system prompt is ~25,000 tokens. Local models can't afford that overhead. Pi's surface area is roughly 100x smaller, which is why a 27-billion-parameter local model can act as an actual agent in this setup.

— [@_philschmid](https://x.com/_philschmid) counted Pi's tools. [@antirez](https://x.com/antirez) counted Claude Code's.

---

## What this lab walks through

| Step | What you'll do | Time |
|---|---|---|
| 1 | Install Ollama (CLI or desktop) | 1 min |
| 2 | Pull Qwen 3.6 27B (4-bit, ~16GB) from Unsloth | 5-10 min (download) |
| 3 | Install Pi via one-line curl | 30 sec |
| 4 | Drop in the [`settings.json`](./settings.json) so Pi talks to local Ollama | 30 sec |
| 5 | Start Pi, give it a real coding task, watch it run | 3-5 min |
| 6 | Try the [demo prompts](./demo-prompts/) on your machine | as long as you want |

Total setup: ~10 minutes. Disk: ~16 GB. Memory: 32 GB recommended (36+ ideal).

---

## Hardware floor — please read before opening an issue

This lab is verified on **Apple Silicon Macs (M2/M3/M4) with 32-128GB of unified memory.**

If you're somewhere else:

| Hardware | Verdict | Notes |
|---|---|---|
| M3 Mac, 36GB unified | ✅ Reference setup. ~20 tok/s on Qwen 3.6 27B Q4. | Paras Chopra's exact stack. |
| M3/M4 Mac, 64-128GB | ✅ Comfortable. Try Q6 or Q8 quants for higher quality. | More headroom for context window. |
| M1 Pro, 32GB | ⚠️ Marginal. Will work but slower. Consider Qwen 3.6 8B variant. | |
| M1/M2/M3, 16-18GB | ❌ Too tight for the 27B model. Try `qwen3.6:8b-nvfp4` instead. | |
| RTX 3090 / 4090 / 5090 (24-32GB VRAM) | ⚠️ Possible, harder. [@Web3Twon](https://x.com/Web3Twon) reports it works. | Most working setups need 80GB+ VRAM; consumer cards are tighter. |
| Linux + multiple consumer GPUs | ⚠️ Possible with model sharding | Not covered in this lab. |
| Strix Halo / AMD / Intel iGPU | ❓ Unknown | If you've made it work, [open a PR](#contributing) with notes. |

---

## Step 1 — Install Ollama

```bash
brew install ollama
ollama serve
```

Or grab the desktop app from [ollama.com](https://ollama.com). Either works.

---

## Step 2 — Pull Qwen 3.6 27B (Unsloth Q4 quant)

```bash
ollama pull hf.co/unsloth/Qwen3.6-27B-GGUF:Q4_K_M
```

This is the quant Paras Chopra used in his demo. ~16 GB on disk. If you want higher quality and have the RAM, try `:Q6_K_L` or `:Q8_0` from the same Unsloth repo.

> **Note on the Unsloth versions:** Unsloth shipped a chat-template fix in early March 2026 that resolved tool-call parsing issues with Qwen 3.6 + agent harnesses. Make sure you're pulling a recent version, not a stale local copy.

---

## Step 3 — Install Pi

```bash
curl -fsSL https://pi.dev/install.sh | sh
```

One line. The Pi binary lands in your PATH.

> **What is Pi?** An open-source coding agent by [Mario Zechner](https://x.com/badlogicgames). It's deliberately minimal — four built-in tools (`read`, `write`, `edit`, `bash`), small system prompt, designed so the model's attention goes to your code, not to remembering all the things it could be doing.

---

## Step 4 — Point Pi at your local Ollama

```bash
mkdir -p ~/.pi
cp settings.json ~/.pi/settings.json
```

The `settings.json` in this repo:

```json
{
  "provider": "ollama",
  "baseUrl": "http://localhost:11434",
  "model": "hf.co/unsloth/Qwen3.6-27B-GGUF:Q4_K_M",
  "contextWindow": 65536
}
```

**Two lines most people miss:**

- **`contextWindow`** — Ollama's default is 2048 tokens, which any agent harness blows through on the first prompt. Bumping to 65,536 stops the agent from "forgetting" mid-task. With 64+ GB of RAM, push to 131072 or higher.
- **`temperature: 0.6`** — Qwen 3.6 loops at lower temps. The default in many setups is 0.1, which makes the model spin in circles on agentic tasks. Multiple developers in [r/LocalLLM threads](https://www.reddit.com/r/LocalLLM/) confirm: 0.6 with `topP: 0.95`, `topK: 20`, `minP: 0.0` is the stable config.

---

## Step 5 — Start Pi

```bash
pi
```

You're in. Pi loads Qwen 3.6 via Ollama and waits for input.

---

## Step 6 — Try a real task

The demo from the video — ask Pi to read your `package.json`, write a Node script, run it, format output:

```
Read the package.json in this directory. Then write a small Node script that
hits the GitHub API, lists my last five public repos, and prints them as a
markdown table sorted by stars.
```

More demo prompts in [`./demo-prompts/`](./demo-prompts/), including the harder cases that show where local falls short of frontier.

---

## What works well

- ✅ Single-file edits and new feature scripts
- ✅ Reading project context (package.json, tsconfig, requirements.txt) and adapting code to it
- ✅ Running tests, parsing failures, fixing the obvious cases
- ✅ Light refactors within one file
- ✅ Generating one-off utilities, README sections, config files
- ✅ Privacy-sensitive code where you can't ship to a cloud provider

## What doesn't work yet

- ❌ Long, multi-file refactors. Pi + Qwen got ~70% on a 500-line TypeScript API migration before losing track. Sonnet finished cleanly.
- ❌ Tool-call edge cases. Sometimes Qwen returns malformed parameters; Pi recovers but it's an extra retry.
- ❌ Vision / multimodal. The integration is rough as of May 2026.
- ❌ Heavy parallel work. Single-stream agent only — no multi-agent orchestration in Pi's default mode.

The honest framing: **route the easy 80% local, keep the hard 20% on cloud frontier models.**

---

## Cost math

Numbers depend on your workflow, but for a heavy Claude Code user (~50 agent tasks per workday):

| Setup | Cost per task | Cost per month |
|---|---|---|
| Claude Code (Sonnet 4.6 / Opus 4.7 mix, Max plan) | $0.40 - $1.20 | ~$600 - $1,800 |
| Pi + Anthropic API (same models) | $0.30 - $1.00 | ~$450 - $1,500 |
| Pi + Qwen 3.6 + Ollama (this lab) | ~$0 | electricity only |

Per engineer. Multiply by team size for the real number.

---

## Endorsements driving this conversation

- **Mario Zechner** ([@badlogicgames](https://x.com/badlogicgames)), Pi creator, 2026-04-30: *"Turns out not killing the prefix cache all the time and not having a humongous set of tools and a massive system prompt is good for local model use."*
- **Salvatore Sanfilippo** ([@antirez](https://x.com/antirez)), Redis creator, 2026-04-30: *"Claude Code system prompt is 25k tokens. Incredible."*
- **Philipp Schmid** ([@_philschmid](https://x.com/_philschmid)), HuggingFace, 2026-04-27: *"Pi provides four tools: read, write, edit, and bash."*
- **Clem Delangue** ([@ClementDelangue](https://x.com/ClementDelangue)), HuggingFace CEO, 2026-04-30: *"Pi + llamacpp + Qwen3.6 = 🔥🔥🔥🔥"*
- **Julien Chaumond** ([@julien_c](https://x.com/julien_c)), HuggingFace cofounder, 2026-04-24: *"Very close to hitting the latest Opus in Claude... in full airplane mode."*
- **Paras Chopra** ([@paraschopra](https://x.com/paraschopra)), Wadhwani AI: ~20 tok/s on M3 36GB, full HTML page generated locally.
- **Twon** ([@Web3Twon](https://x.com/Web3Twon)): replicated on RTX 3090 — *"minimal, fast, and wickedly capable."*

Full receipts (12 cited tweets) in the CloudYeti production notes.

---

## Companion video

[CloudYeti — Self-Driving Laptops: Pi + Qwen 3.6 Local Coding Agents](https://youtube.com/@CloudYeti) *(link will be filled in once published)*

If something here is wrong, [open an issue](https://github.com/ravsau/ai-tutorials/issues/new) or send a PR. I'd rather get corrected than be wrong.

---

## See also

- [`FAQ.md`](./FAQ.md) — answers to questions before they hit the comments
- [`demo-prompts/`](./demo-prompts/) — the three test prompts from the video, ready to copy-paste:
  - [Test 1 — small script with codebase context](./demo-prompts/01-github-repos-table.md)
  - [Test 2 — bug fix workflow](./demo-prompts/02-bug-fix-workflow.md)
  - [Test 3 — hard refactor (where it falls apart)](./demo-prompts/03-hard-refactor.md)
- [`demo-outputs/`](./demo-outputs/) — actual sessions + diffs Pi produced on each test, for viewers who want the raw evidence (added per the comment requests on the [Qwen 3.6 video](https://youtu.be/VjCPqmESUCg))
- [`benchmarks/`](./benchmarks/) — empty for now; PR your tokens-per-second from different hardware

## Contributing

PRs welcome on:
- Hardware data points (especially non-Mac setups)
- New demo prompts that exercise different parts of the agent
- FAQ additions for questions I missed
- Correction of any technical claim above

## License

MIT. Use this however helps you.
