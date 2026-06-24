import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useReducer, useRef } from 'react';
import type { CSSProperties } from 'react';
import type { GameResult, Player } from '../../app/appTypes';
import { PlayerBadge } from '../../components/PlayerBadge';
import {
  basketballReducer,
  createInitialBasketballState,
  getBasketballWinners,
} from './basketballReducer';
import { SHOTS_PER_PLAYER } from './basketballTypes';

type BasketballHoopsGameProps = {
  players: Player[];
  onComplete: (result: GameResult) => void;
  onExit: () => void;
};

function getPowerPosition(power: number): string {
  return `${power}%`;
}

function getShotArc(power: number): string {
  if (power >= 43 && power <= 57) {
    return 'basketball-ball basketball-ball--made';
  }

  if (power < 43) {
    return 'basketball-ball basketball-ball--short';
  }

  return 'basketball-ball basketball-ball--long';
}

export function BasketballHoopsGame({ players, onComplete, onExit }: BasketballHoopsGameProps) {
  const [state, dispatch] = useReducer(
    basketballReducer,
    players,
    createInitialBasketballState,
  );
  const prefersReducedMotion = useReducedMotion();
  const completedRef = useRef(false);
  const directionRef = useRef(1);
  const currentPlayer = players.find((player) => player.id === state.currentPlayerId) ?? players[0];

  useEffect(() => {
    if (state.phase !== 'aiming') {
      return;
    }

    const intervalId = window.setInterval(() => {
      dispatch({ type: 'powerChanged', power: getNextPower(directionRef.current) });
    }, 18);

    return () => window.clearInterval(intervalId);
  }, [state.phase]);

  function getNextPower(direction: number): number {
    const nextPower = state.currentPower + direction * 3;

    if (nextPower >= 100) {
      directionRef.current = -1;
      return 100;
    }

    if (nextPower <= 0) {
      directionRef.current = 1;
      return 0;
    }

    return nextPower;
  }

  useEffect(() => {
    if (state.phase !== 'shot-result') {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      dispatch({ type: 'nextTurn' });
    }, 1100);

    return () => window.clearTimeout(timeoutId);
  }, [state.phase, state.shotResult]);

  useEffect(() => {
    if (state.phase !== 'complete' || completedRef.current) {
      return;
    }

    completedRef.current = true;
    onComplete({
      gameId: 'basketball-hoops',
      winners: getBasketballWinners(state.gameScores, players),
      gameScores: state.gameScores,
    });
  }, [onComplete, players, state]);

  return (
    <main className="game-screen basketball-screen">
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
        style={{ '--player-color': currentPlayer.color } as CSSProperties}
        initial={prefersReducedMotion ? false : { y: -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        key={currentPlayer.id}
      >
        {currentPlayer.label}’s shot · {state.shotsTaken[currentPlayer.id] + 1}/{SHOTS_PER_PLAYER}
      </motion.section>

      <section className="basketball-court" style={{ '--player-color': currentPlayer.color } as CSSProperties}>
        <div className="basketball-hoop" aria-hidden="true">
          <div className="basketball-backboard" />
          <div className="basketball-rim" />
          <div className="basketball-net" />
        </div>

        <motion.div
          className={state.phase === 'shot-result' ? getShotArc(state.lastShotPower ?? 0) : 'basketball-ball'}
          aria-hidden="true"
          key={`${state.currentPlayerId}-${state.shotsTaken[state.currentPlayerId]}-${state.phase}`}
          initial={prefersReducedMotion ? false : { x: 0, y: 0 }}
          animate={state.phase === 'shot-result' && !prefersReducedMotion ? { x: 0, y: 0 } : undefined}
        >
          🏀
        </motion.div>

        <div className="basketball-shot-feedback" aria-live="polite">
          {state.phase === 'shot-result'
            ? state.shotResult === 'made'
              ? 'Swish! +1'
              : 'Miss!'
            : 'Tap Shoot when the marker is in the green zone'}
        </div>

        <div className="power-meter" aria-label="Shot power meter">
          <span className="power-meter__zone" />
          <span className="power-meter__marker" style={{ left: getPowerPosition(state.currentPower) }} />
        </div>

        <button
          className="shoot-button"
          type="button"
          disabled={state.phase !== 'aiming'}
          onClick={() => dispatch({ type: 'shoot' })}
        >
          Shoot
        </button>
      </section>
    </main>
  );
}
