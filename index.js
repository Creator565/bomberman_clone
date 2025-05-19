const width = 13;
const height = 11;
const game = document.getElementById('game');
const grid = [];
const walls = [];
let playerX = 1;
let playerY = 1;
let bombPlaced = false;
const enemies = [];
const enemyCount = 3;

for (let y = 0; y < height; y++) {
  grid[y] = [];
  for (let x = 0; x < width; x++) {
    const tile = document.createElement('div');
    tile.classList.add('tile');
    if (x === 0 || y === 0 || x === width - 1 || y === height - 1 || (x % 2 === 0 && y % 2 === 0)) {
      tile.classList.add('wall');
      walls.push(`${x},${y}`);
    }
    else if (Math.random() < 0.3 && !(x <= 3 && y <= 3)) {
      tile.classList.add('brick');
    }
    game.appendChild(tile);
    grid[y][x] = tile;
  }
}

while (true) {
  let x = Math.round(Math.random() * (width - 1));
  let y = Math.round(Math.random() * (height - 1));
  if (grid[y][x].classList.contains('brick')) {
    grid[y][x].classList.add('exit');
    break;
  }
}

function spawnEnemies() {
  let placed = 0;
  while (placed < enemyCount) {
    const x = Math.floor(Math.random() * width);
    const y = Math.floor(Math.random() * height);
    const tile = grid[y][x];
    if (!tile.classList.contains('wall') &&
      !tile.classList.contains('brick') &&
      !(x === playerX && y === playerY)) {
        enemies.push({ x, y });
        tile.classList.add('enemy');
        placed++;
      }
    }
}
spawnEnemies();

function drawPlayer() {
  document.querySelectorAll('.player').forEach(el => el.classList.remove('player'));
  grid[playerY][playerX].classList.add('player');
}

function drawEnemies() {
  document.querySelectorAll('.enemy').forEach(el => el.classList.remove('enemy'));
  for (const enemy of enemies) {
    grid[enemy.y][enemy.x].classList.add('enemy');
  }
}

drawPlayer();

function listener(e) {
  const dx = {ArrowLeft: -1, ArrowRight: 1, ArrowUp: 0, ArrowDown: 0}[e.key] ?? 0;
  const dy = {ArrowLeft: 0, ArrowRight: 0, ArrowUp: -1, ArrowDown: 1}[e.key] ?? 0;
  const newX = playerX + dx;
  const newY = playerY + dy;
  if (newX >= 0 && newY >= 0 && newX < width && newY < height) {
    const tile = grid[newY][newX];
    if(tile.classList.contains('exit') && !tile.classList.contains('brick')) {
      if(enemies.length !== 0) {
        const div = document.createElement("div");
        div.id = "telltext"
        div.textContent = "All enemies must be dead to win the game";
        document.getElementById("game").appendChild(div);
      }
      else {
        win();
      }
    }
    if(tile.classList.contains('enemy')) {
      gameOver();
    }
    if (!tile.classList.contains('wall') && !tile.classList.contains('brick') && !tile.classList.contains('bomb')) {
      playerX = newX;
      playerY = newY;
      drawPlayer();
      if (!tile.classList.contains('exit')) {
        document.querySelectorAll('#telltext').forEach(el => el.remove(''));
      }
    }
  }
  if (e.key === ' ') {
    placeBomb();
  }
}

document.addEventListener('keydown', listener);

function placeBomb() {
  if (bombPlaced) return;
  bombPlaced = true;
  let bombX = playerX
  let bombY = playerY
  const tile = grid[playerY][playerX];
  tile.classList.add('bomb');
  setTimeout(() => {
    tile.classList.remove('bomb');
    explode(bombX, bombY);
    bombPlaced = false;
  }, 2000);
}

function explode(x, y) {
  const positions = [
    [x, y],
    [x + 1, y],
    [x - 1, y],
    [x, y + 1],
    [x, y - 1]
  ];
  positions.forEach(([px, py]) => {
    if (px >= 0 && py >= 0 && px < width && py < height) {
      const tile = grid[py][px];
      if (tile.classList.contains('brick')) {
        tile.classList.remove('brick');
      }
      if (tile.classList.contains('player')) {
        gameOver();
      }
      if (!tile.classList.contains('wall')) {
        tile.classList.add('explosion');
        setTimeout(() => tile.classList.remove('explosion'), 400);
      }
      for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        if (enemy.x === px && enemy.y === py) {
          enemies.splice(i, 1);
        }
      }
    }
  });
}

function gameOver() {
    document.removeEventListener('keydown', listener)
    document.querySelectorAll('.player').forEach(el => el.classList.remove('player'));
    const div = document.createElement("div");

    div.id = "losetext"

    div.textContent = "YOU LOSE";

    document.getElementById("game").appendChild(div);
}

function win() {
    document.removeEventListener('keydown', listener)
    document.querySelectorAll('.player').forEach(el => el.classList.remove('player'));
    const div = document.createElement("div");

    div.id = "wintext"

    div.textContent = "YOU WIN";

    document.getElementById("game").appendChild(div);
}

function moveEnemies() {
  for (const enemy of enemies) {
    const directions = [
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 }
    ];
    const dir = directions[Math.floor(Math.random() * directions.length)];
    const newX = enemy.x + dir.dx;
    const newY = enemy.y + dir.dy;

    if (newX >= 0 && newY >= 0 && newX < width && newY < height) {
      const tile = grid[newY][newX];
      if (!tile.classList.contains('wall') && !tile.classList.contains('brick') && !tile.classList.contains('bomb')) {
        enemy.x = newX;
        enemy.y = newY;

        if (enemy.x === playerX && enemy.y === playerY) {
          gameOver();
        }
      }
    }
  }
  drawEnemies();
}

setInterval(moveEnemies, 600);