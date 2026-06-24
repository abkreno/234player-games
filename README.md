# 1 2 3 4 Player Games

A playful family mini-game platform for 1–4 players sharing one laptop or tablet.

Live app: https://234player-games.pages.dev/setup

The app currently includes two playable games: **Find the Match** and **Basketball Hoops**.

## What is included

- React + TypeScript + Vite app shell
- React Router screens:
  - `/setup`
  - `/games`
  - `/game/find-match`
  - `/game/basketball-hoops`
  - `/result`
- Framer Motion card/turn/result/ball animations
- Session score across games
- Playable games:
  - **Find the Match**
  - **Basketball Hoops**
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
3. The selected game starts immediately.
4. Winner screen appears when the game ends.
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

## Find the Match board size

| Players | Pairs | Cards |
| --- | ---: | ---: |
| 1 | 4 | 8 |
| 2 | 5 | 10 |
| 3 | 6 | 12 |
| 4 | 8 | 16 |

## Basketball Hoops rules

- Players share one device.
- Use mouse/touch to press **Shoot**.
- Players take turns.
- Each player gets 5 shots.
- A moving power marker controls shot accuracy.
- Stop the marker in the green zone to score.
- Made shot = +1 game point.
- Miss = 0.
- Game ends when every player has taken all shots.
- Highest score wins.
- Tied highest players each receive +1 session point.

## Testing and CI

The test suite focuses on pure game and platform logic:

- board generation
- Find the Match reducer transitions
- Basketball Hoops reducer transitions
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

## Cloudflare Pages deployment

Recommended Cloudflare Pages settings:

| Setting | Value |
| --- | --- |
| Framework preset | Vite |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | repository root |

This project includes `public/_redirects` so React Router routes work when users refresh or directly open nested pages such as `/games`, `/game/find-match`, `/game/basketball-hoops`, and `/result`.

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
│   ├── basketball-hoops/
│   │   ├── BasketballHoopsGame.tsx
│   │   ├── basketballReducer.ts
│   │   ├── basketballReducer.test.ts
│   │   └── basketballTypes.ts
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
