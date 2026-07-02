# Rough Transcript Sketch — Gemma 4 + Ollama + MLX MTP

This is not a word-for-word teleprompter. It is a loose A-roll sketch so you can record naturally without losing the message.

## 00:00 — Cold open / claim

If you're running local models on a Mac with Ollama, there is something you should know about.

Gemma 4 just got a lot faster on Apple Silicon, but the catch is you want the MLX version.

Ollama's chart shows 95 tokens per second with MTP versus about 50 tokens per second without it.

But I want to be precise here: the story is not “Ollama invented MTP” and it is not “Gemma 4 magically became smarter.”

The story is that MTP support is now showing up in the Ollama plus MLX path on Apple Silicon, starting with Gemma 4, and Ollama says more models are coming.

My last Ollama plus MLX video became one of the biggest videos on this channel, so today I want to test what this new speedup actually means on my Mac.

## 00:45 — Correct framing: what MLX and MTP mean

Before I run the benchmark, two quick definitions.

MLX is Apple's machine learning framework for Apple Silicon. In normal-person terms: it is a runtime designed to make models run efficiently on Mac hardware, using the unified memory and Apple Silicon GPU path instead of treating the Mac like a generic CPU machine.

MTP means multi-token prediction. It is part of a broader family of speculative decoding speedups.

The basic idea is: instead of generating exactly one token, then one token, then one token, the runtime can draft multiple future tokens and then keep the ones that pass verification.

So if normal generation is like typing one word at a time, MTP is more like autocomplete guessing several words ahead — but with a check so bad guesses do not become the final answer.

And this is not brand-new in the ecosystem. llama.cpp already has visible MTP / draft-MTP support. What is interesting here is that Ollama is now making this useful in the Apple Silicon MLX path for Gemma 4.

That matters because Mac local AI is usually limited by two things: model quality and speed. MTP does not magically improve quality, but it can make a usable model feel much more responsive.

## 01:45 — The claim from Ollama

Here is the actual claim from Ollama.

Gemma 4 is nearly 90% faster on Apple Silicon with Ollama using MLX.

The speedup comes from improved multi-token prediction, now on by default for Gemma 4.

And the part I really like is this: Ollama says it automatically tunes how many tokens to draft as it runs, so it does not keep speculating when speculation is no longer helping.

That is important because speculative decoding can backfire if the draft tokens are not useful. The trick is not just drafting more; the trick is drafting when it helps and backing off when it does not.

## 03:00 — Setup

Before I test it, here is the setup.

I am on my 128GB Apple Silicon Mac. I am using Ollama, and I am going to test Gemma 4 through the current Ollama path.

The exact model tag, Ollama version, and benchmark prompt are in the companion repo. I am also putting the script there so you can run the same test on your machine.

One important caveat: Ollama's chart is Gemma 4 12B nvfp4 on an M5 Max. If I cannot perfectly match that hardware and exact model variant, then I should not claim my number is the same benchmark. What I can test is whether the current local experience is actually fast and useful.

## 04:00 — Benchmark 1: raw speed

First, I am running a simple generation benchmark.

The script sends a prompt to Ollama's `/api/generate` endpoint and reads the timing fields that Ollama returns: prompt eval count, prompt eval duration, eval count, and eval duration.

The number I care about most is decode tokens per second, because that is the speed you feel while the model is generating.

I am going to run it three times instead of trusting one run, because local inference can vary depending on warm-up, caching, and memory pressure.

[Show results]

So on my machine, with `gemma4:26b-mlx`, I saw about 84 tokens per second median decode speed on the short explainer prompt, and about 102 tokens per second median decode speed on the coding-style prompt.

I would not over-read the prompt or prefill tokens-per-second here, because the later runs appear cached. For the video, the clean number to say is decode speed — the speed you feel while the model is writing.

Ollama's public chart says 95 tokens per second with MTP and 50 without MTP on their setup. My number is not a perfect before/after, but it tells me what I can expect on this Mac today.

## 06:30 — Benchmark 2: real coding-ish task

Raw tokens per second is useful, but it is not the whole story.

For local AI, what I actually care about is whether the model feels responsive enough for real work: summarizing code, explaining diffs, writing small scripts, or acting as a local subagent.

So here is a small coding-style prompt. I am asking it to write a Python function that summarizes benchmark results into a markdown table.

[Run prompt]

What I am watching for here is not just speed. I want to see whether the answer is coherent, whether it follows the requested structure, and whether it gets through the task without feeling painfully slow.

## 08:30 — Quality caveat

This is the part where I want to be careful.

A speedup is not the same thing as a quality improvement.

MTP can help generate accepted tokens faster, but it does not turn a smaller or weaker model into Claude or GPT-5. If the model was bad at a task before, MTP does not magically make it good.

The practical win is responsiveness. If Gemma 4 was already good enough for a local task, then this kind of speedup makes it much easier to use.

For coding agents, that matters a lot because agents spend so much time in loops: read, think, edit, run, fix, repeat. A faster local model can make those loops feel less painful.

## 10:00 — Verdict

So here is my verdict.

If you are running local AI on a Mac with Ollama, this is worth paying attention to.

Not because Gemma 4 suddenly replaces frontier models, but because Ollama plus MLX plus MTP is exactly the kind of runtime-level improvement that makes local AI more practical.

I would use this for summarization, repo Q&A, small coding tasks, local subagents, and privacy-sensitive workflows where speed matters and the task does not require the absolute best model.

I would not use this as a blanket replacement for Claude Code or frontier coding agents yet.

The bigger thing to watch is which models get MTP next. If this comes to the local coding models people actually use every day — Qwen, DeepSeek, GLM, or future Gemma coding variants — then local Mac workflows get a lot more interesting.

## 11:30 — CTA

I put the benchmark script and prompts in the companion repo so you can run this on your own Mac.

If you want me to test the next model with Ollama plus MLX on the 128GB Mac, drop the model name in the comments: Qwen, GLM, DeepSeek, or another Gemma 4 size.

And if you saw different tokens per second on your Mac, post your chip, memory, model tag, and result. That is the useful data.
