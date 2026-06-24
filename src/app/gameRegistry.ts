import type { GameDefinition } from './appTypes';

export const GAME_REGISTRY: readonly GameDefinition[] = [
  {
    id: 'find-match',
    title: 'Find the Match',
    description: 'Flip two cards, match the shapes, and win the most pairs.',
    status: 'available',
  },
  {
    id: 'race-dash',
    title: 'Race Dash',
    description: 'A fast finish-line race for the next release.',
    status: 'coming-soon',
  },
  {
    id: 'coin-rush',
    title: 'Coin Rush',
    description: 'Grab coins before the timer runs out.',
    status: 'coming-soon',
  },
  {
    id: 'tank-bounce',
    title: 'Tank Bounce',
    description: 'Bounce shots and survive the arena.',
    status: 'coming-soon',
  },
] as const;
