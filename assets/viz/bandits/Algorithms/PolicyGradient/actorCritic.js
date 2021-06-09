// ? What to do with _model + this.getQValues + save when you use funcion approximators? 
class actorCritic{
    constructor(env, params, callback){

        const _model = {
            qValues: new DefaultDict(_.fill(Array(env.nA),0)),
        }
        const _discountFactor = params.discountFactor ?? 1.0;

        this.callback = callback || (()=>{});
        this.getQValues = ()=>_.cloneDeep(_model.qValues);
        this.save = ()=>JSON.stringify(_model);

        /**
         * @param {number} nEpisodes how many episode should we allow our agent to run
         * @param {object}  actor policy function approximator used by our actor
         * @param {object} critic state-value function approximator used as a critic
         * @returns {object} the model itself ( for function chaining)
         */
        this.run = async function(nEpisodes,  actor, critic){
            for(let cEpisode = 0; cEpisode < nEpisodes; cEpisode++){

                let state = env.reset();
                let action = null;

                while(true){
                    // Take one step:
                    action = actor.predict(state);
                    const {observation: nextState, reward, isDone} = env.step(action);

                    // calculate TD target and TD Error
                    const nextStateValues = critic.predict(nextState);
                    const tdTarget = reward + _discountFactor*nextStateValues;
                    const tdError = tdTarget - critic.predict(state);

                    // update both the approximators
                    actor.train(state, tdError, action);
                    critic.train(state, tdTarget);

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
