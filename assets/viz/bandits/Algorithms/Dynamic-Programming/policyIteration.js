import { cloneDeep } from '../../Dependencies/lodash'

export class policyIteration{
  constructor(env, params, callback){

    const _nActions = env.nA;
    const _nStates = env.nS;
    const _model = {
      valueFns: (Array(_nStates).fill(0)),
      policy: (Array(_nStates).fill(0)).map(()=>Array(_nActions).fill(1/_nActions))
    }

    const _actionSelection = greedyActionSelection;
    const _theta = params.theta || 0.2;
    const _discountFactor = params.discountFactor || 0.1;

    this.callback = callback ?? (()=>{})

    function greedyActionSelection(values){
      let maxVal = Math.max(...values);
      const maxValIndexArray = []
      values.map((val,i)=>{
        if(val === maxVal )maxValIndexArray.push(i)
      })

      return maxValIndexArray;
    }


    /**
     *
     * @param {Number} state current state
     * @param {Array} valueFns value function array
     * @summary calculate the action values of the given state.
     * @return {Number} A vector of length _nActions containing the expected value of each action
     */
    function _oneStepLookAhead(state, valueFns) {
      const cAction = new Array(_nActions).fill(0);

      for (let action = 0; action < _nActions; action += 1) {
        const envTransitions = env.P[state][action];
        const { reward } = envTransitions;
        const transitionProb = envTransitions.probability;
        const { nextStateIndex } = envTransitions;

        cAction[action] +=
          transitionProb *
          (reward + _discountFactor * valueFns[nextStateIndex]);
      }

      return cAction;
    }


    this.getPolicy = ()=>cloneDeep(_model.policy);
    this.getValueFns = ()=>cloneDeep(_model.valueFns);
    this.save = ()=>JSON.stringify(_model);

    this.policyEvaluation = function (policy, env, discountFactor, theta, nEpisodes, callback){ 

      return new Promise(async resolve=>{

        // init value Fns
        const valueFns = new Array(_nStates).fill(0);

        for (let iter = 0; iter < nEpisodes; iter+=1) {
          let delta = 0;//  stores the maximum rate of change between the current and prev estimates

          for (let state = 0; state < _nStates; state += 1) {
            let cValue = 0;
            const cActions = policy[state];

            // if this state is terminal state or a wall then don't continue.
            if (env.P[state][0].nextStateIndex === null)break;

            for (let action = 0; action < _nActions; action += 1) {
              const envTransitions = env.P[state][action];
              const { reward } = envTransitions;
              const transitionProb = envTransitions.probability;
              const { nextStateIndex } = envTransitions;
              const actionProb = cActions[action];

              // updating our value fns for current state's action
              cValue +=
                actionProb *
                transitionProb *
                (reward + discountFactor * valueFns[nextStateIndex]);
            }

            
            delta = Math.max(delta, Math.abs(cValue - valueFns[state]));
            valueFns[state] = cValue;
          }
          // updating our _model's valueFns after each iteration
          _model.valueFns = valueFns;

          // calling the callback function
          if(callback)await callback();

          // termination criterion
          if (delta < theta) break;
        }

        // return the valueFns
        resolve( valueFns );
      });

    }
    this.policyImprovement = function(){
      return new Promise( resolve=>{

        // init policy stable flag
        let isPolicyStable = false;

        for (let state = 0; state < _nStates; state += 1) {
          const selActions = _actionSelection(_model.policy[state]);

          const actionValues = _oneStepLookAhead(state, _model.valueFns);
          const bestActions = _actionSelection(actionValues);
          const nBestActions = bestActions.length;

          isPolicyStable = Math.min(...(selActions.map((val,i)=>{return (val === bestActions[i])})));

          // greedily update the policy
          _model.policy[state] = new Array(_nActions)
            .fill(0)
            .map((_, i) =>{
              if(bestActions.indexOf(i) !== -1)return 1.0/nBestActions;
              return 0;
            } );
        }

        resolve(isPolicyStable);

      })

    }

    this.run = async (nEpisodes = 100)=>{
      
      // if the nEpisodes is an array then its assumed that the first entry is the max Iter of policy eval and other one is of policy improvement
      // otherwise if its just a number then use that as a nEpisodes for both case.
      const peMaxIter = nEpisodes[0] ?? nEpisodes;
      const piMaxIter = nEpisodes[1] ?? nEpisodes;

      return new Promise(async (resolve)=>{


        let iter = 0;
        while (true) {
          // evaluate the current Policy
          _model.valueFns = await this.policyEvaluation(
            _model.policy,
            env,
            _discountFactor,
            _theta, 
            peMaxIter,
          );

          // improving our policy
          const isPolicyStable = await this.policyImprovement();

          const terminate = await this.callback();

          if (isPolicyStable){
            return { policy: this.getPolicy(), valueFns: this.getValueFns() };
          } 

          if (iter > piMaxIter || terminate){
            resolve();
            return { policy: this.getPolicy(), valueFns: this.getValueFns() };
          }
          iter += 1;
        }

      })

    }
  }

}
