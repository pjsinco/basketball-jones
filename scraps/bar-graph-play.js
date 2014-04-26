console.log('blue demon');

// bar chart with negative values
// http://bl.ocks.org/mbostock/2368837

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
  .rangeRoundBands([0, width], 0.05);

var yScale = d3.scale.linear()
  .range([height, 0]);

var xAxis = d3.svg.axis()
  .scale(xScale)
  .orient('bottom')
  .tickSize(6, 6)

var chart = d3.select('body')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ','
    + margin.top + ')');

var teamHighlighted = '2582';

getGames(teamHighlighted, function(record, games) {
  //console.log(record);
  //console.log(games);

  //var extent = d3.extent(games.map(function(d) {
    //return timeFormat(d.details.date);
  //}));

  xScale
    .domain(d3.range(games.length));

  yScale
    .domain(d3.extent(games.map(function(d) {
      return d.details.home.pts - d.details.away.pts;
    })));

  console.log(games);
  var margins = games.map(function(d) {
    var margin;
    if (d.details.winner == teamHighlighted ) {
      margin = (d.details.side == 'home') ?
        +d.details.home.pts - d.details.away.pts :
        +d.details.away.pts - d.details.home.pts;
    } else {
      margin = (d.details.side == 'away') ? 
        +d.details.away.pts - d.details.home.pts :
        +d.details.home.pts - d.details.away.pts;
    }
    return margin;
  });

  console.log(margins);


  chart
    .append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis);

  chart
    .selectAll('.x.axis .tick')
    .text(function() { return null; });

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


}); // end getGames();




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
      // if our given team is in this object, 
      // include in games[] and incrent wins or losses
      if (data[d].details.away.id == team ||
        data[d].details.home.id == team) {
        
          // add a new property indicating which 
          // side team is, home or away
          if (data[d].details.away.id == team) {
            data[d].details.side = 'away';
          } else {
            data[d].details.side = 'home';
          }
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
} // end getGames
