from bs4 import BeautifulSoup
import urllib2
import time 
import json
import pprint

base_url = 'http://espn.go.com/ncb/boxscore?gameId='

# indices of home, away totals in list of tbody elems
away_tr_index = 2 
home_tr_index = 5

# file of 5000+ game id's we'll read from
csv_file = \
  open ('../data/all-gameids-2012-13.csv', 'r')
  #open ('../data/some-gameids.csv', 'r')

# set up our game dictionary
games = {}

# for every gameid we have
for game_id in csv_file:
  
  game_id = game_id.replace('\n', '')
  print game_id

  # declare a new game
  game = {}
  game = {'details': None}
  game['details'] = {'date': None, 'winner': None, \
    'away': None, 'home': None}
  game['details']['away'] = \
    {
      'id': None, \
      'fga': None, \
      'fgm': None, \
      '3pa': None, \
      '3pm': None, \
      'fta': None, \
      'ftm': None, \
      'oreb': None, \
      'dreb': None, \
      'reb': None, \
      'ast': None, \
      'stl': None, \
      'blk': None, \
      'to': None, \
      'pf': None, \
      'pts': None \
    }
  game['details']['home'] = \
    {
      'id': None, \
      'fga': None, \
      'fgm': None, \
      '3pa': None, \
      '3pm': None, \
      'fta': None, \
      'ftm': None, \
      'oreb': None, \
      'dreb': None, \
      'reb': None, \
      'ast': None, \
      'stl': None, \
      'blk': None, \
      'to': None, \
      'pf': None, \
      'pts': None \
    }
      
  try:
    url = 'http://espn.go.com/ncb/boxscore?gameId=%s' % (game_id)

    response =  urllib2.urlopen(url)
    content = response.read()
    soup = BeautifulSoup(content)

    # grab the date and turn it into YYYY-mm-dd 
    date = soup.select('.game-time-location p')[0] \
      .string.split(' ')[:-4:-1]
    date = time.strptime(' '.join(date), '%Y %d, %B')
    date = time.strftime('%Y-%m-%d', date)

    ids = {
      'away_id': soup.select('.team.away a')[0]['href'] \
        .split('/')[-2:-1],
      'home_id': soup.select('.team.home a')[0]['href'] \
      .split('/')[-2:-1]
    }

    
    # rows where we find the stats we need
    stat_rows = { \
      'away': soup.select('tbody')[away_tr_index].find('tr'), \
      'home': soup.select('tbody')[home_tr_index].find('tr') \
    }
    
    for team in stat_rows:
      num_fields = len(stat_rows[team].select('td'))
      print num_fields

      for num in range(2, num_fields):

        game['details'][team]['id'] = ids['%s_id' % (team)][0]

        val = stat_rows[team].select('td')[num].string

        if (num == 2): # process FG%
          val = val.split('-')
          game['details'][team]['fga'] = val[1]
          game['details'][team]['fgm'] = val[0]
        elif (num == 3): # process 3P%
          val = val.split('-')
          game['details'][team]['3pa'] = val[1]
          game['details'][team]['3pm'] = val[0]
        elif (num == 4): # process FT%
          val = stat_rows[team].select('td')[num].string.split('-')
          game['details'][team]['fta'] = val[1]
          game['details'][team]['ftm'] = val[0]
        elif (num == 5): # process FT%
          game['details'][team]['oreb'] = val

        elif (num == 6 and num_fields == 13): 
          game['details'][team]['reb'] = val
        elif (num == 6 and num_fields == 14): 
          game['details'][team]['dreb'] = val

        elif (num == 7 and num_fields == 13): 
          game['details'][team]['ast'] = val
        elif (num == 7 and num_fields == 14): 
          game['details'][team]['reb'] = val

        elif (num == 8 and num_fields == 13): 
          game['details'][team]['stl'] = val
        elif (num == 8 and num_fields == 14): 
          game['details'][team]['ast'] = val

        elif (num == 9 and num_fields == 13): 
          game['details'][team]['blk'] = val
        elif (num == 9 and num_fields == 14): 
          game['details'][team]['stl'] = val

        elif (num == 10 and num_fields == 13):
          game['details'][team]['to'] = val
        elif (num == 10 and num_fields == 14):
          game['details'][team]['blk'] = val

        elif (num == 11 and num_fields == 13):
          game['details'][team]['pf'] = val
        elif (num == 11 and num_fields == 14):
          game['details'][team]['to'] = val

        elif (num == 12 and num_fields == 13):
          game['details'][team]['pts'] = val
        elif (num == 12 and num_fields == 14):
          game['details'][team]['pf'] = val

        elif (num == 13): # process FT%
          game['details'][team]['pts'] = val

      if (game['details']['away']['pts'] > \
        game['details']['home']['pts']):
          w_id = game['details']['away']['id']
      else:
          w_id = game['details']['home']['id']
        
        
      game['details']['winner'] = w_id
      game['details']['date'] = date
      games[game_id] = game

  finally:
    with open('../data/box-scores.json', 'w') as outfile:
      json.dump(games, outfile)
      
  #be a good citizen
  time.sleep(1)

with open('../data/box-scores.json', 'w') as outfile:
  json.dump(games, outfile)
