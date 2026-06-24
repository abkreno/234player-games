import { describe, expect, it } from 'vitest';
import { appReducer, initialAppState } from '../app/appReducer';

describe('appReducer', () => {
  it('selects player count', () => {
    const state = appReducer(initialAppState, { type: 'selectPlayerCount', playerCount: 3 });

    expect(state.screen).toBe('games');
    expect(state.playerCount).toBe(3);
    expect(state.players).toHaveLength(3);
  });
});
