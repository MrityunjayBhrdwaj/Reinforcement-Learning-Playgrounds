


function updateGraphViz(){


  const myNodes = [];
  const myEdges = [];

  const vFns = model.getValueFns().map((v)=>{
    const range = {min: Math.min(...model.getValueFns()), max: Math.max(...model.getValueFns()) }; 
    return remap(v, range.min, range.max, 0, 1);
  }); 
  const policy = model.getPolicy();
  const reward = new Array( gridSize*gridSize ).fill(0).map((_,i)=>{
    // return env.P[i].map((s)=> s.reward)

    return newRewardFn(_,_,i)
  })

  // the state node radius is defined by the relative reward of reaching that state.
  const nodeSize = reward.map((v)=>{

    const range = {min: Math.min(...reward), max: Math.max(...reward) }; 
    return remap(v, range.min, range.max+0.001, 35, 85);
  })

  console.log(reward, nodeSize)


  for(let i = 0;i< gridSize;i++){
    for(let j = 0;j< gridSize;j++){

      const cState = i*gridSize + j;

      const cFn =  vFns[cState];

      if(isWallState(cState))continue;

      myNodes.push(
        {
          data: {id: cState+'' }, 
          style: {
            'width':  nodeSize[cState], 
            'height': nodeSize[cState], 
            shape: (isTerminalState(cState))? 'rectangle' : '',
            'background-color' : (isTerminalState(cState) === true)? darkModeCols.blue(0) : `hsl(0, ${100*cFn}%, 50%)`,
            'line-color' : 'black', 
            'border-width':2,
            'text-halign': 'center',
            'text-valign': 'center',
            'color': 'white',
            'font-weight': '800',
            'text-justification': 'center',
            'text-margin-y' : 2,
            'label': cState,
          }
      })


      if(!isTerminalState(cState)){
        myNodes.push({data: {id: cState+'_Up'}})
        myNodes.push({data: {id: cState+'_Right'}})
        myNodes.push({data: {id: cState+'_Down'}})
        myNodes.push({data: {id: cState+'_Left'}})

      }


    }
  }

  for(let i = 0;i< gridSize;i++){
    for(let j = 0;j< gridSize;j++){

      const cIndex = i*gridSize + j;
      const cState = env.P[cIndex];
      const cPolicy = policy[cIndex];

      // { data: { source: '4', target: '4L' } },
      // { data: { source: '4L', target: '6' } },

      if(!(isTerminalState(cIndex) || isWallState(cIndex))){

        myEdges.push({data: {source: cIndex+'', target: cIndex+'_Up'}, style: {'line-color': `rgb(0, ${255*cPolicy[0]}, 0)`,}  })
        myEdges.push({data: {source: cIndex+'_Up', target: cState[0].nextStateIndex+''}, style: {'line-color': `rgb(0, ${255*cPolicy[0]}, 0)`,}})

        myEdges.push({data: {source: cIndex+'', target: cIndex+'_Right'}, style: {'line-color': `rgb(0, ${255*cPolicy[1]}, 0)`,}})
        myEdges.push({data: {source: cIndex+'_Right', target: cState[1].nextStateIndex+''}, style: {'line-color': `rgb(0, ${255*cPolicy[1]}, 0)`,}})

        myEdges.push({data: {source: cIndex+'', target: cIndex+'_Down'}, style: {'line-color': `rgb(0, ${255*cPolicy[2]}, 0)`,}})
        myEdges.push({data: {source: cIndex+'_Down', target: cState[2].nextStateIndex+''}, style: {'line-color': `rgb(0, ${255*cPolicy[2]}, 0)`,}})

        myEdges.push({data: {source: cIndex+'', target: cIndex+'_Left'}, style: {'line-color': `rgb(0, ${255*cPolicy[3]}, 0)`,}})
        myEdges.push({data: {source: cIndex+'_Left', target: cState[3].nextStateIndex+''}, style: {'line-color': `rgb(0, ${255*cPolicy[3]}, 0)`,}})

      }

    }
  }

  var cy = window.cy = cytoscape({
    container: document.getElementById('cy'),
      zoom: 5,
      maxZoom: 2,
      minZoom: .4,

    boxSelectionEnabled: false,

    layout: {
      // name: 'cola',
      name: 'cose-bilkent',
      fit: true,
      tile: true,
      // name: 'breadthfirst',
      nodeRepulsion: 4100,
      tilingPaddingVertical: 5,
      tilingPaddingHorizontal: 5,
      // idealEdgeLength: function( edge ){ return 32; },
      // nestingFactor: 1.2,
      numIter: 10500,
        gravity: 0.25,
      roots: '#0',
        directed: true,
        padding: 10
    },

    style: [
      {
        selector: 'core',

        style: {
          'background-color': 'green'
        }
      },
      {
        selector: 'node',
        style: {
          'background-color': '#555',
          'width' : 10,
          'height' :10 ,
        }
      },

      {
        selector: 'edge',
        style: {
          'width': 2,
          'target-arrow-shape': 'triangle',
          // 'line-color': '#9dbaea',
          // 'target-arrow-color': '#9dbaea',
          'curve-style': 'bezier'
        }
      },

  { 
    selector: '.highlighted',
    style: {
            'background-color': '#61bffc',
            'line-color': '#61bffc',
            'target-arrow-color': '#61bffc',
            'transition-property': 'background-color, line-color, target-arrow-color',
            'transition-duration': '0.5s'
    }
  },
  { 
    selector: '.cHighlight',
    style: {
            'background-color': 'red',
            'line-color': 'red',
            'target-arrow-color': 'red',
            'transition-property': 'background-color, line-color, target-arrow-color',
            'transition-duration': '0.5s'
    }
  },
      
    ],

    elements: {
      nodes: myNodes,
      edges: myEdges
    }
  });


  var bfs = cy.elements().dfs('#0', function(){}, true);

  console.log(bfs.path)
  var i = 1;
  var highlightNextEle = function(){
    if( i < bfs.path.length ){


      bfs.path[i].removeClass('highlighted');
      bfs.path[i].addClass('cHighlight');

      i++;


      var collection = cy.collection();
      collection.union(bfs.path[i-1])
      collection.union(bfs.path[i])
      collection.union(bfs.path[i+1])
      // cy.fit(bfs.path[i-1], bfs.path[i], bfs.path[i+1]).duration(1000)
      // easing: 'ease-in-sine'

      cy.animation({fit: {eles: bfs.path[i-1]}, duration: 500, ease: 'ease-in-out'}).play()
      // cy.fit(collection)
      // cy.animation({zoom: 1.0,}, {duration:1000, transition: 'width 2s linear 1s'}).play()
      setTimeout(
      ()=>{

        bfs.path[i-1].removeClass('cHighlight');
        bfs.path[i-1].addClass('highlighted');
        highlightNextEle();

      } 
      , 500);
    }
  };

  // kick off first highlight
  // highlightNextEle();



}

updateGraphViz();