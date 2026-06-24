import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useReducer, useRef } from 'react';
import type { GameResult, Player, PlayerId } from '../../app/appTypes';
import { PlayerBadge } from '../../components/PlayerBadge';
import { findMatchReducer, createInitialFindMatchState, getWinners } from './findMatchReducer';
import type { MatchCard } from './findMatchTypes';
import { getShapeLabel } from './shapes';
import { ShapeIcon } from './ShapeIcon';

type FindMatchGameProps = {
  players: Player[];
  onComplete: (result: GameResult) => void;
  onExit: () => void;
};

function getElapsedSeconds(startedAt: number, completedAt?: number): number {
  return Math.max(0, Math.round(((completedAt ?? Date.now()) - startedAt) / 1000));
}

function getGridClass(cardCount: number): string {
  if (cardCount <= 10) {
    return 'find-match-board find-match-board--small';
  }

  if (cardCount <= 12) {
    return 'find-match-board find-match-board--medium';
  }

  return 'find-match-board find-match-board--large';
}

function getCardLabel(card: MatchCard): string {
  if (card.state === 'removed') {
    return 'Matched card removed';
  }

  if (card.state === 'hidden') {
    return 'Hidden card';
  }

  return `${getShapeLabel(card.shape)} card`;
}

export function FindMatchGame({ players, onComplete, onExit }: FindMatchGameProps) {
  const [state, dispatch] = useReducer(
    findMatchReducer,
    players,
    createInitialFindMatchState,
  );
  const prefersReducedMotion = useReducedMotion();
  const completedRef = useRef(false);
  const currentPlayer = players.find((player) => player.id === state.currentPlayerId) ?? players[0];
  const isBoardLocked =
    state.phase === 'removingMatch' ||
    state.phase === 'showingMismatch' ||
    state.phase === 'turnTransition' ||
    state.phase === 'complete';
  const gridClass = useMemo(() => getGridClass(state.cards.length), [state.cards.length]);

  useEffect(() => {
    if (state.phase !== 'removingMatch') {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      dispatch({ type: 'matchReadyToRemove' });
    }, 700);

    return () => window.clearTimeout(timeoutId);
  }, [state.phase, state.lastMatchedCardIds]);

  useEffect(() => {
    if (state.phase !== 'showingMismatch') {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      dispatch({ type: 'mismatchReadyToHide' });
    }, 1200);

    return () => window.clearTimeout(timeoutId);
  }, [state.phase, state.selectedCardIds]);

  useEffect(() => {
    if (state.phase !== 'turnTransition') {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      dispatch({ type: 'turnReady' });
    }, 700);

    return () => window.clearTimeout(timeoutId);
  }, [state.phase, state.currentPlayerId]);

  useEffect(() => {
    if (state.phase !== 'complete' || completedRef.current) {
      return;
    }

    completedRef.current = true;
    onComplete({
      gameId: 'find-match',
      winners: players.length === 1 ? [players[0].id] : getWinners(state.gameScores, players),
      gameScores: state.gameScores,
      soloStats:
        players.length === 1
          ? {
              moves: state.moves,
              elapsedSeconds: getElapsedSeconds(state.startedAt, state.completedAt),
            }
          : undefined,
    });
  }, [onComplete, players, state]);

  return (
    <main className="game-screen">
      <div className="game-topbar">
        <button className="text-button" type="button" onClick={onExit}>
          ← Back to Games
        </button>
        <div className="game-score-row" aria-label="Current game score">
          {players.map((player) => (
            <PlayerBadge
              key={player.id}
              player={player}
              score={state.gameScores[player.id]}
              compact
              active={player.id === state.currentPlayerId}
            />
          ))}
        </div>
      </div>

      <motion.section
        className="turn-banner"
        aria-live="polite"
        style={{ '--player-color': currentPlayer.color } as React.CSSProperties}
        initial={prefersReducedMotion ? false : { y: -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        key={currentPlayer.id}
      >
        {currentPlayer.label}’s turn
      </motion.section>

      <section
        className="board-wrap"
        style={{ '--player-color': currentPlayer.color } as React.CSSProperties}
      >
        <div className={gridClass} aria-label="Find the Match card board">
          {state.cards.map((card) => {
            if (card.state === 'removed') {
              return (
                <div
                  key={card.id}
                  className="match-card-slot match-card-slot--empty"
                  aria-label="Matched card removed"
                />
              );
            }

            const isRevealed = card.state === 'revealed';

            return (
              <motion.button
                key={card.id}
                type="button"
                className={`match-card ${isRevealed ? 'match-card--revealed' : ''}`}
                aria-label={getCardLabel(card)}
                aria-disabled={isBoardLocked}
                onClick={() => {
                  if (isBoardLocked) {
                    return;
                  }

                  dispatch({ type: 'cardSelected', cardId: card.id });
                }}
                animate={prefersReducedMotion ? { opacity: 1 } : { rotateY: isRevealed ? 180 : 0 }}
                transition={{ duration: prefersReducedMotion ? 0.05 : 0.25 }}
              >
                <span className="match-card__face match-card__back" aria-hidden="true">
                  ?
                </span>
                <span className="match-card__face match-card__front" aria-hidden={!isRevealed}>
                  <ShapeIcon shape={card.shape} color={card.color} />
                </span>
              </motion.button>
            );
          })}
        </div>
      </section>
    </main>
  );
}
