# 1 2 3 4 Player Games

A playful family mini-game platform for 1–4 players sharing one laptop or tablet.

The current visible game is **Find the Match**, a turn-based memory game where players flip cards, match shapes, and compete to win the most pairs.

## What is included

- React + TypeScript + Vite app shell
- React Router screens:
  - `/setup`
  - `/games`
  - `/game/find-match`
  - `/result`
- Framer Motion card/turn/result animations
- Session score across games
- One active game: **Find the Match**
- Disabled Coming Soon game cards
- Legacy Mini Arena code kept hidden/dev-only

## Run locally

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Run tests:

```bash
npm run test
```

Run all checks:

```bash
npm run check
```

## App flow

1. Choose player count: 1, 2, 3, or 4 players.
2. Pick a game on the Games Screen.
3. Find the Match starts immediately.
4. Winner screen appears when the board is cleared.
5. Tap anywhere to return to Games Screen.
6. Winner receives +1 session point.

## Find the Match rules

- Players share one device.
- Use mouse/touch to flip cards.
- Match by shape.
- If cards match, the player gets +1 game point and keeps the turn.
- If cards do not match, they flip back and the next player goes.
- Game ends when all pairs are removed.
- Highest score wins.
- Tied highest players each receive +1 session point.

## Board size

| Players | Pairs | Cards |
| --- | ---: | ---: |
| 1 | 4 | 8 |
| 2 | 5 | 10 |
| 3 | 6 | 12 |
| 4 | 8 | 16 |

## Testing and CI

The test suite focuses on pure game and platform logic:

- board generation
- Find the Match reducer transitions
- match and mismatch behavior
- board lock behavior
- winner calculation
- session score updates

CI runs on pushes to `main` and on pull requests:

```bash
npm run lint
npm run test
npm run build
```

## Project structure

```text
src/
├── app/
│   ├── App.tsx
│   ├── appReducer.ts
│   ├── appTypes.ts
│   └── gameRegistry.ts
├── components/
│   ├── PlayerBadge.tsx
│   ├── ScreenShell.tsx
│   └── SessionScoreBar.tsx
├── games/
│   └── find-match/
│       ├── FindMatchGame.tsx
│       ├── ShapeIcon.tsx
│       ├── board.ts
│       ├── board.test.ts
│       ├── findMatchReducer.ts
│       ├── findMatchReducer.test.ts
│       ├── findMatchTypes.ts
│       └── shapes.ts
├── screens/
│   ├── GamesScreen.tsx
│   ├── ResultScreen.tsx
│   └── SetupScreen.tsx
├── styles/
│   └── global.css
├── test/
│   ├── appReducer.test.ts
│   ├── fixtures.ts
│   └── setup.ts
└── main.tsx
```

## Roadmap

See [`docs/NEXT_STEPS.md`](docs/NEXT_STEPS.md) for the current product plan, testing plan, and deployment plan.
