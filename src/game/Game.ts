import { CONTROLLED_KEYS, PLAYER_CONFIGS } from '../config/players';
import { clamp, distance, normalize, randomBetween } from './math';
import type { GameElements, GameState, Hazard, Particle, Player, PlayerCount, Star } from './types';

const ARENA_PADDING = 18;
const PLAYER_SIZE = 26;
const PLAYER_ACCELERATION = 720;
const PLAYER_FRICTION = 0.86;
const PLAYER_MAX_SPEED = 260;
const WIN_BONUS = 5;
const STAR_BONUS = 1;
const MAX_FRAME_DELTA = 0.033;

export class MiniArenaGame {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly elements: GameElements;
  private readonly state: GameState = {
    selectedPlayers: 2,
    round: 1,
    status: 'idle',
    players: [],
    hazards: [],
    stars: [],
    particles: [],
    keysDown: new Set<string>(),
    lastFrame: 0,
    hazardTimer: 0,
    starTimer: 0,
    winnerTimer: 0,
  };

  public constructor(elements: GameElements) {
    const context = elements.canvas.getContext('2d');

    if (!context) {
      throw new Error('Canvas 2D rendering context is not available.');
    }

    this.elements = elements;
    this.ctx = context;
  }

  public start(): void {
    this.bindEvents();
    this.resizeCanvas();
    this.updateSetupUi();
    this.resetMatch();
    requestAnimationFrame(this.loop);
  }

  private readonly loop = (timestamp: number): void => {
    if (this.state.lastFrame === 0) {
      this.state.lastFrame = timestamp;
    }

    const dt = Math.min(MAX_FRAME_DELTA, (timestamp - this.state.lastFrame) / 1000);
    this.state.lastFrame = timestamp;

    this.update(dt);
    this.draw();

    if (this.state.status === 'idle') {
      this.drawIdleArena();
    }

    requestAnimationFrame(this.loop);
  };

  private bindEvents(): void {
    this.elements.playerButtons.forEach((button) => {
      button.addEventListener('click', () => {
        if (this.state.status !== 'idle') {
          return;
        }

        this.state.selectedPlayers = Number(button.dataset.playerCount) as PlayerCount;
        this.updateSetupUi();
      });
    });

    this.elements.startButton.addEventListener('click', () => {
      this.state.round = 1;
      this.startRound(false);
    });

    this.elements.resetButton.addEventListener('click', () => this.resetMatch());

    window.addEventListener('keydown', (event) => {
      const key = event.key.toLowerCase();

      if (CONTROLLED_KEYS.includes(key)) {
        event.preventDefault();
        this.state.keysDown.add(key);
      }
    });

    window.addEventListener('keyup', (event) => {
      this.state.keysDown.delete(event.key.toLowerCase());
    });

    window.addEventListener('resize', () => {
      this.resizeCanvas();

      if (this.state.status === 'idle') {
        this.drawIdleArena();
      }
    });
  }

  private resizeCanvas(): void {
    const bounds = this.elements.canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;

    this.elements.canvas.width = Math.floor(bounds.width * ratio);
    this.elements.canvas.height = Math.floor(bounds.height * ratio);
    this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  private arenaWidth(): number {
    return this.elements.canvas.getBoundingClientRect().width;
  }

  private arenaHeight(): number {
    return this.elements.canvas.getBoundingClientRect().height;
  }

  private createPlayers(): Player[] {
    const width = this.arenaWidth();
    const height = this.arenaHeight();
    const spawns = [
      { x: width * 0.18, y: height * 0.18 },
      { x: width * 0.82, y: height * 0.82 },
      { x: width * 0.82, y: height * 0.18 },
      { x: width * 0.18, y: height * 0.82 },
    ];

    return PLAYER_CONFIGS.slice(0, this.state.selectedPlayers).map((config, index) => ({
      ...config,
      ...spawns[index],
      velocity: { x: 0, y: 0 },
      size: PLAYER_SIZE,
      score: this.state.players[index]?.score ?? 0,
      alive: true,
      safeTime: 1.5,
    }));
  }

  private createHazard(): void {
    const edge = Math.floor(Math.random() * 4);
    const width = this.arenaWidth();
    const height = this.arenaHeight();
    const speed = randomBetween(90, 160) + this.state.round * 5;
    const radius = randomBetween(13, 24);
    let hazard: Hazard;

    if (edge === 0) {
      hazard = {
        x: randomBetween(0, width),
        y: -radius,
        velocity: { x: randomBetween(-30, 30), y: speed },
        radius,
        spin: randomBetween(-4, 4),
      };
    } else if (edge === 1) {
      hazard = {
        x: width + radius,
        y: randomBetween(0, height),
        velocity: { x: -speed, y: randomBetween(-30, 30) },
        radius,
        spin: randomBetween(-4, 4),
      };
    } else if (edge === 2) {
      hazard = {
        x: randomBetween(0, width),
        y: height + radius,
        velocity: { x: randomBetween(-30, 30), y: -speed },
        radius,
        spin: randomBetween(-4, 4),
      };
    } else {
      hazard = {
        x: -radius,
        y: randomBetween(0, height),
        velocity: { x: speed, y: randomBetween(-30, 30) },
        radius,
        spin: randomBetween(-4, 4),
      };
    }

    this.state.hazards.push(hazard);
  }

  private createStar(): void {
    const width = this.arenaWidth();
    const height = this.arenaHeight();

    this.state.stars.push({
      x: randomBetween(50, width - 50),
      y: randomBetween(50, height - 50),
      radius: 13,
      pulse: 0,
    });
  }

  private createParticles(x: number, y: number, color: string, count = 14): void {
    const particles: Particle[] = Array.from({ length: count }, () => ({
      x,
      y,
      color,
      velocity: { x: randomBetween(-130, 130), y: randomBetween(-130, 130) },
      life: randomBetween(0.35, 0.8),
      maxLife: 0.8,
      size: randomBetween(3, 7),
    }));

    this.state.particles.push(...particles);
  }

  private updateSetupUi(): void {
    this.elements.playerButtons.forEach((button) => {
      button.classList.toggle(
        'active',
        Number(button.dataset.playerCount) === this.state.selectedPlayers,
      );
    });

    this.renderControls();
    this.renderScoreboard();
  }

  private renderControls(): void {
    this.elements.controlsList.innerHTML = PLAYER_CONFIGS.slice(0, this.state.selectedPlayers)
      .map(
        (player) => `
          <div class="player-card" style="color: ${player.color}">
            <strong><span class="color-dot"></span>${player.name}</strong>
            <div class="keys" aria-label="${player.name} keys">
              <span class="key up">${player.keyLabels[0]}</span>
              <span class="key left">${player.keyLabels[1]}</span>
              <span class="key down">${player.keyLabels[2]}</span>
              <span class="key right">${player.keyLabels[3]}</span>
            </div>
          </div>
        `,
      )
      .join('');
  }

  private renderScoreboard(): void {
    this.elements.scoreboard.innerHTML = PLAYER_CONFIGS.slice(0, this.state.selectedPlayers)
      .map((player, index) => {
        const livePlayer = this.state.players[index];
        const score = livePlayer?.score ?? 0;
        const status = livePlayer ? (livePlayer.alive ? 'In game' : 'Out') : 'Ready';

        return `
          <div class="player-card score-row" style="color: ${player.color}">
            <div>
              <strong><span class="color-dot"></span>${player.name}</strong>
              <small>${status}</small>
            </div>
            <span class="badge">${score}</span>
          </div>
        `;
      })
      .join('');

    this.elements.roundNumber.textContent = String(this.state.round);
  }

  private resetMatch(): void {
    this.state.round = 1;
    this.state.status = 'idle';
    this.state.players = [];
    this.state.hazards = [];
    this.state.stars = [];
    this.state.particles = [];
    this.state.keysDown.clear();
    this.state.winnerTimer = 0;
    this.elements.overlay.classList.remove('hidden');
    this.elements.overlay.innerHTML =
      '<div><h2>Ready?</h2><p>Select player count, then press Start Game.</p></div>';
    this.renderScoreboard();
    this.drawIdleArena();
  }

  private startRound(keepScores: boolean): void {
    this.state.status = 'playing';
    this.state.hazards = [];
    this.state.stars = [];
    this.state.particles = [];
    this.state.hazardTimer = 0.4;
    this.state.starTimer = 0.3;
    this.state.winnerTimer = 0;
    this.state.players = keepScores
      ? this.createPlayers()
      : this.createPlayers().map((player) => ({ ...player, score: 0 }));
    this.elements.overlay.classList.add('hidden');
    this.renderScoreboard();
  }

  private endRound(winner?: Player): void {
    this.state.status = 'round-over';
    this.state.winnerTimer = 2.2;

    if (winner) {
      winner.score += WIN_BONUS;
      this.createParticles(winner.x, winner.y, winner.color, 28);
      this.elements.overlay.innerHTML = `<div><h2>${winner.name} wins!</h2><p>Next round starts automatically.</p></div>`;
    } else {
      this.elements.overlay.innerHTML =
        '<div><h2>Draw!</h2><p>Next round starts automatically.</p></div>';
    }

    this.elements.overlay.classList.remove('hidden');
    this.renderScoreboard();
  }

  private update(dt: number): void {
    this.updateParticles(dt);

    if (this.state.status === 'playing') {
      this.updatePlayers(dt);
      this.updateHazards(dt);
      this.updateStars(dt);
      this.checkRoundEnd();
      this.renderScoreboard();
    }

    if (this.state.status === 'round-over') {
      this.state.winnerTimer -= dt;

      if (this.state.winnerTimer <= 0) {
        this.state.round += 1;
        this.startRound(true);
      }
    }
  }

  private updatePlayers(dt: number): void {
    const width = this.arenaWidth();
    const height = this.arenaHeight();

    this.state.players.forEach((player) => {
      if (!player.alive) {
        return;
      }

      if (this.state.keysDown.has(player.keys.up)) {
        player.velocity.y -= PLAYER_ACCELERATION * dt;
      }

      if (this.state.keysDown.has(player.keys.down)) {
        player.velocity.y += PLAYER_ACCELERATION * dt;
      }

      if (this.state.keysDown.has(player.keys.left)) {
        player.velocity.x -= PLAYER_ACCELERATION * dt;
      }

      if (this.state.keysDown.has(player.keys.right)) {
        player.velocity.x += PLAYER_ACCELERATION * dt;
      }

      player.velocity.x *= PLAYER_FRICTION;
      player.velocity.y *= PLAYER_FRICTION;
      player.velocity = normalize(player.velocity, PLAYER_MAX_SPEED);
      player.x += player.velocity.x * dt;
      player.y += player.velocity.y * dt;

      const half = player.size / 2;

      if (player.x < half || player.x > width - half || player.y < half || player.y > height - half) {
        player.alive = false;
        this.createParticles(player.x, player.y, player.color);
        return;
      }

      player.x = clamp(player.x, half, width - half);
      player.y = clamp(player.y, half, height - half);
      player.safeTime = Math.max(0, player.safeTime - dt);
    });
  }

  private updateHazards(dt: number): void {
    this.state.hazardTimer -= dt;

    if (this.state.hazardTimer <= 0) {
      this.createHazard();
      this.state.hazardTimer = Math.max(
        0.28,
        1.05 - this.state.round * 0.07 - this.state.selectedPlayers * 0.03,
      );
    }

    const width = this.arenaWidth();
    const height = this.arenaHeight();
    this.state.hazards = this.state.hazards.filter((hazard) => {
      hazard.x += hazard.velocity.x * dt;
      hazard.y += hazard.velocity.y * dt;

      return hazard.x > -80 && hazard.x < width + 80 && hazard.y > -80 && hazard.y < height + 80;
    });

    this.state.players.forEach((player) => {
      if (!player.alive || player.safeTime > 0) {
        return;
      }

      const hit = this.state.hazards.some(
        (hazard) => distance(player, hazard) < player.size / 2 + hazard.radius - 3,
      );

      if (hit) {
        player.alive = false;
        this.createParticles(player.x, player.y, player.color);
      }
    });
  }

  private updateStars(dt: number): void {
    this.state.starTimer -= dt;

    if (this.state.starTimer <= 0 && this.state.stars.length < 4) {
      this.createStar();
      this.state.starTimer = randomBetween(1.2, 2.2);
    }

    this.state.stars.forEach((star) => {
      star.pulse += dt * 5;
    });

    this.state.players.forEach((player) => {
      if (!player.alive) {
        return;
      }

      this.state.stars = this.state.stars.filter((star) => {
        if (distance(player, star) < player.size / 2 + star.radius) {
          player.score += STAR_BONUS;
          this.createParticles(star.x, star.y, '#fbbf24', 10);
          return false;
        }

        return true;
      });
    });
  }

  private updateParticles(dt: number): void {
    this.state.particles = this.state.particles.filter((particle) => {
      particle.x += particle.velocity.x * dt;
      particle.y += particle.velocity.y * dt;
      particle.velocity.x *= 0.96;
      particle.velocity.y *= 0.96;
      particle.life -= dt;

      return particle.life > 0;
    });
  }

  private checkRoundEnd(): void {
    const alive = this.state.players.filter((player) => player.alive);

    if (alive.length <= 1 && this.state.status === 'playing') {
      this.endRound(alive[0]);
    }
  }

  private draw(): void {
    const width = this.arenaWidth();
    const height = this.arenaHeight();
    this.ctx.clearRect(0, 0, width, height);

    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(ARENA_PADDING, ARENA_PADDING, width - 36, height - 36);
    this.ctx.restore();

    this.state.stars.forEach((star) => this.drawStar(star));
    this.state.hazards.forEach((hazard) => this.drawHazard(hazard));
    this.state.players.forEach((player) => this.drawPlayer(player));
    this.state.particles.forEach((particle) => this.drawParticle(particle));
  }

  private drawStar(star: Star): void {
    this.ctx.save();
    this.ctx.translate(star.x, star.y);
    this.ctx.beginPath();

    for (let index = 0; index < 10; index += 1) {
      const angle = -Math.PI / 2 + (index * Math.PI) / 5;
      const radius = index % 2 === 0 ? star.radius + Math.sin(star.pulse) * 2 : star.radius * 0.45;
      this.ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    }

    this.ctx.closePath();
    this.ctx.fillStyle = '#fbbf24';
    this.ctx.fill();
    this.ctx.restore();
  }

  private drawHazard(hazard: Hazard): void {
    this.ctx.save();
    this.ctx.translate(hazard.x, hazard.y);
    this.ctx.rotate((performance.now() / 500) * hazard.spin);
    this.ctx.fillStyle = '#fb7185';
    this.ctx.beginPath();
    this.ctx.arc(0, 0, hazard.radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(-hazard.radius * 0.5, -hazard.radius * 0.5);
    this.ctx.lineTo(hazard.radius * 0.5, hazard.radius * 0.5);
    this.ctx.moveTo(hazard.radius * 0.5, -hazard.radius * 0.5);
    this.ctx.lineTo(-hazard.radius * 0.5, hazard.radius * 0.5);
    this.ctx.stroke();
    this.ctx.restore();
  }

  private drawPlayer(player: Player): void {
    if (!player.alive) {
      return;
    }

    this.ctx.save();
    this.ctx.translate(player.x, player.y);
    this.ctx.fillStyle = player.color;
    this.ctx.shadowColor = player.color;
    this.ctx.shadowBlur = 22;
    const half = player.size / 2;
    this.drawRoundedRect(-half, -half, player.size, player.size, 7);
    this.ctx.fill();
    this.ctx.shadowBlur = 0;
    this.ctx.fillStyle = 'rgba(4, 8, 20, 0.78)';
    this.ctx.font = '800 12px Inter, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(String(player.id), 0, 1);

    if (player.safeTime > 0) {
      this.ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, player.size, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  private drawParticle(particle: Particle): void {
    this.ctx.save();
    this.ctx.globalAlpha = clamp(particle.life / particle.maxLife, 0, 1);
    this.ctx.fillStyle = particle.color;
    this.ctx.beginPath();
    this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  private drawRoundedRect(x: number, y: number, width: number, height: number, radius: number): void {
    const r = Math.min(radius, width / 2, height / 2);

    this.ctx.beginPath();
    this.ctx.moveTo(x + r, y);
    this.ctx.arcTo(x + width, y, x + width, y + height, r);
    this.ctx.arcTo(x + width, y + height, x, y + height, r);
    this.ctx.arcTo(x, y + height, x, y, r);
    this.ctx.arcTo(x, y, x + width, y, r);
    this.ctx.closePath();
  }

  private drawIdleArena(): void {
    this.draw();
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(255,255,255,0.12)';
    this.ctx.font = '800 28px Inter, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('2 • 3 • 4 Player Mini Arena', this.arenaWidth() / 2, this.arenaHeight() / 2);
    this.ctx.restore();
  }
}
