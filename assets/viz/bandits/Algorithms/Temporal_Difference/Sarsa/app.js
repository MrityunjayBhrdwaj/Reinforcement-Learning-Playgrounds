// environment to test our models on.
const env = new BlackJackEnv();

// testing Sarsa
const policy = policyFnFactory("random", env);
const model = new Sarsa(env, {discountFactor: 1.0, learningRate: 0.5});
model.run(1000, policy);