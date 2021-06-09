
// TODO:
// create UI for algorithm control
// add backup diagram

// DONE:
//make the next Step btn workable
// add episode log on the side
// style :- score board , (maybe add dealer and player character?) and use the dialog ' hit or stay' when taking action
// if isPause then don't play the animation just wait for the next key press

function breakIntoSubStep(ep,cards){
  // step 1) reset:- has atleast 2 cards then player needs to take more cards untill sum >= 12
  // step 2 ) playerAction (if hit)
  //    step 3) draw that card
  // repeat step 2 and 3 untill player stay ( lets say player hit for n times)
  // step n+1) playerAction Stay
  // step n+2) dealer will draw One card at each step untill it run out

  const steps = [];

  let cStep = 1;
  let epStep = 0;

  // copying our hands
  let playerHand = cards.player.slice();
  let dealerHand = cards.dealer.slice();

  // the reset phase
  steps[0] = {dealerHand: [], playerHand: []};

  // fetching the first 2 cards
  steps[0].dealerHand = dealerHand.splice(0, 2)
  steps[0].playerHand = playerHand.splice(0, 2)

  // fetching all the other cards if the sum of player hand < 12
  let playerHandSum  = _.sum(steps[0].playerHand);
  let dealerHandSum  = _.sum(steps[0].dealerHand);
  while(sumHand(steps[0].playerHand) < 12 ){
    const playerCard = playerHand.shift();
    steps[0].playerHand.push( playerCard );
  }

  steps[0] = {state: steps[0]}


  while(true){

    // make action selection as a step
    console.log(cStep, epStep);
    steps[cStep] = {action: ep[epStep].action};
    cStep++;

    if (ep[epStep].action){

      // if the player hit then draw one more card
      steps[cStep] = {state: {dealerHand: [], playerHand : [(playerHand.shift())]}};
      cStep++;

    }else{

      const dealerCards = dealerHand.map(v=>{return {state: {dealerHand: [v], playerHand: []}}});

      steps.push(...dealerCards)
      cStep += dealerCards.length;
    }

    epStep++;

    if(epStep >= ep.length){
    steps[cStep] = {reward: ep[epStep-1].reward}
      break;
    }
  }

  return steps;

}

function breakIntoSteps(ep, cards){

  // 1) reset:- has atleast 2 cards then player needs to take more cards untill sum >= 12
  // 2) step1:- if player Hit then draw one more card
  // if the player stay then dealer will draw the cards untill its greater then 17 also the untill then the game is over.
  // if this is the last step finish the loop

  // initializing our steps array
  const steps = Array(ep.length+1).fill(0).map(()=>{return {playerHand: [], dealerHand: []}})

  console.log('steps:',steps);
  // copying our hands
  let playerHand = cards.player.slice();
  let dealerHand = cards.dealer.slice();

  // the reset phase

  // fetching the first 2 cards
  steps[0].dealerHand = dealerHand.splice(0, 2)
  steps[0].playerHand = playerHand.splice(0, 2)

  // fetching all the other cards if the sum of player hand < 12
  let playerHandSum  = _.sum(steps[0].playerHand);
  let dealerHandSum  = _.sum(steps[0].dealerHand);
  while(sumHand(steps[0].playerHand) < 12 ){
    const playerCard = playerHand.shift();
    steps[0].playerHand.push( playerCard );
  }

  // steps:-

  for(let i=1;i< ep.length+1;i++){

    if (ep[i-1].action){

      // if the player hit then draw one more card
      steps[i].playerHand.push(playerHand.shift());

    }else{
      // if the player decided to stand then its the last step so just append the rest of the dealerHand
    // if the player stay then dealer will draw the cards untill its <= 17 also the untill then the game is over.

    // let idx = 0;
      // while(sumHand(steps[i].dealerHand) < 17){
      //   steps[i].dealerHand.push( dealerHand.shift() );

      //   console.log('sum:', sumHand(steps[i].dealerHand));

      // }



        steps[i].dealerHand.push( ...dealerHand.splice(0) );

    }
  }

  // verify 
  console.log('HandLength', dealerHand.length, playerHand.length, steps);


  return steps;

}

function randomChoice(arr){
  const n = arr.length;

  return arr[Math.floor(Math.random()*(n))];
}

/********************/
/*  Master Controls */
/********************/

const pausePlayBtn = document.querySelector('#pausePlay');
const nextStepBtn = document.querySelector('#nextStep');
const restartBtn = document.querySelector('#restart')
const episodeLog = document.querySelector('#episodeLogList')

const nEpochElem = document.querySelector('#epoch');
const epsilonElem = document.querySelector('#epsilon');
const noAnimElem = document.querySelector('#noAnim');

let isTrainingEnd = 0;

nEpochElem.onchange = ()=>{
  nEpoch = nEpochElem.value*1-1;

  console.log('istrainingEnd', isTrainingEnd);

  if(isTrainingEnd){
    restartFn();
  }else{
    restart =1;
  }

  console.log('yes its working');
}

nextStepBtn.addEventListener('click', ()=>{

  // when we click the nextStep Btn for the first time
  if (!isNextStep){
   
    // activate the nextStep 
    isNextStep =1;
 
    // also, set the pausePlay btn to pause mode.

    if (!isPause){
      isPause = 1-isPause;
      pausePlayBtn.innerHTML = (isPause)? 'play_arrow' : 'pause';
    }
  }
  else{

    // start going to the next step
    startNextStep = 1;
  }
})

function pausePlayCallback(){
  isPause = 1-isPause;
  pausePlayBtn.innerHTML = (isPause)? 'play_arrow' : 'pause';

  if (isNextStep){
    isNextStep = 0;
    if(!startNextStep)startNextStep = 1; // because the last startNextStep listener might still be waiting for this flag

  }

  console.log('isPause Changed ', isPause);

}
pausePlayBtn.addEventListener('click', pausePlayCallback);

restartBtn.addEventListener('click', ()=>{
  restart = 1;

  // finish all the event listener ( for play/pause and nextStep)
  if(isPause){
    isPause = 1-isPause;
    pausePlayBtn.innerHTML = (isPause)? 'play_arrow' : 'pause';
  }

  if(isNextStep){
    isNextStep = 0;
    if(!startNextStep)startNextStep = 1; // because the last startNextStep listener might still be waiting for this flag
  }

  if(isTrainingEnd)restartFn();


  console.log('restart Button Clicked');
})

function restartFn(){
  cEpisode = 0;
  model = new MC(env,{ discountFactor: 1.0, epsilon: 0.5 }, mcVizCallback);
  model.run( nEpoch, behaviorPolicy = randomPolicy());

}
/***************************************************** */
/*                    VISUALIZATION                    */
/***************************************************** */

let nEpoch = Math.max(nEpochElem.value*1-1, 0);
let delayFac = .3;

// card suite symbol code
const suits = ['\u2660' /* spade */,'\u2665' /* hearts */, '\u2663' /* clubs */, '\u2666' /* diamond */];
const suitsCol = {'\u2660' : 'black' /* spade */,
                  '\u2665' : 'red' /* hearts */, 
                  '\u2663' : 'black'/* clubs */, 
                  '\u2666' : 'red' /* diamond */}

const margin = { top: 0, right: 30, bottom: 130, left:40 },
    width = 800 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

let bjSvg = d3.select("#blackjackArea")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style('background', 'green')
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

const dealerGroup = bjSvg.append('g').attr('id', 'dealer');
const playerGroup = bjSvg.append('g').attr('id', 'player');


// Add X axis
let bjScaleX = d3.scaleLinear()
  .domain([1, 5])
  .range([ 0, width/4 ]);

// Create a Y scale for densities
let bjScaleY = d3.scaleLinear()
  .domain([0, 1])
  .range([ height, 1]);



const cardParams = {
  width: 90,
  height: 120,
  symbolPosTop: {x: 10, y: 95}, // relative to the card
  symbolPosBottom: {x: 80, y: 25}, // relative to the card
  cardGap: 2.3, // relative to the svg scale
}

const dealerOffset = .8;
const trDueration = 1000*delayFac;

let isPause = 0;
let isNextStep = 0;
let startNextStep = 0;
let restart = 0;
// let isDone = 1;

function onPausePlay() {

  return new Promise(resolve=>{

    const intervalId = setInterval(()=>{

      if (!isPause || isNextStep){
        clearInterval(intervalId)
        resolve();
      }

    }, 500)

  })
}

onPausePlay();


function mcVizCallback(ep, fv){
  // console.log('nEpoch', nEpoch, cEpisode);
  if (cEpisode === (Math.max(nEpoch, 1))){
    plotValueFunction();
    console.log('plotting it ', isTrainingEnd);

    isTrainingEnd = 1;
  }else{
    
    // console.log('sdf', isTrainingEnd);
    isTrainingEnd =0;
  }
    cEpisode++;

  if(noAnimElem.checked*1)return;

  return new Promise( async function (resolve, rejects){

    console.log('inside promise of episode'+cEpisode);


      console.log('resolving and logging these after 2000ms',ep, fv);
      const stepsArray = breakIntoSteps(ep, fv);

      const subStepArray = breakIntoSubStep(ep,fv);

      console.log(subStepArray);

      const nCardsPerSteps = {
        player: subStepArray.map((s, _)=>{ if (s.state !== undefined)return s.state.playerHand.length}),
        dealer: subStepArray.map((s, _)=>{ if (s.state !== undefined)return s.state.dealerHand.length}),
        // dealer: subStepArray.map((s, _)=>{return s.dealerHand.length})
      };


      console.log(stepsArray);

      // * reset step
      let playerCardGrpSelection = playerGroup.selectAll('g');
      let dealerCardGrpSelection = dealerGroup.selectAll('g');

      playerCardGrpSelection.remove();
      dealerCardGrpSelection.remove();

      // updating the scores
        
      let cDealerScore = 0;
      let cPlayerScore = 0;

      // data for displaying
      let playerHandData = [];
      let dealerHandData = [];

      let playerHand = [];
      let dealerHand = [];

      const playerSuiteChoice = [];
      const dealerSuiteChoice = [];

      episodeLog.innerHTML = ''


        /* Main Update Function for each step */
       function update(subStepArray, cStep){

        // resetting
        document.querySelector('#hitAction').style.backgroundColor = '';
        document.querySelector('#standAction').style.backgroundColor = '';
        document.querySelector('#hitAction').style.color = 'black';
        document.querySelector('#standAction').style.color = 'black';

        // reintializing
        document.querySelector('#gameStatus').style.opacity = 0.0;
        document.querySelector('#gameStatus').innerHTML = '';

        // updating the episode number
        document.querySelector('#episodeNumber').innerHTML = cEpisode;

        return new Promise((resolve, rejects)=>{
        console.log('start of the promise')

        const cStepObj = subStepArray[cStep];

        // initializing new list element for our episode log
        const newEntry = document.createElement('li');
        if (cStepObj.state){

          const cState = cStepObj.state;


          playerHand.push(...cState.playerHand);
          dealerHand.push(...cState.dealerHand);

          // update cards
          // storing the current state cards to both hands
          playerHandData.push(...cState.playerHand.map(v=>{ 

           if (v ===1)v = 'A'; 
           if(v === 10){
            v = randomChoice([10, 'Q', 'J', 'K']);
          }

          // selecting the suite randomly
           return v+randomChoice(suits);
        })
        )

          dealerHandData.push(...cState.dealerHand.map(v=>{ 
           if (v ===1)v = 'A'; 
           if(v === 10){
              v = randomChoice([10, 'Q', 'J', 'K']);
            }
          // selecting the suite randomly
           return v+randomChoice(suits);
        }))



        console.log('playerHandData: ', playerHandData, ' dealerHandData', dealerHandData);
          // reselecting all the group tag
          playerCardGrpSelection = playerGroup.selectAll('g');


          // logging the state

          if (cStep == 0){

            if (cState.playerHand.length === cState.dealerHand.length){
              newEntry.innerHTML = `In the beginning, They both draw 2 cards`
            }else{
              newEntry.innerHTML = `In the beginning, dealer draw ${cState.dealerHand.length} and  player draw ${cState.playerHand.length} cards because the sum of must be > 12 for player `
            }

            console.log('inside first new Entry');

          }else{
            if(cState.playerHand.length){
              newEntry.innerHTML = `player draw <span style="color: ${suitsCol[playerHandData.slice(-1)[0].slice(-1)]}">${playerHandData.slice(-1)}</span>`
            }

            if (cState.dealerHand.length){
              newEntry.innerHTML = `Now, dealer draw <span style="color: ${suitsCol[dealerHandData.slice(-1)[0].slice(-1)]}">  ${dealerHandData.slice(-1)}</span>`
              // newEntry.innerHTML = `Now, dealer draw style="color: red;">${dealerHandData.slice(-1)}</span>`

            }
          }



          // creating the player card group which contain all the svg elems of our cards
          const playerCardGrp = playerCardGrpSelection
          .data(playerHandData)
          .enter()
            .append('g')
            .merge(playerCardGrpSelection)
            .attr('class', 'playerCards')
            .attr('font-weight', '700')
            .attr('text-anchor', 'start')
            .attr('font-size', '16')
  
            // appending the card shape (rect)
            playerCardGrp
            .append('rect')
              .attr('class', 'card')
              .attr('width', cardParams.width)
              .attr('height', cardParams.height)
              .attr('rx', 5)
              .attr('ry', 5)
              .attr('fill', 'white')
            

            // appending card name to player card group

            // top card value
            playerCardGrp
            .append('text')
              .attr('x', cardParams.symbolPosTop.x)
              .attr('y', cardParams.height - cardParams.symbolPosTop.y )
              .text(d=>d)
              .attr('fill',d=>suitsCol[d.slice(-1)])

            // bottom card value
            playerCardGrp
            .append('text')
              .attr('x', cardParams.symbolPosBottom.x)
              .attr('y', cardParams.height - cardParams.symbolPosBottom.y )
              .attr('transform-origin',
                 cardParams.symbolPosBottom.x+' '+(cardParams.height - cardParams.symbolPosBottom.y )
                )
              .style('transform', 'rotate(180deg)')
              .attr('fill', d=>suitsCol[d.slice(-1)])
              .text(d=>d)


              // draw card animation
              playerCardGrp
              .transition()
              .duration((_,i)=>{return trDueration})
              .attr('transform',
              (_,i)=>{
                return 'translate('+
                  bjScaleX(1+ i*cardParams.cardGap)  +','+
                  bjScaleY(0.0)+')'
                }
              );


          // reselecting all the group tag
          dealerCardGrpSelection = dealerGroup.selectAll('g');

          // creating the dealer card group which contain all the svg elems of our cards
          const dealerCardGrp = dealerCardGrpSelection
          .data(dealerHandData)
          .enter()
            .append('g')
            .merge(dealerCardGrpSelection)
            .attr('class', 'dealerCards')
            .attr('font-weight', '700')
            .attr('text-anchor', 'start')
            .attr('font-size', '16')

            // appending the card shape (rect)
            dealerCardGrp
            .append('rect')
            .attr('class', 'card')
            .attr('width', cardParams.width)
            .attr('height', cardParams.height)
            .attr('rx', 5)
            .attr('ry', 5)
            .attr('fill', 'white')

            // appending card name to dealer card group
            dealerCardGrp
            .append('text')
              .attr('x', cardParams.symbolPosTop.x)
              .attr('y', cardParams.height - cardParams.symbolPosTop.y )
              .attr('fill', d=>suitsCol[d.slice(-1)])
              .text(d=>d)

            dealerCardGrp
            .append('text')
              .attr('x', cardParams.symbolPosBottom.x)
              .attr('y', cardParams.height - cardParams.symbolPosBottom.y )
              .attr('transform-origin',
                 cardParams.symbolPosBottom.x+' '+(cardParams.height - cardParams.symbolPosBottom.y )
                )
              .style('transform', 'rotate(180deg)')
              .attr('fill', d=>suitsCol[d.slice(-1)])
              .text(d=>d)

              // draw card animation
              dealerCardGrp
              .transition()
              .duration((_,i)=>{return trDueration})
              .attr('transform',
              (_,i)=>{
                return 'translate('+
                  bjScaleX(1+ i*cardParams.cardGap)  +','+
                  bjScaleY(dealerOffset)+')'
                }
              );



          // updating the score board
          cPlayerScore = sumHand(playerHand);
          cDealerScore = sumHand(dealerHand);
          document.querySelector('#playerScore').innerHTML = `Player Score: ${cPlayerScore}`;
          document.querySelector('#dealerScore').innerHTML = `Dealer Score: ${cDealerScore}`;


          // placeholder animation


          // TODO: find a way in which it only resolves after finishing all the d3 transitions
          setTimeout(()=>{

            console.log('end of the promise from state block',
            'cStep: '+ cStep);
            resolve(restart); 
          
          },2000*delayFac)

        }
        if(cStepObj.action != undefined){
          // play playerAction animation


          if (cStepObj.action ){
            // document.querySelector('#playerAction').innerHTML = ':'+'Hit!';

            document.querySelector('#hitAction').style.backgroundColor = 'red';
            document.querySelector('#hitAction').style.color = 'white';

            newEntry.innerHTML = `player Hit`


          }else{
            // document.querySelector('#playerAction').innerHTML = ':'+'Stand!';

            document.querySelector('#standAction').style.backgroundColor = 'red';
            document.querySelector('#standAction').style.color = 'white';

            newEntry.innerHTML = `player has decided to stay`
          }

          if (!isPause){

          // for animation
          setTimeout(()=>{
            // resetting
            document.querySelector('#hitAction').style.backgroundColor = '';
            document.querySelector('#standAction').style.backgroundColor = '';
            document.querySelector('#hitAction').style.color = 'black';
            document.querySelector('#standAction').style.color = 'black';

            console.log('end of the promise from action block',
            'cStep: '+ cStep);
            // move to the next step!
            resolve(restart); 
          }
        , 1000*delayFac);

          }else{
            console.log('end of the promise from action block',
            'cStep: '+ cStep);
            // move to the next step!
            resolve(restart); 

          }
        }

        if(cStepObj.reward != undefined){
          // play the final Credits

          document.querySelector('#gameStatus').style.opacity = 0.9;
          document.querySelector('#gameStatus').innerHTML = 'Status: '+( (cStepObj.reward === -1)? 'Dealer Wins!' : 'player Wins!');

          if (cStepObj.reward === -1){
            // cases:- if (cPlayerScore > 21)
            // if(cPlayerScore < 21 && cDealerScore < 21 ) if(cPlayerScore < cDealerScore)

            if(cPlayerScore > 21){
              newEntry.innerHTML = `Since, the sum of player's Hand (${cPlayerScore}) is greater then 21. it's Busted! `
            }else{

              if(cPlayerScore < cDealerScore){
                newEntry.innerHTML = `Since, the sum of player's Hand (${cPlayerScore}) is smaller then dealer's Hand (${cDealerScore}). Dealer Wins! `
              }else{
                throw new Error('here, cPlayerScore < 21 and return is -1 also, cPlayerScore => cDealerScore... so, in which situation this can happen?')
              }
              
              
            }
          }else{
            if (cPlayerScore > 21){
              newEntry.innerHTML = `Since, the sum of dealer's Hand (${cDealerScore}) is greater then 21. the dealer is Busted!... Player Win!! `
            }else{

              newEntry.innerHTML = `Since, the sum of player's Hand (${cPlayerScore}) is greater then dealer's Hand (${cDealerScore}). Player Win!! `

            }
            // cases:- if(cDealerScore > 21)
            // if( cPlayerScore < 21 && cDealerScore < 21 ) if( cDealerScore < cPlayerScore )
          }


          // animation 
          if(!isPause){

            setTimeout(()=>{

              // reintializing
              document.querySelector('#gameStatus').style.opacity = 0.0;
              document.querySelector('#gameStatus').innerHTML = '';

              console.log('end of the promise from reward block', 
              'cStep: '+ cStep);
              resolve(restart); 
            }, 1000*delayFac)
          }
          else{
            console.log('end of the promise from reward block but the episode is still at pause',
              'cStep: '+ cStep);
            resolve(restart);
          }
        }

          episodeLog.appendChild(newEntry);

        });


      }



      /* Main episode step loop!  */
      // for(let cStep=0;cStep<subStepArray.length;cStep++){

      let cStep = 0;
      while(cStep < subStepArray.length){

        console.log('----------------new-step------------------', cStep);

        // if we have paused and haven't clicked on the next step btn
        if (isPause && !isNextStep){

          console.log('inside 1st code block'+ cStep);
          // wait for it to over then update

        // if (isDone)
          await onPausePlay();
          await update(subStepArray, cStep);
        }else{

          console.log('inside 2nd code block'+ cStep);
          await update(subStepArray, cStep);

        }

        if (restart)break;

        if (isNextStep){

          await (()=>{

            return new Promise(resolve=>{

              const intervalId = setInterval(()=>{

                // wait until we click the next step btn
                if (startNextStep){
                  clearInterval(intervalId)
                  resolve();
                  startNextStep = 0;
                }

              }, 500)

            })
          })()
          cStep++;
        }else{

          cStep++;
        }

      }


      console.log('end of the for loop')
      console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$')

      // plot the value functions
      plotValueFunction();

      // resolve with a flag to terminate the training
      resolve(restart);
      if (restart){

        restartFn();
      }
      restart=0;

  })


}








let cEpisode = 0;

const env   = new BlackJackEnv();

let model = new MC(env, { discountFactor: 1.0 }, mcVizCallback);

function randomPolicy(){
  A = tf.ones([env.nA, 1]).div( env.nA).flatten().arraySync();
  return function(observation){
    return A;
  }
}

model.run( nEpoch, behaviourPolicy = randomPolicy());

/* Visualizing the action-value functions:- */

function plotValueFunction(){

  let minPlayerScore = 1000; 
  let maxPlayerScore = -1000; 
  let minDealerScore = 1000; 
  let maxDealerScore = -1000;

  model.getQValues().items().forEach((arr,i)=> {
      let cState = arr[0]; 
      minPlayerScore = Math.min(minPlayerScore, cState.playerScore); 
      maxPlayerScore = Math.max(maxPlayerScore, cState.playerScore); 
      minDealerScore = Math.min(minDealerScore, cState.dealerScore); 
      maxDealerScore = Math.max(maxDealerScore, cState.dealerScore)
    }
  )

  const div = {x: Math.abs(minPlayerScore - maxPlayerScore) + 1, y: Math.abs(minDealerScore - maxDealerScore)+1} 
  let xRange = tf.linspace(minPlayerScore, maxPlayerScore + 0, div.x).flatten().arraySync();
  let yRange = tf.linspace(minDealerScore, maxDealerScore + 0, div.y).flatten().arraySync();

  let mGrd = meshGrid(xRange, yRange)

  console.log(xRange, yRange, div, mGrd);
  let a = tf.tensor(mGrd).reshape([mGrd.length*mGrd[0].length,2]).arraySync().map(
    (a,_)=> {
      let actionValue = model.getQValues().get(
        {
          playerScore: Math.floor(a[0]), 
          dealerScore: Math.floor(a[1]), 
          usableAce: false 
        }
      );
      actionValue = (actionValue === -1 )? [0,0] : actionValue;

      return Math.max(...actionValue);
    }
  )
  let b = tf.tensor(mGrd).reshape([mGrd.length*mGrd[0].length,2]).arraySync().map(
    (a,_)=> {
      let actionValue = model.getQValues().get(
        {
          playerScore: Math.floor(a[0]), 
          dealerScore: Math.floor(a[1]), 
          usableAce: true 
        }
      );
      actionValue = (actionValue === -1 )? [0,0] : actionValue;

      return Math.max(...actionValue);
    }
  )

  a = tf.tensor(a, [mGrd.length, mGrd[0].length]).arraySync();
  b = tf.tensor(b, [mGrd.length, mGrd[0].length]).arraySync();


  console.log(xRange, yRange );

  const valueFnNoAceVizData = [{
    x: xRange,
    y : yRange,
    z : a,
    type: 'contour',

    colorscale : [[0, darkModeCols.blue()], [0.25, darkModeCols.purple()],[0.5, darkModeCols.magenta()], [.75, darkModeCols.yellow()], [1, darkModeCols.red()]],
  }];
  
  const valueFnAceVizData = [{
    x: xRange,
    y : yRange,
    z : b,
    type: 'contour',

    colorscale : [[0, darkModeCols.blue()], [0.25, darkModeCols.purple()],[0.5, darkModeCols.magenta()], [.75, darkModeCols.yellow()], [1, darkModeCols.red()]],

  }];

  const layoutSetting = {
      title : 'Value Function (No Ace) Plot',
      font : {
          size : 15,
          color: 'white',
          family : 'Helvetica'
      },
      paper_bgcolor : '#222633',


  }
  const layoutSetting1 = {
      title : 'Value Function (Ace) Plot',
      font : {
          size : 15,
          color: 'white',
          family : 'Helvetica'
      },
      paper_bgcolor : '#222633',
  }

  Plotly.newPlot('valueFnNoAceViz', valueFnNoAceVizData, layoutSetting);
  Plotly.newPlot('valueFnAceViz', valueFnAceVizData, layoutSetting1);
  
}

// plotValueFunction();



/* Controls */

// register if currt btn is pause or play
let cBtnStatus = 0;
