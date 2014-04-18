//$(document).ready(function() {
 
  // inspired by:
  // http://bl.ocks.org/mbostock/7586334

  var margin = {
    top: 30,
    right: 10,
    bottom: 10,
    left: 10
  }
  var width = 960 - margin.right - margin.left;
  var height = 500 - margin.top - margin.bottom;

  var xScale = d3.scale.ordinal()
    .rangePoints([0, width], 0.5)
    
  var yScale = {};

  var dragging = {};

  var line = d3.svg.line();
    
  var yAxis = d3.svg.axis()
    .orient('left');
  
  var background, foreground;
  var dataset;

  var svg = d3.select('body')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ','
      + margin.top + ')')

  d3.csv('../data/season-totals-by-team.csv', function(error, data) {

    console.log(data);
    dataset = data.map(function(d) {
      return {
        'team': d['Team'],
        '2pp': +d['2Pp'],
        '3pp': +d['3Pp'],
        'ast': +d['AST'],
        'trb': +d['TRB'],
        'tov': +d['TOV'],
        'stl': +d['STL'],
        'ppg': +d['PTSg']
      }
    });

    // these will be our y axes; exclude 'team' 
    var dimensions = d3.keys(dataset[0]).filter(function(d) {
      return d != 'team'; 
    });

    // set up our yScales
    dimensions.forEach(function(d) {
      yScale[d] = d3.scale.linear();
      yScale[d]
        .range([height, 0])
        .domain(d3.extent(dataset, function(e) {
          return e[d];
        }));
    })

    xScale
      .domain(dimensions);

    // gray background lines for context
    background = svg.append('g')
      .attr('class', 'background')

    background
      .selectAll('path')
      .data(dataset)
      .enter()
        .append('path')
        .attr('d', path)

    // add orange foreground lines for focus
    foreground = svg.append('g')
      .attr('class', 'foreground')

    foreground
      .selectAll('path')
      .data(dataset)
      .enter()
        .append('path')
        .attr('d', path)

    // extract 

  }); // end d3.csv()
   
  function position(d) {
    var v = dragging[d];
    return v == null ? xScale(d) : v;
  } 

  function path(d) {
    return line(dimensions.map(function (p) {
      return [position(p), yScale[p](d[p])];
    }));
  }
  //function path(d) {
    //return line(dimensions.map(function(p) { 
      //return [position(p), yScale[p](d[p])]; 
    //}));
  //}
  //function path(d) {
    //return line(dimensions.map(function(e) {
      //return [position(e), yScale[e](d[e])];
    //}));
  //};

  function brushstart() {
    d3.event.sourceEvent.stopPropagation();
  }

  function brush() {
    var actives = dimensions.filter(function(d) {
      return !yScale[d].brush.empty();
    });

    var extents = actives.map(function(d) {
      return yScale[d].brush.extent();
    });

    foreground
      .style('display', function(d) {
          return actives.every(function(p, i) {
            return extents[i][0] <= d[p] && d[p] <= extents[i][1];
          }) ? null : 'none';
      });
  };

//}); // end .ready()
