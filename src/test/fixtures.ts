import type { Player, PlayerId } from '../app/appTypes';

const PLAYER_COLORS: Record<PlayerId, string> = {
  1: '#2563eb',
  2: '#f97316',
  3: '#7c3aed',
  4: '#16a34a',
};

export function createTestPlayers(count: 1 | 2 | 3 | 4): Player[] {
  return Array.from({ length: count }, (_, index) => {
    const id = (index + 1) as PlayerId;

    return {
      id,
      label: `Player ${id}`,
      shortLabel: `P${id}`,
      color: PLAYER_COLORS[id],
    };
  });
}
