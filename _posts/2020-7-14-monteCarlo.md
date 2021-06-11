---
layout: post 
title : Monte Carlo
tags  : [ML,AI, Reinforcement Learning, RL, Monte Carlo, BlackJack]
title-seprator: "|"
categories: Reinforcement Learning
permalink: /:categories/:title.html
mathjax: true
author: Mrityunjay
height: 550px
img: /posts_imgs/monteCarlo/teaser/monteCarloScrst.png
viz: monteCarlo/index.html
---

## Um... What am i looking at?

This is a Demostration of Using Monte Carlo Method in Classical [BlackJack](https://en.wikipedia.org/wiki/Blackjack) environment as defined in Sutton and Buttao.

Here, At each time step we are also logging all the events at each round of blackjack. We can play with controls to understand whats going on at each time step.

## What is Monte Carlo Method?

> Unlike DPs, Monte Carlo Methods rely solely on the sample sequences of states, actions, and reward obtained from the environment to calculate their value estimates by simply averaging the sample returns for each state-action pair.
* MC Methods computes/update there value estimates and policies after the end of each episode.


Advantage of using Monte Carlo Methods:
* Doesn't require complete knowledge of the environment
* Takes less memory
* Can compute optimal policies.
* unlike DPs, the computational expense of estimating the value of a single state is independent of the number of states.

## Monte Carlo Prediction

* **first-visit MC Method** estimates $$v_\pi(s)$$ as the average of the returns following first visits to $$s$$ at each episode.
* **Every-visit MC Method** simply averages the returns following all visits to $$s$$.
* both of them converge to $$v_\pi(s)$$ as the number of visits (or first visits) to $$s$$ goes to infinity.
* ASIDE: we can verify the convergence in the case of first-visit MC Method by observing that *the first-visit MC Method the return is an i.i.d distributed estimate of $$v_\pi(s)$$ with finite variance*.
* the MC-method is preferred over DPs even if we have complete knowledge of our environment because, in DP, all of the probabilities must be computed *before* DP can be applied which requires a lot of computation.

### backup Diagram of MC-methods
* for MC estimation of $$v_\pi$$, the root is a state node, and below it is the entire trajectory of transitions in a particular episode, ending at the terminal state as shown in the fig below

<div style="margin: 0 auto; text-align: center">
    <img src="{{site.url}}/assets/img/posts_imgs/monteCarlo/body/backupDiag.png"  width="400px" />
</div>


* Monte Carlo methods *do not bootstrap*!.

## Monte Carlo Estimation of Action Value

> Without a model of the environment its important to estimate the state-action pairs in order to estimate the policy.
  
* Complication with estimating action-value:- it turns out that it's hard to accurately estimate the state-action pairs because it can be the case that for some deterministic policy $$\pi$$ many state-action pairs may never be visited and hence we can't average their returns which means we can't improve our estimates of these action with experience...

* **exploring start**: we can tackle this issue, by specifying that the episodes start in a state-action pair and that * every pair has a nonzero probability of being selected as the start. * This guarantees that all state-action pairs will be visited an infinite number of times in the limit.
* alternatively, we can assure that all state-action pairs are encountered is to consider only policies that are stochastic with a non-zero probability of selecting all actions in each state.

## Monte Carlo Control

* By following the same Generalized policy iteration method we can approximate optimal policies. 
  * More precisely, we can perform policy evaluation by experiencing many episodes and approximate action-value function which will eventually lead to true action-value function.
  * Whereas, the policy improvement is done by making the policy greedy with respect to the current value function and* because we have an action-value function we don't need any model to construct our greedy policy *:- $$\pi(s) = \operatorname{argmax}_a q(s, a)$$
  * If we look at the policy improvement theorem we know that we will systematically get better and better policy and eventually, this entire process converges to the optimal policy.

* To assure convergence, we have to make 2 unlikely assumption
  * one was that the episodes have **exploring starts**
  * policy evaluation could be done with an infinite number of episodes.
* we can get rid of the second assumption by simply give up trying to complete the policy evaluation before returning to policy improvement.
  * **In-place value iteration**:- here, we take the above idea to extreme i.e, for every state we perform policy evaluation only once and then do policy improvement.

* for Monte-Carlo policy iteration we first generate the episode than after then we perform policy evaluation and the improvement at all the states visited in the episode by using there respective observed returns. (the full algorithm is given below)



<div style="margin: 0 auto; text-align: center">
    <img src="{{site.url}}/assets/img/posts_imgs/monteCarlo/body/MonteCarloESAlgo.png"  width="800px" />
</div>



## Monte Carlo without Exploring Starts.

> The only general way to ensure that all actions are selected infinitely often is for the agent to continue to select them. 

* there are 2 approaches to ensure the above statement:-
  * **On-policy methods**:- On-policy methods attempt to evaluate or improve the policy that is used to make decisions.
  * **Off-policy methods**: This method evaluates or improve a policy different from that used to generate the data.
* In on-policy control methods the policy is generally *soft* meaning that $$\pi$$(a&#124;s) for all $$s \in S$$ and all $$a \in \mathcal{A}(s)$$, but gradually shifted closer and closer to a deterministic optimal policy.
  
* since the GPI require only to move the policy towards a greedy policy we can improve our $$\epsilon$$-soft policy $$\pi$$ by moving it only to an $$\epsilon$$-greedy policy which is guaranteed to be better than or equal to $$\pi$$.


<div style="margin: 0 auto; text-align: center">
    <img src="{{site.url}}/assets/img/posts_imgs/monteCarlo/body/onPolicyFirstVisitMCControlAlgo.png"  width="800px" />
</div>


* It's important to note that in the limit, we only achieve the best policy among the $$\epsilon$$-soft policies, but the advantage of this method is that we have completely eliminated the assumption of exploring starts.

## Off-Policy Prediction via Importance Sampling

* The On-policy Method learns action values not for the optimal policy, but for a near-optimal policy that still explores.
* in Off-Policy Method we use *2 policy* instead,
  * **target Policy**: The policy we want to learn
  * ** behavior policy**: the policy used to generate behavior
* because we have a different policy to generate our behavior we can make our policy such that it never assigns 0 probability to any action.
* because we have a different policy to generate our data the off-policy methods are *often of greater variance and slower to converge*.
*  We apply importance sampling to off-policy learning by weighting returns according to the relative probability of their trajectories occurring under the target and behavior policies, called the **importance-sampling ratio**.
*  To estimate $$v_\pi(s)$$, we simply scale the returns by the ratios and average the results.

$$ V(s) = \frac{\sum_{t \in \mathit{T}(s) {\rho_t : T(t) -1 G_t}}}{|\mathit{T}(s)|}$$

* When importance sampling is done as a simple average like above, its called **ordinary importance sampling**
  * they are generally unbiased
  * variance of the ratios can be unbounded
* If we use weighted average to estimate our value function then its called **weighted importance sampling**

  $$V(s) \doteq \frac{\sum_{t \in \mathcal{T}(s)} \rho_{t: T(t)-1} G_{t}}{\sum_{t \in \mathcal{T}(s)} \rho_{t: T(t)-1}}$$

  * weighted importance sampling is biased although the bias converges asymptotically to zero.
  * assuming returns are bounded then the variance of weighted importance sampling estimator converges to zero even if the variance of the ratios themselves is infinite


* in practice, weighted importance sampling is strongly preferred then ordinary importance sampling.

<div style="margin: 0 auto; text-align: center">
    <img src="{{site.url}}/assets/img/posts_imgs/monteCarlo/body/importanceSamplingComparison.png"  width="800px" />
</div>

## Incremental Implementation of Monte Carlo Prediction

* For implementing on-policy MC prediction we can simply extend the technique described in section 2.4 where instead of averaging the rewards, we average "returns".

* For Off policy MC prediction with Ordinary Importance Sampling, *we simply average the scaled returns* instead of rewards
* In the case of weighted importance sampling we take the weighted average of our returns in order to calculate our value function:-
instead of averaging the rewards, here, we average "returns".

  $$
  V_{n} \doteq \frac{\sum_{k=1}^{n-1} W_{k} G_{k}}{\sum_{k=1}^{n-1} W_{k}}, \quad n \geq 2
  $$

  and incrementally update our value function $$V_n$$ as we obtain $$G_n$$. here, we need to maintain the record of $$V_n$$ as well as of the cumulative sum of the weights $$C_n$$. which means our final update rule is:-

  $$
  V_{n+1} \doteq V_{n}+\frac{W_{n}}{C_{n}}\left[G_{n}-V_{n}\right], \quad n \geq 1
  $$
  where, 
  $$
  C_{n+1} \doteq C_{n}+W_{n+1}
  $$


* We can apply this technique to the on-policy case as well, *simply by assuming the behavior and target policies to be equal*. 

<div style="margin: 0 auto; text-align: center">
    <img src="{{site.url}}/assets/img/posts_imgs/monteCarlo/body/offPolicyMCPrediction.png"  width="800px" />
</div>

## Off-policy Monte Carlo Control

* Off-policy MC Control follows the behavior policy while learning about and improving the target policy. 
* the behavior policy must have a nonzero probability of selecting all actions that might be selected by the target policy i.e, * for convergence, it must be soft*.

<div style="margin: 0 auto; text-align: center">
    <img src="{{site.url}}/assets/img/posts_imgs/monteCarlo/body/offPolicyMCControl.png"  width="800px" /> 
</div>

* *NOTE:* if nongreedy actions are common in the actual policy then learning will be slow! which is the reason why we use alternative methods like TD learning etc.
