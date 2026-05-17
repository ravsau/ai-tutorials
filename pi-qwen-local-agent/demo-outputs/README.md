# Demo Outputs — Dark Mode Toggle Lab

The video's main demo asks Pi to add a dark mode toggle to a simple page, then iterates on real bugs. Here's what you need to reproduce your own version of that journey on your machine.

## What's here

| File | What it is |
|---|---|
| [`starter.html`](./starter.html) | The starting state — a simple card with text, **no toggle**. This is what you open and hand to Pi. |

## How to reproduce the lab on your machine

1. **Get Pi running** — follow the [setup in the main README](../README.md). Make sure `llama-server` is running on port 8081 and Pi sees it via `models.json`.

2. **Open `starter.html`** in your browser. It's a plain card with a heading and a paragraph. No JavaScript, no toggle, no theme switching.

3. **Open Pi in the same folder:**
   ```bash
   cd demo-outputs
   pi
   ```

4. **Give it the prompt:**
   > *"Create a simple dark mode toggle for this page. Save the user's preference and respect the system theme on first visit."*

5. **Watch what Pi does.** Open the file in the browser after each edit. When you hit a bug — toggle invisible, overlapping the heading, whatever — push back in plain English. *"The toggle is invisible in light mode, fix that."*

6. **Keep iterating.** This is the point of the lab. You're not following a tutorial — you're running a real coding session against a local model.

## What your output will look like

Different from mine. Different from everyone else's. That's the lab format — same starting state, same first prompt, but every viewer's iteration journey produces a different end state.

If you want to share what you ended up with, open a PR and add your version under your handle. Cross-machine data points are what make this useful.

## Honest expectations

- **Round 1:** Pi will probably get most of the structure right (theme variables, animated switch, local storage).
- **Round 2-5:** Visual bugs — toggle invisible against light background, overlapping the heading, color blending into the card. Push back. Pi reasons about each.
- **The "going nuclear" moment:** somewhere around iteration 4-5, you'll either tell Pi to do something drastic, or it'll volunteer one. That's the moment in the video. Yours may land differently.

Total time on a Mac M3 with Qwen 3.6 27B Q4 via `llama.cpp`: about 15-20 minutes for the full iteration session.
