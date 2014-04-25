console.log('blue demon');

// time scales
// http://jsfiddle.net/robdodson/KWRxW/
// http://bl.ocks.org/mbostock/1849162
// http://bl.ocks.org/mbostock/6186172
// http://bl.ocks.org/mbostock/1166403
// http://bl.ocks.org/phoebebright/3059392
// http://stackoverflow.com/questions/20181286/how-to-use-d3-time-scale-to-generate-an-array-of-evenly-spaced-dates

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

var xScale = d3.time.scale()
  .range([0, width]);

var yScale = d3.scale.linear()
  .range([height, 0]);

var svg = d3.select('body')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ','
    + margin.top + ')');


// returns stats for all season's games for the given team
function getGames(team) {
  d3.json('../data/box-scores-all.json', function(error, data) {
    
    // count wins, losses
    var record = {
      wins: 0,
      losses: 0
    }

    // find all games involving the team
    d3.keys(data).forEach(function(d) {
      if (data[d].details.away.id == team ||
        data[d].details.home.id == team) {
          if (data[d].details.winner == team) {
            record.wins++;
          } else {
            record.losses++;
          }
        }
      })

    return record;
  }); // end d3.json()
}
