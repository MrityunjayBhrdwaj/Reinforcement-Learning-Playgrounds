export class Env{
    /**
     * @summary this function resets the state of the environment
     * @returns {stepObj}
     */
    reset(){throw new Error("this method is not yet Implemented")}

    /**
     * @param {object} action action performed by the agent
     * @summary run 1 timestep of the environment.
     * @returns {stepObj}
     */
    step(action){throw new Error("this method is not yet Implemented")}

    /**
     * @summary Renders the environment
     */
    render(){throw new Error("this method is not yet Implemented")}
}

/**
 * @typedef {object} stepObj
 * @property {object} nextState agent's observation of the environemnt after performing the given action
 * @property {number} reward amount of reward we get after performing the given action
 * @property {boolean} isDone indicate if we reach terminal state or not
 * @property {object} info contains extra informations ( if specified ).
 */
