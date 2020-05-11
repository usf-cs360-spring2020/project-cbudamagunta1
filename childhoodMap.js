/*
* SETUP
*/

/* Data */
var dataLoaded;

const files = {
  basemap: "https://cdn.jsdelivr.net/npm/us-atlas@3/counties-albers-10m.json",
  commutingZonesMap: "datasets/czs_fips.json",
  commutingZonesData: "datasets/commuting_zones.csv"
};


/* SVG */
const svg = d3.select("body").select("svg#Vis");

const g = {
  basemap: svg.select("g#basemap"),
  states: svg.select("g#states"),
  details: svg.select("g#details"),
  legend: svg.select("g#legend"),

  bar: svg.select("g#bar")
};


/* Details widgit */
const details = g.details.append("foreignObject")
  .attr("id", "details")
  .attr("width", 200)
  .attr("height", 600)
  .attr("x", 20)
  .attr("y", 10);

const body = details.append("xhtml:detail")
  .style("text-align", "left")
  .style("background", "none")
  .html("<p>N/A</p>");

details.style("visibility", "hidden");


/* Scale */
var colorScale = d3.scaleQuantize();


/*
* SELECTION TO SWITCH DATA
*/

var dataOptions = [
  "Inventor",
  "Inventor - Parent Quintile 1",
  "Inventor - Parent Quintile 2",
  "Inventor - Parent Quintile 3",
  "Inventor - Parent Quintile 4",
  "Inventor - Parent Quintile 5"
]

var selectedVariable;
var variableTitle;

var select = d3.select('body')
  .select('select')
  	.attr('class','select')
    .on('change',onchange)

var options = select
  .selectAll('option')
	.data(dataOptions).enter()
	.append('option')
    .text(d => d);


/* Initial Selection */
variableTitle = d3.select('select').property('value');

if(variableTitle == "Inventor - Parent Quintile 1"){
  selectedVariable = "inventorPQ1";
}else if (variableTitle == "Inventor - Parent Quintile 2") {
  selectedVariable = "inventorPQ2";
}else if (variableTitle == "Inventor - Parent Quintile 3") {
  selectedVariable = "inventorPQ3";
}else if (variableTitle == "Inventor - Parent Quintile 4") {
  selectedVariable = "inventorPQ4";
}else if (variableTitle == "Inventor - Parent Quintile 5") {
  selectedVariable = "inventorPQ5";
}else if (variableTitle == "Inventor") {
  selectedVariable = "inventor";
};


/* When Selection Changes */
function onchange() {
  variableTitle = d3.select('select').property('value');

  if(variableTitle == "Inventor - Parent Quintile 1"){
    selectedVariable = "inventorPQ1";
  }else if (variableTitle == "Inventor - Parent Quintile 2") {
    selectedVariable = "inventorPQ2";
  }else if (variableTitle == "Inventor - Parent Quintile 3") {
    selectedVariable = "inventorPQ3";
  }else if (variableTitle == "Inventor - Parent Quintile 4") {
    selectedVariable = "inventorPQ4";
  }else if (variableTitle == "Inventor - Parent Quintile 5") {
    selectedVariable = "inventorPQ5";
  }else if (variableTitle == "Inventor") {
    selectedVariable = "inventor";
  };

  colorMap();
};


/*
* MAP PROJECTION
*/

const projection = d3.geoAlbersUsa().scale(1300).translate([487.5, 305]);
const path = d3.geoPath();


/*
* LOAD DATA
*/

d3.csv("datasets/table_1b.csv", parseData).then(function(data) {
  dataLoaded = data;
  colorMap();
});


/*
* COLOR SCALE
*/

/*
* Set up color scale and trigger map drawing
*/
function colorMap() {

  let dataVariable = dataLoaded.map(row => row[selectedVariable]);

  let colorMin = d3.min(dataVariable);
  let colorMax = d3.max(dataVariable);

  let colorScheme;
  if(variableTitle == "Inventor - Parent Quintile 1"){
    colorScheme = d3.schemeYlGnBu[9];
  }else if (variableTitle == "Inventor - Parent Quintile 2") {
    colorScheme = d3.schemeYlGnBu[9];
  }else if (variableTitle == "Inventor - Parent Quintile 3") {
    colorScheme = d3.schemeYlGnBu[9];
  }else if (variableTitle == "Inventor - Parent Quintile 4") {
    colorScheme = d3.schemeYlGnBu[9];
  }else if (variableTitle == "Inventor - Parent Quintile 5") {
    colorScheme = d3.schemeYlGnBu[9];
  }else if (variableTitle == "Inventor") {
    colorScheme = d3.schemeYlGnBu[9];
  };

  colorScale
    .domain([colorMin, colorMax])
    .range(colorScheme);

  /* Draw country outline */
  d3.json(files.basemap).then(function(json) {
    drawBasemap(json);
  });

  drawLegend();
}


/* LEGEND */
function drawLegend(){

  g.legend
    .attr("class", "legend")
    .attr("transform", "translate(700,30)");

  var legend = d3.legendColor()
    .labelFormat(d3.format(".3%"))
    .title(variableTitle)
    .titleWidth(500)
    .scale(colorScale)
    .shapePadding(-3)
    .shapeWidth(30);

  g.legend
    .call(legend);


  /* Brushing */
  let states = d3.select("#states");

  legend.on("cellover", function(d) {
      let dataMatch = dataLoaded.filter(e => colorScale(e[selectedVariable]) === d)
      let num = dataMatch.length;
      for(var i=0; i<num; i++){
        d3.select("#" + dataMatch[i].stateAbbrv).raise().classed("active", true);
      }
    })
    .on("cellout", function(d) {
      let dataMatch = dataLoaded.filter(e => colorScale(e[selectedVariable]) === d)
      let num = dataMatch.length;
      for(var i=0; i<num; i++){
        d3.select("#" + dataMatch[i].stateAbbrv).lower().classed("active", false);;
      }
    });
}


/*
* MAP DRAWING
*/

/*
* Draw the map
*/
function drawBasemap(json) {

  let basemapData = json;

  /* Draw country shape */
  const basemap = g.basemap.append("path")
    .attr("transform", "translate(50,100)")
    .datum(topojson.feature(json, json.objects.nation))
    .attr("d", path)
    .attr("class", "land");

  /* Draw states */
  let statesData = topojson.feature(json, json.objects.states).features
  const states = g.states.selectAll("path.state")
    .data(statesData)
    .attr("id", "states")
    .join("path")
    .attr("transform", "translate(50,100)")
      .attr("d", path)
      .attr("class", "state")

      .attr("id", function (d) {
        let dataMatch = dataLoaded.filter(e => e.state === d.properties.name);
        return dataMatch[0].stateAbbrv;
      })

      .style("fill", function (d) {
        let dataMatch = dataLoaded.filter(e => e.state === d.properties.name);
        if(dataMatch[0][selectedVariable] >= 0){
          return colorScale(dataMatch[0][selectedVariable]);
        }else{
          return "#9a9393";
        }
      });


    /* Interactivity */
    states.on("mouseover", function(d) {

      /* Draw Bar Chart*/
      drawBarChart(d);

      /* Highlight Neighborhoods */
      d3.select(this).raise().classed("active", true);

      /* Details on Demand */
      let dataMatch = dataLoaded.filter(e => e.state === d.properties.name);
      const html = `
        <table border="0" cellspacing="0" cellpadding="2">
        <tbody>
          <tr>
            <th>State:</th>
            <td>${dataMatch[0].state}</td>
          </tr>
          <tr>
            <th>${variableTitle}</th>
            <td>${dataMatch[0][selectedVariable] ? dataMatch[0][selectedVariable] : "N/A"}</td>
          </tr>
          <tr>
            <th>Inventor:</th>
            <td>${dataMatch[0].inventor ? dataMatch[0].inventor : "N/A"}</td>
          </tr>
        </tbody>
        </table>
      `;

      body.html(html);
      details.style("visibility", "visible");
    })
    .on("mousemove", function(d) {

      /* Draw Bar Chart*/
      d3.select("g#bar").selectAll("*").remove();
      drawBarChart(d, dataLoaded);

    })
    .on("mouseout", function(d) {

      /* Draw Bar Chart*/
      d3.select("g#bar").selectAll("*").remove();

      /* Highlight Neighborhoods */
      d3.select(this).lower().classed("active", false);

      /* Details on Demand */
      details.style("visibility", "hidden");
    });
}


/*
* BAR CHART
*/

/* Draw the Bar Chart */
function drawBarChart(state) {

  /* Get Data Match */
  let dataMatch = dataLoaded.filter(e => e.state === state.properties.name);
  let barGroups = [
    "inventor",
    "inventorPQ1",
    "inventorPQ2",
    "inventorPQ3",
    "inventorPQ4",
    "inventorPQ5",
    "male",
    "female"
  ];

  let barValues = [
    dataMatch[0].inventor,
    dataMatch[0].inventorPQ1,
    dataMatch[0].inventorPQ2,
    dataMatch[0].inventorPQ3,
    dataMatch[0].inventorPQ4,
    dataMatch[0].inventorPQ5,
    dataMatch[0].male,
    dataMatch[0].female
  ];


  /* Set Up Bar Data */
  const barData = [
    {
      group: "inventor",
      value: dataMatch[0].inventor
    },
    {
      group: "inventorPQ1",
      value: dataMatch[0].inventorPQ1
    },
    {
      group: "inventorPQ2",
      value: dataMatch[0].inventorPQ2
    },
    {
      group: "inventorPQ3",
      value: dataMatch[0].inventorPQ3
    },
    {
      group: "inventorPQ4",
      value: dataMatch[0].inventorPQ4
    },
    {
      group: "inventorPQ5",
      value: dataMatch[0].inventorPQ5
    },
    {
      group: "male",
      value: dataMatch[0].male
    },
    {
      group: "female",
      value: dataMatch[0].female
    },
  ];


  let dataMax = d3.max(barValues);
  let dataMin = 0;

  /* Set Up Plot */
  const barPlot = g.bar
    .attr("id", "bar")
    .attr("transform", "translate(380,20)");

  const barScales = {
    x: d3.scaleBand(),
    y: d3.scaleLinear(),
  };

  let barPlotWidth = 250;
  let barPlotHeight = 70;

  barScales.x.rangeRound([0, barPlotWidth]);

  barScales.y
      .domain([dataMin, dataMax])
      .range([barPlotHeight, 0]);

  let yGroup = g.bar.append('g').attr("id", "y-axis-barline")
    .attr('class', 'axis');

  let yAxis = d3.axisLeft(barScales.y);

  yAxis.ticks(5, '0.3%');
  yGroup.call(yAxis);


  /* Draw Titles */
  let xMiddle = 300 + midpoint(barScales.x.range());
  let yMiddle = 20 + midpoint(barScales.y.range());

  let yTitle = g.bar.append('text')
    .attr('transform', translate(250, yMiddle))
    .attr('class', 'axis-title')
    .attr('id', 'axis-title')
    .text('Inventor Rate');

  yTitle.attr('x', -40);
  yTitle.attr('y', -65);

  yTitle.attr('dy', 15);
  yTitle.attr('text-anchor', 'middle');
  yTitle.attr('transform', 'rotate(-90)');


  /* DRAW AXIS */
  barScales.x.domain(barGroups);

  let xGroup = g.bar.append('g').attr("id", "x-axis-barline").attr('class', 'axis');
  let xAxis = d3.axisBottom(barScales.x).tickPadding(0).tickSizeOuter(0);

  xGroup.attr('transform', translate(0, barPlotHeight));
  xGroup.call(xAxis)
    .selectAll("text")
      .attr("y", 4)
      .attr("x", -5)
      .attr("dy", ".35em")
      .attr("transform", "rotate(-90)")
      .style("text-anchor", "end");


  /* Bar Chart */
  const barLineGroup = g.bar.append('g').attr('id', 'barline');
  const bars = barLineGroup
    .selectAll("rect")
    .attr("id", "bars")
    .data(barData)
    .enter()
    .append("rect")
      .attr("class", d => d.group)
      .attr("x", d => (barScales.x(d.group)) + 3)
      .attr("y", d => barScales.y(d.value))
      .attr("width", barScales.x.bandwidth() - 3)
      .attr("height", d => barPlotHeight - barScales.y(d.value))
      .style("fill", "#145649");
}


/*
* DATA HANDLING
*/

/*
* Parse the data
*/
function parseData(row){
  let keep = {};

  keep.inventor = parseFloat(row["inventor"]);

  keep.inventorPQ1 = parseFloat(row["inventor_pq_1"]);
  keep.inventorPQ2 = parseFloat(row["inventor_pq_2"]);
  keep.inventorPQ3 = parseFloat(row["inventor_pq_3"]);
  keep.inventorPQ4 = parseFloat(row["inventor_pq_4"]);
  keep.inventorPQ5 = parseFloat(row["inventor_pq_5"]);

  keep.state = row["par_state"];
  keep.stateAbbrv = row["par_stateabbrv"];

  keep.male = parseFloat(row["inventor_g_m"]);
  keep.female = parseFloat(row["inventor_g_f"]);

  return keep;
}


/*
* HELPER FUNCTIONS
*/

/*
 * From bubble.js example:
 * calculates the midpoint of a range given as a 2 element array
 */
function midpoint(range) {
  return range[0] + (range[1] - range[0]) / 2.0;
}

/*
 * From bubble.js example:
 * returns a translate string for the transform attribute
 */
function translate(x, y) {
  return 'translate(' + String(x) + ',' + String(y) + ')';
}
