import type { GameId, Player, PlayerId } from '../app/appTypes';
import { GAME_REGISTRY } from '../app/gameRegistry';
import { ScreenShell } from '../components/ScreenShell';
import { SessionScoreBar } from '../components/SessionScoreBar';

type GamesScreenProps = {
  players: Player[];
  sessionScores: Record<PlayerId, number>;
  onSelectGame: (gameId: GameId) => void;
};

export function GamesScreen({ players, sessionScores, onSelectGame }: GamesScreenProps) {
  return (
    <ScreenShell
      eyebrow="pick a game"
      title="Games"
      subtitle="Tap a game card to start playing right away."
    >
      <section className="games-grid" aria-label="Available games">
        {GAME_REGISTRY.map((game) => {
          const isAvailable = game.status === 'available';

          return (
            <button
              key={game.id}
              className={`game-card ${isAvailable ? 'game-card--available' : 'game-card--disabled'}`}
              type="button"
              disabled={!isAvailable}
              onClick={() => {
                if (isAvailable) {
                  onSelectGame(game.id);
                }
              }}
            >
              <span>{isAvailable ? 'Play now' : 'Coming soon'}</span>
              <strong>{game.title}</strong>
              <small>{game.description}</small>
            </button>
          );
        })}
      </section>
      <SessionScoreBar players={players} scores={sessionScores} />
    </ScreenShell>
  );
}
