#!/usr/bin/env python3
"""Add the llama-cpp-flash-next provider to Pi's ~/.pi/agent/models.json.

It keeps every provider you already have, and saves a backup first (models.json.bak).
Run it from this folder:  python3 add-to-pi.py
"""
import json
import pathlib
import shutil

here = pathlib.Path(__file__).resolve().parent
target = pathlib.Path.home() / ".pi" / "agent" / "models.json"
new = json.loads((here / "pi-models.json").read_text())["providers"]

target.parent.mkdir(parents=True, exist_ok=True)
data = {"providers": {}}
if target.exists():
    shutil.copy(target, target.with_name("models.json.bak"))
    data = json.loads(target.read_text())
data.setdefault("providers", {}).update(new)
target.write_text(json.dumps(data, indent=2) + "\n")
print(f"Added {', '.join(new)} to {target}")
print("Start Pi with: pi -ne -ns -nc --provider llama-cpp-flash-next --model qwen3.8-flash-next")
