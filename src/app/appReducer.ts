import type { AppAction, AppState, Player, PlayerCount, PlayerId } from './appTypes';

const PLAYER_COLORS: Record<PlayerId, string> = {
  1: '#2563eb',
  2: '#f97316',
  3: '#7c3aed',
  4: '#16a34a',
};

export const initialSessionScores: Record<PlayerId, number> = {
  1: 0,
  2: 0,
  3: 0,
  4: 0,
};

export const initialAppState: AppState = {
  screen: 'setup',
  players: [],
  sessionScores: initialSessionScores,
};

export function createPlayers(playerCount: PlayerCount): Player[] {
  return Array.from({ length: playerCount }, (_, index) => {
    const id = (index + 1) as PlayerId;

    return {
      id,
      label: `Player ${id}`,
      shortLabel: `P${id}`,
      color: PLAYER_COLORS[id],
    };
  });
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'selectPlayerCount':
      return {
        screen: 'games',
        playerCount: action.playerCount,
        players: createPlayers(action.playerCount),
        sessionScores: initialSessionScores,
      };

    case 'selectGame':
      return {
        ...state,
        screen: 'playing',
        selectedGameId: action.gameId,
        result: undefined,
      };

    case 'completeGame': {
      const nextSessionScores = { ...state.sessionScores };

      action.result.winners.forEach((winnerId) => {
        nextSessionScores[winnerId] += 1;
      });

      return {
        ...state,
        screen: 'result',
        result: action.result,
        sessionScores: nextSessionScores,
      };
    }

    case 'continueFromResult':
      return {
        ...state,
        screen: 'games',
        selectedGameId: undefined,
        result: undefined,
      };

    case 'exitGame':
      return {
        ...state,
        screen: 'games',
        selectedGameId: undefined,
        result: undefined,
      };

    case 'resetSession':
      return initialAppState;

    default:
      return state;
  }
}
