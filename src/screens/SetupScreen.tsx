import type { PlayerCount } from '../app/appTypes';
import { ScreenShell } from '../components/ScreenShell';

type SetupScreenProps = {
  onSelectPlayerCount: (playerCount: PlayerCount) => void;
};

const PLAYER_COUNTS: readonly PlayerCount[] = [1, 2, 3, 4];

export function SetupScreen({ onSelectPlayerCount }: SetupScreenProps) {
  return (
    <ScreenShell
      eyebrow="family mini-games"
      title="Choose players"
      subtitle="Pick how many people are playing on this device."
    >
      <section className="setup-grid" aria-label="Choose player count">
        {PLAYER_COUNTS.map((playerCount) => (
          <button
            key={playerCount}
            className="player-count-card"
            type="button"
            onClick={() => onSelectPlayerCount(playerCount)}
          >
            <strong>{playerCount}</strong>
            <span>{playerCount === 1 ? 'Player' : 'Players'}</span>
          </button>
        ))}
      </section>
    </ScreenShell>
  );
}
