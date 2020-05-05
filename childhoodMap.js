/*
* SETUP
*/

var dataLoaded;

const urls = {
  basemap: "https://cdn.jsdelivr.net/npm/us-atlas@3/counties-albers-10m.json"
};

const svg = d3.select("body").select("svg#Vis");

const g = {
  basemap: svg.select("g#basemap"),
  states: svg.select("g#states"),
  tooltip: svg.select("g#tooltip"),
  details: svg.select("g#details"),
  legend: svg.select("g#legend")
};

/* Tooltip */
const tip = g.tooltip.append("text").attr("id", "tooltip");
tip.attr("text-anchor", "end");
tip.attr("dx", -5);
tip.attr("dy", -5);
tip.style("visibility", "hidden");

/* Details widgit */
const details = g.details.append("foreignObject")
  .attr("id", "details")
  .attr("width", 325)
  .attr("height", 600)
  .attr("x", 20)
  .attr("y", 20);

const body = details.append("xhtml:detail")
  .style("text-align", "left")
  .style("background", "none")
  .html("<p>N/A</p>");

details.style("visibility", "hidden");

var colorScale = d3.scaleQuantize();


/*
* SELECTION TO SWITCH DATA
*/


var dataOptions = [
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
};

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
  };

  colorMap(dataLoaded);
};


/*
* MAP PROJECTION
*/

/* Set up projection */
const projection = d3.geoAlbersUsa().scale(1300).translate([487.5, 305]);
const path = d3.geoPath()// .projection(projection);


/*
* LOAD DATA
*/

d3.csv("table_1b.csv", parseData).then(function(data) {
  dataLoaded = data;
  colorMap(dataLoaded);
});


/*
* COLOR SCALE
*/

/*
* Set up color scale and trigger map drawing
*/
function colorMap(data) {

  let dataVariable = data.map(row => row[selectedVariable]);
  let colorMin = d3.min(dataVariable);
  let colorMax = d3.max(dataVariable);

  let colorScheme;
  if(variableTitle == "Inventor - Parent Quintile 1"){
    colorScheme = d3.schemePurples[9];
  }else if (variableTitle == "Inventor - Parent Quintile 2") {
    colorScheme = d3.schemeOranges[9];
  }else if (variableTitle == "Inventor - Parent Quintile 3") {
    colorScheme = d3.schemeBlues[9];
  }else if (variableTitle == "Inventor - Parent Quintile 4") {
    colorScheme = d3.schemeGreens[9];
  }else if (variableTitle == "Inventor - Parent Quintile 5") {
    colorScheme = d3.schemeBlues[9];
  };

  colorScale
    .domain([colorMin, colorMax])
    .range(colorScheme)

  d3.json(urls.basemap).then(function(json) {
    drawBasemap(json, data, colorScale);
  });

  drawLegend();
}

/* LEGEND */
function drawLegend(){

  g.legend
    .attr("class", "legend")
    .attr("transform", "translate(710,30)");

  var legend = d3.legendColor()
    .labelFormat(d3.format(".3"))
    .title(variableTitle)
    .titleWidth(500)
    .scale(colorScale)
    // .orient("horizontal")
    .shapePadding(0)
    .shapeWidth(30)
    // .shapeHeight(30)
    ;


  // let states = d3.select("#states");
  //
  // legend.on("cellover", function(d) {
  //     let dataMatch = data.filter(e => e.properties.name === d.);
  //
  //   })
  //   .on("cellout", function(d) {
  //
  //   });

  g.legend
    .call(legend);
}


/*
* MAP DRAWING
*/

/*
* Draw the base map
*/
function drawBasemap(json, data, colorScale) {

    /* Draw country shape */
    const basemap = g.basemap.append("path")
      .attr("transform", "translate(30,120)")
      .datum(topojson.feature(json, json.objects.nation))
      .attr("d", path)
      .attr("class", "land");

    /* Draw states */
    let statesData = topojson.feature(json, json.objects.states).features
    const states = g.states.selectAll("path.state")
      .data(statesData)
      .attr("id", "states")
      .join("path")
      .attr("transform", "translate(30,120)")
        .attr("d", path)
        .attr("class", "state")
        .style("fill", function (d) {
          let dataMatch = data.filter(e => e.state === d.properties.name);
          return colorScale(dataMatch[0][selectedVariable]);
        });

    /* Interactivity */
    states.on("mouseover", function(d) {

      /* Highlight Neighborhoods */
      d3.select(this).raise().classed("active", true);

      /* Tooltip */
      tip.text(d.properties.name);
      tip.style("visibility", "visible");

      /* Details on Demand */
      let dataMatch = data.filter(e => e.state === d.properties.name);
      const html = `
        <table border="0" cellspacing="0" cellpadding="2">
        <tbody>
          <tr>
            <th>${variableTitle}</th>
            <td>${dataMatch[0][selectedVariable]}</td>
          </tr>
          <tr>
            <th>Inventor:</th>
            <td>${dataMatch[0].inventor}</td>
          </tr>
        </tbody>
        </table>
      `;

      body.html(html);
      details.style("visibility", "visible");
    })
    .on("mousemove.tooltip", function(d) {

      /* Tooltip */
      const coords = d3.mouse(g.basemap.node());
      tip.attr("x", coords[0]);
      tip.attr("y", coords[1]);
    })
    .on("mouseout", function(d) {

      /* Highlight Neighborhoods */
      d3.select(this).lower().classed("active", false);

      /* Tooltip */
      tip.style("visibility", "hidden");

      /* Details on Demand */
      details.style("visibility", "hidden");
    });
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

  return keep;
}


/*
* HELPER FUNCTIONS
*/

/*
 * From bubble.js example:
 * returns a translate string for the transform attribute
 */
function translate(x, y) {
  return 'translate(' + String(x) + ',' + String(y) + ')';
}
