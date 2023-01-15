class Block {
	constructor(x, y, colr, ind){
    this.x = x;
    this.y = y;
    this.oriX = x - players[currentPlayer].predictedX; // posX in createNewShape() is 3
    this.oriY = y;
    this.belongsTo = ind
    this.color = colr;
    this.side = blockSize - 2; // space of 1px at each side
  }

  display(){
    noStroke();
    fill(colors[this.color]);
    square(coordToPixel[this.x][this.y].x + 1, coordToPixel[this.x][this.y].y + 1, this.side);
  }

  moveDown(){
    this.y += 1;
  }

  moveRight(){
    this.x += 1;
  }

  moveLeft(){
    this.x -= 1;
  }

  // reachedEnd(){
  //   if(this.y-1 == gameHeight - 2*blockSize + padding){
  //     return true;
  //   }else{
  //     return false;
  //   }
  // }
}
