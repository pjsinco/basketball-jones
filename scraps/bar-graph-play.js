console.log('blue demon');

// time scales
// http://jsfiddle.net/robdodson/KWRxW/
// http://bl.ocks.org/mbostock/1849162 // yes
// http://bl.ocks.org/mbostock/6186172
// http://bl.ocks.org/mbostock/1166403
// http://bl.ocks.org/phoebebright/3059392
// http://stackoverflow.com/questions/20181286/
//    how-to-use-d3-time-scale-to-generate-an-array-of-
//      evenly-spaced-dates
// http://stackoverflow.com/questions/10127402/
//    bar-chart-with-negative-values // yes

var margin = {
  top: 50,
  right: 50,
  bottom: 50,
  left: 50
}

var width = 800 - margin.left - margin.right;
var height = 200 - margin.top - margin.bottom;

var timeFormat = d3.time.format('%Y-%m-%d').parse;
// ex.: timeFormat('2013-01-05');
// returns a js Date object

var xScale = d3.scale.ordinal()
  //.range([0, width]);
  .rangeRoundBands([0, width], .7, 0.5);

var yScale = d3.scale.linear()
  .range([height, 0]);

var xAxis = d3.svg.axis()
  .scale(xScale)
  .orient('bottom')
  //.tickSize(6, 6)

var chart = d3.select('body')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ','
    + margin.top + ')');


getGames('2582', function(record, games) {
  console.log(record);
  console.log(games);

  //var extent = d3.extent(games.map(function(d) {
    //return timeFormat(d.details.date);
  //}));

  xScale
    .domain([0, games.length]);

  yScale
    .domain(d3.extent(games.map(function(d) {
      return d.details.home.pts - d.details.away.pts;
    })));

  console.log(yScale.domain());
  
  var marginExtent = games.map(function(d) {
    //console.log(d);
  })

  xAxis
    .tickValues(d3.range([1, games.length]))
  chart
    .append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis);

  chart
    .selectAll('bar')
    .data(games)
    .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', function(d, i) {
        return xScale(i);
      })
      .attr('y', function(d) {
        return yScale(d.details.home.pts - d.details.away.pts);
      })
      .attr('height', function(d) {
        return height - yScale(d.details.home.pts
          - d.details.away.pts);
      })
      .attr('width', xScale.rangeBand());

  console.log(xScale.rangeBand());
  

});




function getGames(team, callback) {
// returns stats for all season's games for the given team
  d3.json('../data/box-scores-all.json', function(error, data) {
    
    // count wins, losses
    var record = {
      wins: 0,
      losses: 0
    }
  
    var games = [];

    // find all games involving the team
    d3.keys(data).forEach(function(d) {
      if (data[d].details.away.id == team ||
        data[d].details.home.id == team) {
          games.push(data[d])
          if (data[d].details.winner == team) {
            record.wins++;
          } else {
            record.losses++;
          }
        }
      });

    callback(record, games);
  }); // end d3.json()
}
