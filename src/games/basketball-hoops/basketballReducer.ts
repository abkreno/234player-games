import type { Player, PlayerId } from '../../app/appTypes';
import type { BasketballAction, BasketballState, PowerDirection } from './basketballTypes';
import { SHOTS_PER_PLAYER } from './basketballTypes';

function createEmptyScores(players: Player[]): Record<PlayerId, number> {
  return players.reduce(
    (scores, player) => ({
      ...scores,
      [player.id]: 0,
    }),
    { 1: 0, 2: 0, 3: 0, 4: 0 } as Record<PlayerId, number>,
  );
}

function getRandomPlayerId(players: Player[]): PlayerId {
  return players[Math.floor(Math.random() * players.length)].id;
}

function createPlayerOrder(players: Player[], firstPlayerId: PlayerId): PlayerId[] {
  const playerIds = players.map((player) => player.id);
  const firstIndex = playerIds.indexOf(firstPlayerId);

  return [...playerIds.slice(firstIndex), ...playerIds.slice(0, firstIndex)];
}

function getNextPlayerId(state: BasketballState): PlayerId {
  const currentIndex = state.playerOrder.indexOf(state.currentPlayerId);
  const nextIndex = (currentIndex + 1) % state.playerOrder.length;

  return state.playerOrder[nextIndex];
}

function isMadeShot(power: number): boolean {
  return power >= 43 && power <= 57;
}

function areAllShotsComplete(state: BasketballState): boolean {
  return state.playerOrder.every((playerId) => state.shotsTaken[playerId] >= SHOTS_PER_PLAYER);
}

function getNextPowerState(
  power: number,
  direction: PowerDirection,
): Pick<BasketballState, 'currentPower' | 'powerDirection'> {
  const nextPower = power + direction * 3;

  if (nextPower >= 100) {
    return { currentPower: 100, powerDirection: -1 };
  }

  if (nextPower <= 0) {
    return { currentPower: 0, powerDirection: 1 };
  }

  return { currentPower: nextPower, powerDirection: direction };
}

export function createInitialBasketballState(players: Player[]): BasketballState {
  const firstPlayerId = getRandomPlayerId(players);

  return {
    phase: 'aiming',
    currentPlayerId: firstPlayerId,
    playerOrder: createPlayerOrder(players, firstPlayerId),
    gameScores: createEmptyScores(players),
    shotsTaken: createEmptyScores(players),
    currentPower: 0,
    powerDirection: 1,
  };
}

export function basketballReducer(
  state: BasketballState,
  action: BasketballAction,
): BasketballState {
  switch (action.type) {
    case 'powerTick':
      if (state.phase !== 'aiming') {
        return state;
      }

      return {
        ...state,
        ...getNextPowerState(state.currentPower, state.powerDirection),
      };

    case 'shoot': {
      if (state.phase !== 'aiming') {
        return state;
      }

      const madeShot = isMadeShot(state.currentPower);

      return {
        ...state,
        phase: 'shot-result',
        shotResult: madeShot ? 'made' : 'missed',
        lastShotPower: state.currentPower,
        gameScores: {
          ...state.gameScores,
          [state.currentPlayerId]: state.gameScores[state.currentPlayerId] + (madeShot ? 1 : 0),
        },
        shotsTaken: {
          ...state.shotsTaken,
          [state.currentPlayerId]: state.shotsTaken[state.currentPlayerId] + 1,
        },
      };
    }

    case 'nextTurn': {
      if (state.phase !== 'shot-result') {
        return state;
      }

      if (areAllShotsComplete(state)) {
        return {
          ...state,
          phase: 'complete',
        };
      }

      return {
        ...state,
        phase: 'aiming',
        currentPlayerId: getNextPlayerId(state),
        currentPower: 0,
        powerDirection: 1,
        shotResult: undefined,
      };
    }

    default:
      return state;
  }
}

export function getBasketballWinners(gameScores: Record<PlayerId, number>, players: Player[]): PlayerId[] {
  const activeScores = players.map((player) => ({ id: player.id, score: gameScores[player.id] }));
  const highestScore = Math.max(...activeScores.map((playerScore) => playerScore.score));

  return activeScores
    .filter((playerScore) => playerScore.score === highestScore)
    .map((playerScore) => playerScore.id);
}
