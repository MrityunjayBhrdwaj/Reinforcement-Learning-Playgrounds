import { cloneDeep, fill } from '../../../Dependencies/lodash'
import { indexFromDistribution, argMax, DefaultDict } from '../../../Dependencies/Utils';

export class QLearning{
    constructor(env, params, callback){

        const _model = {
            qValues: new DefaultDict(fill(Array(env.nA),0)),
        }
        const _discountFactor = params.discountFactor ?? 1.0;
        const _learningRate = params.learningRate ?? 0.5;
        const _targetPolicy = _greedyPolicyFn;

        function _greedyPolicyFn(state){

            const qValues = _model.qValues;
            const policy = fill(Array(env.nA), 0);
            const greedyAction = argMax(qValues.get(state))
            policy[greedyAction] = 1.0;
            return policy;
        };

        this.callback = callback || (()=>{});
        this.getQValues = ()=>cloneDeep(_model.qValues);
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
                    const actionProbs = behaviorPolicy(state, this.getQValues());
                    action = indexFromDistribution(actionProbs);
                    const {observation: nextState, reward, isDone} = env.step(action);

                    // select next Action
                    const targetNextAction = indexFromDistribution(_targetPolicy(nextState));

                    // TD Update
                    const cActionValues = _model.qValues;
                    const tdTarget = reward + _discountFactor * cActionValues.get(nextState)[targetNextAction];
                    const tdDelta = tdTarget - cActionValues.get(state)[action];
                    let newActionValues = cActionValues.get(state);
                    newActionValues[action] += _learningRate * tdDelta;
                    cActionValues.set(state, newActionValues);

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