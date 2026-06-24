import { motion, useReducedMotion } from 'framer-motion';
import type { GameResult, Player } from '../app/appTypes';

type ResultScreenProps = {
  players: Player[];
  result: GameResult;
  onContinue: () => void;
};

function formatWinnerNames(players: Player[], winnerIds: readonly number[]): string {
  return players
    .filter((player) => winnerIds.includes(player.id))
    .map((player) => player.label)
    .join(' and ');
}

export function ResultScreen({ players, result, onContinue }: ResultScreenProps) {
  const prefersReducedMotion = useReducedMotion();
  const winnerNames = formatWinnerNames(players, result.winners);
  const isTie = result.winners.length > 1;
  const isSolo = players.length === 1;

  return (
    <main className="result-screen" onClick={onContinue} onKeyDown={onContinue} tabIndex={0}>
      <motion.section
        className="result-card"
        initial={prefersReducedMotion ? false : { scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <p className="eyebrow">game over</p>
        <h1>{isSolo ? 'Great job!' : isTie ? 'It’s a tie!' : `${winnerNames} wins!`}</h1>
        {isSolo && result.soloStats ? (
          <p className="result-stats">
            Time: <strong>{result.soloStats.elapsedSeconds}s</strong> · Moves:{' '}
            <strong>{result.soloStats.moves}</strong>
          </p>
        ) : (
          <p className="result-stats">{winnerNames} get +1 game point.</p>
        )}
        <p className="tap-hint">Tap anywhere to continue</p>
      </motion.section>
    </main>
  );
}
