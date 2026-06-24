import { describe, expect, it } from 'vitest';
import type { PlayerCount } from '../../app/appTypes';
import { createBoard, getPairCount } from './board';

const PLAYER_COUNTS: readonly PlayerCount[] = [1, 2, 3, 4];

describe('Find the Match board generation', () => {
  it.each([
    [1, 4],
    [2, 5],
    [3, 6],
    [4, 8],
  ] as const)('returns %i pairs for %i players', (playerCount, expectedPairs) => {
    expect(getPairCount(playerCount)).toBe(expectedPairs);
  });

  it.each(PLAYER_COUNTS)('creates two cards per pair for %i players', (playerCount) => {
    const board = createBoard(playerCount);
    const pairCount = getPairCount(playerCount);

    expect(board).toHaveLength(pairCount * 2);

    const cardsByPair = new Map<string, number>();

    board.forEach((card) => {
      cardsByPair.set(card.pairId, (cardsByPair.get(card.pairId) ?? 0) + 1);
    });

    expect(cardsByPair).toHaveLength(pairCount);
    expect([...cardsByPair.values()]).toEqual(Array(pairCount).fill(2));
  });

  it.each(PLAYER_COUNTS)('creates unique card ids for %i players', (playerCount) => {
    const board = createBoard(playerCount);
    const uniqueIds = new Set(board.map((card) => card.id));

    expect(uniqueIds.size).toBe(board.length);
  });

  it('starts all cards hidden', () => {
    const board = createBoard(4);

    expect(board.every((card) => card.state === 'hidden')).toBe(true);
  });
});
