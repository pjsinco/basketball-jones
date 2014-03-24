console.log('ewing');

var url = 'http://www.sports-reference.com/cbb/schools/'

//d3.csv('../data/espn-teams-stripped.csv', function(error, data) {
d3.csv('../data/ids-espn-sports-ref.csv', function(error, data) {
  data.forEach(function(d) {
    $.ajax({
      url: url + d.sports_ref_id,
      type: 'GET',
      cache: false,
      complete: function(request, textStatus) {
        console.log('checking ' + d.sports_ref_id);
        if (request.responseText.indexOf('School Index') > 0) {
          console.log(' didn\'t find');
          addGraph(d.school);
        } else { 
          console.log(' ok');
        }
      }
    }); // end $.ajax()
  }); // end data.forEach()

}); // end d3.csv();

function addGraph(str) {
  d3.select('body')
    .append('p')
    .text(str);
}

/*
 * Problem names 
 */
// ole-miss
// bowling
// alabama-a&m
// detroit
// charleston
// liu-brooklyn
// unc-asheville
// unc-greensboro
// north-carolina-a&t
// texas-a&m
// prairie-view-a&m
// uc-santa-barbara
// siu-edwardsville
// southern-miss
// st-francis-u
// st-johns
// southern-university
// saint-marys
// st-peters
// tcu-horned
// tennessee-tech-golden
// virginia-military
// uc-riverside
// william-&-mary
// grambling-state
// bryant-university
// usc-upstate
// uc-irvine
// uc-davis
// louisiana-lafayette-ragin
// texas-a&m
// american-university
// albany-great
// florida-a&m
// georgia-tech-yellow
