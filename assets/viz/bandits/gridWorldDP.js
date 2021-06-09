import {DiscreteEnv} from 'discrete'
// Inspired by Frozen Lake Env : https://github.com/openai/gym/blob/master/gym/envs/toy_text/frozen_lake.py

export class GridWorldEnv extends DiscreteEnv{
  constructor(gridShape = [5, 5], isWallState, isTerminalState, rewardFn, startStateFn){

    const _isTerminalState = isTerminalState ?? _defaultIsTerminalState.bind(this);
    const _isWallState = isWallState ?? _defaultIsWallState;
    const _rewardFn = rewardFn ?? _defaultRewardFn;
    const _initStartState = startStateFn ?? (()=>3);

    const _gridShape = gridShape;
    this.nS = _gridShape[0]* _gridShape[1];
    this.nA = 4;
    this.P = Array(this.nS).fill(null);
    this.P = this.P.map((_, s)=>{
      // creating space for all the actions and filling them with the appropriate info
      return _stateProperties.call(this, s);
    });

    /**
     * @param {number} i index of the state
     * @param {number} a index of the state
     * @summery Check if the current state is along an edge
     * @return {boolean}
     */
    function _isEdge(i, a, actions) {

      const [UP, RIGHT, DOWN, LEFT] = actions;
      const width = _gridShape[0];
      const height = _gridShape[1];
      const xCoord = Math.floor(i / width);
      const yCoord = i % height;

      if (xCoord === 0 && a === LEFT) return 1;
      if (yCoord === 0 && a === UP) return 1;
      if (yCoord === height - 1 && a === DOWN) return 1;
      if (xCoord === width - 1 && a === RIGHT) return 1;

      return 0;
    }

    function _defaultRewardFn(s, a){
      // standard textbook reward scheme
      if (_isTerminalState(s) || _isWallState(s))return 0;
      return -1;
    }

    function _defaultIsWallState(idx){
      return 0;
    }

    function _defaultIsTerminalState(idx){
      // this function considers the first and the last state as its terminal state
      const width = Math.sqrt(this.nS);
      const height = width;

      const coords = index2Coords(idx, _gridShape, this.nS)

      const i = coords[0];
      const j = coords[1];

      if (i + j === 0 || i * j === (width - 1) * (height - 1)) return true;
      return false;
    }

    function _stateProperties(s, nA){

      const actions = [0, 1, 2, 3];
      const [UP, RIGHT, DOWN, LEFT] = actions;

      const properties = [];

      for(let dir=0; dir < this.nA; dir++){

          // next State index if the current state is not a terminal, wall or in an edge
          let nextStateIndex = (()=>{
            if (dir === UP)return s - 1;
            if (dir === RIGHT)return s + _gridShape[0];
            if (dir === DOWN)return s + 1;
            if (dir === LEFT)return s - _gridShape[1];
          })()

          nextStateIndex =  ( _isEdge(s, dir, actions) || _isWallState(nextStateIndex) || _isTerminalState(s) )? s : nextStateIndex;

          properties.push(
            [
              {
                probability: 1.0,
                // if the given state, action pair yield a wall state or is on the edge or is a terminal state then don't change the state at all.
                nextState: nextStateIndex,
                reward: _rewardFn(s, dir, nextStateIndex),
                isDone: +_isTerminalState(s)
              }
            ]
          )
      }

      return properties;
    }

    // calculate initial state distribution
    const _isd = Array(this.nS).fill(0)
    _isd[_initStartState()] = 1.0

    super(this.nS,this.nA,this.P, _isd)
  }
  render(){

  }
}