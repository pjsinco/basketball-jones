$(document).ready(function() {

  var plays = []; // hold all our play objects
  var play = null;
  var awayId, homeId, fileName;
  var baseUrl =  'http://espn.go.com/ncb/playbyplay?gameId=';
  var indexId = 7; 
  // index of espn id after splitting on '/' on a team's url

  var saveJsonToFile = function(object, filename){
      var blob, blobText;
      blobText = [JSON.stringify(object)];
      blob = new Blob(blobText, {
          type: "text/plain;charset=utf-8"
      });
      saveAs(blob, filename);
  }

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

  // take a team's espn url and parse out the espn id
  var getTeamIdFromLink = function(link) {
    return link.split('/')[indexId].trim();
  }
  
  d3.csv('../data/game-ids.csv', function(error, data) {
    // grab 200 ids to scrape
    var idsToScrape = [];
    for (var i = 0; i < 200; i++) {
      console.log(data[i].game_id);
      idsToScrape.push(data[i].game_id);
    }

    idsToScrape.forEach(function(d) {
      $.ajax({
        url: baseUrl + d,
        //url: 'http://espn.go.com/ncb/playbyplay?gameId=323152168',
        type: 'GET',
        success: function(data, textStatus) {

          awayId
            = getTeamIdFromLink($(data.responseText)
              .find('.team.away h3 a')
              .attr('href'));
          homeId
            = getTeamIdFromLink($(data.responseText)
              .find('.team.home h3 a')
              .attr('href'));

          // grab all the rows
          var rows = $(data.responseText).
            find('.mod-data.mod-pbp tbody tr');
          var numRows = rows.length;

          // dynamically establish baseline number of <td>s in each row
          var numTDsInRow = $(rows[0]).find('td').length;

          // grab all the <td>s in each row, and process them
          rows.each(function(i) {
            // initialize a new object in our plays array ...
            plays[i] = {}; 
            // ... and grab hold of it
            play = plays[i]; 

            // process each <td>
            var tds = $(this).find('td');
            tds.each(function(k) {
              
              // if we're in the first <td>
              if (k % numTDsInRow === 0 
                && $(this).attr('colspan') != 4) { 
                // note: there's a blank line, which we want to ignore,
                // after the end of the the 1st half; 
                // the blank line can be identified
                // by <td colspan=4>; so make sure colspan != 4
                // before we write anything
                  play['clock'] = $(this).text().trim()
              } else if (k % numTDsInRow === 1) { 
                // we're in the second <td>: away team's play;
                // check that there are more than 2 <td>s in this row;
                // if there aren't, there's been a gameply stoppage 
                // like a timeout or end of half;
                // we'll note the score at the end of a half, as well
                // as that a half has ended; we'll not  
                // mention when timeout has happened
                if (tds.length > 2) {
                  play['away_play'] = $(this).text().trim();
                } else { // ... play stoppage
                  var stoppageEvent = $(this).children().text(); 
                  // twist back to grab the score from the previous row
                  var score = $(this).parent('tr')
                    .prev('tr').find('td:nth-child(3)').text().trim();
                  play['away_play'] = '';
                  // away score is listed first ... 
                  play['away_score'] = score.split('-')[0]; 
                  // ... and team_score is last
                  play['team_score'] = score.split('-')[1]; 
                  play['home_play'] = '';
                  // and note the event that stopped the game
                  play['stoppage'] = stoppageEvent;
                }
              } else if (k % numTDsInRow === 2) {
                // we're in the third <td>, the one with the score;
                // we probably don't need to check number 
                // of <td>s at this
                // point, but we will just to be safe
                if (tds.length > 2) {
                  var score = $(this).text().trim().split('-');
                  play['away_score'] = score[0];
                  play['home_score'] = score[1];
                } else {
                  play['away_score'] = '';
                  play['home_score'] = '';
                  play['home_play'] = '';
                  play['stoppage'] = '';
                }
              } else if (k % numTDsInRow === 3) {
                // we're in the third <td>: the home play;
                // again, check tds.length just to be safe
                if (tds.length > 2) {
                  play['home_play'] = $(this).text().trim();
                } else {
                  play['home_play'] = '';
                }
              }
            });
            
          });
          

          /****** SAVE JSON **********
          ***************************/
          var fileName =  awayId + '-' + homeId + '-' + d
            + '.json';

          saveJsonToFile(plays, fileName);
          /***************************
          ***************************/

          //http://stackoverflow.com/questions/11257062/
          //  converting-json-object-to-csv-format-in-javascript
          function convertToCSV(objArray) {
            var array = 
              typeof objArray 
                != 'object' ? JSON.parse(objArray) : objArray;

            var arrOfStr = []
            arrOfStr.push('clock,away_play,score,home_play');
            for (var i = 0; i < array.length; i++) {
              var str = '';
              var line = '';
              for (var index in array[i]) {
                if (line != '') {
                  line += ',';
                }

                line += array[i][index];
              }

              str += line + '\r\n';
              arrOfStr.push(str);
            }

            return arrOfStr;
          }

          //convert plays array to CSV
          //var csv = convertToCSV(plays);
          //saveCsvToFile(csv, 'temp.csv'); // temp name for now

        } // end success
      }); // end $.ajax()
    }); // end data.forEach()
  }); // end d3.csv()
}); 
