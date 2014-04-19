// based on 
// http://bl.ocks.org/jasondavies/1341281

var margin = {
  top: 30,
  right: 10,
  bottom: 10,
  left: 10
}
 
var width = 960 - margin.left - margin.right;
var height = 300 - margin.top - margin.bottom;

// set up our scales
var xScale = d3.scale.ordinal()
  .rangePoints([0, width], 1);

var yScale = {};

var dragging = {};
var background, foreground, dimensions, totals;

var axis = d3.svg.axis()
  .orient('left');

var line = d3.svg.line();

var svg = d3.select('body').append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ','
    + margin.top + ')');

  
d3.csv('../data/season-totals-by-team.csv', function(error, data) {
  totals = data.map(function(d) {
    return {
      team: d.Team,
      'FG%': parseFloat(d['FGp']),
      '2P%': parseFloat(d['2Pp']),
      '3P%': parseFloat(d['3Pp']),
      'AST': parseInt(d.AST),
      'STL': parseInt(d.STL),
      'PTS/G': parseFloat(d['PTSg']),
      'TOV': parseFloat(d['TOV']),
      'PF': parseFloat(d['PF']),
      'ORB': parseFloat(d['ORB']),
      'DRB': parseFloat(d['DRB'])
    };
  });

  dimensions = d3.keys(totals[0]).filter(function(d) {
    return d != 'team'; 
  });

  // set up our yScales
  dimensions.forEach(function(d) {
    yScale[d] = d3.scale.linear();
    yScale[d]
      .range([height, 0])
      .domain(d3.extent(totals, function(e) {
        return e[d];
      }));
  });

//  // extract the list of dimensions and create a scale for each
//  dimensions = d3.keys(totals[0])
//    .filter(function(d) {
//      return d != 'team' && (yScale[d] = d3.scale.linear()
//        .domain(d3.extent(totals, function(p) {
//          return (p[d]);
//        }))
//        .range([height, 0])
//  )});

  var table = d3.select('body').append('table');
  var thead = table.append('thead').append('tr');
  var tbody = table.append('tbody')

  thead
    .selectAll('th')
    .data(d3.keys(totals[0]))
    .enter()
      .append('th')
      .text(function(d) {
        return d;
      });

  var rows = tbody.selectAll('tr')
    .data(totals)
    .enter()
      .append('tr')
      .attr('class', function(d) {
        return d.team;
      })
       
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
  

  xScale
    .domain(dimensions)

  // add background lines for context
  background = svg.append('g')
    .attr('class', 'background')
  
  background
    .selectAll('path')
    .data(totals)
    .enter()
      .append('path')
      .attr('d', path)

  // gray foreground lines for focus
  foreground = svg.append('g')
    .attr('class', 'foreground')

  foreground
    .selectAll('path')
    .data(totals)
    .enter()
      .append('path')
      .attr('d', path)
      .on('mouseover', function(d) {
        d3.select(this)
          .style('stroke-width', '5px')
          .style('stroke', 'darkorange')
          .style('stroke-opacity', '1.0')
       svg
          .append('text')
          .attr('class', 'tooltip')
          .attr('text-anchor', 'middle')
          .attr('y', 0)
          .text(function() {
            return d.team;
          })

      })
      .on('mouseout', function() {
        d3.select(this)
          .style('stroke-width', '1px')
          .style('stroke', '#ccc')
          .style('stroke-opacity', '0.4')
        d3.select('.tooltip')
          .remove();
      })

  // add a group element for each dimension
  var g = svg.selectAll('.dimension')
    .data(dimensions)
    .enter()
      .append('g')
      .attr('class', 'dimension')
      .attr('transform', function(d) {
        return 'translate(' + xScale(d) + ',0)';
      })
      .call(d3.behavior.drag()
        .on('dragstart', function(d) {
          console.log(d);
          dragging[d] = this.__origin__ = xScale(d);
          background.attr('visibility', 'hidden');
        })
        .on('drag', function(d) {
          dragging[d] = Math.min(
            width, 
            Math.max(0, this.__origin__ += d3.event.dx)
          );
          foreground.attr('d', path);
          dimensions.sort(function(a, b) { 
            return position(a) - position(b); 
          });
          xScale.domain(dimensions);
          g.attr('transform', function(d) { 
            return 'translate(' + position(d) + ')'; 
          })
        })
        .on('dragend', function(d) {
          delete this.__origin__;
          delete dragging[d];
          transition(d3.select(this))
              .attr('transform', 'translate(' + xScale(d) + ')');
          transition(foreground)
              .attr('d', path);
          background
              .attr('d', path)
              .transition()
              .delay(500)
              .duration(0)
              .attr('visibility', null);

//        .on('dragstart', function(d) {
//          dragging[d] = this.__origin__ = xScale(d);
//          background
//            .attr('visibility', 'hidden');
//        })
//        .on('drag', function(d) {
//          dragging[d] = 
//            Math.min(w, Math.max(0, this.__origin__ += d3.event.dx));
//            foreground
//              .attr('d', path);
//            dimensions.sort(function(a, b) {
//              return position(a) - position(b); 
//            });
//            xScale
//              .domain(dimensions)
//            g
//              .attr('transform', function(d) {
//                return 'translate(' + position(d) + ')'
//              });
//        })
//        .on('dragend', function(d) {
//          delete this.__origin__;
//          delete dragging[d];
//          transition(d3.select(this))
//            .attr('transform', 'translate(' + xScale(d) + ')');
//          transition(foreground)
//            .attr('d', path);
//          background
//            .attr('d', path)
//            .transition()
//            .delay(500)
//            .duration(0)
//            .attr('visibility', null);
        })
      );

      // add an axis and title
      g
        .append('g')
        .attr('class', 'axis')
        .each(function(d) {
          d3.select(this).call(axis.scale(yScale[d]))
        })
        .append('text')
          .attr('text-anchor', 'middle')
          .attr('y', -9)
          .attr('class', 'dimension')
          .text(function(d) {
            return d;
          });

      g
        .append('g')
        .attr('class', 'brush')
        .each(function(d) {
          d3.select(this).call(yScale[d].brush
            = d3.svg.brush()
              .y(yScale[d])
              .on('brushstart', brushstart)
              .on('brush', brush)
          );
        })

}); // end d3.csv()

function position(d) {
  var v = dragging[d];
  return v == null ? xScale(d) : v;
}

function transition(g) {
  return g
    .transition()
    .duration(500);
}

function path(d) {
  return line(dimensions.map(function (p) {
    return [position(p), yScale[p](d[p])];
  }));
}

function brushstart() {
  d3.event.sourceEvent.stopPropagation();
}

function brush() {
  var actives = dimensions.filter(function(p) {
    return !yScale[p].brush.empty();
  });
  var extents = actives.map(function(p) {
    return yScale[p].brush.extent();
  });
  foreground
    .style('display', function(d) {
      return actives.every(function(p, i) {
        return extents[i][0] <= d[p] && d[p] <= extents[i][1];
      }) ? null : 'none';
    })
};
