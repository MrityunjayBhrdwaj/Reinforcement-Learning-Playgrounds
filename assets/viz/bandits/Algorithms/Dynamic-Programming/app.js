const gridSize = 5;
let env = new gridWorldEnv_v2([gridSize, gridSize]);

// init our policy Iteriation Model
let model = new policyIteration(
env,
{   discountFactor: 1.0, 
    theta: 0.00001 
}, 
);

// run the policy iteration algorithm
model.run([100, 100]);