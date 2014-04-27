// help from bar chart with negative values
// http://bl.ocks.org/mbostock/2368837

var margin = {
  top: 10,
  right: 10,
  bottom: 10,
  left: 10
}

var width = 600 - margin.left - margin.right;
var height = 70 - margin.top - margin.bottom;

var timeFormat = d3.time.format('%Y-%m-%d').parse;
// ex.: timeFormat('2013-01-05');
// returns a js Date object

var xScale = d3.scale.ordinal()
  .rangeRoundBands([0, width], 0.15);

var yScale = d3.scale.linear()
  .range([0, height])
  .nice();

//var xAxis = d3.svg.axis()
//  .scale(xScale)
//  .orient('bottom')
//  .tickSize(6, 6)

//var yAxis = d3.svg.axis()
//  .scale(yScale)
//  .orient('left')

var chart = d3.select('body')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ','
    + margin.top + ')');

var teamHighlighted = '2582';

getGames(teamHighlighted, function(games) {

  xScale
    .domain(d3.range(games.length));

  yScale
    .domain(d3.extent(games.map(function(d) {
      return d.details.margin;
    })));

  console.log(yScale.domain());
  console.log(games);
  console.log(chart);


  //chart
    //.selectAll('.x.axis .tick')
    //.text(function() { return null; });

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
        return xScale(i);
      })
      .attr('y', function(d) {
        return height - yScale(Math.max(0, d.details.margin));
      })
      .attr('height', function(d) {
        return Math.abs(yScale(d.details.margin) - yScale(0));
      })
      .attr('width', xScale.rangeBand());

//  chart
//    .append('g')
//    .attr('class', 'y axis')
//    .attr('transform', 'translate(0,' + height + ')')
//    .call(yAxis);

  chart
    .append('g')
    .attr('class', 'x axis')
    .append('line')
    .attr('y1', height - yScale(0))
    .attr('y2', height - yScale(0))
    .attr('x2', width)

}); // end getGames();


 /*
  * Returns stats for all season's games for the given team
  *
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
