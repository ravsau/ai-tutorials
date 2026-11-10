# Run Qwen3.8-Flash-Next Locally with llama.cpp (Step by Step)

Companion guide for the CloudYeti video (link added after publish). It works for any Mac with 96 GB or more of
unified memory, and for PCs with enough system RAM. Every step has the exact command and a check.

> Status: written 2026-11-09. It is being tested on camera on an M3 Max with 128 GB; speed numbers are added after the video.
> If a step fails for you, [open an issue](https://github.com/ravsau/ai-tutorials/issues/new?labels=qwen3.8-flash-next) with your machine and the error.

## What you are running

| Fact | Value |
|---|---|
| Model | [Qwen/Qwen3.8-Flash-Next](https://huggingface.co/Qwen/Qwen3.8-Flash-Next) (open weights, released 2026-08-24) |
| Size | 125B parameters, but only 6B are active for each token, so it runs much faster than a 125B dense model |
| Context | 262,144 tokens native |
| Files used here | [unsloth/Qwen3.8-Flash-Next-GGUF](https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF) (smaller "quantized" versions) |
| Runner | [llama.cpp](https://github.com/ggml-org/llama.cpp) `llama-server`: one command downloads the model, serves a chat page and an OpenAI-compatible API |

## Which file fits your machine

The model file must fit in memory with room left for your system and the context. Pick the row for your RAM.

| Your RAM | File (QUANT) | Download size | Notes |
|---|---|---|---|
| less than 96 GB | none | n/a | This model does not fit. Use a smaller model, like Qwen3.6-35B-A3B. |
| 96 GB | `UD-IQ2_XS` | 75.8 GB | Fits, but 2-bit costs quality. |
| 128 GB | `UD-IQ4_XS` | 93.7 GB | Best fit. Use `UD-IQ3_XXS` (83.6 GB) if you want more context. |
| 192 GB | `UD-Q5_K_XL` | 158.3 GB | `UD-Q4_K_XL` (111.3 GB) leaves more room. |
| 256 GB | `UD-Q6_K_XL` | 169.2 GB | |
| 512 GB | `Q8_0` | 188.2 GB | Near full quality. |

Sizes are from the Hugging Face file list, read 2026-11-09. `start.sh` picks the row for you; you can override it.

---

## Step 1: Check your machine (1 minute)

Mac:
```bash
echo "RAM: $(( $(sysctl -n hw.memsize) / 1073741824 )) GB"
df -h ~ | tail -1
```
Linux:
```bash
free -g | head -2
df -h ~ | tail -1
```
**Check:** RAM is 96 GB or more, and free disk space is bigger than the download size in the table (plus 1 GB for the
vision file).

## Step 2: Install or update llama.cpp (2 minutes)

Mac (Homebrew):
```bash
brew install llama.cpp      # first time
brew upgrade llama.cpp      # if you already have it
```
Linux / Windows: download a release build from [github.com/ggml-org/llama.cpp/releases](https://github.com/ggml-org/llama.cpp/releases).

**Check:**
```bash
llama-server --version
```
The model is new. Unsloth says to use the latest llama.cpp. Old builds fail later with an "unknown model architecture"
error. If Homebrew does not have a new enough build yet, build it from source (Mac, about 5 minutes):
```bash
git clone https://github.com/ggml-org/llama.cpp
cmake llama.cpp -B llama.cpp/build -DBUILD_SHARED_LIBS=OFF
cmake --build llama.cpp/build --config Release -j --target llama-server llama-cli
export PATH="$PWD/llama.cpp/build/bin:$PATH"
```

## Step 3 (Mac only): Let the GPU use more of your memory (30 seconds)

macOS lets the GPU use only part of your RAM by default. This model needs more. This command sets the limit to your
RAM minus 10 GB, so macOS keeps 10 GB for itself:
```bash
sudo sysctl iogpu.wired_limit_mb=$(( $(sysctl -n hw.memsize) / 1048576 - 10240 ))
```
**Check:**
```bash
sysctl iogpu.wired_limit_mb
```
It shows the new number. The setting goes back to the default when you restart the Mac. To undo it now:
`sudo sysctl iogpu.wired_limit_mb=0`.

## Step 4: Get the start script (30 seconds)

```bash
git clone https://github.com/ravsau/ai-tutorials.git
cd ai-tutorials/qwen3.8-flash-next-llamacpp
```

## Step 5: Start the model (the first start downloads it)

```bash
./start.sh
```
To choose the file yourself: `QUANT=UD-IQ3_XXS ./start.sh`. For less memory: `CTX=32768 ./start.sh`.

The script runs this one command (you can also type it yourself):
```bash
llama-server -hf unsloth/Qwen3.8-Flash-Next-GGUF:UD-IQ4_XS --alias qwen3.8-flash-next \
  -c 65536 -ngl 99 -fa on --jinja --temp 1.0 --top-p 0.95 --top-k 20 --min-p 0.0 \
  --host 127.0.0.1 --port 8080
```
What the flags do:
- `-hf ...:UD-IQ4_XS` downloads that file from Hugging Face (all 4 parts) and loads it.
- `-c 65536` is the context size. Coding agents need this much: their first prompt alone can be 2,000 to 20,000
  tokens, and a one-file website is about 10,000 more. 16,384 is too small. Bigger context uses more memory.
- `-ngl 99` puts all layers on the GPU. `-fa on` turns on flash attention (faster, less memory).
- `--jinja` uses the model's own chat template, which tool calling needs.
- `--temp 1.0 --top-p 0.95 --top-k 20 --min-p 0.0` are the sampling settings Unsloth recommends for thinking mode
  ([Unsloth guide](https://unsloth.ai/docs/models/qwen3.8-next)).

The download is large. At 50 MB/s, 94 GB takes about 30 minutes. If it stops, run `./start.sh` again and it continues.

**Check:** the log ends with a line like `server is listening on http://127.0.0.1:8080`.

## Step 6: Chat in your browser (1 minute)

Open [http://127.0.0.1:8080](http://127.0.0.1:8080). llama.cpp has a built-in chat page. Ask something small first.

## Step 7: Measure the speed (1 minute)

In a second terminal:
```bash
curl -s http://127.0.0.1:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"qwen3.8-flash-next","messages":[{"role":"user","content":"Write a Python function that checks if a number is prime."}]}' \
  | python3 -c "import json,sys; d=json.load(sys.stdin); t=d['timings']; print(d['choices'][0]['message']['content'][-300:]); print(f\"\nprompt: {t['prompt_per_second']:.1f} tok/s   output: {t['predicted_per_second']:.1f} tok/s\")"
```
**Check:** you see the answer and two speeds. "output tok/s" is how fast it writes.

Watch memory while it runs: Mac: Activity Monitor > Memory (look at "Memory Pressure", green is fine).
Linux: `watch -n 1 free -g`.

## Step 7b: Measure the reading speed (2-6 minutes)

Coding agents send a long prompt before the model writes anything, so reading speed matters as much as writing speed:
```bash
python3 long-prompt-test.py              # about 20,000 tokens, with a hidden code to check recall
```

## Step 8: Use it from a coding agent (5 minutes)

The server is OpenAI-compatible at `http://127.0.0.1:8080/v1`, so any agent that accepts a custom endpoint works.

**OpenCode:**
```bash
curl -fsSL https://opencode.ai/install | bash
cp opencode.json /path/to/your/project/opencode.json
cd /path/to/your/project && opencode
```
Then pick the model "Qwen3.8 Flash Next (local)" with `/models`.

**Pi:**
Install Pi only if you do not have it. When the installer asks `Start pi now? [Y/n]`, answer `n`: that starts Pi
with your default provider (a cloud model if you set one), not the local model.
```bash
curl -fsSL https://pi.dev/install.sh | sh
```
Then:
```bash
cd ai-tutorials/qwen3.8-flash-next-llamacpp       # the folder you cloned in Step 4
python3 add-to-pi.py                              # adds one provider, keeps yours, saves models.json.bak
mkdir -p ~/qwen-demo && cd ~/qwen-demo            # an empty folder for the agent to work in
pi -ne -ns -nc --provider llama-cpp-flash-next --model qwen3.8-flash-next
```
The provider has its own name (`llama-cpp-flash-next`), so it does not clash with a `llama-cpp` provider you
already have. If Pi says `Connection error`, the provider points at a port where no server runs: check that
`start.sh` is still running in the first terminal.

**Check that Pi uses the local model:** the bottom right of Pi must show `(llama-cpp-flash-next) qwen3.8-flash-next`,
and the bottom left must show no `$` cost. If you see another provider or a cost, you are on a cloud model: exit
and start Pi again with the flags above.

Why `-ne -ns -nc`: they turn off extensions, skills and AGENTS.md/CLAUDE.md files for this run. Pi's own prompt is
small, but installed extensions and skills are added to every first prompt. In my test, the first prompt was 19,567
tokens with my extensions and 1,684 tokens without them, and the same small task took 6:27 vs 1:10 on a local 27B model.
A local model reads the prompt much slower than a cloud model, so keep it lean.

**Check:** give the agent a small task, like "create hello.py that prints the date", and see the file appear.

## Step 9: Stop it and free the memory

Press `Ctrl+C` in the terminal that runs `start.sh`. Do not use `kill -9` on a busy server on a Mac: it can leave GPU
memory locked until you restart.

---

## NVIDIA PC (24-48 GB GPU, lots of system RAM)

This model is a mixture of experts. You can keep the experts in system RAM and the rest on the GPU:
```bash
QUANT=UD-IQ4_XS ./start.sh --cpu-moe
```
You need system RAM bigger than the file size plus about 10 GB. Not tested by me yet; if it works for you, open a PR
with your GPU, RAM and speed.

## Problems and fixes

| Problem | Fix |
|---|---|
| `unknown model architecture` | Your llama.cpp is too old. Do Step 2 again. |
| `has invalid ggml type 42` / `failed to read tensor info` | Your llama.cpp is too old for the new 2-bit type in this file (Homebrew build 9878 fails). Build from source (end of Step 2). The file is fine; do not download it again. |
| Crash or "failed to allocate" when loading | Do Step 3, or use a smaller file (`QUANT=UD-IQ3_XXS`), or a smaller context (`CTX=8192`). |
| Very slow, Memory Pressure is red | The file is too big for your RAM. Use the next smaller row in the table. |
| Download stops | Run `./start.sh` again; it continues where it stopped. |
| Faster output with MTP | MTP needs Unsloth's custom llama.cpp branch for now; see the MTP section of the [Unsloth guide](https://unsloth.ai/docs/models/qwen3.8-next). |
| `exceeds the available context size (16384 tokens)` | The prompt does not fit. Stop the server (`Ctrl+C`), then `CTX=65536 ./start.sh`. In Pi, also use `-ne -ns -nc` to make the first prompt small. |
| A new `CTX` has no effect (the error still says the old size) | An old server still runs on port 8080, so the new one could not start. Stop the old one with `Ctrl+C` in its terminal, then start again. Check with `curl -s http://127.0.0.1:8080/props \| grep -o '"n_ctx":[0-9]*'`. |
| Port 8080 already in use | `PORT=8081 ./start.sh`, and change the port in `opencode.json` / `pi-models.json`. |

## Files in this folder

| File | What it is |
|---|---|
| `start.sh` | Picks the file from your RAM and starts `llama-server` |
| `opencode.json` | OpenCode config for the local server |
| `pi-models.json` | Pi config for the local server |
| `add-to-pi.py` | Adds `pi-models.json` to `~/.pi/agent/models.json` without removing your other providers |
| `demo-prompts.md` | 8 prompts to push the model (from DataCamp, Simon Willison, r/LocalLLaMA, and mine), with a score sheet |
| `long-prompt-test.py` | Reading-speed test with a hidden code (Python standard library only) |

---

**[📚 Courses: cloudyeti.io/courses](https://cloudyeti.io/courses)** · **[🎓 learn.cloudyeti.io](https://learn.cloudyeti.io)** · **[📅 Book 1:1 consulting: cloudyeti.io/meet](https://cloudyeti.io/meet)**
