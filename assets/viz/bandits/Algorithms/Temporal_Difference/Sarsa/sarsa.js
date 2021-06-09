import { cloneDeep, fill } from '../../../Dependencies/lodash'
import { indexFromDistribution, argMax, DefaultDict } from '../../../Dependencies/Utils';

export class Sarsa{
    constructor(env, params, callback){

        const _model = {
            qValues: new DefaultDict(fill(Array(env.nA),0)),
        }
        const _discountFactor = params.discountFactor ?? 1.0;
        const _learningRate = params.learningRate ?? 0.5;

        this.callback = callback || (()=>{});
        this.getQValues = ()=>cloneDeep(_model.qValues);
        this.saveModel = ()=>JSON.stringify(_model);

        /**
         * 
         * @param {number} maxEpisode how many episode should we allow our agent to run
         * @param {function} behaviorPolicy our proposed policy from which we will choose our action
         * @returns {object} the model itself ( for function chaining)
         */
        this.run = async function(nEpisodes, policy){
            for(let cEpisode = 0; cEpisode < nEpisodes; cEpisode++){

                let state = env.reset();
                const actionProbs = policy(state, this.getQValues());
                let action = indexFromDistribution(actionProbs);

                while(true){
                    // Take one step:
                    const {observation: nextState, reward, isDone} = env.step(action);

                    // select next Action
                    const nextActionProb = policy(nextState, this.getQValues());
                    const nextAction = indexFromDistribution(nextActionProb);

                    // TD Update
                    const cActionValues = _model.qValues;
                    const tdTarget = reward + _discountFactor * cActionValues.get(nextState)[nextAction];
                    const tdDelta = tdTarget - cActionValues.get(state)[action];
                    let newActionValues = cActionValues.get(state);
                    newActionValues[action] += _learningRate * tdDelta;
                    cActionValues.set(state, newActionValues);

                    if (isDone )break;

                    action = nextAction;
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