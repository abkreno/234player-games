# 2 3 4 Player Games — Mini Arena

A small browser game inspired by shared-keyboard party games: choose 2, 3, or 4 players, dodge moving hazards, collect stars, and survive as long as possible.

## Play locally

This project is intentionally dependency-free. Open `index.html` directly in a browser, or serve the folder with any static file server.

```bash
python3 -m http.server 5173
```

Then open:

```text
http://localhost:5173
```

## Controls

- Player 1: `W` `A` `S` `D`
- Player 2: arrow keys
- Player 3: `I` `J` `K` `L`
- Player 4: `T` `F` `G` `H`

## Game rules

- Select 2, 3, or 4 players.
- Move inside the arena and avoid the red hazards.
- Collect stars for +1 point.
- Last player standing wins the round and gets +5 points.
- The next round starts automatically.

## Files

- `index.html` — app markup and game screen
- `styles.css` — responsive UI styling
- `game.js` — canvas rendering, player controls, hazards, scoring, and rounds
