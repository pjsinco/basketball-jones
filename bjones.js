// lots of inspiration, ideas from here:
// http://bl.ocks.org/mbostock/7586334

// http://bl.ocks.org/jasondavies/1341281


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

var xAxis = d3.svg.axis()
  .orient("left");

var background, foreground, dimensions;
var selected = []; // will hold the brushed teams

var totals;

var svg = d3.select("body")
  .append("svg")
  .attr("width", width + margin.right + margin.left)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," 
      + margin.top + ")");

d3.csv("../data/season-totals-by-team.csv", function(error, data) {

  //console.log(data);
  totals = data.map(function(d) {
    return {
      '2p'   : +d['2P'],
      '2pa'  : +d['2PA'],
      '2pp'  : +d['2Pp'],
      '3p'   : +d['3P'],
      '3pa'  : +d['3PA'],
      '3pp'  : +d['3Pp'],
      'ast'  : +d['AST'],
      'blk'  : +d['BLK'],
      'drb'  : +d['DRB'],
      'fg'   : +d['FG'],
      'fga'  : +d['FGA'],
      'fgp'  : +d['FGp'],
      'ft'   : +d['FT'],
      'fta'  : +d['FTA'],
      'ftp'  : +d['FTp'],
      'g'    : +d['G'],
      'orb'  : +d['ORB'],
      'pf'   : +d['PF'],
      'pts'  : +d['PTS'],
      'ptsg' : +d['PTSg'],
      'stl'  : +d['STL'],
      'tov'  : +d['TOV'],
      'trb'  : +d['TRB'],
      'team' : d['Team']
    }
  });

  // these will be our y axes; exclude 'team'
  dimensions = d3.keys(totals[0]).filter(function(d) {
    return d != 'team';
  });

  // set up our yScales
  dimensions.forEach(function(d) {
    yScale[d] = d3.scale.linear()
      .range([height, 0])
      .domain(d3.extent(totals, function(teamStats) {
        return teamStats[d];
      }))
  });
    
  // xScale's domain is all our yScale axes
  xScale
    .domain(dimensions)

  // add a line for each team in the background
  background = svg.append('g')
    .attr('class', 'background')
    .selectAll('path')
    .data(totals)
    .enter()
      .append('path')
      .attr('class', function(d) {
        return d['team'];
      })
      .attr('d', path)

  // ... and one for each team brushed
  foreground = svg.append('g')
    .attr('class', 'foreground')
    .selectAll('path')
    .data(totals)
    .enter()
      .append('path')
      .attr('class', function(d) {
        return d['team'];
      })
      .attr('d', path)
      .on('mouseover', function(d) {
        //console.log(d['team']);
      })


  // add g element for each dimension (each y-axis)
  var g = svg.selectAll('.dimension')
    .data(dimensions)
    .enter()
      .append('g')
      .attr('class', 'dimension')
      .attr('transform', function(d) {
        return 'translate(' + xScale(d) + ')';
      })
      .call(d3.behavior.drag() // allow user to rearrange axes
        .on('dragstart', function(d) {
          dragging[d] = this.__origin__ = xScale(d);
          background
            .attr('visibility', 'hidden');
        }) // end 'dragstart'
        .on('drag', function(d) {
          dragging[d] = Math.min(
            width, Math.max(0, this.__origin__ += d3.event.dx)
          );
          foreground
            .attr('d', path);
          dimensions 
            .sort(function(a, b) {
              return position(a) - position(b);
            }) 
          xScale
            .domain(dimensions)
          g
            .attr('transform', function(d) {
              return 'translate(' + position(d) + ')';
            })
        }) // end 'drag'
        .on('dragend', function(d) {
          delete this.__origin__;
          delete dragging[d];
          transition(d3.select(this))
            .attr('transform', 'translate(' + xScale(d) + ')'); 
          transition(foreground)
            .attr('d', path)
          background
            .attr('d', path)
            .transition()
            .delay(500)
            .duration(0)
            .attr('visibility', null);
        }) // end 'dragend'
      ); // end call()
  
  // add an axis and title
  g
    .append('g')
    .attr('class', 'axis')
    .each(function(d) {
      d3.select(this)
        .call(
          xAxis
            .scale(yScale[d])
        );
    })
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('y', -9)
    .text(String)

  // add a brush for each axis
  g
    .append('g')
    .attr('class', 'brush')
    .each(function(d) {
      d3.select(this)
        .call(
          yScale[d].brush = d3.svg.brush()
            .y(yScale[d])
              .on('brushstart', brushstart)
              .on('brush', brush)
              .on('brushend', updateTable)
        );
    })
    .selectAll('rect')
    .attr('x', -8)
    .attr('width', 16)

  // add a table
  var table = d3.select('body').append('table');
  var thead = table.append('thead').append('tr');
  var tbody = table.append('tbody');

  thead
    .selectAll('th')
    .data(d3.keys(totals[0]))
    .enter()
      .append('th')
      .text(function(d) {
        return d;
      });

  /*
   *HELPER FUNCTIONS
   */
  function updateTable() {
    // get selected teams
    $.each(
      $(".foreground path:not([style*='display: none'])"), 
        function() { 
          selected.push($(this).attr('class'));
        }
    ); // end .each()

    // for each team in selected[], bring in the team from totals[]
    selected = totals.filter(function(d) {
      if (selected.indexOf(d['team']) > -1) {
        return d;
      }
    })

    var rows = tbody.selectAll('tr')
      .data(selected)

    // remove the table rows already there ...
    rows
      .exit()
      .remove();
    
    // ... and make new ones
    rows
      .enter()
        .append('tr')
        .attr('class', function(d) {
          return d['team'];
        })

    // populate the cells;
    // snippet from HW1
    var cells = rows.selectAll('td')
      .data(function(d) {
        return d3.range(Object.keys(d).length)
          .map(function(e, i){
            return d[Object.keys(d)[i]];
          });
      })
      .enter()
        .append('td')
        .text(function(d) {
          return d;
        });
    
  }

  function position(d) {
    var v = dragging[d];
    return v == null ? xScale(d) : v;
  }
  
  function transition(g) {
    return g
      .transition()
      .duration(500);
  }
  
  // return the path for a given data point
  function path(d) {
    return line(
      dimensions
        .map(function(e) { 
          return [position(e), yScale[e](d[e])]; }
        )
    );
  }
  
  // when brushing, don’t trigger axis dragging
  function brushstart() {
    d3.event.sourceEvent.stopPropagation();
  }

  // our brush event--toggle the display of foreground lines
  function brush() {
    selected = []; // reset selected teams

    var actives = dimensions.filter(function(d) { 
        return !yScale[d].brush.empty(); //return nonempty brushes
    });

    var extents = actives.map(function(d) {
        return yScale[d].brush.extent(); 
      });


    foreground
      .style("display", function(d) {
        return actives.every(function(e, i) {
          return extents[i][0] <= d[e] && d[e] <= extents[i][1];
        }) ? null : "none";
      });

  } // end brush()

}); // end d3.csv()

// get array of selected lines with this selector:
// d3.selectAll(".foreground path:not([style*='display: none'])")

// get length of that selection
// d3.selectAll(".foreground path:not([style*='display: none'])")[0].length

// get class name in jquery:
//$(".foreground path:not([style*='display: none'])").attr('class')

