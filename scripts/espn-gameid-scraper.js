$(document).ready(function() {
  console.log('big green');
  var gameIds = ['gameid'];
  var teamId;
  var indexId = 8;

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

  $.ajax({
    url: 'http://espn.go.com/mens-college-basketball/team/schedule/_/id/2168/year/2013/dayton-flyers',
    type: 'GET',
    success: function(data, textStatus) {
      
      //console.log($(data.responseText).filter("link[href*='espn.go.com/mens-college-basketball/team/schedule/_/id/']"));
      teamId = 
        getTeamIdFromLink(
          $(data.responseText)
            .filter("link[href*='/schedule/_/id/']").attr('href')
        );



      //console.log(data.responseText);
      //var teamId = getTeamIdFromLink(teamLink)
      $(data.responseText).find('li.score a').each(function(i) {
        gameIds.push($(this).attr('href').split('=').pop());
      });

      saveCsvToFile(gameIds, teamId + '.csv');
    } // end success 


  }); // end $.ajax()

});
