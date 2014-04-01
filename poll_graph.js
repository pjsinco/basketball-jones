var dataset;
//var teams = {};
//var teamlines = [];
//var weeks = [];
//
origStroke = 3;
hoverStroke = 10;
//
var svg = d3.select("body").append("svg");
//
//var polls = { "ap": "data/poll-data/2012-13-AP.csv", "coaches": "data/poll-data/2012-13-coaches.csv" };
//
//function displayPoll(thePoll) {
//	thePollPath = polls[thePoll];
//

d3.csv('data/poll-data/2012-13-AP.csv', function(error, data) {

  console.log(data);
	var teams = {};
  var teamlines = [];
  var weeks = [];
	dataset = data;

  // data wrangling
  for (var i=0;i<dataset.length;i++) {
  	if (dataset[i].Wk === "Wk") {
  		dataset.splice(i,1);
  	}
  } // end for

  // data wrangling
  for (var i=0;i<dataset.length;i++) {
  	line = dataset[i];
  	school = line.School;
  	week = parseInt(line.Wk);
  	line.Wk = week;
  	rank = parseInt(line.Rk);
  	line.Rk = rank;
  	starIndex = school.indexOf("*");
  	if (weeks.indexOf(line.Wk) === -1) {
  		weeks.push(line.Wk);
  	}
  	if (starIndex > 0) {
  		school = school.substring(0,starIndex);
  		line.School = school;
  	}
  	if (teams[school]) {
  		teams[school].push(line);
  	} else {
  		teams[school] = [line];
  	}
  } // end for

  // data wrangling
  for (var school in teams) {
  	rankedWeeks = [];
  	ranks = teams[school];
  	ranks.forEach(function(d) {
  		rankedWeeks.push(d.Wk);
  	})
  	if (rankedWeeks.length !== weeks.length) {
  		var diff = [];
  		var j=0;
  		for (var i=0;i<weeks.length;i++) {
  			if (rankedWeeks.indexOf(weeks[i]) === -1) {
  				diff.push(weeks[i]);
  			}
  		}
  		//console.log(school, diff);
  		diff.forEach(function(d) {
  			teams[school].push({"Wk": d, "Rk": "26"});
  		})
  	}
  	ranks = teams[school];
  	ranks.sort(function(a,b) {
  		return d3.ascending(a.Wk, b.Wk);
  	})
  } // end for

  maxWk = d3.max(weeks, function(d) { return d; });
  
  xscale = d3.scale.linear().domain([1,maxWk]).range([50,1600]);
  yscale = d3.scale.linear().domain([1,25]).range([50,700]);

  xaxis = d3.svg.axis()
  			.scale(xscale)
  			.orient("bottom")
  			.ticks(20);

  yaxis = d3.svg.axis()
  			.scale(yscale)
  			.orient("left")
  			.ticks(25);

  var teamline = d3.svg.line()
    .x(function(d) { 
        console.log(d);
        return xscale(d.Wk); 
    })
  	.y(function(d) { 
        console.log(d);
        //console.log('y: ', yscale(d.Rk));
        return yscale(d.Rk); 
     })
  	//.interpolate("cardinal");

  var myLine = d3.svg.line()
    .x(function(d) {
      console.log(d);
      return d.Wk;
    })
    .y(function(d) {
      console.log(d);
      return d.Rk;
    })

  var lineFunction = d3.svg.line()
    .x(function(d) { return xscale(d.Wk); })
    .y(function(d) { return yscale(d.Rk); })
    .interpolate("linear");

  var lineData = [ { "x": 1,   "y": 5},  { "x": 20,  "y": 20},
                   { "x": 40,  "y": 10}, { "x": 60,  "y": 40},
                   { "x": 80,  "y": 5},  { "x": 100, "y": 60}];

  
  console.log(lineFunction(data));

  svg.append("defs").append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", 1550)
      .attr("height", 660)
      .attr("x", 50)
      .attr("y", 40);

  count = 1;

    svg
      .selectAll('.teampath')
      .data(data)
      .exit()
      .remove();
  
  svg.selectAll('.teampath')
    .data(dataset)
    .enter()
      .append("path")
			//.attr('d', teamline)
  	  .attr('d', teamline)
			//.attr('class', function(d) {
        //return d.School;
      //})
  	  .classed("teampath", true)
      //.transition()
      //.duration(500)
      .style('fill', function(d) {
        //console.log(d);  
      })
  	  .style("fill", "none")
  	  .style("stroke-width", origStroke)
  	  .style("stroke", searchColor(school))

  svg.selectAll('.teampath')
  	.on("mouseover", function(d) {
  		var thepath = d3.select(this);
  		return highlightPath(thepath);
  	})
  	.on("mouseout", function(d) {
  		//var thepath = d3.select(this);
  		//thepath.style("stroke-width", origStroke);
  		return backToNormal();
  	})
    .style("clip-path", "url(#clip)")
  count++;

	  lastRk = teams[school][teams[school].length-1].Rk;
	  if (lastRk < 26) {
	  	svg.append("text")
	  		.attr("transform", "translate(1603,"+yscale(lastRk)+")")
	  		.attr("dy", ".25em")
	  		.attr("text-anchor", "start")
	  		.style("fill", searchColor(school))
	  		.on("mouseover", function() {
	  			//thisSchool = this.indexOf
	  			theSchool = this.innerHTML;
	  			theSchool = theSchool.substring((theSchool.indexOf(" ")+1));
	  			//console.log(theSchool);
	  			return highlightPath(null,theSchool);
	  		})
	  		.on("mouseout", function() {
	  			return backToNormal();
	  		})
	  		.text(lastRk + ": " + school);
	  }


  svg.append("g")
  	.attr("class", "axis")
  	.attr("transform", "translate(0,705)")
  	.call(xaxis);

  svg.append("g")
  	.attr("class", "axis")
  	.attr("transform", "translate(50,0)")
  	.call(yaxis);

}); // end d3.csv()
//}; // end displayPoll()

var allPaths;

function highlightPath(thePath,school) {

	d3.selectAll("path.teampath")
			.style("opacity", 0.25)
			.style("stroke-width", 1);

	if (thePath) {
		thePath.style("stroke-width", hoverStroke)
				.style("opacity", 1);
	}
	if (school) {
		thePath = d3.select("path."+school);
		thePath.style("stroke-width", hoverStroke)
				.style("opacity", 1);
	}
}

function backToNormal() {
	d3.selectAll("path.teampath")
					.style("opacity", 1)
					.style("stroke-width", origStroke);
}

//d3.select("input[value=\"ap\"]").on("click", displayPoll("ap"));
//d3.select("input[value=\"coaches\"]").on("click", displayPoll("coaches"));

//displayPoll("ap");
//displayPoll("coaches");
