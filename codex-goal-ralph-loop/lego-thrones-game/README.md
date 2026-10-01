# Brick Throne: Gate Beneath the Red Keep

A small static 3D browser game with a brick-toy medieval fantasy style. The game uses Three.js from a CDN, so it should be served over HTTP instead of opened directly from disk.

Run it locally:

```bash
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173/` in a browser and play with:

- `WASD` or arrow keys to move
- `E` to interact with the secret door and beacon
- `Space` to guard against patrols

Goal: collect three crowns in King's Landing, use the secret door in the east wall, travel north of the Wall, and light the beacon.
