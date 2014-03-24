/*
* sports-ref schools list:
* http://www.sports-reference.com/cbb/schools/?redir
*/
  
/*
* espn schools list:
* http://espn.go.com/mens-college-basketball/standings
*/
console.log('hoya');

// clean up team names from espn list
d3.csv('../data/espn-ids.csv', function(error, data) {

  var teams = []
  data.forEach(function(d) {
    
    var teamSplit = d.school.replace(/[.',()&]/g,'').split('-');
    teamSplit.pop();
    var team = teamSplit.join('-');
    teams.push(team)
  }); // end data.forEach()

  d3.selectAll('p')
    .data(teams)
    .enter()
    .append('p')
      .text(function(d) {
        return d;
      })
      
}); // end d3.csv()
