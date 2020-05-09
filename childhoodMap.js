/*
* SETUP
*/

var dataLoaded;

const files = {
  basemap: "https://cdn.jsdelivr.net/npm/us-atlas@3/counties-albers-10m.json",
  commutingZonesMap: "datasets/czs_fips.json",
  commutingZonesData: "datasets/commuting_zones.csv"
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

  colorMap(dataLoaded);
};


/*
* MAP PROJECTION
*/

const projection = d3.geoAlbersUsa().scale(1300).translate([487.5, 305]);
const countryPath = d3.geoPath();
const czPath = d3.geoPath();//.projection(projection);;


/*
* LOAD DATA
*/

d3.csv("datasets/table_1b.csv", parseData).then(function(data) {
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
    drawBasemap(json, data);
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
* Draw the map
*/
function drawBasemap(json, data) {

    let basemapData = json;

    /* Draw country shape */
    const basemap = g.basemap.append("path")
      .attr("transform", "translate(30,120)")
      .datum(topojson.feature(json, json.objects.nation))
      .attr("d", countryPath)
      .attr("class", "land");

      /* Draw states */
      let statesData = topojson.feature(json, json.objects.states).features
      const states = g.states.selectAll("path.state")
        .data(statesData)
        .attr("id", "states")
        .join("path")
        .attr("transform", "translate(30,120)")
          .attr("d", countryPath)
          .attr("class", "state")
          .style("fill", function (d) {
            let dataMatch = data.filter(e => e.state === d.properties.name);
            if(dataMatch[0][selectedVariable] >= 0){
              return colorScale(dataMatch[0][selectedVariable]);
            }else{
              return "#9a9393";
            }
          });

      /* Interactivity */
      states.on("mouseover", function(d) {

        /* Highlight Neighborhoods */
        d3.select(this).raise().classed("active", true);

        /* Tooltip */
        // tip.text(d.properties.name);
        // tip.style("visibility", "visible");

        /* Details on Demand */
        let dataMatch = data.filter(e => e.state === d.properties.name);
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
      .on("mousemove.tooltip", function(d) {

        /* Tooltip */
        // const coords = d3.mouse(g.basemap.node());
        // tip.attr("x", coords[0]);
        // tip.attr("y", coords[1]);
      })
      .on("mouseout", function(d) {

        /* Highlight Neighborhoods */
        d3.select(this).lower().classed("active", false);

        /* Tooltip */
        // tip.style("visibility", "hidden");

        /* Details on Demand */
        details.style("visibility", "hidden");
      });
}


/*
* DATA HANDLING
*/

/*
* Parse the dataset data
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

  // keep.cz = parseInt(row["par_cz"]);
  // keep.czname = row["par_czname"];

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
