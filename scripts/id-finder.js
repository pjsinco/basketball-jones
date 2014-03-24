// unix fu to grab schools from sports-reference
// curl -A "Mozilla/5.0 (compatible; MSIE 7.01; Windows NT 5.0)" http://www.sports-reference.com/cbb/schools/?redir > ~/Desktop/search2.html
// grep -o -E 'href=".*"' search2.html | cut -d'"' -f2 | grep '/cbb/schools/' | cut -d'/' -f4

/*
* Sports-ref schools list:
* http://www.sports-reference.com/cbb/schools/?redir
*/
  
console.log('hoya');

d3.csv('../data/espn-ids.csv', function(error, data) {
  //console.log(data);

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
