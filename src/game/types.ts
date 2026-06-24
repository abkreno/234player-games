export type Direction = 'up' | 'down' | 'left' | 'right';

export type PlayerCount = 2 | 3 | 4;

export type GameStatus = 'idle' | 'playing' | 'round-over';

export type Vector = {
  x: number;
  y: number;
};

export type PlayerConfig = {
  id: number;
  name: string;
  color: string;
  keys: Record<Direction, string>;
  keyLabels: readonly [string, string, string, string];
};

export type Player = PlayerConfig &
  Vector & {
    velocity: Vector;
    size: number;
    score: number;
    alive: boolean;
    safeTime: number;
  };

export type Hazard = Vector & {
  velocity: Vector;
  radius: number;
  spin: number;
};

export type Star = Vector & {
  radius: number;
  pulse: number;
};

export type Particle = Vector & {
  velocity: Vector;
  color: string;
  life: number;
  maxLife: number;
  size: number;
};

export type GameState = {
  selectedPlayers: PlayerCount;
  round: number;
  status: GameStatus;
  players: Player[];
  hazards: Hazard[];
  stars: Star[];
  particles: Particle[];
  keysDown: Set<string>;
  lastFrame: number;
  hazardTimer: number;
  starTimer: number;
  winnerTimer: number;
};

export type GameElements = {
  canvas: HTMLCanvasElement;
  overlay: HTMLElement;
  startButton: HTMLButtonElement;
  resetButton: HTMLButtonElement;
  playerButtons: NodeListOf<HTMLButtonElement>;
  controlsList: HTMLElement;
  scoreboard: HTMLElement;
  roundNumber: HTMLElement;
};
