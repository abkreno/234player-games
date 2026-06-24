import type { PlayerId } from '../../app/appTypes';

export type ShapeKind = 'circle' | 'square' | 'triangle' | 'star' | 'heart' | 'diamond' | 'moon' | 'hexagon';

export type CardState = 'hidden' | 'revealed' | 'removed';

export type MatchCard = {
  id: string;
  pairId: string;
  shape: ShapeKind;
  color: string;
  state: CardState;
};

export type FindMatchPhase =
  | 'ready'
  | 'selectingFirstCard'
  | 'selectingSecondCard'
  | 'checkingMatch'
  | 'removingMatch'
  | 'showingMismatch'
  | 'turnTransition'
  | 'complete';

export type FindMatchState = {
  phase: FindMatchPhase;
  cards: MatchCard[];
  currentPlayerId: PlayerId;
  playerOrder: PlayerId[];
  selectedCardIds: string[];
  gameScores: Record<PlayerId, number>;
  moves: number;
  startedAt: number;
  completedAt?: number;
  lastMatchedCardIds: string[];
};

export type FindMatchAction =
  | { type: 'cardSelected'; cardId: string }
  | { type: 'matchReadyToRemove' }
  | { type: 'matchedCardsRemoved' }
  | { type: 'mismatchReadyToHide' }
  | { type: 'turnReady' };
