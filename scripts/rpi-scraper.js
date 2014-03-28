$(document).ready(function() {
  var rows = $('table.sortable tr[class^="div_"]');
  var link = window.location.href.split('/').pop()
  var week = link.split('-').pop().split('.')[0];
  var comps = link.split('-')
  var date = comps[0] + '-' + comps[1] + '-' + comps[2];

  var csv =['Wk,Date,Rk,School,ID,Rating,Prev,High,Low'];

  rows.each(function(index, element) {
    var rank = $(this).find('td:nth-child(1)').text();
    var teamLink = $(this).find('a').attr('href');
    var school = $(this).find('a').text()
    var rpi = $(this).find('td:nth-child(3)').text();
    var high = $(this).find('td:nth-child(4)').text();
    var low = $(this).find('td:nth-child(5)').text(); 
    var last = $(this).find('td:nth-child(6)').text(); 

    var id = teamLink.split('/').pop();

    var line = String(week + ',' + date + ',' + rank 
      + ',' + school + ',' + id + ',' + rpi + ',' + last + ',' 
      + high + ',' + low);
    csv.push(line);

  })

  var saveToFile = function(arrayOfLines, fileName) {
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
  //console.log(csv[13].endsWith('p'));
  //console.log('Patrick'.endsWith('p'));
  var filename = 'rpi-' + date + '-week-' + week + '.csv';

  saveToFile(csv, filename);

});
