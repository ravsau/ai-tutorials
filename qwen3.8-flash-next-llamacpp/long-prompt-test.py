#!/usr/bin/env python3
"""Read-speed test for a local model: how long does it take to READ a long prompt?

Coding agents send a long prompt (system prompt, tools, files) before the model writes one word.
Most videos only show writing speed (tokens/s out). This script measures reading speed too, and checks
that the model really read the whole prompt: a secret code is hidden at 70% of the text.

Usage (server from start.sh must be running):
  python3 long-prompt-test.py                 # about 20,000 tokens
  python3 long-prompt-test.py --tokens 2000   # quick check
  python3 long-prompt-test.py --url http://127.0.0.1:8081 --model my-model

Only the Python standard library. No API keys, no cost: it talks to your local server only.
"""
import argparse
import json
import random
import time
import urllib.request

SENTENCES = [
    "The warehouse opened at six and the first trucks arrived before the sun came up.",
    "Every shelf had a label, and every label had a barcode that nobody read twice.",
    "A small team checked the orders, packed the boxes and wrote the numbers in a notebook.",
    "On rainy days the loading dock was slow, so the night shift stayed an hour longer.",
    "The manager liked simple rules: count twice, ship once, and never skip the checklist.",
    "Most customers ordered spare parts, but a few ordered the same blue lamp every month.",
    "The old printer jammed on Mondays, which became a joke that everyone repeated.",
    "Inventory was counted by hand each quarter, and the totals almost always matched.",
]
SECRET = "BLUE-PELICAN-42"


def build_prompt(tokens: int) -> str:
    rnd = random.Random(7)
    target_chars = tokens * 4  # about 4 characters per token for plain English
    parts, size, hidden = [], 0, False
    while size < target_chars:
        if not hidden and size >= target_chars * 0.7:
            parts.append(f"Note for the reader: the secret launch code is {SECRET}.")
            hidden = True
        s = rnd.choice(SENTENCES)
        parts.append(s)
        size += len(s) + 1
    return " ".join(parts)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--url", default="http://127.0.0.1:8080")
    ap.add_argument("--model", default="qwen3.8-flash-next")
    ap.add_argument("--tokens", type=int, default=20000)
    a = ap.parse_args()

    doc = build_prompt(a.tokens)
    body = {
        "model": a.model,
        "messages": [
            {"role": "user", "content": doc + "\n\nWhat is the secret launch code in the text above? "
                                              "Answer with the code only."},
        ],
        "max_tokens": 4000,
    }
    req = urllib.request.Request(a.url + "/v1/chat/completions", data=json.dumps(body).encode(),
                                 headers={"Content-Type": "application/json"})
    print(f"Sending about {a.tokens:,} tokens to {a.url} ...")
    t0 = time.time()
    with urllib.request.urlopen(req, timeout=3600) as r:
        d = json.load(r)
    wall = time.time() - t0

    answer = (d["choices"][0]["message"].get("content") or "").strip()
    t = d.get("timings", {})
    print()
    print(f"Answer:            {answer[-80:]}")
    print(f"Found the code:    {'YES' if SECRET in answer else 'NO'}")
    if t:
        print(f"Prompt tokens:     {t.get('prompt_n', 0):,}")
        print(f"Reading speed:     {t.get('prompt_per_second', 0):.0f} tokens/s  "
              f"({t.get('prompt_ms', 0) / 1000:.1f} s to read the prompt)")
        print(f"Writing speed:     {t.get('predicted_per_second', 0):.1f} tokens/s  "
              f"({t.get('predicted_n', 0):,} tokens written, thinking included)")
    print(f"Total time:        {wall:.1f} s")


if __name__ == "__main__":
    main()
