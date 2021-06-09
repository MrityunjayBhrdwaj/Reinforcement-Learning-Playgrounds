const qValVizElem = document.getElementById('QvalViz');

var margin = {top: 0, right: 30, bottom: 20, left:20},
    width = 400 - margin.left - margin.right,
    height = 50 - margin.top - margin.bottom;

// append the svg object to the body of the page
let Asvg = d3.select("#QvalViz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

let qValContainerGroup = Asvg.append('g').attr('id', 'qValContainer');

qValContainerGroup
    .attr("transform", "translate(10," + 0 + ")")

let a = Array(nArms).fill(5);
  // Add X axis
  var qValScaleX = d3.scaleLinear()
    .domain([1, nArms])
    .range([ 0, width ]);

  // Create a Y scale for densities
  var qValScaleY = d3.scaleLinear()
    .domain([0, 1])
    .range([ height, 1]);

  Asvg.append("g")
    .attr("transform", "translate(10," + qValScaleY(0) + ")")
    .call(d3.axisBottom(qValScaleX))
    .selectAll("text")
    //   .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

    qValContainerGroup.selectAll('rect')
    .data(a)
    .enter()
        .append('rect')
        .attr('x', (d,i)=>{ return qValScaleX(i+.55)})
        .attr('y', qValScaleY(0.9))
        .attr('width', (width/(nArms-1)))
        .attr('height', qValScaleY(1-0.9))
        .attr('rx', 2)
        .attr('ry', 2)
        .attr('fill', (d, i)=>{ return myColor(allMeans[i])})
        .attr('stroke-width', 2)
        .attr('stroke', 'none');

    qValContainerGroup.selectAll('text')
    .data(a)
    .enter()
        .append('text')
        .attr('text-anchor', 'end')
        .attr('x', (d,i)=>{
            return qValScaleX(i+.3+1)})
        .attr('y', qValScaleY(0.1))
        .text((d,i) =>{return d})
        .attr('fill', 'white')



//   rewardRFSvg.append("text")
//       .attr("text-anchor", "end")
//       .attr("x", width)
//       .attr("y", height+20)
//       .text('N(a)')

function updateQVal(action, rVals){
    console.log('alsdkjflkasjdf', rVals)
    const textSelect = qValContainerGroup.selectAll('text')
    const rectSelect = qValContainerGroup.selectAll('rect')

    textSelect.remove();

    rectSelect.data(rVals)
    .enter().append('rect')
    .merge(rectSelect)
    .attr('stroke', (d,i)=>{return (i === action)? 'red': 'none'})

   qValContainerGroup.selectAll('text') 
    .data(rVals)
    .enter()

        .append('text')
        .attr('text-anchor', 'end')
        .attr('x', (d,i)=>{
            return qValScaleX(i+.3+1)})
        .attr('y', qValScaleY(0.1))
        .text((d,i) =>{return d.toFixed(1)})
        .attr('fill', 'white')

}


function timeAdd(a,b, f){
  let mSec_0 = a[3];
  let sec_0 = a[2];
  let m_0 = a[1];
  let h_0 = a[0];
  
  let mSec_1 = b[3];
  let sec_1 = b[2];
  let m_1 = b[1];
  let h_1 = b[0];

  let mSec_plus = (mSec_0 + mSec_1);
  let mSecRem   = ( mSec_plus ) % 1000;

  let sec_plus  = (sec_0 + sec_1 + (((mSec_plus - 1000) < 0)? 0 : 1 ));
  let secRem    = ( sec_plus ) % 60;
  
  let m_plus  = (m_0 + m_1 + (((sec_plus- 60) < 0)? 0 : 1 ));
  let mRem = ( m_plus ) % 60;

  let h_plus  = (h_0 + h_1 + (((m_plus- 60) < 0)? 0 : 1 ));
  let hRem = ( h_plus ) % 60;

  return `${hRem} : ${mRem} : ${secRem} : ${mSecRem}`
}

timeAdd([0, 4, 24, 398],[0, 7, 21, 337]);
timeSub([0, 11, 45, 735], [0, 4, 24, 398]);
// 398 + 337
// 11 : 45 : 735
// 4: 24: 398
// 7 : 21 : 337

// (11 : 24 : 235) - (4 : 45 : 398) = 6 : 38 : 837 

function timeSub(a,b, f){
  let mSec_0 = a[3];
  let sec_0 = a[2];
  let m_0 = a[1];
  let h_0 = a[0];
  
  let mSec_1 = b[3];
  let sec_1 = b[2];
  let m_1 = b[1];
  let h_1 = b[0];

  let mSec_sub = (mSec_0 < mSec_1)? (mSec_0 + 1000) - mSec_1 : ( mSec_0 ) - mSec_1 

  let sec_sub = (sec_0 < sec_1 )? ( sec_0 + 60) - sec_1 : sec_0 - sec_1;
  sec_sub = (mSec_0 < mSec_1)? sec_sub - 1 : sec_sub;

  let m_sub = ( m_0 < m_1 )? (m_0 + 60) - m_1 : m_0 - m_1;
  m_sub = (sec_0 < sec_1)? m_sub - 1 : m_sub;

  let h_sub = ( h_0 < h_1 )? (h_0 + 24) - h_1 : h_0 - h_1;
  h_sub = (m_0 < m_1)? h_sub - 1 : h_sub;

  return `${h_sub} : ${m_sub} : ${sec_sub} : ${mSec_sub}`
}

function timeAdd(a,b, f){
  let mSec_0 = a[3];
  let sec_0 = a[2];
  let m_0 = a[1];
  let h_0 = a[0];
  
  let mSec_1 = b[3];
  let sec_1 = b[2];
  let m_1 = b[1];
  let h_1 = b[0];

  let mSec_plus = (mSec_0 + mSec_1);
  let mSecRem   = ( mSec_plus ) % 1000;

  let sec_plus  = (sec_0 + sec_1 + (((mSec_plus - 1000) < 0)? 0 : 1 ));
  let secRem    = ( sec_plus ) % 60;
  
  let m_plus  = (m_0 + m_1 + (((sec_plus- 60) < 0)? 0 : 1 ));
  let mRem = ( m_plus ) % 60;

  let h_plus  = (h_0 + h_1 + (((m_plus- 60) < 0)? 0 : 1 ));
  let hRem = ( h_plus ) % 60;

  return `${hRem} : ${mRem} : ${secRem} : ${mSecRem}`
}