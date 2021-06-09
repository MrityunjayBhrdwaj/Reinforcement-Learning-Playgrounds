class nStepSarsa{
    constructor(env, params, callback){

        const _model = {
            qValues: new DefaultDict(_.fill(Array(env.nA),0)),
        }
        const _discountFactor = params.discountFactor ?? 1.0;
        const _learningRate = params.learningRate ?? 0.5;
        const _nSteps = params.nSteps ?? 1;

        this.callback = callback || (()=>{});
        this.getQValues = ()=>_.cloneDeep(_model.qValues);
        this.saveModel = ()=>JSON.stringify(_model);

        /**
         * 
         * @param {number} maxEpisode how many episode should we allow our agent to run
         * @param {function} policy policy from which we will choose our action
         * @returns {object} the model itself ( for function chaining)
         */
        this.run = async function(nEpisodes, policy){
            for(let cEpisode = 0; cEpisode < nEpisodes; cEpisode++){

                let state = env.reset();
                const actionProbs = policy(state, this.getQValues());
                let action = indexFromDistribution(actionProbs);
                let stateHistory = [];
                let actionHistory = [];
                let rewardHistory = [];

                let T = Infinity;
                let t = 0;

                while(true){
                    if( t < T){
                        // Take one step:
                        const {observation: nextState, reward, isDone} = env.step(action);

                        // storing our state, action and reward pairs
                        stateHistory.push(state);
                        actionHistory.push(action)
                        rewardHistory.push(reward);

                        if (isDone){
                            T = t+1;
                        }
                        else{ 
                            // select next Action
                            const nextActionProb = policy(nextState, this.getQValues());
                            const nextAction = indexFromDistribution(nextActionProb);

                            // reassign state action pairs
                            action = nextAction;
                            state = nextState;
                        }
                    }
                    const tau = t - _nSteps + 1;
                    if(tau >= 0){

                        // calculating the returns
                        let returns = 0;
                        const maxIndex = Math.min(tau+_nSteps, T); 
                        for(let i=tau + 1;i< maxIndex; i++)
                            returns += _discountFactor**(i - tau -1)*rewardHistory[i];
                        if( tau + _nSteps < T)
                            returns + _discountFactor**_nSteps*_model.qValues.get(tau + _nSteps);

                        // updating our qValues
                        let newActionValue = _model.qValues.get(stateHistory[tau]);
                        newActionValue[actionHistory[tau]] += _learningRate*[returns - newActionValue[actionHistory[tau]]];
                        _model.qValues.set(stateHistory[tau], newActionValue);

                    }

                    if(tau === T-1)break;
                    t +=1;
                }

                // invoke the callback
                const stopTheLoop = await this.callback() || false;

                if(stopTheLoop)break;

            }

            return this;
        }

    
    }

}