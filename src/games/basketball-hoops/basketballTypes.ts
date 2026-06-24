import type { PlayerId } from '../../app/appTypes';

export const SHOTS_PER_PLAYER = 5;

export type BasketballPhase = 'aiming' | 'shot-result' | 'complete';
export type ShotResult = 'made' | 'missed';
export type PowerDirection = 1 | -1;

export type BasketballState = {
  phase: BasketballPhase;
  currentPlayerId: PlayerId;
  playerOrder: PlayerId[];
  gameScores: Record<PlayerId, number>;
  shotsTaken: Record<PlayerId, number>;
  currentPower: number;
  powerDirection: PowerDirection;
  shotResult?: ShotResult;
  lastShotPower?: number;
};

export type BasketballAction = { type: 'powerTick' } | { type: 'shoot' } | { type: 'nextTurn' };
