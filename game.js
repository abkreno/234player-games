const canvas = document.querySelector('#gameCanvas');
const ctx = canvas.getContext('2d');
const overlay = document.querySelector('#overlay');
const startBtn = document.querySelector('#startBtn');
const resetBtn = document.querySelector('#resetBtn');
const playerButtons = document.querySelectorAll('[data-player-count]');
const controlsList = document.querySelector('#controlsList');
const scoreboard = document.querySelector('#scoreboard');
const roundNumber = document.querySelector('#roundNumber');

const PLAYER_CONFIG = [
  {
    name: 'Player 1',
    color: '#22d3ee',
    keys: { up: 'w', down: 's', left: 'a', right: 'd' },
    keyLabels: ['W', 'A', 'S', 'D'],
  },
  {
    name: 'Player 2',
    color: '#f97316',
    keys: { up: 'arrowup', down: 'arrowdown', left: 'arrowleft', right: 'arrowright' },
    keyLabels: ['↑', '←', '↓', '→'],
  },
  {
    name: 'Player 3',
    color: '#a78bfa',
    keys: { up: 'i', down: 'k', left: 'j', right: 'l' },
    keyLabels: ['I', 'J', 'K', 'L'],
  },
  {
    name: 'Player 4',
    color: '#34d399',
    keys: { up: 't', down: 'g', left: 'f', right: 'h' },
    keyLabels: ['T', 'F', 'G', 'H'],
  },
];

const state = {
  selectedPlayers: 2,
  round: 1,
  status: 'idle',
  players: [],
  hazards: [],
  stars: [],
  particles: [],
  keysDown: new Set(),
  lastFrame: 0,
  hazardTimer: 0,
  starTimer: 0,
  winnerTimer: 0,
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function resizeCanvas() {
  const bounds = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.floor(bounds.width * ratio);
  canvas.height = Math.floor(bounds.height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function arenaWidth() {
  return canvas.getBoundingClientRect().width;
}

function arenaHeight() {
  return canvas.getBoundingClientRect().height;
}

function createPlayers() {
  const width = arenaWidth();
  const height = arenaHeight();
  const spawns = [
    { x: width * 0.18, y: height * 0.18 },
    { x: width * 0.82, y: height * 0.82 },
    { x: width * 0.82, y: height * 0.18 },
    { x: width * 0.18, y: height * 0.82 },
  ];

  return PLAYER_CONFIG.slice(0, state.selectedPlayers).map((config, index) => ({
    ...config,
    ...spawns[index],
    vx: 0,
    vy: 0,
    size: 26,
    score: state.players[index]?.score || 0,
    alive: true,
    safeTime: 1.5,
  }));
}

function createHazard() {
  const edge = Math.floor(Math.random() * 4);
  const width = arenaWidth();
  const height = arenaHeight();
  const speed = randomBetween(90, 160) + state.round * 5;
  const radius = randomBetween(13, 24);
  let x;
  let y;
  let vx;
  let vy;

  if (edge === 0) {
    x = randomBetween(0, width);
    y = -radius;
    vx = randomBetween(-30, 30);
    vy = speed;
  } else if (edge === 1) {
    x = width + radius;
    y = randomBetween(0, height);
    vx = -speed;
    vy = randomBetween(-30, 30);
  } else if (edge === 2) {
    x = randomBetween(0, width);
    y = height + radius;
    vx = randomBetween(-30, 30);
    vy = -speed;
  } else {
    x = -radius;
    y = randomBetween(0, height);
    vx = speed;
    vy = randomBetween(-30, 30);
  }

  state.hazards.push({ x, y, vx, vy, radius, spin: randomBetween(-4, 4) });
}

function createStar() {
  state.stars.push({
    x: randomBetween(50, arenaWidth() - 50),
    y: randomBetween(50, arenaHeight() - 50),
    radius: 13,
    pulse: 0,
  });
}

function createParticles(x, y, color, count = 14) {
  for (let i = 0; i < count; i += 1) {
    state.particles.push({
      x,
      y,
      color,
      vx: randomBetween(-130, 130),
      vy: randomBetween(-130, 130),
      life: randomBetween(0.35, 0.8),
      maxLife: 0.8,
      size: randomBetween(3, 7),
    });
  }
}

function updateSetupUi() {
  playerButtons.forEach((button) => {
    button.classList.toggle('active', Number(button.dataset.playerCount) === state.selectedPlayers);
  });
  renderControls();
  renderScoreboard();
}

function renderControls() {
  controlsList.innerHTML = PLAYER_CONFIG.slice(0, state.selectedPlayers)
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

function renderScoreboard() {
  scoreboard.innerHTML = PLAYER_CONFIG.slice(0, state.selectedPlayers)
    .map((player, index) => {
      const livePlayer = state.players[index];
      const score = livePlayer?.score || 0;
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
  roundNumber.textContent = state.round;
}

function resetMatch() {
  state.round = 1;
  state.status = 'idle';
  state.players = [];
  state.hazards = [];
  state.stars = [];
  state.particles = [];
  state.keysDown.clear();
  state.winnerTimer = 0;
  overlay.classList.remove('hidden');
  overlay.innerHTML = '<div><h2>Ready?</h2><p>Select player count, then press Start Game.</p></div>';
  renderScoreboard();
  drawIdleArena();
}

function startRound(keepScores = false) {
  state.status = 'playing';
  state.hazards = [];
  state.stars = [];
  state.particles = [];
  state.hazardTimer = 0.4;
  state.starTimer = 0.3;
  state.winnerTimer = 0;
  state.players = keepScores ? createPlayers() : createPlayers().map((player) => ({ ...player, score: 0 }));
  overlay.classList.add('hidden');
  renderScoreboard();
}

function endRound(winner) {
  state.status = 'round-over';
  state.winnerTimer = 2.2;
  if (winner) {
    winner.score += 5;
    createParticles(winner.x, winner.y, winner.color, 28);
    overlay.innerHTML = `<div><h2>${winner.name} wins!</h2><p>Next round starts automatically.</p></div>`;
  } else {
    overlay.innerHTML = '<div><h2>Draw!</h2><p>Next round starts automatically.</p></div>';
  }
  overlay.classList.remove('hidden');
  renderScoreboard();
}

function updatePlayers(dt) {
  const acceleration = 720;
  const friction = 0.86;
  const maxSpeed = 260;
  const width = arenaWidth();
  const height = arenaHeight();

  state.players.forEach((player) => {
    if (!player.alive) return;

    if (state.keysDown.has(player.keys.up)) player.vy -= acceleration * dt;
    if (state.keysDown.has(player.keys.down)) player.vy += acceleration * dt;
    if (state.keysDown.has(player.keys.left)) player.vx -= acceleration * dt;
    if (state.keysDown.has(player.keys.right)) player.vx += acceleration * dt;

    player.vx *= friction;
    player.vy *= friction;

    const speed = Math.hypot(player.vx, player.vy);
    if (speed > maxSpeed) {
      player.vx = (player.vx / speed) * maxSpeed;
      player.vy = (player.vy / speed) * maxSpeed;
    }

    player.x += player.vx * dt;
    player.y += player.vy * dt;

    const half = player.size / 2;
    if (player.x < half || player.x > width - half || player.y < half || player.y > height - half) {
      player.alive = false;
      createParticles(player.x, player.y, player.color);
      return;
    }

    player.x = clamp(player.x, half, width - half);
    player.y = clamp(player.y, half, height - half);
    player.safeTime = Math.max(0, player.safeTime - dt);
  });
}

function updateHazards(dt) {
  state.hazardTimer -= dt;
  if (state.hazardTimer <= 0) {
    createHazard();
    state.hazardTimer = Math.max(0.28, 1.05 - state.round * 0.07 - state.selectedPlayers * 0.03);
  }

  const width = arenaWidth();
  const height = arenaHeight();
  state.hazards = state.hazards.filter((hazard) => {
    hazard.x += hazard.vx * dt;
    hazard.y += hazard.vy * dt;
    return hazard.x > -80 && hazard.x < width + 80 && hazard.y > -80 && hazard.y < height + 80;
  });

  state.players.forEach((player) => {
    if (!player.alive || player.safeTime > 0) return;
    const hit = state.hazards.some((hazard) => distance(player, hazard) < player.size / 2 + hazard.radius - 3);
    if (hit) {
      player.alive = false;
      createParticles(player.x, player.y, player.color);
    }
  });
}

function updateStars(dt) {
  state.starTimer -= dt;
  if (state.starTimer <= 0 && state.stars.length < 4) {
    createStar();
    state.starTimer = randomBetween(1.2, 2.2);
  }

  state.stars.forEach((star) => {
    star.pulse += dt * 5;
  });

  state.players.forEach((player) => {
    if (!player.alive) return;
    state.stars = state.stars.filter((star) => {
      if (distance(player, star) < player.size / 2 + star.radius) {
        player.score += 1;
        createParticles(star.x, star.y, '#fbbf24', 10);
        return false;
      }
      return true;
    });
  });
}

function updateParticles(dt) {
  state.particles = state.particles.filter((particle) => {
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vx *= 0.96;
    particle.vy *= 0.96;
    particle.life -= dt;
    return particle.life > 0;
  });
}

function checkRoundEnd() {
  const alive = state.players.filter((player) => player.alive);
  if (alive.length <= 1 && state.status === 'playing') {
    endRound(alive[0]);
  }
}

function update(dt) {
  updateParticles(dt);

  if (state.status === 'playing') {
    updatePlayers(dt);
    updateHazards(dt);
    updateStars(dt);
    checkRoundEnd();
    renderScoreboard();
  }

  if (state.status === 'round-over') {
    state.winnerTimer -= dt;
    if (state.winnerTimer <= 0) {
      state.round += 1;
      startRound(true);
    }
  }
}

function drawStar(x, y, radius, fill) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const pointRadius = i % 2 === 0 ? radius : radius * 0.45;
    ctx.lineTo(Math.cos(angle) * pointRadius, Math.sin(angle) * pointRadius);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.restore();
}

function draw() {
  const width = arenaWidth();
  const height = arenaHeight();
  ctx.clearRect(0, 0, width, height);

  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 3;
  ctx.strokeRect(18, 18, width - 36, height - 36);
  ctx.restore();

  state.stars.forEach((star) => {
    drawStar(star.x, star.y, star.radius + Math.sin(star.pulse) * 2, '#fbbf24');
  });

  state.hazards.forEach((hazard) => {
    ctx.save();
    ctx.translate(hazard.x, hazard.y);
    ctx.rotate(performance.now() / 500 * hazard.spin);
    ctx.fillStyle = '#fb7185';
    ctx.beginPath();
    ctx.arc(0, 0, hazard.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-hazard.radius * 0.5, -hazard.radius * 0.5);
    ctx.lineTo(hazard.radius * 0.5, hazard.radius * 0.5);
    ctx.moveTo(hazard.radius * 0.5, -hazard.radius * 0.5);
    ctx.lineTo(-hazard.radius * 0.5, hazard.radius * 0.5);
    ctx.stroke();
    ctx.restore();
  });

  state.players.forEach((player) => {
    if (!player.alive) return;
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.fillStyle = player.color;
    ctx.shadowColor = player.color;
    ctx.shadowBlur = 22;
    const half = player.size / 2;
    ctx.beginPath();
    ctx.roundRect(-half, -half, player.size, player.size, 7);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(4, 8, 20, 0.78)';
    ctx.font = '800 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(PLAYER_CONFIG.indexOf(player) + 1 || state.players.indexOf(player) + 1), 0, 1);

    if (player.safeTime > 0) {
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, player.size, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  });

  state.particles.forEach((particle) => {
    ctx.save();
    ctx.globalAlpha = clamp(particle.life / particle.maxLife, 0, 1);
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function drawIdleArena() {
  draw();
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.font = '800 28px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('2 • 3 • 4 Player Mini Arena', arenaWidth() / 2, arenaHeight() / 2);
  ctx.restore();
}

function loop(timestamp) {
  if (!state.lastFrame) state.lastFrame = timestamp;
  const dt = Math.min(0.033, (timestamp - state.lastFrame) / 1000);
  state.lastFrame = timestamp;
  update(dt);
  draw();
  if (state.status === 'idle') drawIdleArena();
  requestAnimationFrame(loop);
}

playerButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (state.status === 'playing' || state.status === 'round-over') return;
    state.selectedPlayers = Number(button.dataset.playerCount);
    updateSetupUi();
  });
});

startBtn.addEventListener('click', () => {
  state.round = 1;
  startRound(false);
});

resetBtn.addEventListener('click', resetMatch);

window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  const controlledKeys = PLAYER_CONFIG.flatMap((player) => Object.values(player.keys));
  if (controlledKeys.includes(key)) {
    event.preventDefault();
    state.keysDown.add(key);
  }
});

window.addEventListener('keyup', (event) => {
  state.keysDown.delete(event.key.toLowerCase());
});

window.addEventListener('resize', () => {
  resizeCanvas();
  if (state.status === 'idle') drawIdleArena();
});

if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function roundRect(x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    this.moveTo(x + r, y);
    this.arcTo(x + width, y, x + width, y + height, r);
    this.arcTo(x + width, y + height, x, y + height, r);
    this.arcTo(x, y + height, x, y, r);
    this.arcTo(x, y, x + width, y, r);
    return this;
  };
}

resizeCanvas();
updateSetupUi();
resetMatch();
requestAnimationFrame(loop);
