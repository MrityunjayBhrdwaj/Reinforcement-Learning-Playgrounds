// TODO: 
// Do we really need getQValues function? == yes! for asthetical typing reasons. :P

// DONE:
// For MC, added the argument for adding arbitrary policy function 
// convert the name of DefaultDict to defaultDict in this file and all of the other files that uses it.
// use importance sampling ratio instead of weight cum sum.
// and make sure to use the defaultGetValue feature instead of if/else statements while querying entries that doesn't exist yet.

class MC {

  constructor(env, params, callback) {
    const _model = {
        qValues: new DefaultDict(_.fill(Array(env.nA), 0)),
        weightsCumSum : new DefaultDict(_.fill(Array(env.nA), 0)),
    }
    const _discountFactor = params.discountFactor;
    const _targetPolicy = _greedyPolicyFn;

    function _greedyPolicyFn(state){

      const qValues = _model.qValues;
      const policy = _.fill(Array(env.nA), 0);
      const greedyAction = argMax(qValues.get(state))
      policy[greedyAction] = 1.0;
      return policy;
    };

    function _generateEpisode (maxSteps, behaviourPolicy){

      //storing our state, action, reward pairs for this episode
      const episodePairs = [];
      let forViz = null;
      let state = env.reset();
      const qValues = _model.qValues;

      // actual episode loop
      for(let t=0; t< maxSteps; t+=1){

        // choose a random action from our behaviour Policy
        const action = indexFromDistribution(behaviourPolicy(state, qValues));
        // taking the step
        const { observation: nextState, reward, isDone, cardUsed } = env.step(action);
        // store all the pairs 
        episodePairs.push({state, action, reward});
        // stop this episode if it reaches the terminal state
        if (isDone){
          forViz = cardUsed;
          break;
        }
        state = nextState;
      }

      return {episodePairs, forViz};
    }

    function _updateValueFns(episodePairs, behaviourPolicy){

      // initializing
      let returnsSum = 0;
      let returnsWeights = 1;

      // actual backtracking loop
      for(let i=episodePairs.length-1;i >= 0; i -=1){

        // fetching our state action and reward pairs from the current time step
        const {state, action, reward} = episodePairs[i];

        // caculating our sum of returns
        returnsSum = _discountFactor * returnsSum + reward;

        // calculating our cummulative sum of weights ( importance ratio)
        const cWeightsCumSum = _model.weightsCumSum;
        let newWeightsCumSum = cWeightsCumSum.get(state);
        newWeightsCumSum[action] += returnsWeights;
        cWeightsCumSum.set(state, newWeightsCumSum)

        // calculating and storing our Q values
        const cActionValues = _model.qValues;
        const weightedImportanceSamplingRatio = (returnsWeights / cWeightsCumSum.get(state)[action]);
        let newActionVal = cActionValues.get(state);

        newActionVal[action] += weightedImportanceSamplingRatio * (returnsSum - newActionVal[action]);
        cActionValues.set(state, newActionVal)

        const targetAction = argMax(_targetPolicy(state));
        if (action !== targetAction)
          break;

        // updating our returns weights.
        const importanceSamplingRatio = 1.0/behaviourPolicy(state, cActionValues)[action];
        returnsWeights = returnsWeights * importanceSamplingRatio;
      }

    }

    this.callback = callback ?? (()=>{})
    this.getQValues = ()=>_.cloneDeep(_model.qValues);
    this.save = ()=>JSON.stringify(_model);

    /**
     * 
     * @param {number} nEpisodes how many episode should we allow our agent to run
     * @param {function} behaviorPolicy our proposed policy from which we will choose our action
     * 
     * @returns {object} the model itself ( for function chaining)
     */
    this.run = async (nEpisodes, behaviourPolicy)=>{

        const maxSteps = 1000;
        let cEpisode = 0;

        while(true){

          if (cEpisode % nEpisodes/10 === 0)
            console.log(`${cEpisode}) `);
      
          // * Generating the episodes
          const {episodePairs, forViz} = _generateEpisode(maxSteps, behaviourPolicy);

          // * backtrack the episode for updating our Q values
          _updateValueFns(episodePairs, behaviourPolicy);

          const stopTheLoop = await this.callback(episodePairs, forViz) || false;
          if(cEpisode >= nEpisodes || stopTheLoop){
            console.log('exiting');  
            break;
          }

          cEpisode +=1;
        }

      return this;
    }

  }
}

// Coding Procedure:-
// const env = new blackJackGym();
// const behaviourPolicy = policyFnFactory('epsilonGreedy', {epsilon: 0.2}, env);
// function myCallbackFn(){/* do something */}

// const model = new MonteCarlo(
//   env, 
//   { _discountFactor: .3}, 
//   callback = {
//     evaluation : (()=>{}),
//     improvement: myCallbackFn
//   }
// );
// model.run(maxEpisodes = 1000, behaviourPolicy);