// TODO:

// DONE:
// use classes
// follow the same gym layout.

class gridWorldEnv_v1{
  constructor(gridShape, isWallState, isTerminalState, rewardFn){

    this.isTerminalState = isTerminalState ?? _defaultIsTerminalState;
    this.isWallState = isWallState ?? _defaultIsWallState;
    this.rewardFn = rewardFn ?? _defaultRewardFn;
    this.gridShape = gridShape;
    this.nS = gridShape[0]* gridShape[1];
    this.nA = 4;
    this.cLoc = 0;


    function _defaultRewardFn(s, a){
      // standard textbook reward scheme
      if (isTerminalState(s) || isWallState(s))return 0;
      return -1;
    }

    function _defaultIsWallState(idx){
      return 0;
    }

    function _defaultIsTerminalState(idx){
      // this function considers the first and the last state as its terminal state
      const width = Math.sqrt(this.nS);
      const height = width;

      const coords = index2Coords(idx, this.gridShape, this.nS)

      const i = coords[0];
      const j = coords[1];

      if (i + j === 0 || i * j === (width - 1) * (height - 1)) return true;
      return false;
    }



  }

 
  reset(){
    this.cLoc = 0;

  }

  step(action){


    const UP = 0;
    const RIGHT = 1;
    const DOWN = 2;
    const LEFT = 3;

    /**
     * @param {number} i index of the state
     * @param {number} a index of the state
     * @summary Check if the current state is along an edge
     * @return {boolean}
     */
    function _isEdge(i, a){
      const width = this.gridShape[0];
      const height = this.gridShape[1];
      const xCoord = Math.floor(i / width);
      const yCoord = i % height;

      if (xCoord === 0 && a === LEFT) return 1;
      if (yCoord === 0 && a === UP) return 1;
      if (yCoord === height - 1 && a === DOWN) return 1;
      if (xCoord === width - 1 && a === RIGHT) return 1;

      return 0;
    }

    const cLoc = this.cLoc;

    let nextStateIndex = (()=>{
        if (action === UP)return cLoc - 1;
        if (action === RIGHT)return cLoc + this.gridShape[0];
        if (action === DOWN)return cLoc + 1;
        if (action === LEFT)return cLoc - this.gridShape[1];
    })();

    // if the given state, action pair yield a wall state or is on the edge or is a terminal state then don't change the state at all.
    nextStateIndex =  ( _isEdge(i, action) || this.isWallState(nextStateIndex) || this.isTerminalState(i) )? cLoc : nextStateIndex;
    
    this.cLoc = nextStateIndex;

    return {
      probability: 1.0,
      nextStateIndex: nextStateIndex,
      reward: this.rewardFn(i, dir, nextStateIndex),
      isDone: +this.isTerminalState(i)
    }

  }
  render(){

  }
}