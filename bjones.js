// re: para coords--lots of inspiration, ideas from:
// http://bl.ocks.org/mbostock/7586334
// http://exposedata.com/parallel/

var margin = {
    top: 30, 
    right: 10, 
    bottom: 10, 
    left: 10
}

var width = 960 - margin.right - margin.left;
var height = 300 - margin.top - margin.bottom;

// set up our scales
var xScale = d3.scale.ordinal()
  .rangePoints([0, width], 1);

var yScale = {};

var dragging = {};

var line = d3.svg.line()
  .interpolate('cardinal')
  .tension(0.95)

var xAxis = d3.svg.axis()
  .orient("left");

var background, foreground, dimensions;
var selected = []; // will hold the brushed teams

var totals;

var percentFormat = d3.format('%')

var svg = d3.select("body")
  .append("svg")
  .attr("width", width + margin.right + margin.left)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," 
      + margin.top + ")");

d3.csv("../data/season-totals.csv", function(error, data) {

  //console.log(data);
  totals = data.map(function(d) {
    return {
      'Team' : d['friendly_school'].replace(/&/g, ''),
      'FG%'  : +d['FGp'],
      '2P%'  : +d['2Pp'],
      '3P%'  : +d['3Pp'],
      'FT%'  : +d['FTp'],
      'REB'  : +d['TRB'],
      'AST'  : +d['AST'],
      'BLK'  : +d['BLK'],
      'STL'  : +d['STL'],
      'TOV'  : +d['TOV'],
      'PF'   : +d['PF'],
      'PTS/G' : +d['PTSg']
    }
  });

  console.log(totals);
  // these will be our y axes; exclude 'Team'
  dimensions = d3.keys(totals[0]).filter(function(d) {
    return d != 'Team';
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
    .data(totals, function(d) {
      return d.Team;
    })
    .enter()
      .append('path')
      .attr('class', function(d) {
        return d['Team'];
      })
      .attr('d', path)

  // ... and one for each team brushed
  foreground = svg.append('g')
    .attr('class', 'foreground')
    .selectAll('path')
    .data(totals, function(d) {
      return d.Team;
    })
    .enter()
      .append('path')
      .attr('class', function(d) {
        return d['Team'];
      })
      .attr('d', path)
      .on('mouseover', function(d) {
        //console.log(d['Team']);
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
  var table = d3.select('body')
    .append('div')
    .attr('class', 'table_container')
    .append('table');

  table
    .attr('id', 'season_totals');
  
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
    selected = [];

    // get selected teams
    $.each(
      $(".foreground path:not([style*='display: none'])"), 
        function() { 
          selected.push($(this).attr('class'));
        }
    ); // end .each()

    console.log(selected);

    // for each team in selected[], bring in the team from totals[]
    var selectedTeams = totals.filter(function(d) {
      if (selected.indexOf(d['Team']) > -1) {
        return d;
      }
    })

    console.log(selectedTeams);
    //console.log(selected.forEach(function(d) {console.log(d['team']);}));


    var rows = tbody.selectAll('tr')
      .data(selectedTeams, function(d) {
        // key function to associate the row with a team
        return d['Team']; 
      })

    // remove the table rows already there ...
    rows
      .exit()
      .remove();
    
    // ... and make new ones
    rows
      .enter()
        .append('tr')
        .attr('class', function(d) {
          return d['Team'];
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
    
    var selectedSchool; 
    d3.selectAll('#season_totals tbody tr')
      .on('mouseover', function() {
        $(this).toggleClass('highlighted');
        
        // get school name from class
        selectedSchool = $(this).attr('class') 
            .replace(/highlighted/g, '')
            .trim()

        $(".foreground path[class='" + selectedSchool + "']")
          .each(function(d) {
            $(this)
              .css('stroke-width', '5')
              .css('stroke', '#5654bf')
              .css('stroke-linecap', 'round')
              .appendTo($(this).parent()) // bring to front
          });
      }) // end on
      .on('mouseout', function() {
        $(this).toggleClass('highlighted');

        $(".foreground path[class='" + selectedSchool + "']")
          .each(function() {
            $(this)
              .css('stroke-width', '1')
              .css('stroke', 'darkorange')
          })
      }) // end on
      .on('click', function() {
        $('.opened').not($(this))
          .toggleClass('opened');

        $(this).toggleClass('opened');
      })
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

  } // end brush


}); // end d3.csv()












// get array of selected lines with this selector:
// d3.selectAll(".foreground path:not([style*='display: none'])")

// get length of that selection
// d3.selectAll(".foreground path:not([style*='display: none'])")[0].length

// get class name in jquery:
//$(".foreground path:not([style*='display: none'])").attr('class')

