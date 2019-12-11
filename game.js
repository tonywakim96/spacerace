import game.html
import game.css

let playerHealth = 100;
let backgroundImage;
let time = 0;
let blackholeHeight = 0;

function preload() {
  backgroundImage = loadImage(
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/NGC_4414_%28NASA-med%29.jpg/1451px-NGC_4414_%28NASA-med%29.jpg"
  );
}

function drawHealthBar() {
  fill("grey");
  rect(width + 10, height, 150, 10);
  if (playerHealth > 0) {
    fill(playerHealth > 25 ? "green" : "red");
    rect(640, 10, 1.5 * playerHealth, 10);
  } else if (playerHealth <= 0) {
    fill("rgba(100, 100, 100, 0.5)");
    rect(0, 0, width, height);
    textFont("Avenir");
    textAlign(CENTER);
    textSize(40);
    textStyle(BOLD);
    fill(0);
    text("GAME OVER", width / 2, height / 2 - 20);
    text(`${Math.round(time)} seconds`, width / 2, height / 2 + 20);
    exit();
  }
}

function updateTimer() {
  fill("grey");
  time += 1 / 60;
  textSize(30);
  textAlign(RIGHT);
  text(Math.round(time), width - 10, 50);
}

function updateScarecrow() {
  fill("grey");
  rect(10, 10, 150, 10);
  if (scarecrow) {
    scarecrow.draw();
    scarecrow.ttl--;
    if (scarecrow.ttl < 0) {
      scarecrow = undefined;
      scarecrowCooldown = time;
    }
  } else {
    fill("white");
    rect(
      10,
      10,
      time - scarecrowCooldown < 10 ? 15 * (time - scarecrowCooldown) : 150,
      10
    );
    if (time - scarecrowCooldown > 10) {
      fill("grey");
      textSize(15);
      textAlign(LEFT);
      text("Click to use decoy!", 10, 40);
    }
  }
}

class healthbox {
  constructor(x, y, index) {
    Object.assign(this, { x, y, index });
  }
  update() {
    fill("red");
    rect(this.x - 8, this.y - 3, 16, 6);
    rect(this.x - 3, this.y - 8, 6, 16);
    let [dx, dy] = [this.x - player.x, this.y - player.y];
    const distance = Math.hypot(dx, dy);
    let overlap = 20 + player.radius - distance;
    if (this.y < blackholeHeight) {
      this.delete;
    } else if (overlap > 0) {
      playerHealth = playerHealth > 90 ? 100 : playerHealth + 25;
      this.delete();
    }
  }
  subtract() {
    this.index--;
  }
  delete() {
    healthboxes.splice(this.index, 1);
    healthboxes.forEach(box => {
      if (box.index > this.index) {
        box.subtract();
      }
    });
  }
}

class mainCharacter {
  constructor(x, y, color, radius, speed) {
    Object.assign(this, { x, y, color, radius, speed });
  }
  draw() {
    fill(this.color);
    ellipse(this.x, this.y, this.radius * 3, this.radius * 4);
    fill("red");
    ellipse(this.x, this.y - 16, this.radius / 3, this.radius / 2);
    ellipse(this.x, this.y - 11, this.radius / 4, this.radius / 3);
    ellipse(this.x, this.y - 7, this.radius / 5, this.radius / 4);
    fill("white");
    ellipse(this.x - 8, this.y - 3, this.radius, this.radius / 2.5);
    ellipse(this.x + 8, this.y - 3, this.radius, this.radius / 2.5);
    fill(0);
    ellipse(this.x + 6, this.y - 3, this.radius / 3, this.radius / 3);
    ellipse(this.x - 6, this.y - 3, this.radius / 3, this.radius / 3);
    fill("yellow");
    arc(this.x + 7, this.y + 9, 25, 5, 90, PI + QUARTER_PI, CHORD);
  }
  move(target) {
    this.x += (target.x - this.x) * this.speed;
    this.y += (target.y - this.y) * this.speed;
  }
}

class enemy {
  constructor(type, x, y, radius, speed) {
    Object.assign(this, { type, x, y, radius, speed });
  }
  draw() {
    if (this.type === "spaceShip") {
      fill("grey");
      ellipse(this.x, this.y, this.radius * 2, this.radius / 2);
      ellipse(this.x, this.y - 10, this.radius, this.radius / 2);

      fill("#c1d3d4");
      ellipse(this.x, this.y - 10, this.radius / 1.5, this.radius / 2.7);
    } else if (this.type === "spaceShip") {
      function hit(x, y, outerRadius, innerRadius, points) {
        let angle = TWO_PI / points;
        let halfAngle = angle / 2.0;
        beginShape();
        for (let angleIndex = 0; angleIndex < TWO_PI; angleIndex += angle)
          endShape(CLOSE);
      }
    }
  }
  move(target) {
    this.x += (target.x - this.x) * this.speed;
    this.y += (target.y - this.y) * this.speed;
  }
}

const player = new mainCharacter(100, 30, "#84DE02", 10, 0.05);
let enemies = [];
let healthboxes = [];
let scarecrow;
let scarecrowCooldown = 0;

function addEnemy(
  type,
  amount = 1,
  coordinates = [
    Math.random() > 0.5 ? 0 : width,
    Math.random() * (height - blackholeHeight) - blackholeHeight
  ],
  size = Math.random() * 20 + 10,
  speed = Math.random() * 0.03 + 0.003
) {
  for (let i = 0; i < amount; i++) {
    enemies.push(
      new enemy(type, coordinates[0] + i, coordinates[1], size, speed)
    );
  }
}

function drawBlackHole() {
  fill("rgba(100,100,100,0.8)");
  blackholeHeight = time * 1.5;
  rect(0, 0, width, blackholeHeight);
}

function setup() {
  createCanvas(800, 600);
  spawnEnemies();
  noStroke();
}

function draw() {
  background(backgroundImage);
  player.draw();
  player.move({ x: mouseX, y: mouseY });
  enemies.forEach(enemy => enemy.draw());
  enemies.forEach(enemy => enemy.move(scarecrow || player));
  healthboxes.forEach(box => box.update());
  adjust();
  drawBlackHole();
  drawHealthBar();
  updateTimer();
  updateScarecrow();
  if ((Math.round(60 * time) / 60) % 10 === 0) {
    spawnEnemies();
    if (Math.random() > 0.3) {
      healthboxes.push(
        new healthbox(
          Math.random() * width,
          Math.random() * (height - blackholeHeight) - blackholeHeight,
          healthboxes.length
        )
      );
    }
  }
}

function spawnEnemies() {
  addEnemy("spaceShip", 1, undefined, 35);
}

function adjust() {
  const characters = [player, ...enemies];
  for (let i = 0; i < characters.length; i++) {
    for (let j = i + 1; j < characters.length; j++) {
      pushOff(characters[i], characters[j]);
    }
  }
  if (player.y <= blackholeHeight + player.radius) {
    player.y = blackholeHeight + player.radius;
    playerHealth -= 0.1;
  }
  for (enemyIndex = 0; enemyIndex < enemies.length; enemyIndex++) {
    if (enemies[enemyIndex].y <= blackholeHeight + enemies[enemyIndex].radius) {
      enemies[enemyIndex].y = blackholeHeight + enemies[enemyIndex].radius;
    }
  }
}

function pushOff(c1, c2) {
  let [dx, dy] = [c2.x - c1.x, c2.y - c1.y];
  const distance = Math.hypot(dx, dy);
  let overlap = c1.radius + c2.radius - distance;
  if (overlap > 0) {
    const adjustX = overlap / 2 * (dx / distance);
    const adjustY = overlap / 2 * (dy / distance);
    c1.x -= adjustX;
    c1.y -= adjustY;
    c2.x += adjustX;
    c2.y += adjustY;
    if (c1 === player) {
      playerHealth -= 0.1;
      if (playerHealth == 0) {
        fill("red");
        rect(100, 100, 100, 100);
      }
    }
  }
}

function mouseClicked() {
  if (!scarecrow & (time - scarecrowCooldown > 10)) {
    scarecrow = new mainCharacter(
      player.x,
      player.y,
      "rgba(156,218,68,0.5)",
      10,
      0
    );
    scarecrow.ttl = frameRate() * 5;
  }
}
