/*
* SETUP
*/

const urls = {
  basemap: "https://cdn.jsdelivr.net/npm/us-atlas@3/counties-albers-10m.json"
};

const svg = d3.select("body").select("svg#Vis");

const g = {
  basemap: svg.select("g#basemap"),
  outline: svg.select("g#outline"),


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
  .attr("x", 0)
  .attr("y", 0);

const body = details.append("xhtml:detail")
  .style("text-align", "left")
  .style("background", "none")
  .html("<p>N/A</p>");

details.style("visibility", "hidden");

let colorScale = d3.scaleQuantize();

// let colorScale = d3.scaleThreshold()



/*
* MAP PROJECTION
*/

/* Set up projection */
const projection = d3.geoAlbersUsa().scale(1300).translate([487.5, 305]);

const path = d3.geoPath()
// .projection(projection);


d3.csv("table_1b.csv", parseData).then(colorMap);


/*
* COLOR SCALE
*/

/*
* Draw the individual complaint points
*/
function colorMap(data) {

  let inventorPQ1 = data.map(row => row.inventorPQ1);
  let colorMin = d3.min(inventorPQ1);
  let colorMax = d3.max(inventorPQ1);
  console.log(colorMin + " " + colorMax);

  colorScale
    .domain([colorMin, colorMax])
    .range(d3.schemePurples[9])


  drawLegend();

  d3.json(urls.basemap).then(function(json) {
    drawBasemap(json, data, colorScale);
  });
}

/* LEGEND */
function drawLegend(){

  g.legend
    .attr("class", "legend")
    .attr("transform", "translate(600,20)");

  var legend = d3.legendColor()
    .labelFormat(d3.format(".7f"))
    // .useClass(true)
    .title("PQ1")
    .titleWidth(100)
    .scale(colorScale)
    .orient("horizontal")
    .labelAlign("vertical");

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
      .datum(topojson.feature(json, json.objects.nation))
      .attr("d", path)
      .attr("class", "land");

    /* Draw states */
    let statesData = topojson.feature(json, json.objects.states).features
    const states = g.states.selectAll("path.state")
        .data(statesData)
        .join("path")
          .attr("d", path)
          .attr("class", "state")
          .style("fill", function (d) {
            let dataMatch = data.filter(e => e.state === d.properties.name);
            return colorScale(dataMatch[0].inventorPQ1);
          });

    /* Interactivity */
    states.on("mouseover", function(d) {

      /* Highlight Neighborhoods */
      d3.select(this).raise().classed("active", true);

      /* Tooltip */
      tip.text(d.properties.name);
      tip.style("visibility", "visible");
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
