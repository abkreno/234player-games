import type { PlayerId } from '../../app/appTypes';

export const SHOTS_PER_PLAYER = 5;

export type BasketballPhase = 'aiming' | 'shot-result' | 'turn-transition' | 'complete';

export type ShotResult = 'made' | 'missed';

export type BasketballState = {
  phase: BasketballPhase;
  currentPlayerId: PlayerId;
  playerOrder: PlayerId[];
  gameScores: Record<PlayerId, number>;
  shotsTaken: Record<PlayerId, number>;
  currentPower: number;
  shotResult?: ShotResult;
  lastShotPower?: number;
};

export type BasketballAction =
  | { type: 'powerChanged'; power: number }
  | { type: 'shoot' }
  | { type: 'nextTurn' };
