import {Env} from 'core'
export class DiscreteEnv extends Env{
    /**
     * 
     * @param {number} nS number of state
     * @param {number} nA number of actions
     * @param {array} P array of arrays where P[s][a] = [{probability, nextState, reward, isDone}, ...]
     * @param {array} initStateDist probability distribution of states used for initialization
     */
    constructor(nS,nA,P, initStateDist){
        this.P = P;
        this.initStateDist = initStateDist;
        this.lastAction = null;
        this.nS = nS;
        this.nA = nA;

        // sampling random state
        this.s = indexFromDistribution(initStateDist);
    }
    reset(){
        // sampling random state
        this.s = indexFromDistribution(this.initStateDist);
        this.lastAction = null;
        return this.s;
    }
    step(action){
        let transtionStates = this.P[this.s][action];
        if (!transtionStates.length)throw new Error("P[s][a] must be an array of atleast length 1 but given", transtionStates)

        const transtionProbs = transtions.map((a)=>a.probability)
        const sampleAction = indexFromDistribution(transtionProbs);
        let {nextState, reward, isDone, probability} = transitionStates[sampleAction];

        this.s = nextState;
        this.lastAction = sampleAction;

        return {nextState, reward, isDone, probability};

    }
}