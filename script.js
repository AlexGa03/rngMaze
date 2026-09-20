const CELL_SIZE = 25;

// Configuraciones por dificultad (filas y columnas impares para la celosía DFS)
const DIFFICULTIES = {
  easy: { cols: 15, rows: 15, time: 45 },
  medium: { cols: 21, rows: 21, time: 75 },
  hard: { cols: 29, rows: 29, time: 120 }
};

function cargarImagen(nombre) {
  const imagen = new Image();
  imagen.src = `resources/${nombre}`;
  return imagen;
}

const jerry_left = cargarImagen("jerry.png");
const jerry_right = cargarImagen("jerry_right.png");
const jerry_up = cargarImagen("jerry_up.png");
const jerry_down = cargarImagen("jerry_down.png");
const cheese = cargarImagen("cheesItem.png");

// Nodos del DOM
const canvas = document.getElementById("marco");
const context = canvas.getContext("2d");
const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("cnv");
const endScreen = document.getElementById("gameOver");
const finDisplay = document.getElementById("meta");
const intentosDisplay = document.getElementById("intentos");
const timeDisplay = document.getElementById("time");
const difficultySelect = document.getElementById("difficultySelect");

// Estado de partida
let currentMaze = [];
let personajeX = 1;
let personajeY = 1;
let meta = { x: 0, y: 0 };
let count = 0;
let isGameOver = false;
let timerId = null;

// Mapeo lineal para la pila DFS
const toIndex = (x, y, cols) => y * cols + x;
const fromIndex = (idx, cols) => ({ x: idx % cols, y: Math.floor(idx / cols) });

const DIRECTIONS = [
  { dx: 0, dy: -2, wallDx: 0, wallDy: -1 },
  { dx: 0, dy: 2, wallDx: 0, wallDy: 1 },
  { dx: -2, dy: 0, wallDx: -1, wallDy: 0 },
  { dx: 2, dy: 0, wallDx: 1, wallDy: 0 }
];

function pintar(x, y, color) {
  context.fillStyle = color;
  context.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}

function createMaze(cols, rows) {
  const maze = Array.from({ length: rows }, () => Array(cols).fill(0));

  context.fillStyle = "black";
  context.fillRect(0, 0, canvas.width, canvas.height);

  const startX = 1;
  const startY = 1;
  maze[startY][startX] = 1;
  pintar(startX, startY, "white");

  const stack = [toIndex(startX, startY, cols)];

  while (stack.length > 0) {
    const { x, y } = fromIndex(stack.at(-1), cols);

    const neighbors = DIRECTIONS.map(dir => ({
      nx: x + dir.dx,
      ny: y + dir.dy,
      wx: x + dir.wallDx,
      wy: y + dir.wallDy
    })).filter(({ nx, ny }) =>
        nx > 0 && nx < cols - 1 &&
        ny > 0 && ny < rows - 1 &&
        maze[ny][nx] === 0
    );

    if (neighbors.length > 0) {
      const choice = neighbors[Math.floor(Math.random() * neighbors.length)];

      maze[choice.wy][choice.wx] = 1;
      pintar(choice.wx, choice.wy, "white");

      maze[choice.ny][choice.nx] = 1;
      pintar(choice.nx, choice.ny, "white");

      stack.push(toIndex(choice.nx, choice.ny, cols));
    } else {
      stack.pop();
    }
  }

  const endX = cols - 2;
  const endY = rows - 2;
  pintar(endX, endY, "lightgreen");
  context.drawImage(cheese, endX * CELL_SIZE, endY * CELL_SIZE, CELL_SIZE, CELL_SIZE);

  return {
    maze,
    start: { x: startX, y: startY },
    end: { x: endX, y: endY }
  };
}

const MOVE_VECTORS = {
  w: { dx: 0, dy: -1, sprite: jerry_up },
  ArrowUp: { dx: 0, dy: -1, sprite: jerry_up },
  s: { dx: 0, dy: 1, sprite: jerry_down },
  ArrowDown: { dx: 0, dy: 1, sprite: jerry_down },
  a: { dx: -1, dy: 0, sprite: jerry_left },
  ArrowLeft: { dx: -1, dy: 0, sprite: jerry_left },
  d: { dx: 1, dy: 0, sprite: jerry_right },
  ArrowRight: { dx: 1, dy: 0, sprite: jerry_right }
};

document.addEventListener("keydown", (e) => {
  if (isGameOver) return;
  const action = MOVE_VECTORS[e.key];
  if (action) {
    e.preventDefault();
    handleMovement(action);
  }
});

function handleMovement({ dx, dy, sprite }) {
  const nextX = personajeX + dx;
  const nextY = personajeY + dy;

  const isOutOfBounds = nextY < 0 || nextY >= currentMaze.length || nextX < 0 || nextX >= currentMaze[0].length;
  if (isOutOfBounds || currentMaze[nextY][nextX] !== 1) {
    return;
  }

  pintar(personajeX, personajeY, "white");

  personajeX = nextX;
  personajeY = nextY;
  intentosDisplay.innerText = `Pasos: ${++count}`;

  context.drawImage(
      sprite,
      personajeX * CELL_SIZE,
      personajeY * CELL_SIZE,
      CELL_SIZE,
      CELL_SIZE
  );

  if (personajeX === meta.x && personajeY === meta.y) {
    finDisplay.innerText = "¡HAS LLEGADO A LA META!";
    pintar(personajeX, personajeY, "yellow");
    gameOver();
  }
}

function timerSet(duration) {
  if (timerId) clearInterval(timerId);

  let remaining = duration;
  const updateDisplay = () => {
    const minutes = String(Math.floor(remaining / 60)).padStart(2, "0");
    const seconds = String(remaining % 60).padStart(2, "0");
    timeDisplay.innerText = `Time: ${minutes}:${seconds}`;
  };

  updateDisplay();

  timerId = setInterval(() => {
    remaining--;
    updateDisplay();

    if (remaining <= 0) {
      clearInterval(timerId);
      finDisplay.innerText = "Game Over";
      gameOver();
    }
  }, 1000);
}

function startGame() {
  if (timerId) clearInterval(timerId);

  const selectedDiff = difficultySelect.value;
  const config = DIFFICULTIES[selectedDiff] || DIFFICULTIES.medium;

  canvas.width = config.cols * CELL_SIZE;
  canvas.height = config.rows * CELL_SIZE;

  startScreen.style.display = "none";
  gameScreen.style.display = "flex";
  endScreen.style.display = "none";

  count = 0;
  isGameOver = false;
  intentosDisplay.innerText = `Pasos: ${count}`;

  const mazeData = createMaze(config.cols, config.rows);
  currentMaze = mazeData.maze;
  personajeX = mazeData.start.x;
  personajeY = mazeData.start.y;
  meta = mazeData.end;

  context.drawImage(
      jerry_down,
      personajeX * CELL_SIZE,
      personajeY * CELL_SIZE,
      CELL_SIZE,
      CELL_SIZE
  );

  timerSet(config.time);
}
function goToMenu() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
  isGameOver = true;

  gameScreen.style.display = "none";
  endScreen.style.display = "none";
  startScreen.style.display = "flex";
}
function gameOver() {
  isGameOver = true;
  if (timerId) clearInterval(timerId);
  startScreen.style.display = "none";
  gameScreen.style.display = "none";
  endScreen.style.display = "flex";
}