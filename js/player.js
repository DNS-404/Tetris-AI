class Player{
	constructor(brain){
    // this.genome = {
    //   rowsCleared: random() - 0.5, 
    //   // weightedHeight: random() - 0.5, // absolute height of highest column
    //   // cumulativeHeight: random() - 0.5, // sum of height of all columns
    //   relativeHeight: random() - 0.5, 
    //   holes: random() * 0.5, // empty blocks (blocks below filled blocks)
    //   roughness: random() - 0.5, // sum of absolute differences of heights
    //   maxHeight: random() - 0.5 // max height of structure
    // };
    if(brain){
      this.brain = brain.copy();
    }else{
      this.brain = new NeuralNetwork(5, 6, 1);
    }
    this.fitness = 0;
    this.predictedOri = 0;
    this.predictedX = 0;
  }

  think(shapeInd){
    let bestMoveFitness = -100;
    let bestMoveOri = -1;
    let bestMoveX = -1;
    holesOnBoard = calcHoles();
    prevRoughness = calcRoughness();
    prevMaxHeight = calcMaxHeight();
    prevRelHeight = calcRelativeHeight();
    for(let ori=1; ori<=allBlocks[shapeInd]['num_ori']; ori++){
      let coords = allBlocks[shapeInd]['ori' + ori];
      let xSize = this.calcXSize(coords);
      let ySize = this.calcYSize(coords);
      for(let x = 0; x <= gameNumCols-xSize; x++){
        for(let y = gameNumRows-ySize; y>=0; y--){
          let doesFit = this.checkIfFits(x, y, coords);
          if(doesFit){
            // assume board is filled with predicted shape:
            for(let i=0; i<coords.length; i++){
              board[coords[i][1]+y][coords[i][0]+x] = 1;
            }
            // console.log(board);
            let fitScore = this.calcFitnessOfMove();
            if(fitScore > bestMoveFitness){
              bestMoveFitness = fitScore;
              bestMoveOri = ori;
              bestMoveX = x;
            }
            // un-fill the board at predicted shape location:
            for(let i=0; i<coords.length; i++){
              board[coords[i][1]+y][coords[i][0]+x] = 0;
            }
            break;
          }
        }
      }
    }
    this.predictedOri = bestMoveOri;
    this.predictedX = bestMoveX;
  }

  calcFitnessOfMove(){
    let input = [];
    input[0] = calcRowsCleared() / 4; // at max 4 rows can be cleared at a time
    input[1] = (calcRelativeHeight() - prevRelHeight) / 4; // at max Height can increase by 4
    input[2] = (calcHoles() - holesOnBoard) / gameNumRows;
    input[3] = (calcRoughness() - prevRoughness) / gameNumCols;
    input[4] = (calcMaxHeight() - prevMaxHeight) / gameNumCols;
    // console.log(input);
    if(input[0] > 0){
      input[0] = 1;
    }
    if(input[1] > 1){
      input[1] = 1;
    }
    if(input[2] > 1){
      input[2] = 1;
    }
    if(input[3] > 1){
      input[3] = 1;
    }
    if(input[4] > 1){
      input[4] = 1;
    }
    if(input[0] == 0 && input[2] > 0){ // if no rows cleared then HOLES ARE BAD!
      input[2] = 1;
    }
    // console.log(input);
    let output = this.brain.predict(input);
    return output;
  }

  mutate(){
    this.brain.mutate(0.1);
  }

  /* ---------------------------- SUPPORT FUNCTIONS ------------------------ */

  calcXSize(coords){
    let xMin = 10000;
    let xMax = -1;
    for(let i=0; i<coords.length; i++){
      if(coords[i][0] < xMin){
        xMin = coords[i][0];
      }
      if(coords[i][0] > xMax){
        xMax = coords[i][0];
      }
    }
    if(xMin == 10000 && xMax == -1){
      return 0;
    }
    return (xMax - xMin + 1);
  }

  calcYSize(coords){
    let yMin = 10000;
    let yMax = -1;
    for(let i=0; i<coords.length; i++){
      if(coords[i][1] < yMin){
        yMin = coords[i][1];
      }
      if(coords[i][1] > yMax){
        yMax = coords[i][1];
      }
    }
    if(yMin == 10000 && yMax == -1){
      return 0;
    }
    return (yMax - yMin + 1);
  }

  checkIfFits(x, y, coords){
    for(let i=0; i<coords.length; i++){
      let xVal = coords[i][0]+x;
      let yVal = coords[i][1]+y;
      if(xVal < 0 || xVal >= gameNumCols ||
        yVal < 0 || yVal >= gameNumRows ||
        board[yVal][xVal] != 0){
        // console.log("Failed at: " + xVal + " " + yVal);
        return false;
      }
    }
    return true;
  }
}








