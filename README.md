# 2 3 4 Player Games — Mini Arena

A browser-based local multiplayer 2D party game inspired by shared-keyboard games: choose 2, 3, or 4 players, dodge moving hazards, collect stars, and survive as long as possible.

## What was built

The first prototype was upgraded into a modern TypeScript/Vite web game project:

- Strict TypeScript source code under `src/`
- Vite dev server and production build pipeline
- ESLint and Prettier configs for consistent code quality
- Modular game architecture with separated config, domain types, math helpers, and game loop logic
- Canvas-based 2D rendering with high-DPI resizing
- Keyboard input handling for 2, 3, and 4 local players
- Round system, score system, hazards, collectible stars, particles, and responsive UI

## Tech stack

- **TypeScript** for typed game state, entities, config, and DOM integration
- **Vite** for fast local development and optimized production builds
- **HTML Canvas 2D** for lightweight rendering without a heavy engine dependency
- **ESLint** for static analysis
- **Prettier** for formatting
- **CSS Grid/Flexbox** for responsive game layout

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

Run all checks:

```bash
npm run check
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

## Project structure

```text
.
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── eslint.config.js
├── docs/
│   └── IMPLEMENTATION.md
└── src/
    ├── main.ts
    ├── styles.css
    ├── config/
    │   └── players.ts
    └── game/
        ├── Game.ts
        ├── math.ts
        └── types.ts
```

## Architecture summary

`src/main.ts` validates required DOM elements and starts the game. `src/game/Game.ts` owns the game lifecycle, input handling, state updates, collision checks, scoring, and rendering. `src/game/types.ts` defines the domain model, while `src/config/players.ts` keeps player controls and colors separate from gameplay logic.

See [`docs/IMPLEMENTATION.md`](docs/IMPLEMENTATION.md) for the detailed implementation notes and 2D game best practices used.
