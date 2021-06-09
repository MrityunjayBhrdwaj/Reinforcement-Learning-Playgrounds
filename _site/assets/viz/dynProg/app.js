// TODO: 
// update the graphViz on each epoch
// create a hover panel which shows all the information.
// ? check if something is breaking the code.. ( test the code)
// add parameters control
// add timeline controls
// create the final layout

// DONE: 
// fix the change reward value UI
// correctly represent the directions 
// edit mode for grid world inspired by karpathy for mutating the reward for that state
// add support for custom rewards in gridWorld environment
// clean up the UI and make it consistent

// HyperParams
let gridSize = 5;
const delayFac = 1;
const wallStateArray = []; // LUT for wall states
const terminalStateArray = []; // LUT for therminal states
const rewardArray = [];
let isEditMode = 0; // viz state flags


// grid world environment defaults
const svgDims = {width: 600, height: 600};
const dirIcons = ['arrow_upward', 'arrow_forward', 'arrow_downward', 'arrow_backward'];
const dirTranforms = [[-20, -10], [0, 10], [-20, 30], [-40, 10]]

let cellSelection = d3.selectAll('.cell');

// DOM elements
const editModeBtnElem = document.querySelector('#editMode');
const gridSizeSliderElem = document.querySelector('#gridSize');

gridSizeSliderElem.addEventListener('input', ()=>{
  gridSize = +gridSizeSliderElem.value;

  console.log('gridSize Changed', gridSizeSliderElem.value);

  if(isEditMode)
    updateViz();
})

// Event Handling
editModeBtnElem.addEventListener('click', ()=>{
  isEditMode = 1-isEditMode;
  console.log('editMOde', isEditMode)

  gridSizeSliderElem.style.display = 'none';

  if(isEditMode){
  gridSizeSliderElem.style.display = 'block';

    const cellRectSelection = d3.selectAll('.cellRect');
    const cellDiscSelection = d3.selectAll('.rewardNdDir');
    const cellRewardSel = d3.selectAll('.cellReward');
    const cellDirSel = d3.selectAll('.cellDir');

    // gridSize = 7;

    // Everything should be white accept wall and terminal state.
    cellRectSelection.attr('fill',(v)=>{
      if (v.isTerminalState)return 'blue';
      if(v.isWall)return 'black';
      return 'white'
    } );

    cellRewardSel
    .style('fill', 'black')
    .style('font-size', '1.5em')

    cellDirSel.remove();

    updateViz();

  }else{

    console.log()
    env = new gridWorldEnv_v2([gridSize, gridSize], isWallState, isTerminalState, newRewardFn);

    model = new policyIteration(
      env,
      { discountFactor: 1.0, 
        theta: 0.00001
      }, 
      ()=>{

        updateViz();
      }
    );

    model.run([100, 100]).then(()=>{
        updateGraphViz();
      console.log('finished Iterating')
    });
  }


})

/* RL Model */

// Creating our Environment

// functions for our environment constructor
function isWallState (i){
  return (wallStateArray.indexOf(i) !== -1)
}

function isTerminalState (i){
  return (terminalStateArray.indexOf(i) !== -1)
}

function rewardFn(s, a, nextStateIndex){
  // standard textbook reward scheme
  if ( isTerminalState(nextStateIndex) || isTerminalState(s) || isWallState(s) ){ return 0; }
  return -1;
}


function newRewardFn(s,a,sP){
 return rewardArray[sP] ?? -1;
}

let env = new gridWorldEnv_v2([gridSize, gridSize], isWallState, isTerminalState, newRewardFn);

// init our policy Iteriation Model
let model = new policyIteration(
  env,
  { discountFactor: 1.0, 
    theta: 0.00001 
  }, 
  updateViz
);

// run the policy iteration algorithm
model.run([100, 100]);

// intializing svg
let svg = d3.select('#vizContainer')
  .append("svg")
  .attr('id', 'svgContainer')
  .attr('class', 'material-icons')
    .attr("width", svgDims.width)
    .attr("height",svgDims.height)
    .style('background', '#ddd');

// x and y scales
let xScale = d3.scaleLinear()
  .domain([0, gridSize])
  .range([0, svgDims.width]);

let yScale = d3.scaleLinear()
  .domain([0, gridSize])
  .range([0, svgDims.height]);

// adding group for our gridWorld env
const gridGrp = svg.append('g').attr('id', 'grid')

let cellSize = Math.floor(svgDims.width/gridSize)
const cellSizeFac = 0.95;


let currSelectedElem = null;


  console.log(model.getPolicy()[3])
function updateViz(){

  console.log(model.getPolicy()[3])

// x and y scales
xScale = d3.scaleLinear()
  .domain([0, gridSize])
  .range([0, svgDims.width]);

yScale = d3.scaleLinear()
  .domain([0, gridSize])
  .range([0, svgDims.height]);

cellSize = Math.floor(svgDims.width/gridSize)
  return new Promise(resolve=>{

    /* * Grid Cell visualization */
    let cellPos = (new Array(gridSize**2)).fill(0).map((_,i)=> {

        const coord = index2Coords(i, [gridSize, gridSize]);
        return {
          coords: coord,
          dir: 'none',
          isTerminalState: isTerminalState(i),
          intensity: null,/* relative to valueFns */
          vFn: null,
          reward: rewardArray[i] ?? -1,
          isWall: isWallState(i)
        }
      });

    if (!isEditMode){

      const policy = model.getPolicy();
      const valueFns = model.getValueFns();

      const vFns = valueFns.map((v)=>{
        const range = {min: Math.min(...valueFns), max: Math.max(...valueFns) }; 
        return remap(v, range.min, range.max, 0, 1);
      }); 
      
      cellPos = (new Array(gridSize**2)).fill(0).map((_,i)=> {

        if(!(i > 24 || 0 <= i))
          console.error("invalid Index", i)
        const coord = index2Coords(i, [gridSize, gridSize]);
        return {
          coords: coord,
          dir: policy[i].map((v,i)=>{ if(v !== 0)return dirIcons[i]; return ''}),
          isTerminalState: isTerminalState(i),
          intensity: vFns[i],/* relative to valueFns */
          vFn: valueFns[i].toFixed(1),
          reward: rewardArray[i] ?? -1,
          isWall: isWallState(i)
        }
      });

    }
   

    cellSelection = d3.selectAll('.cell')

    cellSelection.remove();

    // creating grid cell group for each cell
    const cellGrp = gridGrp
    .selectAll('g')
    .data(cellPos)
    .enter()
    .append('g')
    .merge(cellSelection)
    .attr('class', 'cell')
    

    // adding rect
    const cellRectGrp = cellGrp
    .append('rect')
    .attr('class', 'cellRect')
    .attr('width',  cellSize*cellSizeFac)
    .attr('height', cellSize*cellSizeFac)
    .attr('x',v => cellSize*((1-cellSizeFac)/2) + xScale(v.coords[0]))
    .attr('y',v => cellSize*((1-cellSizeFac)/2) + yScale(v.coords[1]))
    .on('click', function(v,i){
            // reset the prev selected tile's style to default
            const cellCtrlElem = document.querySelector('#cellCtrl')

            if (currSelectedElem){
              if (currSelectedElem !== this){
                // cleaning up
                const scoreElem = currSelectedElem.childNodes[1];

                scoreElem.style.display = 'block';

                d3.select(scoreElem)
                .style('transform', 'translate(0,0)')
                .style('text-anchor', 'middle');
            

                d3.selectAll('.cell')
                .attr('opacity', 1);

                currSelectedElem = null;
                cellCtrlElem.innerHTML = '';
                return;
              }
            }

            if (isEditMode){


              // TODO: if the user clicks on the rect then change the state to wall

              // if its a new wall state then include them to your wall state array

              if (wallStateArray.indexOf(i) === -1 && terminalStateArray.indexOf(i) === -1){
                wallStateArray.push(i);

                this.style.fill = `black`
              }
              else if (wallStateArray.indexOf(i) !== -1){
                wallStateArray.pop(i);
                terminalStateArray.push(i);
                
                this.style.fill = `blue`

              }
              else if(terminalStateArray.indexOf(i) !== -1){
                terminalStateArray.pop(i);

                this.style.fill = `white`
              }

            }
    })
    .transition()
    .duration(100*delayFac)
    .ease(d3.easeCubic)
    .attr('fill', (v,i) => {

      if(wallStateArray.indexOf(i) !== -1) return 'black';

      return v.isTerminalState? darkModeCols.blue() : (() => {

        if(isEditMode)return 'white';

        const fac = v.intensity;
        return `hsl(0, ${100*fac}%, 50%)`;
      })()
    })




    const cellDiscGrp = cellGrp
    .append('g')
    .attr('class', 'rewardNdDir')
    .on('click', 
          function (v, cCellIdx){

            const cellCtrlElem = document.querySelector('#cellCtrl')

            if(!isEditMode)return;
            
            if (currSelectedElem){
              if (currSelectedElem !== this){
                // cleaning up
                const scoreElem = currSelectedElem.childNodes[0];

                scoreElem.style.display = 'block';

                d3.select(scoreElem)
                .style('transform', '');
            

                d3.selectAll('.cell')
                .attr('opacity', 1);

                currSelectedElem = null;
                cellCtrlElem.innerHTML = '';
                return;
              }
            }


            // if its a terminal state then dont mutate the rewards values and also remove the prev slider
            if (v.isTerminalState){ cellCtrlElem.innerHTML = '';  return ;}

            currSelectedElem = this;


            // gathering all the elements

            const scoreElem = this.childNodes[this.childElementCount -1];

            d3.select(scoreElem)
            .style('transform',v => `translate(${cellSize*((1-cellSizeFac)/2)*0 + (v.coords[0])*0 + 1}em, 0px)`)
            .style('text-anchor', 'end');

            // on input callback function for our slider to change the values of our reward
            function sliderChange(){

              window.selElm = currSelectedElem;
                d3.select(scoreElem).text(this.value);

                rewardArray[cCellIdx] = +this.value;
            }

            // adding the slider above our cell
            d3.select('#cellCtrl')
            .html(`
          
              <div style="transform: translate(${ xScale(v.coords[0]+0.1)}px, ${  cellSize*((1-cellSizeFac))*1.5 + yScale(v.coords[1] + .5)}px); width: ${cellSize*cellSizeFac*0.8}px;" />
            
              <input id="rangeSlider" type="range" step="0.01" min="-5" max="5" style="width: ${cellSize*cellSizeFac*0.8}px;">
              </div>

            `)
            const rangeSliderElem = document.querySelector("#rangeSlider")
            rangeSliderElem.value = scoreElem.innerHTML;

            rangeSliderElem.addEventListener('input', 
            sliderChange)


            // fade all the other cells

            d3.selectAll('.cell')
            .attr('opacity',(_,idx) => (idx !== cCellIdx)? 0.4 : 1)

          });

    // adding text to show the direction signs ( -> , <- , up and down)

    for(let a=0;a<env.nA;a++){



      cellDiscGrp
      .append('text')
      .attr('class', 'cellDir')
      .attr('x',v => xScale(v.coords[0]+0.5))
      .attr('y',v => yScale(v.coords[1]+0.5))
      .attr('transform',(v,i)=>{

        if(Math.max(...model.getPolicy()[i]) === 1)return `translate(${-20}, ${15})`

        const cTransform = [dirTranforms[a][0], dirTranforms[a][1]];
        if(v.dir[2] === ''){
          cTransform[1]+= 15
        }
          return `translate(${cTransform[0]}, ${cTransform[1]})`
      } 
      )
      .style('font-size', 1.5*(5/gridSize) + 'em')
      .style('fill', 'white')
      .style('display', (isEditMode)? 'none' : '')
      .transition()
      .duration(1000*delayFac)
      .ease(d3.easeCubic)
      .text(v => (v.isTerminalState || v.isWall || isEditMode)? '' : v.dir[a])
    }

    cellDiscGrp
    .append('text')
    .attr('class', 'cellReward')
    .attr('x',v => (isEditMode)? cellSize*((1-cellSizeFac)/2) + xScale(v.coords[0] + .5) : cellSize*((1-cellSizeFac)/2) + xScale(v.coords[0] + .45))
    .attr('y',v => (isEditMode)? cellSize*((1-cellSizeFac))*1.5 + yScale(v.coords[1] + .5) : yScale(v.coords[1] + .8))
    // .style('font-align', 'center')
    .style('text-anchor', 'middle')
    // .attr('transform',v => (isEditMode)?  `translate(${ xScale(v.coords[0]*0)}px, ${yScale(v.coords[1])}px)` : 'translate(0,05)')
    .style('font-family', 'Helvetica')
    .style('font-size',(isEditMode)? 1.5*(5/gridSize) + 'em' : '0.5em' )
    .style('fill',v => (isEditMode || v.isWall)? 'black' : 'white')
    .transition()
    .duration(1000*delayFac)
    .ease(d3.easeCubic)
    .text(v => v.reward);


    setTimeout(()=>{
    resolve(isEditMode);
    }, 1000*delayFac)

  })

}

function editMode(){

}

