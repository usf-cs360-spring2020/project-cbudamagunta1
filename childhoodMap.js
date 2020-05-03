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


/*
* MAP PROJECTION
*/

/* Set up projection */
const projection = d3.geoAlbersUsa().scale(1300).translate([487.5, 305]);

const path = d3.geoPath()
// .projection(projection);


d3.json(urls.basemap).then(function(json) {

  console.log(json);

  var states = new Map(json.objects.states.geometries.map(d => [d.id, d.properties]));
  console.log(states);

  drawBasemap(json);
});



/*
* Draw the base map
*/
function drawBasemap(json) {

    const basemap = g.basemap.append("path")
      .datum(topojson.feature(json, json.objects.nation))
      .attr("d", path)
      .attr("class", "land");



    const basemap2 = g.basemap.selectAll("path.land")
      .data(topojson.feature(json, json.objects.nation))
      .enter()
      .append("path")
      .attr("d", path)
      .attr("class", "land")
      .attr("fill", "brown");


      let statesData = topojson.feature(json, json.objects.states).features

      const states = g.states.selectAll("path.state")
          .data(statesData)
          .enter()
          .append("path")
          .attr("d", path)
          .attr("class", "state")
          .on("mouseover", function() {
            console.log("here");
            d3.select(this).raise().classed("active", true);
          })
          .on("mouseout", function() { d3.select(this).lower().classed("active", false); });


      //     svg.selectAll("path")
      // .data(counties)
      // .enter().append("path")
      //   .attr("fill", d => color(d.properties.location_id))
      //   .attr("d", path)
      //   .on("mouseover", function() { d3.select(this).raise().classed("active", true); })
      //   .on("mouseout", function() { d3.select(this).lower().classed("active", false); })
      // .append("title")
      //   .text(d => title(d.properties.location_id));


    // const states = g.states.append("path")
    //   .datum(topojson.mesh(json, json.objects.states, (a, b) => a !== b))
    //   .attr("fill", "none")
    //   .attr("stroke", "black")
    //   .attr("stroke-linejoin", "round")
    //   .attr("d", path)
    //   .attr(function(d) {
    //      forEach((item, d) => {
    //        item.properties.outline = item;
    //        console.log(item);
    //      });
    //
    //     d.properties.outline = this;
    //   });

  /* Highlight Neighborhoods */
  // basemap.on("mouseover.highlight", function(d) {
  //   d3.select(d.properties.outline).raise();
  //   d3.select(d.properties.outline).classed("active", true);
  // })
  // .on("mouseout.highlight", function(d) {
  //   d3.select(d.properties.outline).classed("active", false);
  // });
  //
  // /* Tooltip */
  // basemap.on("mouseover.tooltip", function(d) {
  //   tip.text(d.properties.name);
  //   tip.style("visibility", "visible");
  // })
  // .on("mousemove.tooltip", function(d) {
  //   const coords = d3.mouse(g.basemap.node());
  //   tip.attr("x", coords[0]);
  //   tip.attr("y", coords[1]);
  // })
  // .on("mouseout.tooltip", function(d) {
  //   tip.style("visibility", "hidden");
  // });
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
