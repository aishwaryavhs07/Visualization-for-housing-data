const svgHeight = 700;
const svgWidth = 800;
const margin = 20;
const graphHeight = svgHeight - 150;
const graphWidth = svgWidth +50;
let yAxisLabel = "Frequency";
let binFrequency = 11;
let binSize = 0;
let csvInArr = []



function binCountHandler() {
    var slider = document.getElementById("sliderId");
    binFrequency = slider.value;
  //  document.getElementById("sliderbinval").innerHTML = binFrequency - 1;
    beginFunc(getColumnNameFromDrop());
}

function getColumnNameFromDrop() {
    return document.getElementById("colCount").value;
}


function colChanger() {
    let colName = getColumnNameFromDrop();
    beginFunc(colName);
}


function generateDataArrayHist(colName) {
    return csvInArr.map(function(d) {
        return parseFloat(d[colName]);
    });

 
}

function generateBinArrayHist(dataArray) {
    let bin = [];
    let maxValue = d3.max(dataArray);
    let minValue = d3.min(dataArray);
    binSize = (maxValue - minValue)/binFrequency;
    for (let i = 0; i < binFrequency; i++) {
        bin.push(parseFloat((minValue + (i * binSize)).toFixed(2)));
    }
    return bin;
}

function generateDataBarDict(colName){
     let arr= generateDataArrayHist(colName);
     let colDict = {}
     for (let i = 0; i < arr.length; i++) {
        if (colDict.hasOwnProperty(arr[i])) { 
            colDict[arr[i]]=colDict[arr[i]]+1 ;
        }
        else {
            colDict[arr[i]]=1;
        }
     }
     let listBars = []
     for (let key in colDict) {
        let k = key
        let v = colDict[key]
      
        listBars.push({xaxisvalues: k, yaxisvalues: v})
     }
   
     return listBars
   }

function generateDataForHist(dataArray, binArray) {
    let arr = []
    arr.push({y : 0, binVal: binArray[0]});
    for (let binc = 1; binc < binArray.length; binc++) {
        let y = 0;
        for (let x = 0; x < dataArray.length; x++) {
            if (dataArray[x] >= binArray[binc-1]) {
                if (binc === binArray.length - 1) {
                    dataArray[x] <= binArray[binc]
                    y++;
                } 
                else if (dataArray[x] < binArray[binc] && dataArray[x] >= binArray[binc-1])
                    y++;
            }
        }
        arr.push({y : y, binVal: binArray[binc]});

    }
    return arr;
}

function generateDataForBarGraph(colName) {
    let dataArray = generateDataArrayHist(colName);
    let binArray = generateBinArrayHist(dataArray);
    return generateDataForHist(dataArray, binArray);
}

function beginFunc(colName) {
    if (colName === undefined)
        colName = 'price';
     // document.getElementById("sliderId").enabled = true;

    if (colName === "bedrooms" || colName === "bathrooms" || colName ==="floors" || colName ==="waterfront" ||
      colName ==="view" || colName ==="condition" || colName ==="grade")
    {
     // document.getElementById("sliderId").disabled = true;

       let dataArr = generateDataBarDict(colName)
       removeSVGElement();
       barchart(colName,dataArr)
    }

    else
    {
    let dataArr = generateDataForBarGraph(colName);
    removeSVGElement();
    histchart(colName,dataArr);
  
}
}

function histchart(colName,dataArr) {
    const svg = d3.select(".chart-container")
                  .append("svg")
                  .attr("id", "svg-element")
                  .attr("width", graphWidth)
                  .attr("height", svgHeight);


    const g = svg.append("g").attr("transform", "translate(60, 30)");

    svg.append("text")
        .attr("x", graphWidth/2)
        .attr("y", graphHeight + 80)
        .text(colName)
        .style("font-weight", "bold");

    svg.append("text")
       .attr("x", 0 - svgHeight/2 - 70)
       .attr("y", 0 + 25)
       .attr("transform", "rotate(-90)")
       .text(yAxisLabel)
       .style("font-weight", "bold");

    let barText = svg.append("text");

    const yScale = d3.scaleLinear()
                     .domain([0,d3.max(dataArr.map(function(d) {
                         return d.y;
                     }))])
                     .range([graphHeight,0]);

    const xScale = d3.scaleBand()
                     .domain(dataArr.map(function(d) {
                         return d.binVal;
                     }))
                     .range([0, svgWidth]);

    const xAxis = d3.axisBottom()

                    .scale(xScale);
 
    const yAxis = d3.axisLeft()
                    .scale(yScale);

    g.append("g")
     .call(yAxis)
     .append("g")
     .attr("transform", "translate(0," + graphHeight + ")")
     .call(xAxis); 

    g.selectAll("rect")
     .data(dataArr)
     .enter()
     .append("rect")
     .attr("x", function(d) {return xScale(d.binVal) - xScale.bandwidth()/2;})
     .attr("y", function(d) {return yScale(d.y);})
     .attr("width", xScale.bandwidth() - 2)
     .attr("height", function(d) {return graphHeight - yScale(d.y);})
     .style("fill", "steelblue")
     .attr("transform-origin", "bottom")
     .style("opacity", 0.8)
     .on("mouseover", function(d) {
        let currRect = d3.select(this);
        let xVal = currRect.attr("x");
        let yVal = currRect.attr("y");

        currRect.style("fill","darkblue")
                .style("opacity", 1)
                .attr("width", xScale.bandwidth() + 2)
                .attr("y", yScale(d.y)-3)
                .attr("height", graphHeight - yScale(d.y) +7);

        svg.append("text")
           .attr("class", "barText")
           .attr("x", xVal)
           .attr("y", yVal)
           .attr("transform", "translate(75,27)")
           .text(d.y);
        })
     .on("mouseleave", function(d) {
         let currRect = d3.select(this);
         currRect.style("fill", "steelblue")
                 .style("opacity", 0.8)
                 .style("z-index", 1)
                 .attr("width", xScale.bandwidth() )
                 .attr("y", yScale(d.y))
                 .attr("height", graphHeight - yScale(d.y));

         svg.select(".barText")
                 .remove();

         })
    
}


function barchart(colName,dataArr){

var margin = {top: 20, right: 20, bottom: 30, left: 100},
    width = 960 - margin.left - margin.right,
    height = 1000 - margin.top - margin.bottom;

var x = d3.scaleBand()
          .range([0, width])
          .padding(0.1);
var y = d3.scaleLinear()
          .range([graphHeight,0]);
          

var svg = d3.select(".chart-container")
                  .append("svg")
    .attr("id", "svg-element")
    .attr("width", width + margin.left + margin.right)
    .attr("height", graphHeight + margin.top + margin.bottom)
    .append("g")
    .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")");
svg.append("text")
        .attr("x", width/2)
        .attr("y", graphHeight + 25)
        .text(colName)
        .style("font-weight", "bold");

    svg.append("text")
       .attr("x", 0 - graphHeight/2 - 70)
       .attr("y", 0 - 50)
       .attr("transform", "rotate(-90)")
       .text(yAxisLabel)
       .style("font-weight", "bold");

 const g = svg.append("g").attr("transform", "translate(60, 30)");
  data = dataArr
 
  x.domain(data.map(function(d) { return d.xaxisvalues; }));
  y.domain([0, d3.max(data, function(d) { return d.yaxisvalues; })]);

  svg.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .style("fill", "steelblue")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.xaxisvalues); })
      .attr("width", x.bandwidth())
      .attr("y", function(d) { return y(d.yaxisvalues); })
      .attr("height", function(d) { return graphHeight - y(d.yaxisvalues); })
      .on("mouseover", function(d) {
        let currRect = d3.select(this);
        let xVal = currRect.attr("x");
        let yVal = currRect.attr("y");

        currRect.style("fill","darkblue")
               .style("opacity", 1)
                .attr("width", x.bandwidth() +4)
                .attr("height", function(d) { return graphHeight - y(d.yaxisvalues)+10; });

        svg.append("text")
           .attr("class", "barText")
           .attr("x", xVal)
           .attr("y", yVal)
           .attr("transform", "translate(10,-5)")
           .text(d.yaxisvalues);
        })

     .on("mouseleave", function(d) {
         let currRect = d3.select(this);
         currRect.style("fill", "steelblue")
                 .style("opacity", 0.8)
                 .style("z-index", 1)
                 .attr("width", x.bandwidth())
                 .attr("y", y(d.yaxisvalues))
                 .attr("height",  function(d) { return graphHeight - y(d.yaxisvalues); });

         svg.select(".barText")
                 .remove();

         })

  svg.append("g")
      .attr("transform", "translate(0," + graphHeight + ")")
      .call(d3.axisBottom(x));
  svg.append("g")
      .call(d3.axisLeft(y));
 }

 function removeSVGElement() {
    let parent = document.getElementById("svg-container");
    let child = document.getElementById("svg-element");
    if (parent && child)
        parent.removeChild(child);
    return;
}

 d3.csv("./data/house_data.csv").then(function(data) {
    csvInArr = data;
    beginFunc();
});
