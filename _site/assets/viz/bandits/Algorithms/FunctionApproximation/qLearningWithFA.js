// TODO: add qValues argument to _greedyPolicyFn and add targetPolicy as an optional property of params object
// TODO: in behavior Policy only insert the array of the actions not the whole qValue defaultDict object itself.
class QLearning{
    constructor(env, approximator, params, callback){

        const _model = {
            qValues: new DefaultDict(_.fill(Array(env.nA),0)),
        }
        const _discountFactor = params.discountFactor ?? 1.0;
        const _targetPolicy = params.targetPolicy ?? _greedyPolicyFn;

        function _greedyPolicyFn(state, qValues){

            const policy = _.fill(Array(env.nA), 0);
            const greedyAction = argMax(qValues.get(state))
            policy[greedyAction] = 1.0;
            return policy;
        };

        this.callback = callback || (()=>{});
        this.getQValues = ()=>_.cloneDeep(_model.qValues);
        this.save = ()=>JSON.stringify(_model);

        /**
         * 
         * @param {number} nEpisodes how many episode should we allow our agent to run
         * @param {function} behaviorPolicy our proposed policy from which we will choose our action
         * 
         * @returns {object} the model itself ( for function chaining)
         */
        this.run = async function(nEpisodes, behaviorPolicy){
            for(let cEpisode = 0; cEpisode < nEpisodes; cEpisode++){

                let state = env.reset();
                let action = null;

                while(true){
                    // Take one step:
                    let qValues = await approximator.predict(state);
                    const actionProb = behaviorPolicy(state, qValues);
                    action = indexFromDistribution(actionProb);
                    const {observation: nextState, reward, isDone} = env.step(action);

                    // calculating the q Values of our next action by following our targetPolicy.
                    const nextQValues = approximator.predict(nextState);
                    const targetActionProb = _targetPolicy(nextState, nextQValues);
                    const targetActionIndex = indexFromDistribution(targetActionProb);
                    const targetActionQValue = nextQValues[targetActionIndex];

                    // updating the function approximator
                    const tdTarget = reward + _discountFactor*targetActionQValue;
                    await approximator.train(_.cloneDeep(state), action, tdTarget)

                    if (isDone)break;
                    state = nextState;
                }

                // invoke the callback
                const stopTheLoop = await this.callback() || false;

                if(stopTheLoop)break;

            }

            return this;
        }

    
    }

}