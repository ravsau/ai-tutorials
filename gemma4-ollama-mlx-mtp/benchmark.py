#!/usr/bin/env python3
"""Benchmark Gemma 4 26B MLX through Ollama.

Default usage:
    python3 benchmark.py

What it does:
- checks that Ollama is reachable
- optionally pulls gemma4:26b-mlx
- runs two prompts three times each
- prints decode tokens/sec
- saves JSON + Markdown results under results/
"""

from __future__ import annotations

import argparse
import json
import shutil
import statistics
import subprocess
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

MODEL = "gemma4:26b-mlx"
BASE_URL = "http://localhost:11434"
RUNS = 3
NUM_PREDICT = 256
TEMPERATURE = 0.2

PROMPTS = {
    "short": "Explain multi-token prediction in practical terms for someone running local AI on a Mac. Keep it under 180 words.",
    "coding": "Write a Python function called summarize_results(rows) that accepts a list of dicts with keys model, run, eval_tokens, eval_tok_s, and total_s. It should return a markdown table sorted by eval_tok_s descending. Include a tiny example input and output.",
}


def post_json(url: str, payload: Dict[str, Any], timeout: int = 600) -> Dict[str, Any]:
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def ns_to_s(value: Optional[Union[int, float]]) -> float:
    return (value or 0) / 1_000_000_000


def tok_s(count: Optional[int], duration_ns: Optional[int]) -> float:
    seconds = ns_to_s(duration_ns)
    if not count or seconds <= 0:
        return 0.0
    return count / seconds


def check_ollama(base_url: str) -> None:
    if shutil.which("ollama") is None:
        raise SystemExit("ERROR: ollama CLI not found. Install Ollama first: https://ollama.com")
    try:
        post_json(f"{base_url.rstrip('/')}/api/tags", {}, timeout=10)
    except urllib.error.HTTPError:
        # /api/tags is GET-only on some Ollama versions, so use urllib directly.
        pass
    except Exception:
        try:
            with urllib.request.urlopen(f"{base_url.rstrip('/')}/api/tags", timeout=10) as resp:
                json.loads(resp.read().decode("utf-8"))
        except Exception as exc:
            raise SystemExit(f"ERROR: Ollama is not reachable at {base_url}. Start Ollama, then rerun. Details: {exc}")


def pull_model(model: str) -> None:
    print(f"Pulling/checking {model} ...", file=sys.stderr)
    subprocess.run(["ollama", "pull", model], check=True)


def run_once(base_url: str, model: str, prompt_name: str, prompt: str, run_id: int) -> Dict[str, Any]:
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False,
        "options": {"temperature": TEMPERATURE, "num_predict": NUM_PREDICT},
    }
    start = time.perf_counter()
    response = post_json(f"{base_url.rstrip('/')}/api/generate", payload)
    wall = time.perf_counter() - start

    prompt_count = response.get("prompt_eval_count") or 0
    prompt_duration = response.get("prompt_eval_duration") or 0
    eval_count = response.get("eval_count") or 0
    eval_duration = response.get("eval_duration") or 0

    return {
        "prompt_name": prompt_name,
        "model": model,
        "run": run_id,
        "eval_tokens": eval_count,
        "decode_tok_s": tok_s(eval_count, eval_duration),
        "prompt_tok_s": tok_s(prompt_count, prompt_duration),
        "ollama_total_s": ns_to_s(response.get("total_duration") or 0),
        "wall_s": wall,
        "done_reason": response.get("done_reason"),
        "response_preview": (response.get("response") or "")[:700],
    }


def median(values: List[float]) -> float:
    values = [v for v in values if v > 0]
    return statistics.median(values) if values else 0.0


def make_markdown(model: str, rows: List[Dict[str, Any]]) -> str:
    lines = [f"# Gemma 4 26B MLX benchmark: `{model}`", ""]
    lines += [
        "| Prompt | Run | Decode tok/s | Eval tokens | Total s |",
        "|---|---:|---:|---:|---:|",
    ]
    for row in rows:
        lines.append(
            f"| {row['prompt_name']} | {row['run']} | **{row['decode_tok_s']:.2f}** | {row['eval_tokens']} | {row['wall_s']:.2f} |"
        )

    lines.append("")
    lines.append("## Summary")
    lines.append("")
    for prompt_name in PROMPTS:
        prompt_rows = [r for r in rows if r["prompt_name"] == prompt_name]
        lines.append(f"- {prompt_name}: **{median([r['decode_tok_s'] for r in prompt_rows]):.2f} decode tok/s median**")

    lines.append("")
    lines.append("Note: focus on decode tok/s. Prompt/prefill speed can look inflated on repeated local runs because prompt work may be cached.")
    return "\n".join(lines) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description="Benchmark Gemma 4 26B MLX with Ollama")
    parser.add_argument("--model", default=MODEL, help=f"Ollama model tag. Default: {MODEL}")
    parser.add_argument("--base-url", default=BASE_URL, help=f"Ollama API URL. Default: {BASE_URL}")
    parser.add_argument("--runs", type=int, default=RUNS, help=f"Runs per prompt. Default: {RUNS}")
    parser.add_argument("--no-pull", action="store_true", help="Skip `ollama pull` and use the already installed model")
    parser.add_argument("--out-dir", default="results", help="Where to save result files")
    args = parser.parse_args()

    check_ollama(args.base_url)
    if not args.no_pull:
        pull_model(args.model)

    rows: List[Dict[str, Any]] = []
    for prompt_name, prompt in PROMPTS.items():
        for run_id in range(1, args.runs + 1):
            print(f"{prompt_name} run {run_id}/{args.runs}: {args.model}", file=sys.stderr)
            rows.append(run_once(args.base_url, args.model, prompt_name, prompt, run_id))

    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    safe_model = args.model.replace("/", "_").replace(":", "-")
    json_path = out_dir / f"{safe_model}-{stamp}.json"
    md_path = out_dir / f"{safe_model}-{stamp}.md"

    payload = {
        "model": args.model,
        "created_at": stamp,
        "runs_per_prompt": args.runs,
        "prompts": PROMPTS,
        "rows": rows,
    }
    json_path.write_text(json.dumps(payload, indent=2))
    md = make_markdown(args.model, rows)
    md_path.write_text(md)

    print(md)
    print(f"Wrote: {json_path}")
    print(f"Wrote: {md_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
