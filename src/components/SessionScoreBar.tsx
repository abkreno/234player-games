import type { Player, PlayerId } from '../app/appTypes';
import { PlayerBadge } from './PlayerBadge';

type SessionScoreBarProps = {
  players: Player[];
  scores: Record<PlayerId, number>;
};

export function SessionScoreBar({ players, scores }: SessionScoreBarProps) {
  return (
    <footer className="session-score" aria-label="Session score">
      {players.map((player) => (
        <PlayerBadge key={player.id} player={player} score={scores[player.id]} compact />
      ))}
    </footer>
  );
}
