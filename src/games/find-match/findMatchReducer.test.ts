import { describe, expect, it, vi } from 'vitest';
import { createTestPlayers } from '../../test/fixtures';
import { createInitialFindMatchState, findMatchReducer, getWinners } from './findMatchReducer';
import type { FindMatchState } from './findMatchTypes';

function selectMatchingPair(state: FindMatchState): [string, string] {
  const firstCard = state.cards[0];
  const secondCard = state.cards.find(
    (card) => card.id !== firstCard.id && card.pairId === firstCard.pairId,
  );

  if (!secondCard) {
    throw new Error('Test board is missing a matching pair.');
  }

  return [firstCard.id, secondCard.id];
}

function selectMismatchedPair(state: FindMatchState): [string, string] {
  const firstCard = state.cards[0];
  const secondCard = state.cards.find(
    (card) => card.id !== firstCard.id && card.pairId !== firstCard.pairId,
  );

  if (!secondCard) {
    throw new Error('Test board is missing a mismatched pair.');
  }

  return [firstCard.id, secondCard.id];
}

describe('Find the Match reducer', () => {
  it('selects a first card and reveals it', () => {
    const state = createInitialFindMatchState(createTestPlayers(2));
    const firstCardId = state.cards[0].id;
    const nextState = findMatchReducer(state, { type: 'cardSelected', cardId: firstCardId });

    expect(nextState.phase).toBe('selectingSecondCard');
    expect(nextState.selectedCardIds).toEqual([firstCardId]);
    expect(nextState.cards.find((card) => card.id === firstCardId)?.state).toBe('revealed');
  });

  it('scores a match, keeps the same player, then removes matched cards', () => {
    const state = createInitialFindMatchState(createTestPlayers(2));
    const currentPlayerId = state.currentPlayerId;
    const [firstCardId, secondCardId] = selectMatchingPair(state);

    const firstSelection = findMatchReducer(state, { type: 'cardSelected', cardId: firstCardId });
    const matchState = findMatchReducer(firstSelection, { type: 'cardSelected', cardId: secondCardId });

    expect(matchState.phase).toBe('removingMatch');
    expect(matchState.gameScores[currentPlayerId]).toBe(1);
    expect(matchState.currentPlayerId).toBe(currentPlayerId);

    const removedState = findMatchReducer(matchState, { type: 'matchReadyToRemove' });

    expect(removedState.phase).toBe('selectingFirstCard');
    expect(removedState.selectedCardIds).toEqual([]);
    expect(removedState.cards.filter((card) => card.state === 'removed')).toHaveLength(2);
  });

  it('hides mismatched cards and advances to the next player after the turn lock', () => {
    const state = createInitialFindMatchState(createTestPlayers(3));
    const currentPlayerId = state.currentPlayerId;
    const expectedNextPlayerId = state.playerOrder[1];
    const [firstCardId, secondCardId] = selectMismatchedPair(state);

    const firstSelection = findMatchReducer(state, { type: 'cardSelected', cardId: firstCardId });
    const mismatchState = findMatchReducer(firstSelection, { type: 'cardSelected', cardId: secondCardId });

    expect(mismatchState.phase).toBe('showingMismatch');
    expect(mismatchState.currentPlayerId).toBe(currentPlayerId);
    expect(mismatchState.moves).toBe(1);

    const transitionState = findMatchReducer(mismatchState, { type: 'mismatchReadyToHide' });

    expect(transitionState.phase).toBe('turnTransition');
    expect(transitionState.currentPlayerId).toBe(expectedNextPlayerId);
    expect(transitionState.selectedCardIds).toEqual([]);
    expect(transitionState.cards.find((card) => card.id === firstCardId)?.state).toBe('hidden');
    expect(transitionState.cards.find((card) => card.id === secondCardId)?.state).toBe('hidden');

    const nextTurnState = findMatchReducer(transitionState, { type: 'turnReady' });

    expect(nextTurnState.phase).toBe('selectingFirstCard');
  });

  it('ignores card clicks while the board is locked', () => {
    const state = createInitialFindMatchState(createTestPlayers(2));
    const [firstCardId, secondCardId] = selectMismatchedPair(state);
    const firstSelection = findMatchReducer(state, { type: 'cardSelected', cardId: firstCardId });
    const lockedState = findMatchReducer(firstSelection, { type: 'cardSelected', cardId: secondCardId });
    const ignoredState = findMatchReducer(lockedState, {
      type: 'cardSelected',
      cardId: lockedState.cards[2].id,
    });

    expect(ignoredState).toBe(lockedState);
  });

  it('marks the game complete when the final pair is removed', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-25T00:00:00Z'));

    const state = createInitialFindMatchState(createTestPlayers(1));
    const [firstCardId, secondCardId] = selectMatchingPair(state);
    const almostCompleteState: FindMatchState = {
      ...state,
      cards: state.cards.map((card) =>
        card.id === firstCardId || card.id === secondCardId ? card : { ...card, state: 'removed' },
      ),
    };

    const firstSelection = findMatchReducer(almostCompleteState, {
      type: 'cardSelected',
      cardId: firstCardId,
    });
    const matchState = findMatchReducer(firstSelection, {
      type: 'cardSelected',
      cardId: secondCardId,
    });
    const completeState = findMatchReducer(matchState, { type: 'matchReadyToRemove' });

    expect(completeState.phase).toBe('complete');
    expect(completeState.cards.every((card) => card.state === 'removed')).toBe(true);
    expect(completeState.completedAt).toBe(Date.now());

    vi.useRealTimers();
  });

  it('returns all tied highest-scoring players as winners', () => {
    const players = createTestPlayers(4);

    expect(getWinners({ 1: 3, 2: 1, 3: 3, 4: 0 }, players)).toEqual([1, 3]);
  });
});
