/* -------------------------- CONFIG -------------------------- */
let gameHeight = 700;
let gameWidth = 420;
let gameNumRows = 18; // WITHOUT BORDERS
let gameNumCols = 10; // WITHOUT BORDERS
let padding = 25;
let marginX = 480;
let blockSize = 35;
let borderColorIndex = 0;
let allowedToMoveDown = false;
let colors = ['#636e72', '#f53b57', '#3c40c6', '#0fbcf9', '#00d8d6', '#05c46b', '#ffdd59'];
let fontTitle;
let score = 0;
let maxScoreTillNow = 0;
let generation = 0;
let tempGen = 0;

/* ----------------------------- AI ------------------------------ */
const populationSize = 100;
let currentPlayer = 0;
let players = [];
let savedPlayers = [];
let holesOnBoard = 0;
let prevRoughness = 0;
let prevMaxHeight = 0;
let prevRelHeight = 0;
let showingBestPlayers = false;
let bestScores = [];

/* -------------------------- GAME VARS -------------------------- */
let board = [ // 0: empty, i: occupied with color index i
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
]; // All the blocks currently on the board
let borderBlocks = []; // Border blocks
let coordToPixel = []; // Coordinates to Pixel translation

let currentShape = [];
let shapeNumber = 0;
// let speedVal = 0; // 0: slowest, 1: faster, 2: fasterrr, 3: invisibly fast
let speed = 50, iter = 0;
let howManyTimes = 1;

/* -------------------------- ALL BLOCKS INFO -------------------------- */
let allBlocks = [ // coordinates wrt (0, 0)
  {
    'ori1': [[0, 0], [1, 0], [2, 0], [3, 0]],
    'ori2': [[0, 0], [0, 1], [0, 2], [0, 3]],
    'num_ori': 2
  }, // ----
  {
    'ori1': [[0, 0], [0, 1], [1, 1], [2, 1]],
    'ori2': [[0, 0], [1, 0], [0, 1], [0, 2]],
    'ori3': [[0, 0], [1, 0], [2, 0], [2, 1]],
    'ori4': [[1, 0], [1, 1], [1, 2], [0, 2]],
    'num_ori': 4
  }, // |__
  {
    'ori1': [[0, 1], [1, 1], [2, 1], [2, 0]],
    'ori2': [[0, 0], [0, 1], [0, 2], [1, 2]],
    'ori3': [[0, 0], [1, 0], [0, 1], [2, 0]],
    'ori4': [[0, 0], [1, 0], [1, 1], [1, 2]],
    'num_ori': 4
  }, // __|
  {
    'ori1': [[0, 0], [0, 1], [1, 0], [1, 1]],
    'num_ori': 1
  }, // O
  {
    'ori1': [[0, 1], [1, 1], [1, 0], [2, 0]],
    'ori2': [[0, 0], [0, 1], [1, 1], [1, 2]],
    'num_ori': 2
  }, // _|-
  {
    'ori1': [[0, 1], [1, 0], [1, 1], [2, 1]],
    'ori2': [[0, 0], [0, 1], [0, 2], [1, 1]],
    'ori3': [[0, 0], [1, 0], [2, 0], [1, 1]],
    'ori4': [[1, 0], [1, 1], [1, 2], [0, 1]],
    'num_ori': 4
  }, // _|_
  {
    'ori1': [[0, 0], [1, 0], [1, 1], [2, 1]],
    'ori2': [[1, 0], [1, 1], [0, 1], [0, 2]],
    'num_ori': 2
  } // -|_
];
let currBlock = 0;
let currOri = 1;

let allBlocksBoundaries = [ // boundaries on the x-axis (both sides inclusive)
  [0, 6],
  [0, 7],
  [0, 7],
  [0, 8],
  [0, 7],
  [0, 7],
  [0, 7],
];

/* -------------------------- MAIN CODE -------------------------- */
function preload(){
  fontTitle = loadFont('font/GameCube.ttf');
}

function setup(){
  createCanvas(1200, 760);
  randomSeed(1);
  for(let i=0; i<colors.length; i++){
    colors[i] = color(colors[i]);
  }
  allowedToMoveDown = false;
  createCoordinateArray();
  createBorders();

  // AI
  createInitialPopulation();
  createNewShape();
}

function draw(){
  background(51);

  
  /* ------------ CURRENT SHAPE ------------ */
  for(let i=0; i<howManyTimes; i++){
    if(currentShape.length > 0){
      if(howManyTimes == 1){
        if(iter >= speed){
          allowedToMoveDown = true;
          iter = 0;
        }
        ++iter;
      }else{
        allowedToMoveDown = true;
      }
      if(canShapeMoveDown()){
        if(allowedToMoveDown){
          allowedToMoveDown = false;
          // score += 1;
          for(block of currentShape){
            block.moveDown();
          }
        }
      }else{
        addShapeToGrid();
        createNewShape();
      }
    }

    /* -------------- GAME FLOW --------------- */
    clearFilledLinesAndShift();
    if(checkGameOver()){
      if(!showingBestPlayers){
        maxScoreTillNow = max(maxScoreTillNow, score);
        players[currentPlayer].fitness = score;
        currentPlayer += 1;
        if(currentPlayer >= players.length){
          createNewGeneration();
          generation += 1;
          currentPlayer = 0;
        }else{
          createNewShape();
        }
        resetGame();
      }else{
        generation += 1;
        resetGame();
      }
    }

    // if(speed > 1 || howManyTimes%100 == 0){
      
    // }
  }
  
  /* -------- ALL THE DISPLAYING ------------ */
  for(block of currentShape){
    block.display();
  }
  drawOccupiedSpaces();
  drawHeading();
  drawStats();
  drawBorders();
}

/* -------------------------- GAME FLOW -------------------------- */

function checkGameOver(){
  for(let i=0; i<board[1].length; i++){
    if(board[1][i] != 0)
      return true;
  }
  return false;
}

function clearFilledLinesAndShift(){
  let toShift = []
  for(let y=0; y<board.length; y++){
    let filled = true;
    for(let x=0; x<board[y].length; x++){
      if(board[y][x] == 0){
        filled = false;
        break;
      }
    }
    if(filled){
      toShift.push(y);
    }
  }
  if(toShift.length > 0){
    for(row of toShift){
      for(let y=row; y>0; y--){
        for(let x=0; x<board[y].length; x++){
          board[y][x] = board[y-1][x];
        }
      }
      score += 200;
    }
  }
}

function resetGame(){
  shapeNumber = 0;
  score = 0;
  for(let i=0; i<board.length; i++){
    for(let j=0; j<board[i].length; j++){
      board[i][j] = 0;
    }
  }
  randomSeed(1);
  createNewShape();
}

function drawHeading(){
  // TITLE
  textFont(fontTitle);
  fill(255);
  textSize(68);
  text('TETRIS', 40, 90);
  // TITLE BOX
  noFill();
  stroke(255);
  rect(20, 20, 450, 85);
}

function drawStats(){
  // Score
  strokeWeight(1);
  textFont(fontTitle);
  fill(255);
  textSize(26);
  text('SCORE :', 40, 180);
  text(score, 250, 180);
  // Score BOX
  noFill();
  stroke(255);
  rect(20, 140, 450, 60);

  // AI STATS
  fill(255);
  textSize(26);
  text('GENERATION :', 40, 280);
  text(generation, 380, 280);
  if(!showingBestPlayers){
    text('PLAYER :', 40, 325);
    text((currentPlayer+1) + '/' + populationSize, 300, 325);
    text('SHAPE NO. :', 40, 370);
    text(shapeNumber, 320, 370);
    text('MAX SCORE :', 40, 415);
    text(maxScoreTillNow, 340, 415);
  }else{
    text('PLAYER :', 40, 325);
    text('BEST', 300, 325);
    text('SHOWING BEST', 40, 370);
    text('PLAYERS ONLY', 40, 415);
  }
  // Border
  noFill();
  stroke(255);
  rect(20, 235, 450, 200);

  // Controls
  // fill(255);
  // textSize(26);
  // text('CONTROLS :', 40, 505);
  // textSize(28);
  // text('S : increase speed', 40, 550);
  // text('H : decrese speed', 40, 590);
  // if(!showingBestPlayers){
  //   text('A : shift left', 40, 630);
  //   text('D : shift right', 40, 670);
  //   text('E : rotate clockwise', 40, 710);
  // }else{
  //   text('L : next generation', 40, 630);
  //   text('K : prev generation', 40, 670);
  // }
  // Controls BOX
  noFill();
  stroke(255);
  rect(20, 465, 450, 260);

  strokeWeight(2);
  line(50, 490, 50, 700); // y Axis
  line(50, 700, 435, 700); // x Axis
  stroke(255, 0, 0);
  line(50, 500, 435, 500); // GOAL
  stroke(255);
  // marks on y axis:
  for(let y=500; y<=690; y+=15){
    line(50, y, 52, y);
  }
  // marks on x axis:
  for(let x=50; x<=430; x+=15){
    line(x, 700, x, 698);
  }
  let prevx = 0, prevy = 0;
  let biasX = 50, biasY = 700;
  for(let i=0; i<generation; i++){
    let newx = prevx + 15;
    let newy = floor((bestScores[i]/1000) * 15);
    line(prevx + biasX, biasY - prevy, newx + biasX, biasY - newy);
    prevx = newx;
    prevy = newy;
  }

  // faded lines
  strokeWeight(1);
  stroke(255, 50);
  for(let x=50; x<=430; x+=15){
    line(x, 700, x, 500);
  }
}

/* -------------------------- CURRENT SHAPE -------------------------- */

function createNewShape(){
  let shapeInd = floor(random(0, allBlocks.length));
  let colorInd = floor(random(1, colors.length));
  // console.log(shapeInd);
  let posX = "";
  let ori = ""
  if(!showingBestPlayers){
    players[currentPlayer].think(shapeInd);
    // console.log(players[currentPlayer].predictedX + " " + players[currentPlayer].predictedOri);
    posX = players[currentPlayer].predictedX;
    ori = players[currentPlayer].predictedOri;
  }else{
    if(generation < savedPlayers.length){
      savedPlayers[generation].think(shapeInd);
      posX = savedPlayers[generation].predictedX;
      ori = savedPlayers[generation].predictedOri;
    }else{
      showingBestPlayers = !showingBestPlayers;
      generation = tempGen;
      resetGame();
      return;
    }
  }
  currentShape = [];
  for(let i=0; i<allBlocks[shapeInd]['ori' + ori].length; i++){
    let b = new Block(
                  posX + allBlocks[shapeInd]['ori' + ori][i][0],
                  allBlocks[shapeInd]['ori' + ori][i][1],
                  colorInd,
                  shapeInd
                );
    currentShape.push(b);
  }
  shapeNumber += 1;
}

function canShapeMoveDown(){
  for(block of currentShape){
    if(block.y+1 > board.length-1 || board[block.y+1][block.x] != 0)
      return false;
  }
  return true;
}

function canMoveRight(){
  for(block of currentShape){
    if(block.x >= gameNumCols-1)
      return false;
  }
  return true;
}

function canMoveLeft(){
  for(block of currentShape){
    if(block.x <= 0)
      return false;
  }
  return true;
}

function rotateShape(){
  let s = [];
  let lastX = -1;
  for(block of currentShape){
    s.push([block.oriX, block.oriY]);
    if(block.oriX > lastX){
      lastX = block.oriX;
    }
  }
  for(let i=0; i<s.length; i++){
    let newX = lastX - s[i][1];
    let newY = s[i][0];
    s[i][0] = newX;
    s[i][1] = newY;
  }
  for(let i=0; i<currentShape.length; i++){
    currentShape[i].x += (s[i][0]-currentShape[i].oriX);
    currentShape[i].y += (s[i][1]-currentShape[i].oriY);
    currentShape[i].oriX = s[i][0];
    currentShape[i].oriY = s[i][1];
  }
}

function addShapeToGrid(){
  for(block of currentShape){
    board[block.y][block.x] = block.color;
  }
  currentShape = [];
}

/* -------------------------- OTHER FUNCTIONS -------------------------- */

function createCoordinateArray(){
  for(let x=padding+marginX+blockSize; x <= padding+marginX+gameWidth-2*blockSize; x += blockSize){
    let currArray = [];
    for(let y=padding+blockSize; y <= padding+gameHeight-2*blockSize; y += blockSize){
      let coord = {'x': x, 'y': y};
      currArray.push(coord);
    }
    coordToPixel.push(currArray);
  }
}

/* -------------------------- OCCUPIED SPACES -------------------------- */

function drawOccupiedSpaces(){
  for(let y=0; y<board.length; y++){
    for(let x=0; x<board[y].length; x++){
      if(board[y][x] != 0){ // not empty
        noStroke();
        fill(colors[board[y][x]]);
        square(coordToPixel[x][y].x+1, coordToPixel[x][y].y+1, blockSize-2);
      }
    }
  }
}

/* -------------------------- EVENTS -------------------------- */

// function keyReleased(){
//   if(keyCode == 83 || keyCode == 115){ // s (down)
//     speed = speed*10;
//   }
// }

function keyPressed(){
  if(keyCode == 68 || keyCode == 100){ // d (right)
    if(canMoveRight()){
      for(block of currentShape){
        block.moveRight();
      }
    }
  }else if(keyCode == 65 || keyCode == 97){ // a (left)
    if(canMoveLeft()){
      for(block of currentShape){
        block.moveLeft();
      }
    }
  }else if(keyCode == 69 || keyCode == 101){ // e (rotate)
    if(currentShape.length > 0){
      rotateShape();
    }
  }else if(keyCode == 83 || keyCode == 115){ // s (fast)
    speed = speed/2;
    if(speed < 2){
      howManyTimes += 1;
    }
  }else if(keyCode == 72 || keyCode == 126){ // s (slow)
    speed = speed*2;
    if(howManyTimes > 1){
      howManyTimes -= 1;
    }else if(speed < 1){
      speed = 1;
    }
  }else if(keyCode == 32){ // SPACE
    if(showingBestPlayers){
      generation = tempGen;
    }else{ // AI was playing
      tempGen = generation;
      generation = 0;
    }
    showingBestPlayers = !showingBestPlayers;
    resetGame();
  }else if(keyCode == 76 || keyCode == 130){ // L
    generation += 1;
    resetGame();
  }else if(keyCode == 75 || keyCode == 129){ // K
    generation -= 1;
    resetGame();
  }

  return false; // prevent any default behaviour
}

/* -------------------------- BORDERS -------------------------- */

function drawGrid(){
  noFill();
  stroke(255, 255, 255);
  // vertical lines
  for(let x = padding+marginX; x <= gameWidth+padding+marginX; x += blockSize){
    line(x, padding, x, padding + gameHeight);
  }
  // horizontal lines
  for(let y = padding; y <= gameHeight+padding; y += blockSize){
    line(padding+marginX, y, padding + gameWidth + marginX, y);
  }
}

function createBorders(){
  let b;
  // vertical
  for(let y = padding; y < gameHeight+padding; y += blockSize){
    b = [padding + marginX, y]; // last color is black
    borderBlocks.push(b);
    b = [padding + marginX + gameWidth - blockSize, y]; // last color is black
    borderBlocks.push(b);
  }
  // horizontal
  for(let x = padding + marginX + blockSize; x < gameWidth + padding + marginX; x += blockSize){
    b = [x, padding]; // last color is black
    borderBlocks.push(b);
    b = [x, padding + gameHeight - blockSize]; // last color is black
    borderBlocks.push(b);
  }
}

function drawBorders(){
  noStroke();
  fill(colors[borderColorIndex]);
  for(blocks of borderBlocks){
    square(blocks[0] + 1, blocks[1] + 1, blockSize - 2);
  }
}




