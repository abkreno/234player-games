import { describe, expect, it } from 'vitest';
import { createTestPlayers } from '../../test/fixtures';
import {
  basketballReducer,
  createInitialBasketballState,
  getBasketballWinners,
} from './basketballReducer';
import { SHOTS_PER_PLAYER } from './basketballTypes';

describe('Basketball Hoops reducer', () => {
  it('moves the power meter while aiming', () => {
    const state = createInitialBasketballState(createTestPlayers(2));
    const nextState = basketballReducer(state, { type: 'powerTick' });

    expect(nextState.currentPower).toBe(3);
    expect(nextState.powerDirection).toBe(1);
  });

  it('bounces the power meter at the edges', () => {
    const state = {
      ...createInitialBasketballState(createTestPlayers(2)),
      currentPower: 99,
      powerDirection: 1 as const,
    };
    const nextState = basketballReducer(state, { type: 'powerTick' });

    expect(nextState.currentPower).toBe(100);
    expect(nextState.powerDirection).toBe(-1);
  });

  it('scores a made shot inside the green zone', () => {
    const state = {
      ...createInitialBasketballState(createTestPlayers(2)),
      currentPower: 50,
    };
    const nextState = basketballReducer(state, { type: 'shoot' });

    expect(nextState.phase).toBe('shot-result');
    expect(nextState.shotResult).toBe('made');
    expect(nextState.gameScores[state.currentPlayerId]).toBe(1);
    expect(nextState.shotsTaken[state.currentPlayerId]).toBe(1);
  });

  it('misses a shot outside the green zone', () => {
    const state = {
      ...createInitialBasketballState(createTestPlayers(2)),
      currentPower: 20,
    };
    const nextState = basketballReducer(state, { type: 'shoot' });

    expect(nextState.shotResult).toBe('missed');
    expect(nextState.gameScores[state.currentPlayerId]).toBe(0);
    expect(nextState.shotsTaken[state.currentPlayerId]).toBe(1);
  });

  it('moves to the next player after a shot result', () => {
    const state = createInitialBasketballState(createTestPlayers(3));
    const shotState = basketballReducer(state, { type: 'shoot' });
    const nextTurnState = basketballReducer(shotState, { type: 'nextTurn' });

    expect(nextTurnState.phase).toBe('aiming');
    expect(nextTurnState.currentPlayerId).toBe(state.playerOrder[1]);
    expect(nextTurnState.currentPower).toBe(0);
  });

  it('completes after every player takes all shots', () => {
    const state = createInitialBasketballState(createTestPlayers(2));
    const almostCompleteState = {
      ...state,
      phase: 'shot-result' as const,
      shotsTaken: {
        1: SHOTS_PER_PLAYER,
        2: SHOTS_PER_PLAYER,
        3: 0,
        4: 0,
      },
    };
    const completeState = basketballReducer(almostCompleteState, { type: 'nextTurn' });

    expect(completeState.phase).toBe('complete');
  });

  it('returns all tied highest-scoring players as winners', () => {
    expect(getBasketballWinners({ 1: 4, 2: 2, 3: 4, 4: 0 }, createTestPlayers(3))).toEqual([
      1,
      3,
    ]);
  });
});
