# Implementation Notes

This document explains what was implemented and why the project was upgraded to a TypeScript-first 2D web game architecture.

## Goal

Create a browser game similar in spirit to 2/3/4-player shared-screen party games, while keeping the implementation original. The current game is **Mini Arena**, a local multiplayer survival game where players share one keyboard, collect stars, avoid hazards, and compete for round wins.

## What changed

The original empty repository was first bootstrapped with a dependency-free static prototype. It has now been upgraded into a modern TypeScript project with a maintainable structure.

### Added tooling

- `Vite` for local development, hot reload, and production builds.
- `TypeScript` with `strict` mode enabled.
- `ESLint` using flat config for TypeScript linting.
- `Prettier` for formatting consistency.
- `.gitignore` for common local artifacts.

### Added game features

- 2, 3, and 4 player selection.
- Shared keyboard controls.
- Canvas 2D arena rendering.
- High-DPI canvas resizing with `devicePixelRatio`.
- RequestAnimationFrame game loop.
- Delta-time based movement.
- Player acceleration, friction, and max speed.
- Moving hazards spawned from arena edges.
- Collectible stars.
- Particle effects for collisions and pickups.
- Round state machine: idle, playing, round-over.
- Scoreboard and automatic next-round flow.
- Responsive layout for desktop and smaller screens.

## Source layout

```text
src/
├── main.ts              # DOM lookup and game bootstrap
├── styles.css           # Responsive UI and canvas layout
├── config/
│   └── players.ts       # Player colors and key bindings
└── game/
    ├── Game.ts          # Main game class and loop
    ├── math.ts          # Reusable math helpers
    └── types.ts         # Domain types for game entities and state
```

## Architecture decisions

### 1. TypeScript domain model

The game state is typed with explicit models for players, hazards, stars, particles, and game lifecycle status. This makes future additions safer because the compiler can catch missing fields, invalid status values, and incorrect entity shapes before runtime.

Important types include:

- `PlayerCount = 2 | 3 | 4`
- `GameStatus = 'idle' | 'playing' | 'round-over'`
- `Player`, `Hazard`, `Star`, `Particle`
- `GameState`
- `GameElements`

### 2. Single game owner class

`MiniArenaGame` owns the gameplay lifecycle:

- startup
- event binding
- state updates
- collision detection
- round transitions
- rendering

This avoids scattered global state and makes the project easier to extend into a menu with multiple mini-games later.

### 3. Data-driven player config

Player names, colors, controls, and labels live in `src/config/players.ts`. That keeps game rules separate from player setup and makes it easier to add controller support, remappable keys, or different control schemes later.

### 4. Delta-time based movement

Movement uses the elapsed time between frames instead of assuming a fixed frame rate. That keeps movement more consistent across devices with different refresh rates.

### 5. Canvas 2D instead of a heavy game engine

The game currently uses native Canvas 2D because the mechanics are simple and the scope is small. This keeps the bundle lightweight and avoids introducing a large engine before the project needs one.

A future version could use a dedicated 2D engine such as Phaser, PixiJS, or Kaboom if the game grows to include asset pipelines, scenes, animation systems, audio managers, or physics-heavy gameplay.

## 2D game best practices used

### Game loop separation

The code separates:

- input collection
- state updates
- collision checks
- drawing

This keeps the game loop predictable and easier to debug.

### Entity-based state

Players, hazards, stars, and particles are represented as small data objects. This is simpler than a full Entity Component System, but still keeps entities structured enough for future refactoring.

### Responsive rendering

The canvas is sized according to its displayed bounds and scaled for `devicePixelRatio`, which keeps the game sharper on high-DPI screens.

### Bounded frame delta

The frame delta is capped to avoid physics jumps when the tab is inactive or the browser pauses rendering.

### Config constants

Gameplay values such as acceleration, friction, max speed, score bonuses, and frame delta live as constants near the top of `Game.ts`, making tuning easier.

### Small utility functions

Math helpers such as `clamp`, `distance`, `randomBetween`, and `normalize` are isolated in `math.ts`, reducing repeated logic inside the game class.

### Original assets and visuals

The implementation does not copy assets from the reference website. It uses simple geometric shapes, CSS, gradients, and Canvas drawing to create an original look.

## How to add another mini-game later

A scalable next step would be to introduce a shared game interface, for example:

```ts
export type MiniGame = {
  start(): void;
  stop(): void;
  update(dt: number): void;
  draw(): void;
};
```

Then each new mini-game could live in its own folder under `src/games/`, while shared input, rendering utilities, and UI components stay reusable.

## Recommended next steps

1. Add unit tests for math helpers and scoring rules.
2. Add a scene/menu system for multiple mini-games.
3. Add audio feedback for pickups, hits, and round wins.
4. Add keyboard remapping.
5. Add mobile/touch controls.
6. Add GitHub Actions to run `npm run check` on pull requests.
7. Add asset preloading if the game starts using images or audio.
8. Consider Phaser or PixiJS if the project grows beyond simple Canvas primitives.
