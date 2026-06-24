import type { PlayerCount } from '../../app/appTypes';
import type { MatchCard } from './findMatchTypes';
import { SHAPES } from './shapes';

const PAIRS_BY_PLAYER_COUNT: Record<PlayerCount, number> = {
  1: 4,
  2: 5,
  3: 6,
  4: 8,
};

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

export function getPairCount(playerCount: PlayerCount): number {
  return PAIRS_BY_PLAYER_COUNT[playerCount];
}

export function createBoard(playerCount: PlayerCount): MatchCard[] {
  const pairCount = getPairCount(playerCount);
  const selectedShapes = shuffle([...SHAPES]).slice(0, pairCount);
  const cards = selectedShapes.flatMap((shape, index) => {
    const pairId = `${shape.kind}-${index}`;

    return [0, 1].map((copyIndex) => ({
      id: `${pairId}-${copyIndex}`,
      pairId,
      shape: shape.kind,
      color: shape.color,
      state: 'hidden' as const,
    }));
  });

  return shuffle(cards);
}
