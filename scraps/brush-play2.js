var margin = {
    top: 30, 
    right: 10, 
    bottom: 10, 
    left: 10
}

var width = 960 - margin.right - margin.left;
var height = 500 - margin.top - margin.bottom;

// set up our scales
var xScale = d3.scale.ordinal()
    .rangePoints([0, width], 1);

var yScale = {};

var dragging = {};

var line = d3.svg.line();

var axis = d3.svg.axis()
  .orient("left");

var background, foreground;

var totals;

var svg = d3.select("body")
  .append("svg")
  .attr("width", width + margin.right + margin.left)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," 
      + margin.top + ")");

d3.csv("../data/season-totals-by-team.csv", function(error, data) {

  console.log(data);
  totals = data.map(function(d) {
    return {
      2P: 
      2PA:
      2Pp:
      3P: 
      3PA:
      3Pp:
      AST:
      BLK:
      DRB:
      FG: 
      FGA:
      FGp:
      FT: 
      FTA:
      FTp:
      G: 
      MP: 
      ORB:
      PF: 
      PTS:
      PTSg:
      STL:
      TOV:
      TRB:
      Team:
      Year:
  });

  // Extract the list of dimensions and create a scale for each.
  xScale.domain(dimensions = d3.keys(totals[0]).filter(function(d) {
    return d != "name" && (yScale[d] = d3.scale.linear()
        .domain(d3.extent(totals, function(p) { return +p[d]; }))
        .range([height, 0]));
  }));

  // Add grey background lines for context.
  background = svg.append("g")
      .attr("class", "background")
    .selectAll("path")
      .data(totals)
    .enter().append("path")
      .attr("d", path);

  // Add blue foreground lines for focus.
  foreground = svg.append("g")
      .attr("class", "foreground")
    .selectAll("path")
      .data(totals)
    .enter().append("path")
      .attr("d", path);

  // Add a group element for each dimension.
  var g = svg.selectAll(".dimension")
      .data(dimensions)
    .enter().append("g")
      .attr("class", "dimension")
      .attr("transform", function(d) { return "translate(" + xScale(d) + ")"; })
      .call(d3.behavior.drag()
        .on("dragstart", function(d) {
          dragging[d] = this.__origin__ = xScale(d);
          background.attr("visibility", "hidden");
        })
        .on("drag", function(d) {
          dragging[d] = Math.min(width, Math.max(0, this.__origin__ += d3.event.dx));
          foreground.attr("d", path);
          dimensions.sort(function(a, b) { return position(a) - position(b); });
          xScale.domain(dimensions);
          g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
        })
        .on("dragend", function(d) {
          delete this.__origin__;
          delete dragging[d];
          transition(d3.select(this)).attr("transform", "translate(" + xScale(d) + ")");
          transition(foreground)
              .attr("d", path);
          background
              .attr("d", path)
              .transition()
              .delay(500)
              .duration(0)
              .attr("visibility", null);
        }));

  // Add an axis and title.
  g.append("g")
      .attr("class", "axis")
      .each(function(d) { d3.select(this).call(axis.scale(yScale[d])); })
    .append("text")
      .attr("text-anchor", "middle")
      .attr("y", -9)
      .text(String);

  // Add and store a brush for each axis.
  g.append("g")
      .attr("class", "brush")
      .each(function(d) { d3.select(this).call(yScale[d].brush = d3.svg.brush().y(yScale[d]).on("brushstart", brushstart).on("brush", brush)); })
    .selectAll("rect")
      .attr("x", -8)
      .attr("width", 16);
});

function position(d) {
  var v = dragging[d];
  return v == null ? xScale(d) : v;
}

function transition(g) {
  return g.transition().duration(500);
}

// Returns the path for a given data point.
function path(d) {
  return line(dimensions.map(function(p) { return [position(p), yScale[p](d[p])]; }));
}

// When brushing, don’t trigger axis dragging.
function brushstart() {
  d3.event.sourceEvent.stopPropagation();
}

// Handles a brush event, toggling the display of foreground lines.
function brush() {
  var actives = dimensions.filter(function(p) { return !yScale[p].brush.empty(); }),
      extents = actives.map(function(p) { return yScale[p].brush.extent(); });
  foreground.style("display", function(d) {
    return actives.every(function(p, i) {
      return extents[i][0] <= d[p] && d[p] <= extents[i][1];
    }) ? null : "none";
  });
}

