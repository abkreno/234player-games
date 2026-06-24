import { MiniArenaGame } from './game/Game';
import './styles.css';

function getRequiredElement<T extends HTMLElement>(selector: string, elementName: string): T {
  const element = document.querySelector<T>(selector);

  if (!element) {
    throw new Error(`Missing required ${elementName} element: ${selector}`);
  }

  return element;
}

const game = new MiniArenaGame({
  canvas: getRequiredElement<HTMLCanvasElement>('#gameCanvas', 'canvas'),
  overlay: getRequiredElement<HTMLElement>('#overlay', 'overlay'),
  startButton: getRequiredElement<HTMLButtonElement>('#startBtn', 'start button'),
  resetButton: getRequiredElement<HTMLButtonElement>('#resetBtn', 'reset button'),
  playerButtons: document.querySelectorAll<HTMLButtonElement>('[data-player-count]'),
  controlsList: getRequiredElement<HTMLElement>('#controlsList', 'controls list'),
  scoreboard: getRequiredElement<HTMLElement>('#scoreboard', 'scoreboard'),
  roundNumber: getRequiredElement<HTMLElement>('#roundNumber', 'round number'),
});

game.start();
