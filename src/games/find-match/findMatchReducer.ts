import type { Player, PlayerId } from '../../app/appTypes';
import { createBoard } from './board';
import type { FindMatchAction, FindMatchState, MatchCard } from './findMatchTypes';

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

function getNextPlayerId(state: FindMatchState): PlayerId {
  const currentIndex = state.playerOrder.indexOf(state.currentPlayerId);
  const nextIndex = (currentIndex + 1) % state.playerOrder.length;

  return state.playerOrder[nextIndex];
}

function revealCard(cards: MatchCard[], cardId: string): MatchCard[] {
  return cards.map((card) => (card.id === cardId ? { ...card, state: 'revealed' } : card));
}

function hideCards(cards: MatchCard[], cardIds: string[]): MatchCard[] {
  return cards.map((card) =>
    cardIds.includes(card.id) && card.state !== 'removed' ? { ...card, state: 'hidden' } : card,
  );
}

function removeCards(cards: MatchCard[], cardIds: string[]): MatchCard[] {
  return cards.map((card) => (cardIds.includes(card.id) ? { ...card, state: 'removed' } : card));
}

function isBoardComplete(cards: MatchCard[]): boolean {
  return cards.every((card) => card.state === 'removed');
}

export function createInitialFindMatchState(players: Player[]): FindMatchState {
  const firstPlayerId = getRandomPlayerId(players);

  return {
    phase: 'selectingFirstCard',
    cards: createBoard(players.length as 1 | 2 | 3 | 4),
    currentPlayerId: firstPlayerId,
    playerOrder: createPlayerOrder(players, firstPlayerId),
    selectedCardIds: [],
    gameScores: createEmptyScores(players),
    moves: 0,
    startedAt: Date.now(),
    lastMatchedCardIds: [],
  };
}

export function findMatchReducer(state: FindMatchState, action: FindMatchAction): FindMatchState {
  switch (action.type) {
    case 'cardSelected': {
      if (state.phase !== 'selectingFirstCard' && state.phase !== 'selectingSecondCard') {
        return state;
      }

      const selectedCard = state.cards.find((card) => card.id === action.cardId);

      if (!selectedCard || selectedCard.state !== 'hidden') {
        return state;
      }

      const selectedCardIds = [...state.selectedCardIds, action.cardId];
      const cards = revealCard(state.cards, action.cardId);

      if (selectedCardIds.length === 1) {
        return {
          ...state,
          phase: 'selectingSecondCard',
          selectedCardIds,
          cards,
        };
      }

      const [firstCardId, secondCardId] = selectedCardIds;
      const firstCard = cards.find((card) => card.id === firstCardId);
      const secondCard = cards.find((card) => card.id === secondCardId);

      if (!firstCard || !secondCard) {
        return state;
      }

      const isMatch = firstCard.pairId === secondCard.pairId;

      if (isMatch) {
        return {
          ...state,
          phase: 'removingMatch',
          selectedCardIds,
          cards,
          moves: state.moves + 1,
          gameScores: {
            ...state.gameScores,
            [state.currentPlayerId]: state.gameScores[state.currentPlayerId] + 1,
          },
          lastMatchedCardIds: selectedCardIds,
        };
      }

      return {
        ...state,
        phase: 'showingMismatch',
        selectedCardIds,
        cards,
        moves: state.moves + 1,
      };
    }

    case 'matchReadyToRemove': {
      if (state.phase !== 'removingMatch') {
        return state;
      }

      const cards = removeCards(state.cards, state.lastMatchedCardIds);

      if (isBoardComplete(cards)) {
        return {
          ...state,
          phase: 'complete',
          cards,
          selectedCardIds: [],
          completedAt: Date.now(),
        };
      }

      return {
        ...state,
        phase: 'selectingFirstCard',
        cards,
        selectedCardIds: [],
        lastMatchedCardIds: [],
      };
    }

    case 'matchedCardsRemoved':
      return state;

    case 'mismatchReadyToHide': {
      if (state.phase !== 'showingMismatch') {
        return state;
      }

      return {
        ...state,
        phase: 'turnTransition',
        cards: hideCards(state.cards, state.selectedCardIds),
        selectedCardIds: [],
        currentPlayerId: getNextPlayerId(state),
      };
    }

    case 'turnReady':
      if (state.phase !== 'turnTransition') {
        return state;
      }

      return {
        ...state,
        phase: 'selectingFirstCard',
      };

    default:
      return state;
  }
}

export function getWinners(gameScores: Record<PlayerId, number>, players: Player[]): PlayerId[] {
  const activeScores = players.map((player) => ({ id: player.id, score: gameScores[player.id] }));
  const highestScore = Math.max(...activeScores.map((playerScore) => playerScore.score));

  return activeScores
    .filter((playerScore) => playerScore.score === highestScore)
    .map((playerScore) => playerScore.id);
}
