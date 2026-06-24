export type PlayerId = 1 | 2 | 3 | 4;
export type PlayerCount = 1 | 2 | 3 | 4;
export type AppScreen = 'setup' | 'games' | 'playing' | 'result';
export type GameId = 'find-match' | 'basketball-hoops';
export type ComingSoonGameId = 'race-dash' | 'coin-rush' | 'tank-bounce';

export type Player = {
  id: PlayerId;
  label: string;
  shortLabel: string;
  color: string;
};

export type GameResult = {
  gameId: GameId;
  winners: PlayerId[];
  gameScores: Record<PlayerId, number>;
  soloStats?: {
    moves: number;
    elapsedSeconds: number;
  };
};

export type AppState = {
  screen: AppScreen;
  playerCount?: PlayerCount;
  players: Player[];
  sessionScores: Record<PlayerId, number>;
  selectedGameId?: GameId;
  result?: GameResult;
};

export type AppAction =
  | { type: 'selectPlayerCount'; playerCount: PlayerCount }
  | { type: 'selectGame'; gameId: GameId }
  | { type: 'completeGame'; result: GameResult }
  | { type: 'continueFromResult' }
  | { type: 'exitGame' }
  | { type: 'resetSession' };

export type GameDefinition =
  | {
      id: GameId;
      title: string;
      description: string;
      status: 'available';
    }
  | {
      id: ComingSoonGameId;
      title: string;
      description: string;
      status: 'coming-soon';
    };
