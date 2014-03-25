/*
* sports-ref schools list:
* http://www.sports-reference.com/cbb/schools/?redir
*/
  
/*
* espn schools list:
* http://espn.go.com/mens-college-basketball/standings
*/

/*
 * teamrankings list:
 * http://www.teamrankings.com/ncaa-basketball/team/njit
 */
console.log('hoya');

// clean up team names 
//d3.csv('../data/espn-ids.csv', function(error, data) {
d3.csv('../data/teamrankings-ids.csv', function(error, data) {
  d3.selectAll('p')
    .data(data)
    .enter()
    .append('p')
      .text(function(d) {
        return d.teamrankings_id;
      })

  console.log(data);
  var teams = []
  data.forEach(function(d) {
    
    var teamSplit = d.teamrankings_id.replace(/[.',()&]/g,'').split('-');
    teamSplit.pop();
    var team = teamSplit.join('-');
    teams.push(team)
  }); // end data.forEach()

//  d3.selectAll('p')
//    .data(teams)
//    .enter()
//    .append('p')
//      .text(function(d) {
//        return d;
//      })
      
}); // end d3.csv()
