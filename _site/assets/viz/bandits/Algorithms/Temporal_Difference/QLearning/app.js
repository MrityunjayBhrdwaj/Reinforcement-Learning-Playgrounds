// environment to test on.
const env = new BlackJackEnv();

// Testing QLearning
const behaviorPolicy = policyFnFactory("epsilonGreedy", env, {epsilon: 0.1} );
const model = new QLearning(env, {discountFactor: 1.0, learningRate: 0.5});
model.run(1000, behaviorPolicy);