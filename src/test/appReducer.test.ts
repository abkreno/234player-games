import { describe, expect, it } from 'vitest';
import { appReducer, initialAppState } from '../app/appReducer';
import type { GameResult } from '../app/appTypes';

describe('appReducer', () => {
  it('selects player count', () => {
    const state = appReducer(initialAppState, { type: 'selectPlayerCount', playerCount: 3 });

    expect(state.screen).toBe('games');
    expect(state.playerCount).toBe(3);
    expect(state.players).toHaveLength(3);
    expect(state.sessionScores).toEqual({ 1: 0, 2: 0, 3: 0, 4: 0 });
  });

  it('starts selected game', () => {
    const setupState = appReducer(initialAppState, { type: 'selectPlayerCount', playerCount: 2 });
    const playingState = appReducer(setupState, { type: 'selectGame', gameId: 'find-match' });

    expect(playingState.screen).toBe('playing');
    expect(playingState.selectedGameId).toBe('find-match');
  });

  it('increments session totals for each winner', () => {
    const setupState = appReducer(initialAppState, { type: 'selectPlayerCount', playerCount: 4 });
    const result: GameResult = {
      gameId: 'find-match',
      winners: [1, 3],
      gameScores: { 1: 3, 2: 1, 3: 3, 4: 0 },
    };
    const resultState = appReducer(setupState, { type: 'completeGame', result });

    expect(resultState.screen).toBe('result');
    expect(resultState.result).toBe(result);
    expect(resultState.sessionScores).toEqual({ 1: 1, 2: 0, 3: 1, 4: 0 });
  });

  it('keeps session totals when continuing back to games', () => {
    const setupState = appReducer(initialAppState, { type: 'selectPlayerCount', playerCount: 1 });
    const result: GameResult = {
      gameId: 'find-match',
      winners: [1],
      gameScores: { 1: 4, 2: 0, 3: 0, 4: 0 },
      soloStats: { moves: 8, elapsedSeconds: 22 },
    };
    const resultState = appReducer(setupState, { type: 'completeGame', result });
    const gamesState = appReducer(resultState, { type: 'continueFromResult' });

    expect(gamesState.screen).toBe('games');
    expect(gamesState.result).toBeUndefined();
    expect(gamesState.selectedGameId).toBeUndefined();
    expect(gamesState.sessionScores[1]).toBe(1);
  });

  it('exits a game without changing session totals', () => {
    const setupState = appReducer(initialAppState, { type: 'selectPlayerCount', playerCount: 2 });
    const playingState = appReducer(setupState, { type: 'selectGame', gameId: 'find-match' });
    const gamesState = appReducer(playingState, { type: 'exitGame' });

    expect(gamesState.screen).toBe('games');
    expect(gamesState.sessionScores).toEqual({ 1: 0, 2: 0, 3: 0, 4: 0 });
  });
});
