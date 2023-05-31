//ESTILO DEL PERSONAJE
function cargarImagen(nombre) {
  const imagen = new Image();
  imagen.src = "resources/" + nombre;
  return imagen;
}

// Asignación de imágenes
const jerry_left = cargarImagen("jerry.png");
const jerry_right = cargarImagen("jerry_right.png");
const jerry_up = cargarImagen("jerry_up.png");
const jerry_down = cargarImagen("jerry_down.png");
const cheese = cargarImagen("cheesItem.png");
console.log(cheese);
//META
let meta;
let fin = document.getElementById("meta");
//CUENTA INTENTOS
let count = 0;
let intentos = document.getElementById("intentos");
let over;
//MARCO PRINCIPAL
let canvas = document.getElementById("marco");
let context = canvas.getContext("2d");
let visiteds = [];
let NoBlockeds = [];
let borders = [];
let voids = [];
let walls = [];
let personajeX;
let personajeY;
let space;
function createMaze() {
  //Se asigna el tamaño del laberinto
  const element = document.getElementById("marco");
  const rect = element.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  space = 2*height+2*width;
  for (let i = 1; i <= height / 25; i++) {
    for (let j = 1; j <= width / 25; j++) {
      let name = "ct";
      if (i < 10) {
        name = name + "0" + i;
      } else {
        name = name + i;
      }
      if (j < 10) {
        name = name + "0" + j;
      } else {
        name = name + j;
      }
      if (j < 3 || width / 25 - j <= 1 || i < 3 || height / 25 - i <= 1) {
        borders.push(name);
      } else if (i % 2 == 0 || (i % 2 != 0 && j % 2 == 0)) {
        walls.push(name);
      } else {
        voids.push(name);
      }
    }
  }
  //Se guardan las esquinas
  let corners = [];
  corners[0] = voids[0];
  let indexCor1 = Math.floor((width / 25 - 2) / 2);
  while (voids[indexCor1].charAt(3) !== "3") {
    indexCor1 = indexCor1 - 1;
  }
  corners[1] = voids[indexCor1];
  let c2y = parseInt(voids.at(-1).charAt(2) + voids.at(-1).charAt(3));
  if (c2y < 10) {
    c2y = "0" + c2y;
  }
  corners[2] = "ct" + c2y + "03";
  corners[3] = voids.at(-1);
  console.log("ESQUINAS: " + corners);

  // Pintar elementos
  context.fillStyle = "lightblue";
  context.fillRect(0, 0, width, height);
  context.strokeRect(0, 0, width, height);

  // Bordes
  for (const border of borders) {
    pintar(border, "black", 25);
  }
  for (const wall of walls) {
    pintar(wall, "black", 25);
  }

  //Generar laberinto
  //Escoger posición/casilla inicial de manera random
  // let rngStart = Math.round(Math.random() * (voids.length - 1));
  //Extraemos del array paredes la posición inicial y lo metemos en el array visitiados
  visiteds[0] = voids[0];
  voids.splice(0, 1);
  pintar(visiteds[0], "white", 25);

  let actual = visiteds.at(0);

  //INICIO BUCLE(buscar caminos hasta que todos los puntos esten conectados)
  while (voids.length > 0) {
    //-------------------------Selecionar vecinos--------------------------------------------------------------
    let xV = parseInt(actual.slice(4, 6));
    let yV = parseInt(actual.slice(2, 4));
    let leftPos = xV - 2;
    let rightPos = xV + 2;
    let upPos = yV - 2;
    let downPos = yV + 2;

    [xV, yV, leftPos, rightPos, upPos, downPos] = [
      xV,
      yV,
      leftPos,
      rightPos,
      upPos,
      downPos,
    ].map((value) => value.toString().padStart(2, "0"));

    // Todos los vecinos de la posición actual
    let left = "ct" + yV + leftPos;
    let right = "ct" + yV + rightPos;
    let up = "ct" + upPos + xV;
    let down = "ct" + downPos + xV;

    let Vecinas = [left, right, up, down];
    let WrongVecinas = [];
    
    // Buscar vecinos que no se pueden visitar
    WrongVecinas = Vecinas.filter(neighbor => borders.includes(neighbor));
    WrongVecinas = WrongVecinas.concat(Vecinas.filter(neighbor => visiteds.includes(neighbor)));
    
    Vecinas = Vecinas.filter(neighbor => !WrongVecinas.includes(neighbor));
    
    //La casilla no esta bloqueda
    if (Vecinas.length >= 1) {
      NoBlockeds.push(actual);
      //Vecino al azar
      let rngContinue = Math.round(Math.random() * (Vecinas.length - 1));
      visiteds.push(Vecinas[rngContinue]);
      //cambiamos las variables(el anterior será el actual y el actual el vecino selecionado)
      let previous = actual;
      actual = visiteds.at(-1);
      voids.forEach(function (voidN, key) {
        if (voidN == Vecinas[rngContinue]) {
          voids.splice(key, 1);
        }
      });
      pintar(actual, "white", 25);
      //Reconocer la dirección elegida---------------------------------------
      //Actual coords
      let xL = parseInt(actual.charAt(4) + actual.charAt(5));
      let yL = parseInt(actual.charAt(2) + actual.charAt(3));
      //Previous coords
      let xP = parseInt(previous.charAt(4) + previous.charAt(5));
      let yP = parseInt(previous.charAt(2) + previous.charAt(3));
      //Diferencia entre coordenadas para saber hacia donde se ha movido
      let x_ = xL - xP;
      let y_ = yL - yP;

      let movimiento = "blocked";
      let yW;
      let xW;
      if (x_ == 2) {
        movimiento = "right";
      } else if (x_ == -2) {
        movimiento = "left";
      } else if (y_ == 2) {
        movimiento = "down";
      } else if (y_ == -2) {
        movimiento = "up";
      }
      //Pintar la casilla de WALLS INTERMEDIA Y ELIMINARLA DE WALLS
      context.fillStyle = "white";
      if (movimiento == "left") {
        xW = xP - 1;
        yW = yP;
        context.fillRect((xP - 2) * 25, (yP - 1) * 25, 25, 25);
      } else if (movimiento == "right") {
        xW = xL - 1;
        yW = yP;
        context.fillRect((xL - 2) * 25, (yP - 1) * 25, 25, 25);
      } else if (movimiento == "up") {
        xW = xP;
        yW = yP - 1;
        context.fillRect((xP - 1) * 25, (yP - 2) * 25, 25, 25);
      } else if (movimiento == "down") {
        xW = xP;
        yW = yL - 1;
        context.fillRect((xP - 1) * 25, (yL - 2) * 25, 25, 25);
      }
      let wallName = "ct";
      if (yW < 10) {
        wallName = wallName + "0" + yW;
      } else {
        wallName = wallName + yW;
      }
      if (xW < 10) {
        wallName = wallName + "0" + xW;
      } else {
        wallName = wallName + xW;
      }

      walls.forEach(function (wall, key) {
        if (wall == wallName) {
          walls.splice(key, 1);
        }
      });
      //La casilla está bloqueada por lo tanto nos disponemos a buscar en las no bloqueadas
    } else {
      actual = buscarNoBlockeds();
    }
  }

  // let rngOut = Math.round(Math.random() * (corners.length - 1));
  meta = corners.at(-1);
  //Pintamos la meta
  pintar(meta, "lighgreen", 25);
  let mx = parseInt(meta.charAt(4) + meta.charAt(5));
  let my = parseInt(meta.charAt(2) + meta.charAt(3));
  context.drawImage(cheese, (mx - 1) * 25, (my - 1) * 25, 25, 25);
}
//Funcion para pintar un cuadrado dado un elemento del tipo "ct+x+y"
function pintar(square, color, size) {
  let x = parseInt(square.charAt(4) + square.charAt(5));
  let y = parseInt(square.charAt(2) + square.charAt(3));
  let MazePositionX = 25 * (x - 1);
  let MazePositionY = 25 * (y - 1);
  context.fillStyle = color;
  context.fillRect(MazePositionX, MazePositionY, size, size);
  //context.strokeRect(MazePositionX, MazePositionY, size, size);
}
//Buscamos los no bloqueados y cambiamos el actual al ultimo no bloqueado
function buscarNoBlockeds() {
  actualizarNoBlockeds();
  return NoBlockeds.pop();
}

//Comprobamos cada elemento del array no bloqueados para ver si los movimientos posteriores
//a su inserción en el array, han hecho que la casilla este ahora bloqueada
function actualizarNoBlockeds() {
  for (let key = NoBlockeds.length - 1; key >= 0; key--) {
    let NBlocked = NoBlockeds[key];
    let xV = parseInt(NBlocked.charAt(4) + NBlocked.charAt(5));
    let yV = parseInt(NBlocked.charAt(2) + NBlocked.charAt(3));
    let leftPos = xV - 2;
    let rightPos = xV + 2;
    let upPos = yV - 2;
    let downPos = yV + 2;

    let formattedLeftPos = leftPos < 10 ? "0" + leftPos : leftPos;
    let formattedRightPos = rightPos < 10 ? "0" + rightPos : rightPos;
    let formattedUpPos = upPos < 10 ? "0" + upPos : upPos;
    let formattedDownPos = downPos < 10 ? "0" + downPos : downPos;
    let formattedXV = xV < 10 ? "0" + xV : xV;
    let formattedYV = yV < 10 ? "0" + yV : yV;

    let left = "ct" + formattedYV.toString() + formattedLeftPos.toString();
    let right = "ct" + formattedYV.toString() + formattedRightPos.toString();
    let up = "ct" + formattedUpPos.toString() + formattedXV.toString();
    let down = "ct" + formattedDownPos.toString() + formattedXV.toString();

    let Vecinas = [left, right, up, down];
    let WrongVecinas = [];

    for (let i = Vecinas.length - 1; i >= 0; i--) {
      if (borders.includes(Vecinas[i])) {
        WrongVecinas.push(Vecinas[i]);
        Vecinas.splice(i, 1);
      }
    }

    visiteds.forEach(function (visited) {
      if (Vecinas.includes(visited)) {
        WrongVecinas.push(visited);
      }
    });

    Vecinas = Vecinas.filter(function (vecina) {
      return !WrongVecinas.includes(vecina);
    });

    if (Vecinas.length < 1) {
      NoBlockeds.splice(key, 1);
    }
  }
}


//MOVIMIENTOS - IN-GAME

//Movimiento por teclas del personaje
document.onkeyup = (e) => {
  if (e.key === "w") {
    movimiento(1);
  } else if (e.key === "s") {
    movimiento(2);
  } else if (e.key === "a") {
    movimiento(3);
  } else if (e.key === "d") {
    movimiento(4);
  }
};
//Limpiar el  canvas
function clearCanvas() {
  context.clearRect(0, 0, canvas.width, canvas.height);
}

//Mover visualmente al personaje/Ver los cambios
function mueveCanvas(pos) {
  pintar(last, "white", 25);
  if (pos == 1) {
    context.drawImage(
      jerry_up,
      (personajeX - 1) * 25,
      (personajeY - 1) * 25,
      25,
      25
    );
  } else if (pos == 2) {
    context.drawImage(
      jerry_down,
      (personajeX - 1) * 25,
      (personajeY - 1) * 25,
      25,
      25
    );
  } else if (pos == 3) {
    context.drawImage(
      jerry_left,
      (personajeX - 1) * 25,
      (personajeY - 1) * 25,
      25,
      25
    );
  } else {
    console.log("derecha");
    context.drawImage(
      jerry_right,
      (personajeX - 1) * 25,
      (personajeY - 1) * 25,
      25,
      25
    );
  }
  checkMeta();
}

function checkMeta() {
  if (convesorCoords(personajeX, personajeY) == meta) {
    fin.innerHTML = "¡HAS LLEGADO A LA META!";
    context.fillStyle = "yellow";
    context.fillRect((personajeX - 1) * 25, (personajeY - 1) * 25, 25, 25);
    gameOver();
    // context.strokeRect((personajeX-1) * 25, (personajeY-1) * 25, 25, 25);
  }
}
//Comprobación de casillas
let last;
function movimiento(desp) {
  last = convesorCoords(personajeX, personajeY);

  console.log("last: " + last);
  intentos.innerHTML = "Pasos: " + ++count;
  let xV = parseInt(last.charAt(4) + last.charAt(5));
  let yV = parseInt(last.charAt(2) + last.charAt(3));
  let leftPos = xV - 1;
  let rightPos = xV + 1;
  let upPos = yV - 1;
  let downPos = yV + 1;

  if (leftPos < 10) {
    leftPos = "0" + leftPos;
  }
  if (rightPos < 10) {
    rightPos = "0" + rightPos;
  }
  if (upPos < 10) {
    upPos = "0" + upPos;
  }
  if (downPos < 10) {
    downPos = "0" + downPos;
  }
  if (xV < 10) {
    xV = "0" + xV;
  }
  if (yV < 10) {
    yV = "0" + yV;
  }
  let left = "ct" + yV.toString() + leftPos.toString();
  let right = "ct" + yV.toString() + rightPos.toString();
  let up = "ct" + upPos.toString() + xV.toString();
  let down = "ct" + downPos.toString() + xV.toString();
  let pos;
  //ARRIBA
  if (desp == 1) {
    pos = up;
  }
  //ABAJO
  if (desp == 2) {
    pos = down;
  }
  //IZQUIERDA
  if (desp == 3) {
    pos = left;
  }
  //DERECHA
  if (desp == 4) {
    pos = right;
  }
  let movOk = true;
  console.log(pos);
  borders.forEach(function (border) {
    if (pos == border) {
      movOk = false;
    }
  });
  walls.forEach(function (wall) {
    if (pos == wall) {
      movOk = false;
    }
  });
  if (movOk) {
    personajeX = parseInt(pos.charAt(4) + pos.charAt(5));
    personajeY = parseInt(pos.charAt(2) + pos.charAt(3));
    console.log("Moving to: " + convesorCoords(personajeX, personajeY));
    mueveCanvas(desp);
  }
}

function convesorCoords(x, y) {
  let xP = x;
  let yP = y;
  if (xP < 10) {
    xP = "0" + xP;
  }
  if (yP < 10) {
    yP = "0" + yP;
  }
  let posicion = "ct" + yP + xP;
  return posicion;
}

function timerSet() {
  let time = space/40;

  let timer = setInterval(function () {
    let minutes = Math.floor(time / 60);
    let seconds = Math.round(time % 60);
    currentMinutes = minutes.toString().padStart(2, "0");
    currentSeconds = seconds.toString().padStart(2, "0");
    currentTime = currentMinutes + ":" + currentSeconds;
    document.getElementById("time").innerHTML = "Time: " + currentTime;
    time--;
    if (time < 0) {
      clearInterval(timer);
      fin.innerHTML = "Game Over";
      gameOver();
    }
    if (over) {
      clearInterval(timer);
    }
    console.log(timer);
  }, 1000);
}

//Mostrar o dejar de mostrar pantallas Inicio, Fin, Juego
let start = document.getElementById("startScreen");
let game = document.getElementById("cnv");
let end = document.getElementById("gameOver");

function startGame() {
  start.style.display = "none";
  game.style.display = "flex";
  end.style.display = "none";
  count = 0;
  intentos.innerHTML = "Pasos: " + count;
  visiteds = [];
  NoBlockeds = [];
  borders = [];
  voids = [];
  walls = [];
  over = false;
  clearCanvas();
  createMaze();
  personajeX = parseInt(visiteds[0].charAt(4) + visiteds[0].charAt(5));
  personajeY = parseInt(visiteds[0].charAt(2) + visiteds[0].charAt(3));

  timerSet();
  context.drawImage(
    jerry_down,
    (personajeX - 1) * 25,
    (personajeY - 1) * 25,
    25,
    25
  );
}
function gameOver() {
  over = true;
  start.style.display = "none";
  game.style.display = "none";
  end.style.display = "flex";
}
