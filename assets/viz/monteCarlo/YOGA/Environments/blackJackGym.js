// TODO for yoga lib: 
// try to find a way to generalize the render function with different tech like canvas, webgl, svg etc.
// Create a render method which do everything that you are doing in the mc-viz.js.




function cmp(a, b){
    return ( a > b)*1 - (a < b)*1
}

// 1 = Ace, 2-10 = Number cards, Jack/Queen/King = 10
const deck = new Array(10).fill(0).map((_,i)=>i+1)
deck.push(...[10,10,10]);


/**
 * drawing a card randomly and if drawHand === True then draw another card
 * @param {boolean} drawHand 
 * @return {Array}
 */
function drawCard(drawHand = false){
    const rndIndex = Math.floor(Math.random()*(deck.length));
    let rndCards = deck[rndIndex];

    if (drawHand){
        const rndIndex = Math.floor(Math.random()*(deck.length));
        rndCards = [rndCards, deck[rndIndex]];
    }

    return rndCards;
}

/**
 * do i have an Ace ? if yes, can i use it without exceeding the sum > 21
* @param {Array} hand 
 * @return {boolean} 
 */
function usableAce(hand){
    // console.log(hand);
    return (hand.indexOf(1) !== -1) && ((_.sum(hand) + 10) <= 21)
}

/**
 * return the current hand total and if we have a usable then add 10
 * @param {Array} hand 
 * @return {number}
 */
function sumHand(hand){
    return _.sum(hand) + (usableAce(hand))*10;
}

/**
 * check if our hand is busted or not
 * @param {Array} hand 
 * @returns {boolean}
 */
function isBust(hand){
    return sumHand(hand) > 21
}

/**
 * what is the current score of our hand ( 0 if busted)
 * @param {Array} hand 
 * @return {number}
 */
function score(hand){
    return (isBust(hand))? 0 : sumHand(hand);
}

/**
 * return true if our first 2 card is an ace and a 10 card 
 * @param {Array} hand 
 * @return {boolean}
 */
function isNatural(hand){
    return _.sortBy(hand) === [1, 10];
}

class BlackJackEnv{
    constructor (nautral = false) {
        this.player = [];
        this.dealer = [];
        this.nA = 2;
        this.nautral = nautral;

        this.reset();
    }

    reset(){
        this.dealer = drawCard(/* draw Hand */1);
        this.player = drawCard(/* draw Hand */1);

        while(sumHand(this.player) < 12)
            this.player.push(drawCard());

        return this._getObs();
    }

    step(action){
        let isDone = false;
        let reward = 0;

        if (action){
            this.player.push(drawCard());

            if (isBust(this.player)){
                isDone = true;
                reward = -1;
            }
            else{
                isDone = false;
                reward = 0;
            }
        }
        else{
            // stick!
            isDone = true;
            while(sumHand(this.dealer) < 17){
                this.dealer.push(drawCard());
            }
            reward = cmp(score(this.player), score(this.dealer)) ;
            if(this.natural && isNatural(this.player) && reward === 1)
                reward = 1.5;

        }
            return { observation: this._getObs(), reward, isDone, cardUsed: {dealer: this.dealer, player: this.player} }

    }
    
    render(){

    }

    _getObs(){
        return { playerScore: sumHand(this.player), dealerScore: this.dealer[0], usableAce: usableAce(this.player) }
    }


}