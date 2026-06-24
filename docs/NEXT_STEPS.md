# Next Steps Roadmap

This plan documents the recommended next features, engineering improvements, tools, and npm packages for evolving Mini Arena from a single TypeScript canvas prototype into a scalable local multiplayer mini-game platform.

## Current baseline

The project currently has:

- Vite + TypeScript setup
- Strict TypeScript configuration
- ESLint and Prettier
- Canvas 2D rendering
- Shared-keyboard 2/3/4 player gameplay
- Typed game state and entity models
- Modular source structure
- Basic score, hazards, collectibles, particles, and rounds

## Guiding product direction

Build toward a lightweight web version of a local party-game hub:

1. Start with one polished mini-game.
2. Add a reusable game shell and scene system.
3. Add more mini-games using the same input, scoreboard, audio, and menu systems.
4. Improve feel, polish, accessibility, and deployment.
5. Add analytics and testing once the core loop is stable.

## Phase 1 — Stabilize the current game

### Goals

- Make Mini Arena feel reliable, readable, and easy to tune.
- Reduce future refactor risk.
- Add basic quality gates before adding more features.

### Tasks

- Add a `GameSettings` object for gameplay constants such as speed, friction, hazard spawn rate, star limit, and round duration.
- Move rendering helpers into a separate renderer module.
- Move input handling into an `InputManager` class.
- Add a small `GameClock` helper for delta-time and pause/resume behavior.
- Add pause/resume support using the `Escape` key.
- Add a clear winning condition for match end, for example first to 30 points.
- Add a game-over screen with replay button.
- Add a difficulty ramp that is easier to tune.

### Recommended packages

No extra runtime package is required yet. Keep the runtime lightweight until the architecture stabilizes.

### Definition of done

- The existing game still plays correctly.
- Constants are centralized.
- Input, rendering, and game update logic are easier to reason about.
- `npm run check` passes locally.

## Phase 2 — Add tests and quality gates

### Goals

- Catch regressions in math helpers, scoring, state transitions, and game setup.
- Make future refactors safer.

### Tasks

- Add unit tests for `clamp`, `distance`, `normalize`, and score calculations.
- Add tests for round transitions: idle → playing → round-over → playing.
- Add tests for player count selection.
- Add a GitHub Actions workflow that runs lint, typecheck, and build on pull requests.
- Add `lint-staged` and `husky` only if the team wants pre-commit hooks.

### Recommended packages

- `vitest` for unit tests.
- `jsdom` if DOM-dependent tests are needed.
- `@testing-library/dom` if UI behavior tests become useful.
- `husky` and `lint-staged` for optional pre-commit checks.

### Definition of done

- Math and state logic have useful coverage.
- Pull requests automatically run checks.
- Broken builds are caught before merge.

## Phase 3 — Improve player experience

### Goals

- Make the game feel more like a polished party game.
- Improve feedback, accessibility, and replay value.

### Tasks

- Add sound effects for star pickup, player hit, round start, and round win.
- Add background music with mute toggle.
- Add screen shake on collision.
- Add player spawn countdown.
- Add match winner celebration.
- Add color-blind friendly player indicators, such as icons or player numbers.
- Add keyboard remapping screen.
- Add local storage for preferred player count and audio settings.
- Add a small onboarding screen explaining controls before the first round.

### Recommended packages

- `howler` for audio playback.
- `nanoid` if unique IDs are needed for entities or future match records.
- `zustand` only if state grows beyond what a simple class can comfortably manage.

### Definition of done

- The game has clear audio/visual feedback.
- Players can understand controls quickly.
- The game is playable by more people through improved visual cues.

## Phase 4 — Create a mini-game platform architecture

### Goals

- Prepare the repo for multiple games, not just Mini Arena.
- Avoid duplicating input, UI, audio, and scoreboard code.

### Tasks

- Introduce a `MiniGame` interface:

```ts
export type MiniGame = {
  id: string;
  title: string;
  start(): void;
  stop(): void;
  update(dt: number): void;
  draw(): void;
};
```

- Add a `SceneManager` for menu, game, pause, and results screens.
- Add reusable managers:
  - `InputManager`
  - `AudioManager`
  - `AssetLoader`
  - `ScoreManager`
  - `StorageManager`
- Move Mini Arena into `src/games/mini-arena/`.
- Add a main menu with game cards.
- Add at least one more mini-game to validate the architecture.

### Recommended packages

- Stay custom if games remain simple Canvas 2D.
- Consider `phaser` if you need scenes, asset loading, animation, cameras, physics, and sound in one framework.
- Consider `pixi.js` if you want fast 2D rendering and custom game architecture.
- Consider `matter-js` only if physics simulation becomes central to gameplay.

### Definition of done

- Adding a second game does not require rewriting the shell.
- Shared systems are reusable.
- Each game owns only game-specific rules and rendering.

## Phase 5 — Add more mini-games

### Candidate games

1. **Tank Bounce**
   - Players rotate and shoot bouncing bullets.
   - Last tank alive wins.

2. **Race Dash**
   - Short top-down race with obstacles.
   - First to finish wins.

3. **Coin Rush**
   - Players collect coins while temporary hazards appear.
   - Highest score after 60 seconds wins.

4. **King of the Zone**
   - Players fight to stay inside a scoring zone.
   - Positioning and pushing matter more than collecting.

5. **Reaction Tap**
   - Simple reflex game using each player’s action key.
   - Good for quick rounds and younger players.

### Definition of done

- At least three mini-games are available from the menu.
- Controls and scoreboard are reused.
- Each game has a clear start, win condition, and replay flow.

## Phase 6 — Deployment and release workflow

### Goals

- Make the game easy to share.
- Add automated checks and deploy previews.

### Tasks

- Deploy to GitHub Pages, Netlify, or Vercel.
- Add GitHub Actions for build validation.
- Add preview deployments for pull requests if using Vercel or Netlify.
- Add a production build badge to README.
- Add a short gameplay GIF or screenshot to README.

### Recommended packages and tools

- GitHub Actions for CI.
- Vercel or Netlify for preview deployments.
- GitHub Pages for simple static hosting.
- `vite-plugin-pwa` if offline installable gameplay becomes important.

### Definition of done

- `main` is always deployable.
- Every PR runs checks.
- A public URL exists for playtesting.

## Phase 7 — Analytics and feedback

### Goals

- Understand which games people play and where they drop off.
- Keep analytics privacy-conscious and lightweight.

### Tasks

- Track game starts, round completions, selected player count, and game restarts.
- Avoid collecting personal information.
- Add a feedback link or GitHub issue template.

### Recommended tools

- Plausible or Umami for privacy-friendly analytics.
- GitHub Issues for bug reports and feature requests.

### Definition of done

- Basic usage events are visible.
- Players have a clear way to report bugs or suggest games.

## Priority order

1. Centralize settings and split InputManager/Renderer.
2. Add tests with Vitest.
3. Add GitHub Actions.
4. Add audio and pause/menu polish.
5. Add scene manager and mini-game interface.
6. Add the second mini-game.
7. Deploy publicly.
8. Add analytics and feedback flow.

## Packages to consider later

| Need | Package/tool | When to add |
| --- | --- | --- |
| Unit testing | `vitest` | Phase 2 |
| DOM tests | `jsdom`, `@testing-library/dom` | Phase 2 if needed |
| Audio | `howler` | Phase 3 |
| Pre-commit checks | `husky`, `lint-staged` | Phase 2 if team wants hooks |
| Full 2D game engine | `phaser` | Phase 4 if custom systems become too large |
| Fast 2D renderer | `pixi.js` | Phase 4 if rendering complexity increases |
| Physics | `matter-js` | Phase 4/5 if physics becomes core |
| PWA/offline | `vite-plugin-pwa` | Phase 6 |
| State management | `zustand` | Only if shared app state becomes complex |
| Unique IDs | `nanoid` | Only if entity IDs or match records are needed |

## Immediate next PR suggestion

Create a focused PR titled:

> Refactor Mini Arena into managers and add tests

Scope:

- Add `InputManager`
- Add `GameClock`
- Add `GameSettings`
- Add `Renderer`
- Add Vitest
- Add tests for math helpers and round transitions
- Add GitHub Actions check workflow

Avoid adding new gameplay in that PR. Keep it focused on architecture and reliability.
