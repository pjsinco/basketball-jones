$(document).ready(function() {
  console.log('huskie');

  // based on 
  // http://bl.ocks.org/tjdecke/5558084

  var margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
  };

  var width = 960 - margin.left - margin.right;
  var height = 960 - margin.top - margin.bottom;

  var cellSize = Math.floor(width / 20);
  var legendWidth = cellSize * 2;
  var buckets = 8;
  var days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  var months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
  //var day = d3.time.format('%w'); // weekday as decimal
  //var week = d3.time.format('%U'); // week # of year
  var dateFormat = d3.time.format('%Y-%m-%d');
  var colors = ['rgb(247,251,255)', 'rgb(222,235,247)',
    'rgb(198,219,239)', 'rgb(158,202,225)', 'rgb(107,174,214)', 
    'rgb(66,146,198)', 'rgb(33,113,181)', 'rgb(8,69,148)'];

  var dataset = [];
  var datesPlayed = {};

  var colorScale = d3.scale.quantile()
    .range(colors);
  
  var svg = d3.select('body').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', width + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ','
      + margin.top + ')');

  d3.csv('../data/all-games.csv', function(error, data) {
    // some routine data formatting
    dataset = data.map(function(d) {
      return {
        away_espn_id: d.away_espn_id,
        away_friendly_school: d.away_friendly_school,
        away_score: +d.away_score,
        conf_friendly: d.conf_friendly,
        date: dateFormat(new Date(d.date_time)),
        espn_game_id: d.espn_game_id,
        home_espn_id: d.home_espn_id,
        home_friendly_school: d.home_friendly_school,
        home_score: +d.home_score
      }
    });

    // set up count of games played on every day of season;
    // note: max # of games on a date is 154
    
    // get the season start and end dates
    var extent = d3.extent(dataset, function(d) { 
      return d.date; 
    });

    // calculate # of games each day
    dataset.forEach(function(d) {
      var date = d.date;
      if (datesPlayed[date]) {
        datesPlayed[date]++;
      } else {
        datesPlayed[date] = 1;
      }
    }); // end forEach()

    // set up domain of color scale
    colorScale
      .domain([0, buckets - 1, 154]) // MAGIC # ALERT 
    
    // set up day of week labels
    var dayLabels = svg.selectAll('.dayLabel')
      .data(days)
      .enter()
        .append('text')
        .attr('class', 'dayLabel mono axis')
        .text(function(d) {
          return d;
        })
        .attr('x', 0)
        .attr('y', function(d, i) {
          return i * cellSize;
        })
        .style('text-anchor', 'end')
        .attr('transform', 'translate(-6,' + cellSize / 1.5 + ')');

    var monthLabels = svg.selectAll('.monthLabel')
      .data(months)
      .enter()
        .append('text')
        .text(function(d) {
          return d; 
        })
        .attr('x', function(d, i) {
          return i * cellSize; 
        })
        .attr('y', 0)
        .style('text-anchor', 'middle')
        .attr('transform', 'translate(' + cellSize / 2 + ', -6)')
        .attr('class', 'monthLabel mono axis');
          
    console.log(d3.entries(datesPlayed).length);

    var heatMap = svg.selectAll('.day')
      .data(d3.entries(datesPlayed))
      .enter()
        .append('rect')
        .attr('class', 'day')
        .attr('height', cellSize)
        .attr('width', cellSize)
        .attr('x', function(d) {
          console.log(d);
        })
        // **INCOMPLETE*
  }); // end d3.csv()

  
});
