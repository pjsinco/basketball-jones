$(document).ready(function() {
  console.log('big green');
  var gameIds = ['gameid'];
  var teamId;
  var indexId = 8;
  var baseUrl = 'http://espn.go.com/mens-college-basketball/team/schedule/_/id/';

  var saveCsvToFile = function(arrayOfLines, fileName) {
      /* adds linebreaks at the end*/
      var blob, blobText;
      blobText = arrayOfLines.map(function(d) {
        if (d.endsWith("\n")) {
          return d;
        } else {
          return d + "\n";
        }
      });
      blob = new Blob(blobText, {
        type: "text/plain;charset=utf-8"
      });
      return saveAs(blob, fileName);
    };

  var getTeamIdFromLink = function(link) {
    return link.split('/')[indexId].trim();
  }
  
  var getGameIdList = function(teamId) {
      $.ajax({
        url: baseUrl + teamId,
        type: 'GET',
        success: function(data, textStatus) {
          
          gameIds = ['gameid'];

          // grab all the game ids
          $(data.responseText).find('li.score a').each(function(i) {
            gameIds.push($(this).attr('href').split('=').pop());
          });

          saveCsvToFile(gameIds, teamId + '.csv');
        } // end success 
      }); // end $.ajax()
  };

  function sleep(millis, callback, param) {
    window.setTimeout(function() {
      callback(param);
    }, millis);
  };

  d3.csv('../data/new-master-id.csv', function(error, data) {

    data.forEach(function(d) {
      
      // pause a few seconds between calls
      // ***** PAUSE DOESN'T WORK ********
      sleep(3000, getGameIdList, d.espn_id);

    }); // end data.forEach()
  }); // end d3.csv();
}); // end ready();
