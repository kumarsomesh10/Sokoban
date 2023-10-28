const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

var gridSize = 20;
var tileSize = 0;

const playerChar = "p";
const boxChar = "b";
const targetChar = "t";
const wallChar = "w";
const emptyChar = "e";

let level;
let playerX, playerY;
let boxes = [];
let boxReset = [];
let numBoxes = 5;
let numTargets = numBoxes;
let playerReset;
let isLevelCompleted = false;

// Define variables to keep track of Sokoban character images for different directions
const characterImages = {
  left: "./images/Character10.png",
  right: "./images/Character3.png",
  up: "./images/Character8.png",
  down: "./images/Character5.png",
};
let currentDirection = "down"; // Initialize with a default direction

// Function to change the Sokoban character's direction and image
function changeDirection(direction) {
  currentDirection = direction;
  const img = document.getElementById("sokoban");
  img.src = characterImages[direction];
}

function resetGrid() {
  isLevelCompleted = false;
  changeDirection("down");
  boxes = [];
  boxReset.forEach((box) => {
    boxes.push({ x: box.x, y: box.y });
  });
  playerX = playerReset.x;
  playerY = playerReset.y;
  drawLevel();
  checkLevelCompletion();
}

function generateRandomLevel() {
  isLevelCompleted = false;
  changeDirection("down");
  boxes = [];
  boxReset = [];
  const characters = [emptyChar, wallChar, targetChar];

  // let numBoxes = 5;
  // let numTargets = numBoxes;

  level = new Array(gridSize)
    .fill("")
    .map(() => new Array(gridSize).fill(emptyChar));

  const emptyCells = [];

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (
        x === 0 ||
        y === 0 ||
        x === gridSize - 1 ||
        y === gridSize - 1 ||
        Math.random() < 0.1
      ) {
        level[y][x] = wallChar;
      } else {
        level[y][x] = emptyChar;
        emptyCells.push({ x, y });
      }
    }
  }

  while (numTargets > 0 && emptyCells.length > 0) {
    const { x, y } = emptyCells.splice(
      Math.floor(Math.random() * emptyCells.length),
      1
    )[0];
    level[y][x] = targetChar;
    numTargets--;
  }

  while (numBoxes > 0 && emptyCells.length > 0) {
    const { x, y } = emptyCells.splice(
      Math.floor(Math.random() * emptyCells.length),
      1
    )[0];
    // level[y][x] = boxChar;
    // boxes.push({ x, y });
    // numBoxes--;
    if (isTouchingWall(x, y)) {
      shiftBoxFromWall(x, y);
    } else {
      level[y][x] = boxChar;
      boxes.push({ x, y });
      numBoxes--;
    }
  }
  boxes.forEach((box) => {
    boxReset.push({ x: box.x, y: box.y });
  });

  while (true) {
    const x = 1 + Math.floor(Math.random() * (gridSize - 2));
    const y = 1 + Math.floor(Math.random() * (gridSize - 2));
    if (level[y][x] === emptyChar) {
      level[y][x] = playerChar;
      playerX = x;
      playerY = y;
      playerReset = { x, y };
      break;
    }
  }
  console.log(level);
  checkLevelCompletion();
}

function isTouchingWall(x, y) {
  const directions = [
    [-1, 0], // Left
    [1, 0], // Right
    [0, -1], // Up
    [0, 1], // Down
  ];

  for (const [dx, dy] of directions) {
    const newX = x + dx;
    const newY = y + dy;
    if (level[newY][newX] === wallChar) {
      return true;
    }
  }
  return false;

  // console.log(x, y);
  // console.log(x - 1 !== 0);
  // console.log(y - 1 !== 0);
  // console.log(x + 1 !== gridSize - 1);
  // console.log(y + 1 !== gridSize - 1);
  // console.log(level[y - 1][x] === wallChar);
  // console.log(level[y + 1][x] === wallChar);
  // console.log(level[y][x - 1] === wallChar);
  // console.log(level[y][x + 1] === wallChar);
  // console.log(
  //   "Result : ",
  //   x - 1 !== 0 &&
  //     y - 1 !== 0 &&
  //     x + 1 !== gridSize - 1 &&
  //     y + 1 !== gridSize - 1 &&
  //     level[y - 1][x] === wallChar &&
  //     level[y + 1][x] === wallChar &&
  //     level[y][x - 1] === wallChar &&
  //     level[y][x + 1] === wallChar
  // );

  // return (
  //   level[y - 1][x] === wallChar ||
  //   level[y + 1][x] === wallChar ||
  //   level[y][x - 1] === wallChar ||
  //   level[y][x + 1] === wallChar
  // );
}

function shiftBoxFromWall(x, y) {
  const directions = [
    [-1, 0], // Left
    [1, 0], // Right
    [0, -1], // Up
    [0, 1], // Down
  ];

  for (const [dx, dy] of directions) {
    const newX = x + dx;
    const newY = y + dy;
    if (level[newY][newX] === emptyChar) {
      level[newY][newX] = boxChar;
      // Clear the old position in the level array
      level[y][x] = emptyChar;
      // Update the box's position
      boxes.push({ x: newX, y: newY });
      numBoxes--;
      return true;
    }
  }
  return false;
}

function isWall(x, y) {
  return level[y][x] === wallChar;
}

function isBox(x, y) {
  return boxes.some((box) => box.x === x && box.y === y);
}

function isTarget(x, y) {
  return level[y][x] === targetChar;
}

function move(dx, dy) {
  const newPlayerX = playerX + dx;
  const newPlayerY = playerY + dy;

  if (isWall(newPlayerX, newPlayerY)) {
    return;
  }

  if (isBox(newPlayerX, newPlayerY)) {
    const newBoxX = newPlayerX + dx;
    const newBoxY = newPlayerY + dy;

    if (isWall(newBoxX, newBoxY) || isBox(newBoxX, newBoxY)) {
      return;
    }

    const boxIndex = boxes.findIndex(
      (box) => box.x === newPlayerX && box.y === newPlayerY
    );
    boxes[boxIndex].x = newBoxX;
    boxes[boxIndex].y = newBoxY;
  }

  playerX = newPlayerX;
  playerY = newPlayerY;

  drawLevel();
  checkLevelCompletion();
  if (isLevelCompleted) {
    setTimeout(() => {
      alert("Congratulations! You've solved the level!");
      generateRandomLevel();
      resizeCanvas();
    }, 10);
  }
}

function checkLevelCompletion() {
  // Check if all boxes are on targets and update isLevelCompleted.
  isLevelCompleted = boxes.every((box) => isTarget(box.x, box.y));
  const arrowButtons = document.querySelectorAll(".arrow-button");
  if (isLevelCompleted) {
    // Disable the arrow buttons
    arrowButtons.forEach((button) => {
      button.disabled = true;
    });
  } else {
    arrowButtons.forEach((button) => {
      button.disabled = false;
    });
  }
}

//for box character
function drawBoxes(x, y, color) {
  const xPos = x * tileSize;
  const yPos = y * tileSize;
  if (color === "yellow") {
    const img = document.getElementById("yellowCrate");
    ctx.drawImage(img, xPos, yPos, tileSize, tileSize);
  } else {
    const img = document.getElementById("beigeCrate");
    ctx.drawImage(img, xPos, yPos, tileSize, tileSize);
  }
}

function drawLevel() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#A1E08D";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const cell = level[y][x];
      if (x === 0 || y === 0 || x === gridSize - 1 || y === gridSize - 1) {
        const img = document.getElementById("wallBorder");
        const xPos = x * tileSize;
        const yPos = y * tileSize;
        ctx.drawImage(img, xPos, yPos, tileSize, tileSize);
      } else if (cell === wallChar) {
        const img = document.getElementById("wallChar");
        const xPos = x * tileSize;
        const yPos = y * tileSize;
        ctx.drawImage(img, xPos, yPos, tileSize, tileSize);
      } else if (cell === targetChar) {
        const img = document.getElementById("target");
        const xPos = x * tileSize;
        const yPos = y * tileSize;
        ctx.drawImage(img, xPos, yPos, tileSize, tileSize);
      }
    }
  }

  for (const box of boxes) {
    if (isTarget(box.x, box.y)) {
      drawBoxes(box.x, box.y, "green");
    } else {
      drawBoxes(box.x, box.y, "yellow");
    }
  }

  const xPos = playerX * tileSize;
  const yPos = playerY * tileSize;
  const img = document.getElementById("sokoban");
  ctx.drawImage(img, xPos, yPos, tileSize, tileSize);
}

function onKeyDown(event) {
  if (!isLevelCompleted) {
    switch (event.key) {
      case "ArrowUp":
        changeDirection("up");
        move(0, -1);
        break;
      case "ArrowDown":
        changeDirection("down");
        move(0, 1);
        break;
      case "ArrowLeft":
        changeDirection("left");
        move(-1, 0);
        break;
      case "ArrowRight":
        changeDirection("right");
        move(1, 0);
        break;
    }
  }
}

function resizeCanvas() {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  const isVerticalLayout = windowHeight > windowWidth;

  if (isVerticalLayout) {
    canvas.style.width = "100%";
    canvas.style.height = "auto";
    document.body.style.flexDirection = "column";
  } else {
    canvas.style.width = "auto";
    canvas.style.height = "100%";
    document.body.style.flexDirection = "row";
  }

  const windowSize = Math.min(windowWidth, windowHeight);
  tileSize = Math.floor(windowSize / gridSize);

  canvas.width = gridSize * tileSize;
  canvas.height = gridSize * tileSize;

  drawLevel();
}

document.addEventListener("keydown", onKeyDown);
window.addEventListener("resize", resizeCanvas);
generateRandomLevel();
resizeCanvas();
