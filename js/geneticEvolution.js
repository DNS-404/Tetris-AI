let prevPlayers = [];

function createInitialPopulation(){
  players = [];
  for(let i=0; i<populationSize; i++){
    player = new Player();
    players.push(player);
  }
}

function createNewGeneration(){
  prevPlayers = [];
  let totalScore = 0;
  let maxScore = 0;
  for(let i=0; i<populationSize; i++){
    totalScore += players[i].fitness;
    maxScore = max(maxScore, players[i].fitness);
  }
  bestScores.push(maxScore);
  let avgScore = totalScore / populationSize;
  let foundBest = false;
  for(let i=0; i<populationSize; i++){
    if(players[i].fitness > avgScore || players[i].fitness == maxScore){
      prevPlayers.push(players[i]);
    }
    if(!foundBest && players[i].fitness == maxScore){
      savedPlayers.push(players[i]);
      foundBest = true;
    }
  }
  totalScore = 0;
  for(let i=0; i<prevPlayers.length; i++){
    totalScore += prevPlayers[i].fitness;
  }
  for(let i=0; i<prevPlayers.length; i++){
    prevPlayers[i].fitness = prevPlayers[i].fitness/totalScore;
  }
  // console.log(prevPlayers.length + " " + prevPlayers[0].fitness);
  // console.log("Pool: " + prevPlayers.length);
  console.log("Gen: " + generation + " || Max Score: " + maxScore);
  players = [];
  for(let i=0; i<populationSize; i++){
    players[i] = pickRandom();
  }
}

function pickRandom(){
  let index = 0;
  let r = random(1);
  while(r > 0){
    r = r - prevPlayers[index].fitness;
    index++;
  }
  index--;

  let play = prevPlayers[index];
  let child = new Player(play.brain);
  child.mutate();
  return child;
}

/* ---------------------------- AI FUNCTIONS ------------------------ */

function calcRowsCleared(){ // rows cleared
  let filled = 0;
  for(let i=0; i<board.length; i++){
    let isFilled = true;
    for(let j=0; j<board[i].length; j++){
      if(board[i][j] == 0){
        isFilled = false;
        break;
      }
    }
    if(isFilled){
      filled += 1;
    }
  }
  return filled;
}

function calcRelativeHeight(){ // max height - min height
  let maxHeight = 0;
  let minHeight = 100;
  for(let x=0; x<board[0].length; x++){
    let h = 0;
    for(let y=0; y<board.length; y++){
      if(board[y][x] != 0){
        h = board.length - y;
        break;
      }
    }
    if(h > maxHeight){
      maxHeight = h;
    }
    if(h < minHeight){
      minHeight = h;
    }
  }
  return (maxHeight - minHeight);
}

function calcHoles(){
  let holes = 0;
  for(let x=0; x<board[0].length; x++){
    let foundFirst = false;
    for(let y=0; y<board.length; y++){
      if(board[y][x] != 0 && !foundFirst){
        foundFirst = true;
        continue;
      }
      if(foundFirst && board[y][x] == 0){
        holes += 1;
      }
    }
  }
  return holes;
}

function calcRoughness(){
  let roughness = 0;
  let prevH = -1;
  for(let x=0; x<board[0].length; x++){
    for(let y=0; y<board.length; y++){
      if(board[y][x] != 0){
        if(prevH == -1){
          prevH = board.length - y;
          break;
        }else{
          roughness += abs(board.length - y - prevH);
          prevH = board.length - y;
        }
        break;
      }
    }
  }
  return roughness;
}

function calcMaxHeight(){
  let maxHeight = 0;
  for(let x=0; x<board[0].length; x++){
    let h = 0;
    for(let y=0; y<board.length; y++){
      if(board[y][x] != 0){
        h = board.length - y;
        break;
      }
    }
    if(h > maxHeight){
      maxHeight = h;
    }
  }
  return maxHeight;
}
