class GameState {
  constructor() {
    this.pause = false;
    this.gameOver = false;
    this.pauseMenu = document.getElementById("pause-menu");
    this.gameOverMenu = document.getElementById("game-over-menu");
  }
  changePause() {
    this.pause = !this.pause;
    if (this.pause) {
      this.pauseMenu.style.display = "block";
    } else {
      this.pauseMenu.style.display = "none";
    }
  }
  endGame() {
    this.gameOver = true;
    this.gameOverMenu.style.display = "flex";
  }
  gameRunning() {
    return !(this.pause || this.gameOver);
  }
}
class BottomBar {
  constructor() {
    this.element = document.getElementById("bottom-bar");
    this.x = 10;
    this.speed = 5;
    this.width = this.element.offsetWidth;
    this.height = this.element.offsetHeight;

    this.element.style.top = window.innerHeight - 16 - this.height; //16 padding body
    this.element.style.left = this.x + "px";
  }
  moveX(m) {
    if (gameState.gameRunning()) {
      const dep = this.speed * m;
      if (this.x + dep + this.width <= window.innerWidth - 8 && this.x + dep >= 8) {
        //Pour pas sortir des bordures
        this.x += dep;
        this.element.style.left = this.x + "px";
      }
    }
  }
  changeSpeed(m) {
    if (this.speed + m >= 1 && this.speed + m <= 10) {
      this.speed += m;
    }
  }
}
class Ball {
  constructor() {
    this.element = document.getElementById("ball");
    this.x = 500;
    this.y = 500;
    this.speed = 3;
    this.angle = 110; //0 right, 90 bottom, ect

    this.height = this.element.offsetHeight;
    this.width = this.element.offsetWidth;
  }
  updatePosBall() {
    if (gameState.gameRunning()) {
      const speedX = this.speed * Math.cos((this.angle * Math.PI) / 180); //Calcul speed en fonction de l'angle pour l'axe X
      const speedY = this.speed * Math.sin((this.angle * Math.PI) / 180); //Calcul speed en fonction de l'angle pour l'axe Y
      this.x += speedX; //Calcul les nouvelles coordonnées pour l'axe X
      this.y += speedY; //Calcul les nouvelles coordonnées pour l'axe Y

      if (this.collision(speedX, speedY)) {
        //Si il y a collision revenir a l'initiale
        this.x -= speedX;
        this.y -= speedY;
      }

      this.element.style.top = this.y + "px";
      this.element.style.left = this.x + "px";
    }
  }
  calculAngle(axe, speedX, speedY, offset = 0) {
    const angleIncidence = Math.atan2(speedY, speedX);
    let angleReflexion = 0;

    if (axe === "V") {
      angleReflexion = -angleIncidence;
    } else if (axe === "H") {
      angleReflexion = Math.PI - angleIncidence;
    }

    let angleReflexionDegres = (angleReflexion * 180) / Math.PI + offset;

    if (angleReflexionDegres < 0) {
      angleReflexionDegres += 360;
    }

    this.angle = angleReflexionDegres % 360;

    if (axe === "V") {
      this.speedY = -this.speedY;
    } else if (axe === "H") {
      this.speedX = -this.speedX;
    }
  }
  collision(speedX, speedY) {
    //Calcul collision avec une brique
    function checkColBrick(x, y) {
      const brickColumn = Math.floor((x - 28) / 50); // 28 est le padding + margin du body, 50 est la largeur d'une brique
      const brickRow = Math.floor((y - 28) / 20); // 20 est la hauteur d'une brique

      if (brickColumn >= 0 && brickColumn < matrix[0].length && brickRow >= 0 && brickRow < 10) {
        const element = document.getElementById(matrix[brickRow][brickColumn]);
        if (element.classList.value.indexOf("destroyedBlock") == -1) {
          return { hit: true, element: element, brickRow: brickRow, brickColumn: brickColumn };
        }
      }
      return { hit: false };
    }
    const tL = checkColBrick(this.x, this.y); //Top Left
    const tR = checkColBrick(this.x + this.width, this.y); //Top Right
    const bL = checkColBrick(this.x, this.y + this.height); //Bottom Left
    const bR = checkColBrick(this.x + this.width, this.y + this.height); //Bottom Right
    const tC = checkColBrick(this.x + this.width / 2, this.y); //Top Center
    const bC = checkColBrick(this.x + this.width / 2, this.y + this.height); //Bottom Center
    const lC = checkColBrick(this.x, this.y + this.height / 2); //Left Center
    const rC = checkColBrick(this.x + this.width, this.y + this.height / 2); //Right Center

    if (tL.hit || tR.hit || bL.hit || bR.hit || tC.hit || bC.hit || lC.hit || rC.hit) {
      console.log("Collision Brick");
      console.log("X: " + this.x + " Y: " + this.y);
      console.log("Angle: " + this.angle);
      console.log("SpeedY: " + speedY + " SpeedX: " + speedX);
      const collided = tL.hit ? tL : tR.hit ? tR : bL.hit ? bL : bR.hit ? bR : tC.hit ? tC : bC.hit ? bC : lC.hit ? lC : rC;
      const element = collided.element;
      const brickRow = collided.brickRow;
      const brickColumn = collided.brickColumn;
      element.classList.add("destroyedBlock");

      const ballCenterX = this.x + this.width / 2; // Position X du centre de la balle
      const ballCenterY = this.y + this.height / 2; // Position Y du centre de la balle
      const brickX = brickColumn * 50 + 28 - 25; // Position X du centre de la brique
      const brickY = brickRow * 20 + 28 - 10; // Position Y du centre de la brique

      //Calcul de la distance entre les centres de la balle et de la brique
      const dx = ballCenterX - brickX;
      const dy = ballCenterY - brickY;

      const widthSum = (ball.width + 50) / 2;
      const heightSum = (ball.height + 20) / 2;

      if (Math.abs(dx) <= widthSum && Math.abs(dy) <= heightSum) {
        // Collision verticale
        this.calculAngle("H", speedX, speedY);
      } else {
        // Collision horizontale
        this.calculAngle("V", speedX, speedY);
      }
      console.log("New Angle: " + this.angle);
      return true;
    }

    //Collision Haut
    if (this.y < 8) {
      this.calculAngle("V", speedX, speedY);
      return true;
    }
    //Collision Droite ou Gauche
    if (this.x < 8 || this.x + this.width > window.innerWidth - 8) {
      this.calculAngle("H", speedX, speedY);
      return true;
    }
    //Collision Bas Game Over
    if (this.y + this.height > window.innerHeight - 8) {
      console.log("Game Over");
      gameState.endGame();
    }

    //Collision Bar Player
    if (this.y + this.height > window.innerHeight - 16 - bottomBar.height && this.x + this.width >= bottomBar.x && this.x <= bottomBar.x + bottomBar.width) {
      console.log("Collision Bar");
      let offset = bottomBar.x + bottomBar.width / 2 - this.x - this.width / 2;
      let sign = Math.sign(offset);
      offset = -sign * Math.abs(offset) ** 0.8;
      this.calculAngle("V", speedX, speedY, offset);
      return true;
    }
    return false;
  }
}
const gameState = new GameState();
const bottomBar = new BottomBar();
const ball = new Ball();

const body = document.getElementsByTagName("body")[0];
const widthBody = body.offsetWidth - 40;

const keyDown = {};

const height = 10;

const width = parseInt(widthBody / 50);
console.log("Width Body: " + widthBody);
console.log("NbBrick Par row : " + width);
const matrix = [];

for (let i = 0; i < height; i++) {
  matrix[i] = [];
  for (let j = 0; j < width; j++) {
    const value = Math.round(Math.random());
    const div = document.createElement("div");
    const idDiv = "block" + (width * i + j);
    div.classList.add("block");

    div.id = idDiv;
    if (value == 0) {
      div.classList.add("destroyedBlock");
    }
    document.body.appendChild(div);
    matrix[i][j] = idDiv;
  }
}

document.addEventListener("keydown", function (event) {
  if (event.code === "ArrowRight") {
    keyDown[event.code] = true;
  } else if (event.code === "ArrowLeft") {
    keyDown[event.code] = true;
  } else if (event.code === "KeyP") {
    gameState.changePause();
    console.log(gameState.pause);
  } else if (event.code === "NumpadAdd") {
    bottomBar.changeSpeed(1);
  } else if (event.code === "NumpadSubtract") {
    bottomBar.changeSpeed(-1);
  }
});
document.addEventListener("keyup", function (event) {
  if (event.code === "ArrowRight") {
    keyDown[event.code] = false;
  } else if (event.code === "ArrowLeft") {
    keyDown[event.code] = false;
  }
});

requestAnimationFrame(gameLoop);
setInterval(debugLoop, 100);

function gameLoop() {
  if (keyDown["ArrowRight"]) {
    bottomBar.moveX(1);
  }
  if (keyDown["ArrowLeft"]) {
    bottomBar.moveX(-1);
  }
  ball.updatePosBall();
  requestAnimationFrame(gameLoop);
}
function debugLoop() {
  if (gameState.gameRunning() && false) {
    console.log("Ball Angle: " + ball.angle);
    console.log(`Ball X: ${ball.x} Y: ${ball.y}`);
    console.log(`BottomBar X: ${bottomBar.x}`);
  }
}
