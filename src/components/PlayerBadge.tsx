import type { Player } from '../app/appTypes';

type PlayerBadgeProps = {
  player: Player;
  score?: number;
  compact?: boolean;
  active?: boolean;
};

export function PlayerBadge({ player, score, compact = false, active = false }: PlayerBadgeProps) {
  return (
    <span
      className={`player-badge ${active ? 'player-badge--active' : ''}`}
      style={{ '--player-color': player.color } as React.CSSProperties}
    >
      <span className="player-badge__dot" aria-hidden="true" />
      <span>{compact ? player.shortLabel : player.label}</span>
      {score !== undefined ? <strong>{score}</strong> : null}
    </span>
  );
}
