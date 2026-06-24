import type { PlayerConfig } from '../game/types';

export const PLAYER_CONFIGS: readonly PlayerConfig[] = [
  {
    id: 1,
    name: 'Player 1',
    color: '#22d3ee',
    keys: { up: 'w', down: 's', left: 'a', right: 'd' },
    keyLabels: ['W', 'A', 'S', 'D'],
  },
  {
    id: 2,
    name: 'Player 2',
    color: '#f97316',
    keys: { up: 'arrowup', down: 'arrowdown', left: 'arrowleft', right: 'arrowright' },
    keyLabels: ['↑', '←', '↓', '→'],
  },
  {
    id: 3,
    name: 'Player 3',
    color: '#a78bfa',
    keys: { up: 'i', down: 'k', left: 'j', right: 'l' },
    keyLabels: ['I', 'J', 'K', 'L'],
  },
  {
    id: 4,
    name: 'Player 4',
    color: '#34d399',
    keys: { up: 't', down: 'g', left: 'f', right: 'h' },
    keyLabels: ['T', 'F', 'G', 'H'],
  },
] as const;

export const CONTROLLED_KEYS = PLAYER_CONFIGS.flatMap((player) => Object.values(player.keys));
