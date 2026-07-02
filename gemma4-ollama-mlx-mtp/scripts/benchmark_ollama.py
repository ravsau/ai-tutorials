#!/usr/bin/env python3
"""Benchmark Ollama generation speed for Gemma 4 / local models.

This intentionally uses Ollama's HTTP API response timings instead of wall-clock
only. Ollama returns:
- prompt_eval_count / prompt_eval_duration
- eval_count / eval_duration

durations are nanoseconds. Decode tok/s = eval_count / eval_duration_seconds.
"""

from __future__ import annotations

import argparse
import json
import statistics
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

DEFAULT_PROMPT = """Explain multi-token prediction in practical terms for a developer using local AI on a Mac. Keep it under 180 words."""

CODING_PROMPT = """You are helping benchmark a local coding model. Write a Python function called summarize_results(rows) that accepts a list of dicts with keys model, run, eval_tokens, eval_tok_s, and total_s. It should return a markdown table sorted by eval_tok_s descending. Include a tiny example input and output."""


def post_json(url: str, payload: dict, timeout: int = 600) -> dict:
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def ns_to_s(value: int | float | None) -> float:
    return (value or 0) / 1_000_000_000


def tok_s(count: int | None, duration_ns: int | None) -> float:
    seconds = ns_to_s(duration_ns)
    if not count or seconds <= 0:
        return 0.0
    return count / seconds


def run_once(base_url: str, model: str, prompt: str, num_predict: int, temperature: float, run_id: int) -> dict:
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": temperature,
            "num_predict": num_predict,
        },
    }
    start = time.perf_counter()
    response = post_json(f"{base_url.rstrip('/')}/api/generate", payload)
    wall = time.perf_counter() - start

    prompt_count = response.get("prompt_eval_count") or 0
    prompt_duration = response.get("prompt_eval_duration") or 0
    eval_count = response.get("eval_count") or 0
    eval_duration = response.get("eval_duration") or 0

    return {
        "model": model,
        "run": run_id,
        "created_at": response.get("created_at"),
        "done_reason": response.get("done_reason"),
        "prompt_eval_count": prompt_count,
        "prompt_eval_duration_ns": prompt_duration,
        "prompt_tok_s": tok_s(prompt_count, prompt_duration),
        "eval_count": eval_count,
        "eval_duration_ns": eval_duration,
        "eval_tok_s": tok_s(eval_count, eval_duration),
        "total_duration_ns": response.get("total_duration") or 0,
        "total_s_ollama": ns_to_s(response.get("total_duration") or 0),
        "total_s_wall": wall,
        "load_duration_s": ns_to_s(response.get("load_duration") or 0),
        "response_preview": (response.get("response") or "")[:700],
    }


def summarize(rows: list[dict]) -> str:
    if not rows:
        return "No rows."
    lines = [
        "| Model | Run | Prompt tok/s | Decode tok/s | Eval tokens | Ollama total s | Wall s |",
        "|---|---:|---:|---:|---:|---:|---:|",
    ]
    for r in rows:
        lines.append(
            f"| `{r['model']}` | {r['run']} | {r['prompt_tok_s']:.2f} | **{r['eval_tok_s']:.2f}** | {r['eval_count']} | {r['total_s_ollama']:.2f} | {r['total_s_wall']:.2f} |"
        )
    decode = [r["eval_tok_s"] for r in rows if r["eval_tok_s"] > 0]
    prompt = [r["prompt_tok_s"] for r in rows if r["prompt_tok_s"] > 0]
    lines.append("")
    if decode:
        lines.append(f"Decode tok/s median: **{statistics.median(decode):.2f}**")
        lines.append(f"Decode tok/s mean: **{statistics.mean(decode):.2f}**")
    if prompt:
        lines.append(f"Prompt/prefill tok/s median: **{statistics.median(prompt):.2f}**")
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description="Benchmark Ollama model speed via /api/generate")
    parser.add_argument("--model", default="gemma4:12b-mlx", help="Ollama model tag, e.g. gemma4:12b-mlx, gemma4:26b-mlx, or gemma4:31b-mlx")
    parser.add_argument("--base-url", default="http://localhost:11434", help="Ollama base URL")
    parser.add_argument("--runs", type=int, default=3, help="Number of repeated runs")
    parser.add_argument("--num-predict", type=int, default=256, help="Generation cap")
    parser.add_argument("--temperature", type=float, default=0.2)
    parser.add_argument("--prompt-file", help="Optional file containing prompt")
    parser.add_argument("--coding-prompt", action="store_true", help="Use a coding-style prompt instead of the short MTP explainer prompt")
    parser.add_argument("--out-dir", default="results")
    args = parser.parse_args()

    if args.prompt_file:
        prompt = Path(args.prompt_file).read_text()
    elif args.coding_prompt:
        prompt = CODING_PROMPT
    else:
        prompt = DEFAULT_PROMPT

    rows: list[dict] = []
    for i in range(1, args.runs + 1):
        print(f"Run {i}/{args.runs}: {args.model}", file=sys.stderr)
        try:
            rows.append(run_once(args.base_url, args.model, prompt, args.num_predict, args.temperature, i))
        except urllib.error.HTTPError as exc:
            print(f"ERROR: Ollama returned HTTP {exc.code}: {exc.read().decode('utf-8', 'ignore')}", file=sys.stderr)
            return 3
        except urllib.error.URLError as exc:
            print(f"ERROR: could not reach Ollama at {args.base_url}: {exc}", file=sys.stderr)
            print("Start Ollama first: ollama serve", file=sys.stderr)
            return 2

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    safe_model = args.model.replace("/", "_").replace(":", "-")
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    json_path = out_dir / f"{safe_model}-{stamp}.json"
    md_path = out_dir / f"{safe_model}-{stamp}.md"

    payload = {
        "model": args.model,
        "runs": args.runs,
        "num_predict": args.num_predict,
        "temperature": args.temperature,
        "prompt": prompt,
        "created_at": stamp,
        "rows": rows,
    }
    json_path.write_text(json.dumps(payload, indent=2))
    md = f"# Ollama benchmark: `{args.model}`\n\n" + summarize(rows) + "\n"
    md_path.write_text(md)

    print(md)
    print(f"Wrote: {json_path}")
    print(f"Wrote: {md_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
