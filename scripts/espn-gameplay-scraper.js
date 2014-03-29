(function() {
  console.log('flyer');

  var plays = []; // hold all our play objects
  var play = null;
  
  $.ajax({
    //url: '../scraps/espn-dayton-game.html',
    //url: 'http://espn.go.com/ncb/playbyplay?gameId=400504622',
    url: 'http://espn.go.com/ncb/playbyplay?gameId=323152168',
    type: 'GET',
    success: function(data, textStatus) {
      console.log(data);
      // grab all the rows
      var rows = $(data.responseText).find('.mod-data.mod-pbp tbody tr');
      var numRows = rows.length;
      // grab all the TDs
      var tds = $(rows).find('td');
      
      // dynamically establish number of TDs in each row
      var numTDsInRow = $(rows[0]).find('td').length;

      // grab all the TDs in each row, and process them
      rows.each(function(i) {
        plays[i] = {}; // set up a new play object ...
        play = plays[i]; // ... and put it in our array

        // process each TD
        var tds = $(this).find('td');
        tds.each(function(i) {
          console.log(i);
          if (i % numTDsInRow === 0) { 
            // we're in the first TD;
            // if there are no children; children in a TD indicated
            // something unusual, like a timeout or end of half;
            // i think there always is a clock TD, but just in case
            // let's check
            if ($(this).children().length < 1) { 
              play['clock'] = $(this).text().trim()
            } else {
              play['clock'] = '';
            }
          } else if (i % numTDsInRow === 1) { 
            // we're in the second TD;
            // make sure there are no children, which would
            // indicate something unusual
            console.log($(this));
            if ($(this).children().length < 1) {
              play['away_play'] = $(this).text();
            } else {
              play['away_play'] = '';
              play['score'] = '';
              play['home_play'] = '';
            }
          } else if (i % numTDsInRow === 2) {
            // we're in the third TD;
            // make sure there are no children, which would
            if ($(this).children().length < 1) {
              play['score'] = $(this).text();
            } else {
              play['score'] = '';
              play['home_play'] = '';
            }
          } else if (i % numTDsInRow === 3) {
            // we're in the third TD;
            // make sure there are no children, which would
            if ($(this).children().length < 1) {
              play['home_play'] = $(this).text();
            } else {
              play['home_play'] = '';
            }
          }
        });
        
      });
      
      console.log(plays);
    } // end success
  }); // end $.ajax()
})(); 
