$(document).ready(function() {

  console.log('iron');

  var margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
  }
  //var width = 960 - margin.left - margin.right;
  //var height = 200 - margin.top - margin.bottom;
  var width = 960;
  var height = 136;

  var cellSize = 17;

  var day = d3.time.format('%w'); // weekday as integer
  var week = d3.time.format('%U'); // week # of the year
  var percent = d3.format('.1%');
  var dateFormat = d3.time.format('%Y-%m-%d');

  var colorScale = d3.scale.quantize()
    .range(
      d3.range(11)
        .map(function(d) {
          return 'q' + d + '-11';
        })
    );
  
  var svg = d3.select('body').selectAll('svg')
    .data([2012])
    .enter()
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'RdYlGn')
      .append('g')
        .attr('transform', 'translate(' 
          + ((width - cellSize * 53) / 2) + ','
          + (height - cellSize * 7 - 1) + ')')

//  svg
//    .append('text')
//    .attr('transform', 'translate(-6,' + (cellSize * 3.5)
//      + ')rotate(-90)')
//    .style('text-anchor', 'middle')
//    .text(function(d) {
//      return d
//    })
  
  //console.log(d3.time.days(new Date(2012, 10, 1), 
    //new Date(2013, 03, 31)));


  var rect = svg.selectAll('.day')
    .data(function() {
      return d3.time.days(new Date(2012, 10, 1),
        new Date(2013, 03, 30));
    })
    .enter()
      .append('rect')
      .attr('class', 'day')
      .attr('width', cellSize)
      .attr('height', cellSize)
      .attr('x', function (d) {
        return week(d) * cellSize;
      })
      .attr('y', function(d) {
        return day(d) * cellSize;
      })
      .datum(dateFormat)

  console.log(rect);
  rect
    .append('title')
    .text(function(d) {
      return d; 
    })

  svg
    .selectAll('.month')
    .data(function(d) {
      return d3.time.months(new Date(2012, 10, 1),
        new Date(2013, 03, 30));
    })
    .enter()
      .append('path')
      .attr('class', 'month')
      .attr('d', monthPath);

  

  // nifty!
  // stolen from http://bl.ocks.org/mbostock/4063318
  function monthPath(t0) {
    var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0);
    var d0 = +day(t0);
    var w0 = +week(t0);
    var d1 = +day(t1);
    var w1 = +week(t1);
    return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
      + "H" + w0 * cellSize + "V" + 7 * cellSize
      + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
      + "H" + (w1 + 1) * cellSize + "V" + 0
      + "H" + (w0 + 1) * cellSize + "Z";
  };
  
}); // end .ready()
