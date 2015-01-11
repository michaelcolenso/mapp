var width = window.innerWidth,
    height = 600,
    active = d3.select(null);

var projection = d3.geo.albersUsa()
    .scale(1000)
    .translate([width / 2, height / 2]);

var zoom = d3.behavior.zoom()
    .translate([0, 0])
    .scale(1)
    .scaleExtent([1, 8])
    .on("zoom", zoomed);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height)
    .on("click", stopped, true);
    
var div = d3.select("#map")
      .append("div")
      .attr("class", "tooltip")
      .style("background", "rgba(0,0,0,0.6)")
      .style("opacity", 0);

svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", reset);

var g = svg.append("g");

svg
    .call(zoom) // delete this line to disable free zooming
    .call(zoom.event);

d3.json("us1.json", function(error, us) {
  g.selectAll("path")
      .data(topojson.feature(us, us.objects.states).features)
    .enter().append("path")
      .attr("class", "feature")
      .attr("d", path);
      
  g.append("path")
      .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
      .attr("class", "mesh")
      .attr("d", path);
      
  var base = d3.json("dod_sites.json", function(error, army) {
    g.selectAll("path")
        .data(topojson.feature(army, army.objects.fortress).features)
      .enter().append("path")
        .attr("d", path)
        .attr("class", "base")
        .attr("id", function (d){ return d.id; })	
        .on("mouseover", function(d) {
          var basename = d.id;
          div.transition().duration(200).style("opacity", .9);
          div.html( "<h4>" + basename + "</h4>").style("left", (d3.event.pageX) + "px").style("top", (d3.event.pageY) + "px");
        })
        .on("mouseout", function(d) {
          div.transition().duration(200).style("opacity", 0);
          div.style("left", "-9999px")
        })
        .on("click", clicked);
		   
  });


});


function clicked(d) {
  if (active.node() === this) return reset();
  active.classed("active", false);
  active = d3.select(this).classed("active", true);

  var bounds = path.bounds(d),
      dx = bounds[1][0] - bounds[0][0],
      dy = bounds[1][1] - bounds[0][1],
      x = (bounds[0][0] + bounds[1][0]) / 2,
      y = (bounds[0][1] + bounds[1][1]) / 2,
      scale = .9 / Math.max(dx / width, dy / height),
      translate = [width / 2 - scale * x, height / 2 - scale * y];

  svg.transition()
      .duration(750)
      .call(zoom.translate(translate).scale(scale).event);
}

function reset() {
  active.classed("active", false);
  active = d3.select(null);

  svg.transition()
      .duration(750)
      .call(zoom.translate([0, 0]).scale(1).event);
}

function zoomed() {
  g.style("stroke-width", 1.5 / d3.event.scale + "px");
  g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

// If the drag behavior prevents the default click,
// also stop propagation so we don’t click-to-zoom.
function stopped() {
  if (d3.event.defaultPrevented) d3.event.stopPropagation();
}

