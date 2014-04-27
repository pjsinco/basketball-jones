// re: para coords--lots of inspiration, ideas from:
// http://bl.ocks.org/mbostock/7586334
// http://exposedata.com/parallel/

var margin = {
    top: 30, 
    right: 10, 
    bottom: 10, 
    left: 10
}

var marginBar = {
  top: 10,
  right: 10,
  bottom: 10,
  left: 10
}

var width = 960 - margin.right - margin.left;
var height = 200 - margin.top - margin.bottom;

var widthBar = 670 - marginBar.right - marginBar.left;
var heightBar = 80 - marginBar.top - marginBar.bottom;

// set up our scales
var xScale = d3.scale.ordinal()
  .rangePoints([0, width], 1);

var xScaleBar = d3.scale.ordinal()
  .rangeRoundBands([0, widthBar], 0.15);

var yScale = {};

var yScaleBar = d3.scale.linear()
  .range([0, heightBar])
  .nice();

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

var svg = d3.select(".paracoords")
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
      'Team'        : d['friendly_school'].replace(/&/g, ''),
      'friendly'    : d['friendly_full'],
      'espn_id'     : d['espn_id'],
      'conf'        : d['conf_friendly'],
      'conf_abbrev' : d['conf_abbrev'],
      'FG%'         : +d['FGp'],
      '2P%'         : +d['2Pp'],
      '3P%'         : +d['3Pp'],
      'FT%'         : +d['FTp'],
      'REB'         : +d['TRB'],
      'AST'         : +d['AST'],
      'BLK'         : +d['BLK'],
      'STL'         : +d['STL'],
      'TOV'         : +d['TOV'],
      'PF'          : +d['PF'],
      'PTS/G'       : +d['PTSg']
    }
  });

  // these will be our y axes; exclude 'Team'
  dimensions = d3.keys(totals[0]).filter(function(d) {
    return d != 'Team' && d != 'espn_id' && d != 'conf'
      && d != 'conf_abbrev' && d != 'friendly';
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
  var table = d3.select('.table_container')
    .append('table')
    .attr('id', 'season_totals');

  var chart = d3.select('.table_container')
  //var chart = d3.select('body')
    //.append('div')
    //.attr('class', 'games_bar_chart') 
    .append('svg')
    .attr('width', widthBar + marginBar.left + marginBar.right)
    .attr('height', heightBar + marginBar.top + marginBar.bottom)
    .append('g')
    .attr('transform', 'translate(' + marginBar.left + ','
      + marginBar.top + ')');
  
  var thead = table.append('thead').append('tr');
  var tbody = table.append('tbody');

  thead
    .selectAll('th')
    .data(d3.keys(totals[0]).filter(function(d) {
      return d != 'espn_id' && d != 'conf' && d != 'conf_abbrev'
        && d != 'friendly';
    }))
    .enter()
      .append('th')
      .text(function(d) {
        return d;
      })
      .attr('class', 'asc')

  thead
    .selectAll('th')
    .on('click', function(d) {
      var curOrder = d3.select(this).attr('class');
      tbody
        .selectAll('tr')
        .sort(function(a, b) {
          if (curOrder == 'desc') {

            // if we have a tie, first sort by team name
            if (d3.ascending(a[d], b[d]) == 0) {

              // return the sorted team names
              return d3.ascending(a['Team'], b['Team'])

            } else {
              return d3.ascending(a[d], b[d])
            }
          } else {

            // if we have a tie, first sort by team name
            if (d3.descending(a[d], b[d]) == 0) {

              // return the sorted team names
              return d3.descending(a['Team'], b['Team'])

            } else {
              return d3.descending(a[d], b[d])
            }
          }
        });

      d3.select(this)
        .attr('class', function() {
          return curOrder == 'asc' ? 'desc' : 'asc';
        })
    });

  updateTable(); // draw the table


  // **NOT CURRENTLY IMPLEMENTEd **
  $('#team_search')
    .autocomplete({
      source: totals.map(function(d) {
        // source is names of all the teams
        return d.Team; 
      }),
      focus: function(event) {
        unhighlightSchool($(this).val());
      },
      close: function(event) {
        selectedSchool = $(this).val();
        highlightSchool(selectedSchool);
      }
    });

  /********************************************/
  /********************************************/
  /********************************************/

  var testTeam = 'Army';
  console.log(getTeamByName('Army').espn_id);
  getGames(getTeamByName(testTeam).espn_id, function(games) {
    xScaleBar
      .domain(d3.range(games.length));

    yScaleBar
      .domain(d3.extent(games.map(function(d) {
        return d.details.margin;
      })));

    console.log(yScaleBar.domain());
    console.log(games);
    console.log(chart);

    chart
      .selectAll('.bar')
      .data(games)
      .enter()
        .append('rect')
        .attr('class', function(d) {
          //console.log(d.details.margin < 0);
          return d.details.margin < 0 ? 'bar negative' : 'bar positive';
        })
        .attr('x', function(d, i) {
          return xScaleBar(i);
        })
        .attr('y', function(d) {
          return heightBar - yScaleBar(Math.max(0, d.details.margin));
        })
        .attr('height', function(d) {
          return Math.abs(yScaleBar(d.details.margin) - yScaleBar(0));
        })
        .attr('width', xScaleBar.rangeBand());
  
    chart
      .append('g')
      .attr('class', 'x axis')
      .append('line')
      .attr('y1', heightBar - yScaleBar(0))
      .attr('y2', heightBar - yScaleBar(0))
      .attr('x2', widthBar)

  });

  /********************************************/
  /********************************************/
  /********************************************/



  /************************************************
   *
   *              HELPER FUNCTIONS
   *
   *
  ************************************************/
  /*
   * Returns stats for all season's games for the given team
   */
  function getGames(team, callback) {
    d3.json('../data/box-scores-all.json', function(error, data) {
      
      var games = [];
  
      // find all games involving the team at hand
      d3.keys(data).forEach(function(d) {
  
        // if our given team is in this object, 
        // include it in games[] 
        if (data[d].details.away.id == team ||
          data[d].details.home.id == team) {
          
            // add a new property indicating which 
            // side team is, home or away
            if (data[d].details.away.id == team) {
              data[d].details.side = 'away';
            } else {
              data[d].details.side = 'home';
            }
  
            // add a property for margin of win, loss;
            // positive is win, negative is loss
            var margin;
            if (data[d].details.winner == team ) {
              margin = (data[d].details.side == 'home') ?
                +data[d].details.home.pts - data[d].details.away.pts :
                +data[d].details.away.pts - data[d].details.home.pts;
            } else {
              margin = (data[d].details.side == 'away') ? 
                +data[d].details.away.pts - data[d].details.home.pts :
                +data[d].details.home.pts - data[d].details.away.pts;
            }
  
            data[d].details.margin = margin;
  
            games.push(data[d])
          }
        });
  
      callback(games);
  
    }); // end d3.json
  } // end getGames

  /*
   * Highlight line for school in paracoords
   */
  function highlightSchool(school) {
    $(".foreground path[class='" + school + "']")
      .each(function(d) {
        $(this)
          .css('stroke-width', '5')
          .css('stroke', '#5654bf')
          .css('stroke-linecap', 'round')
          .appendTo($(this).parent()) // bring to front
      });
  }

  /*
   * Remove highlight from line in paracoords
   */
  function unhighlightSchool(school) {
    $(".foreground path[class='" + school + "']")
      .each(function() {
        $(this)
          .css('stroke-width', '1')
          .css('stroke', 'darkorange')
      })
  }
  
  /*
   * Draw and manage the table
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

    // for each team in selected[], bring in the team from totals[]
    var selectedTeams = totals.filter(function(d) {
      if (selected.indexOf(d['Team']) > -1) {
        return d;
      }
    });

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
    // snippet in part from HW1
    var cells = rows.selectAll('td')
      .data(function(d) {
        // turn d into team, which has some properties filtered out 
        // that we don't want to display in the table
        var team = {};
        var keys = d3.keys(d).filter(function(d) {
          return d != 'espn_id' && d != 'conf' && d != 'conf_abbrev'
            && d!= 'friendly';
        })
        keys.forEach(function(key) {
          team[key] = d[key];
        })
        
        return d3.range(Object.keys(team).length)
          .map(function(e, i){
            return team[Object.keys(team)[i]];
          });
      })
      .enter()
        .append('td')
        .text(function(d) {
          return d;
        });
    
    // interaction: highlight table rows and paracoords 
    // on mouseover
    var selectedSchool; 
    d3.selectAll('#season_totals tbody tr')
      .on('mouseover', function() {
        unhighlightSchool(selectedSchool);
        $(this).toggleClass('highlighted');
        
        // get school name from class
        selectedSchool = $(this).attr('class') 
          // distill class name down to school name
          .replace(/highlighted|opened/g, '') 
          .trim()

        highlightSchool(selectedSchool);

        d3.select('.details')
          .select('.team_name')
            .text(function() {
              return getTeamByName(selectedSchool)['friendly'];
            })

        d3.select('.team_conf')
          .text(function() {
            return getTeamByName(selectedSchool)['conf'] + ' Conference'
          });
        

      }) // end on-mouseover
      .on('mouseout', function() {
        $(this).toggleClass('highlighted');
        
        unhighlightSchool(selectedSchool);

      }) // end on-mouseout
      .on('click', function() {
        // remove any other 'opened' row
        $('.opened').not($(this))
          .toggleClass('opened');

        // open this row
        $(this).toggleClass('opened');
        $(this).effect('highlight')
          

      }) // end on-click
  } // end updateTable

  // return all a team's data for the given team name
  function getTeamByName(teamName) {
    var team;
    totals.forEach(function(d) {
      if (d['Team'] == teamName) {
        team = d;
      }
    });
    return team;
  } // end getTeamByName

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

