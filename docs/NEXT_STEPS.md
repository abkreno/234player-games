# Next Steps Roadmap

This document is the current source of truth for the next product and engineering direction of the app.

The app is no longer planned as a single Mini Arena game. The agreed direction is a **1–4 player family mini-game platform** with one polished first game: **Find the Match**.

## 1. Product vision

Build a lightweight family mini-game platform for children and families playing together on one shared laptop or tablet.

The app should eventually support multiple local mini-games, but the first release should ship with one clear, polished game and an architecture that can grow.

## 2. Target users

Primary users:

- Mixed kids/family groups
- One shared device
- Casual play
- Low reading burden
- Very fast start

The game should be simple enough for younger kids, but still enjoyable for older kids and adults.

## 3. Success metric

The first version succeeds if users can start playing within **10 seconds** without reading a separate rules screen.

This means:

- no login
- no custom names in v1
- no long tutorial
- no heavy settings flow
- big buttons
- obvious game cards
- clear current-player feedback
- simple touch/mouse interaction

## 4. First release scope

First release includes:

- Player setup screen
- Games screen
- One active game: **Find the Match**
- Disabled Coming Soon cards
- Result screen
- Session score shown on Games Screen

First release does **not** include:

- multiple playable games
- online multiplayer
- persistent saved scores
- custom player names
- audio
- deployment until after tests/CI
- automated tests in the React rewrite PR

## 5. App flow

### Screen flow

1. User opens app.
2. User chooses player count: 1, 2, 3, or 4 players.
3. App navigates to Games Screen.
4. Games Screen shows:
   - one active game card: Find the Match
   - disabled Coming Soon cards
   - bottom session score row
5. User taps Find the Match.
6. Game starts immediately.
7. Game ends.
8. Result screen appears.
9. User taps anywhere to continue.
10. App returns to Games Screen.
11. Updated session score is visible.

### Routes

Use React Router routes:

```text
/setup
/games
/game/find-match
/result
```

Route guard rules:

- Direct `/games` with no session redirects to `/setup`.
- Direct `/game/find-match` with no session redirects to `/setup`.
- Direct `/result` with no result redirects to `/setup`.
- Refresh resets the session.

## 6. Platform session score

There are two kinds of score:

1. **Game score** — score inside the current game.
2. **Session score** — platform-level score across games.

Rules:

- Session score is shown only on the Games Screen.
- Winner of a completed game gets +1 session point.
- In solo mode, completing the game gives Player 1 +1 session point.
- If there is a tie, all highest-scoring tied players get +1 session point.
- Session score resets on page refresh.
- No localStorage in v1.

Use clear code names:

```ts
gameScores
sessionScores
```

Do not call both simply `scores`.

## 7. Player identity

Use player number plus player color.

Players:

- Player 1 / P1 — blue
- Player 2 / P2 — orange
- Player 3 / P3 — purple
- Player 4 / P4 — green

Rules:

- Use `Player 1` when there is space.
- Use `P1` in compact areas.
- Always pair color with text.
- Do not rely on color alone.
- No custom names in v1.
- No avatars/icons in v1.

Player color should appear consistently in:

- setup screen
- Games Screen session score row
- current turn banner
- board border
- game score row
- result screen

## 8. Games Screen

V1 Games Screen includes:

- Active card: **Find the Match**
- Three disabled Coming Soon cards:
  - Race Dash
  - Coin Rush
  - Tank Bounce
- Bottom session score row:
  - `P1: 0 | P2: 0 | P3: 0 | P4: 0`
  - Only show active players.
  - Use each player’s color on their segment.

Do not show Mini Arena on the Games Screen in v1.

## 9. First game: Find the Match

### Game identity

Find the Match is the first visible flagship game.

Mini Arena should be kept hidden/dev-only for now.

### Game type

- Turn-based memory game
- Shared device
- Mouse/touch only
- No keyboard controls required for v1

### Player count

Supports:

- 1 player
- 2 players
- 3 players
- 4 players

### Board scaling

Use player-count-based board size:

| Players | Pairs | Cards |
| --- | ---: | ---: |
| 1 | 4 | 8 |
| 2 | 5 | 10 |
| 3 | 6 | 12 |
| 4 | 8 | 16 |

Reasoning:

- 1P stays simple.
- 2P uses an odd number of pairs to reduce ties.
- 3P/4P keep board size kid-friendly and accept occasional ties.

### Card content

Use basic geometric shapes:

- circle
- square
- triangle
- star
- heart
- diamond
- moon
- hexagon

Matching rule:

- Match by shape.
- Duplicate shape pairs should look identical.
- Even though the rule is shape-based, the same pair should use the same color too, to avoid confusion.

### Card design

- One shared card-back design for all hidden cards.
- Card back should be playful but not distracting.
- Card front should show one large centered shape on a plain card.
- No text labels on cards.
- No busy backgrounds.
- No asset pipeline needed in v1.

### Turn order

- Random first player.
- Then fixed order.
- If a player matches a pair, they keep their turn.
- If a player misses, turn passes to the next player.

### Turn feedback

Show:

- large current-player banner
- current-player colored board border
- highlighted active player in game score row

Example:

```text
Player 2’s turn
```

### Match behavior

When two selected cards match:

1. Show both cards.
2. Add +1 to current player’s game score.
3. Keep cards visible for 700ms.
4. Cards disappear/fade out.
5. Empty slots remain in the grid.
6. Same player continues.

### Mismatch behavior

When selected cards do not match:

1. Show both cards for 1200ms.
2. Flip both cards back.
3. Change turn.
4. Lock board for 700ms.
5. Show next-player banner.
6. Enable tapping again.

### Animation timing

- Card flip: 250ms
- Matched-card visible delay: 700ms
- Matched-card disappear/fade: 250ms
- Mismatch reveal delay: 1200ms
- Turn transition lock: 700ms

### End condition

Game ends when all pairs are removed.

### Winner calculation

- Multiplayer: player with most pairs wins.
- Tie: all top tied players are winners.
- Solo: player completes the board; result shows time and moves.

### Solo result

Show:

- Great job message
- Time
- Moves
- Tap to continue

Player 1 receives +1 session point after completion.

### Multiplayer result

If one winner:

```text
Player 2 wins!
+1 game point
Tap to continue
```

If tie:

```text
Tie!
Player 1 and Player 3 get +1 game point
Tap to continue
```

## 10. UX decisions

### Start flow

- Choose player count first.
- Then Games Screen.
- Tapping a game starts immediately.
- No extra confirmation.

### Rules explanation

No separate rules screen in v1.

The game should teach through UI:

- tappable cards
- clear flipping
- match stays briefly then disappears
- mismatch flips back
- turn banner changes
- score updates visibly

Tiny contextual helper text is allowed, but avoid a dedicated tutorial modal.

### Post-game flow

- Result screen stays until user taps anywhere.
- Tap returns to Games Screen.
- Session score updates before returning.

### Back/exit behavior

Active game should include a small **Back to Games** control.

If used mid-game:

- discard current game
- award no session point
- return to Games Screen
- keep existing session scores unchanged

## 11. Visual design

Style:

- bright playful kids style
- large cards
- rounded corners
- bold colors
- high contrast
- simple layout
- no dark/neon arcade look for v1
- no cluttered developer-style panels

Important:

- Keep the color system controlled.
- Player colors, UI colors, and card colors should not fight each other.

## 12. Sound and motion

### Sound

No sound in v1.

This means:

- no sound effects
- no background music
- no mute setting
- no audio package such as Howler yet

Visual feedback must carry the experience.

### Motion

Use animation for clarity:

- card flip
- matched-card fade/disappear
- turn banner transition
- result screen entrance

Do not animate everything.

Support reduced motion:

- respect `prefers-reduced-motion`
- reduce flip/result/banner animation when needed
- keep game logic timing consistent

## 13. Accessibility decisions

Cards should be accessible buttons.

Rules:

- Hidden cards are buttons.
- Revealed cards have accessible labels such as `Circle card`.
- Removed matched slots are not buttons.
- Removed slots keep layout space.
- During board lock, use `aria-disabled="true"` and guard clicks in code.
- Do not queue clicks during locked states.
- Add visible turn banner and ARIA live region for turn changes.
- Keep text paired with player colors.

## 14. Technical architecture

### UI framework

Use:

- React
- React DOM
- React Router DOM
- Framer Motion
- TypeScript
- Vite

### State management

Use `useReducer` for v1.

Do not add:

- Zustand
- Redux
- XState

### App-level state

Use a typed app screen state:

```ts
type AppScreen = 'setup' | 'games' | 'playing' | 'result';
```

Recommended app state shape:

```ts
type AppState = {
  screen: AppScreen;
  playerCount?: 1 | 2 | 3 | 4;
  players: Player[];
  sessionScores: Record<PlayerId, number>;
  selectedGameId?: string;
  result?: GameResult;
};
```

Good app-level events:

```ts
selectPlayerCount
selectGame
completeGame
continueFromResult
resetSession
```

Avoid vague mutation events like:

```ts
setScreen
setScore
setResult
toggleThing
```

### Mini-game result contract

Mini-games do not mutate session/platform score directly.

They return a typed result:

```ts
type GameResult = {
  gameId: string;
  winners: PlayerId[];
  gameScores: Record<PlayerId, number>;
};
```

The platform shell receives the result and awards +1 session point to each winner.

### Find the Match state

Use one reducer with explicit phases.

Recommended phase model:

```ts
type FindMatchPhase =
  | 'ready'
  | 'selectingFirstCard'
  | 'selectingSecondCard'
  | 'checkingMatch'
  | 'removingMatch'
  | 'showingMismatch'
  | 'turnTransition'
  | 'complete';
```

Prevent impossible states:

- third card selected while mismatch delay is running
- turn changing before cards flip back
- matched cards disappearing before score updates
- result firing before final animation completes
- old timeout mutating a new game

### Timed effects

Reducers stay pure.

Timed effects live in `useEffect` watching reducer phase.

Every timeout must clean up on phase change or unmount.

Example pattern:

```ts
useEffect(() => {
  if (phase !== 'showingMismatch') return;

  const timeoutId = window.setTimeout(() => {
    dispatch({ type: 'mismatchResolved' });
  }, 1200);

  return () => window.clearTimeout(timeoutId);
}, [phase]);
```

## 15. Recommended file structure

```text
src/
├── app/
│   ├── App.tsx
│   ├── appReducer.ts
│   ├── appTypes.ts
│   └── routes.tsx
├── components/
│   ├── PlayerBadge.tsx
│   ├── SessionScoreBar.tsx
│   └── ScreenShell.tsx
├── games/
│   ├── find-match/
│   │   ├── FindMatchGame.tsx
│   │   ├── findMatchReducer.ts
│   │   ├── findMatchTypes.ts
│   │   ├── board.ts
│   │   └── shapes.ts
│   └── mini-arena/
│       └── legacy/
├── screens/
│   ├── SetupScreen.tsx
│   ├── GamesScreen.tsx
│   └── ResultScreen.tsx
├── styles/
│   └── global.css
└── main.tsx
```

## 16. Game registry

Add a small typed game registry.

Example:

```ts
type GameDefinition = {
  id: 'find-match' | 'race-dash' | 'coin-rush' | 'tank-bounce';
  title: string;
  description: string;
  status: 'available' | 'coming-soon';
};
```

Use it to render the Games Screen.

Keep the registry simple. Do not build a plugin system yet.

## 17. Mini Arena handling

Keep Mini Arena hidden/dev-only.

Recommended location:

```text
src/games/mini-arena/legacy/
```

Rules:

- do not show it on Games Screen
- do not route to it in v1
- do not delete it yet
- do not let it complicate the platform shell

## 18. Package decisions

### Next implementation PR packages

Add runtime packages:

```bash
npm install react react-dom react-router-dom framer-motion
```

Add dev type packages if needed:

```bash
npm install -D @types/react @types/react-dom
```

### Do not add in next PR

- Zustand
- Redux Toolkit
- XState
- Phaser
- PixiJS
- Matter.js
- Howler
- Vitest
- Testing Library
- Cloudflare deployment config

Those belong to later PRs if needed.

## 19. PR sequence

### PR 1 — React platform shell and Find the Match

Title:

```text
Build React platform shell and Find the Match game
```

Scope:

- add React, React DOM, React Router DOM, Framer Motion
- create `/setup`, `/games`, `/game/find-match`, `/result`
- add platform reducer
- add player count setup
- add Games Screen
- add session score row
- add Find the Match game
- add Result Screen
- keep Mini Arena hidden/dev-only
- update docs
- include manual QA checklist

Do not include:

- tests/CI
- deployment
- audio
- localStorage
- multiple playable games

### PR 2 — Tests and CI

Scope:

- add Vitest
- add Testing Library React
- add jsdom
- add reducer tests
- add board generation tests
- add winner calculation tests
- add platform score tests
- add GitHub Actions

CI should run:

```bash
npm run lint
npm run test
npm run build
```

Recommended scripts:

```json
{
  "scripts": {
    "lint": "eslint .",
    "test": "vitest run",
    "build": "tsc --noEmit && vite build",
    "check": "npm run lint && npm run test && npm run build"
  }
}
```

### PR 3 — Cloudflare Pages deployment

Scope:

- deploy to Cloudflare Pages
- build command: `npm run build`
- output directory: `dist`
- add SPA fallback for React Router

For Cloudflare Pages SPA fallback, add:

```text
public/_redirects
```

With content:

```text
/* /index.html 200
```

Deployment should happen after Tests/CI exists.

## 20. Manual QA checklist for PR 1

Verify:

- choose 1 player
- choose 2 players
- choose 3 players
- choose 4 players
- `/setup` to `/games` navigation works
- `/games` shows active Find the Match card
- `/games` shows disabled Coming Soon cards
- `/games` shows session score row
- player colors match labels consistently
- selecting Find the Match starts immediately
- route guards redirect safely when required state is missing
- cards flip in 250ms
- match behavior works:
  - cards show for 700ms
  - game score increments
  - cards disappear
  - empty slots remain
  - same player continues
- mismatch behavior works:
  - cards show for 1200ms
  - cards flip back
  - turn changes
  - board locks for 700ms
- current player banner updates
- board border updates to current player color
- game ends when all pairs are removed
- solo result shows time and moves
- multiplayer result shows correct winner
- tie result awards top tied players
- tap anywhere returns to Games Screen
- session score updates on Games Screen
- Back to Games exits active game without awarding points
- refresh resets session

## 21. First automated tests for PR 2

Focus on reducers and pure game logic.

### Board generation tests

- correct number of pairs for 1/2/3/4 players
- every selected shape appears exactly twice
- cards have unique IDs
- removed slots preserve board positions

### Find the Match reducer tests

- first-card selection
- second-card selection
- match transition
- mismatch transition
- board locked during timed phases
- same player continues after match
- next player after mismatch
- game completes when all pairs removed

### Winner calculation tests

- highest score wins
- tied highest players all win
- solo result includes time and moves

### Platform reducer tests

- player count setup
- session score initialization
- game completion awards +1 to winners
- continue from result returns to Games Screen
- session resets on refresh/new setup

Do not test first:

- exact animation frames
- visual pixels
- Framer Motion internals
- screenshot tests

## 22. Future roadmap

After the first three PRs:

1. Add sound effects only if visual feedback is not enough.
2. Add second game to validate platform architecture.
3. Consider localStorage only if families ask for persistent scores.
4. Add mobile polish after tablet testing.
5. Add more Coming Soon games gradually.
6. Consider Phaser/Pixi only if future games become animation/physics heavy.

Candidate future games:

- Race Dash
- Coin Rush
- Tank Bounce
- Reaction Tap
- King of the Zone

## 23. Non-goals for now

Do not build yet:

- online multiplayer
- accounts/login
- ads
- analytics
- custom player names
- game editor
- level editor
- full physics engine
- PWA/offline support
- saved sessions

Keep v1 focused: **choose players, pick game, play Find the Match, award session point, return to Games Screen.**
