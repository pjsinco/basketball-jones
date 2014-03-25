console.log('ewing');

var url = 'http://www.sports-reference.com/cbb/schools/'

// verify sports-ref ids
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
