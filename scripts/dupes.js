console.log('hiya');

d3.json('../data/box-scores-all.json', function(data) {
  d3.keys(data).forEach(function(d) {
    console.log(d);
  });
});
