#!/usr/bin/env python

from bs4 import BeautifulSoup
import urllib2
import time 
import csv
import re
import json

base_url = 'http://espn.go.com/ncb/boxscore?gameId='


# indices of home, away totals in list of tbody elems
away_tr_index = 2 
home_tr_index = 5

# file of 5000+ game id's we'll read from
  #open ('../data/all-gameids-2012-13.csv', 'r')
csv_file = \
  open ('../data/some-gameids.csv', 'r')


# set up our game dictionary
game = {'game_id': None, 'date': None, 'away': None, 'home': None}
game['away'] = \
  { \
    'away_id': None, \
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
game['home'] = \
  { \
    'home_id': None, \
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

for line in csv_file:
  # clear the dictionary
  game['game_id'] = None
  game['date'] = None
  for key in game['away'].keys():
    game['away'][key] = None
  for key in game['home'].keys():
    game['home'][key] = None


  url = 'http://espn.go.com/ncb/boxscore?gameId=%s' % (line)

  response = \
    urllib2.urlopen(url)
  content = response.read()
  soup = BeautifulSoup(content)

  # grab the date and turn it into YYYY-mm-dd 
  date = soup.select('.game-time-location p')[0] \
    .string.split(' ')[:-4:-1]
  date = time.strptime(' '.join(date), '%Y %d, %B')
  date = time.strftime('%Y-%m-%d', date)

  away_id = soup.select('.team.away a')[0]['href'] \
    .split('/')[-2:-1]
  home_id = soup.select('.team.home a')[0]['href'] \
    .split('/')[-2:-1]

  print away_id, home_id
  
  # rows where we find the stats we need
  away_tr = soup.select('tbody')[away_tr_index].find('tr')
  home_tr = soup.select('tbody')[home_tr_index].find('tr')
  
  #for td in away_tr.select('td'):
  for num in range(2, len(away_tr.select('td'))):
    if (away_tr.select('td')[num].contents):
    
      away_tr.select('td')[num].string
  
  game['game_id'] = line.replace('\n', '')
  game['date'] = date.replace('\n', '')
  game['away']['away_id'] = away_id[0]
  game['home']['home_id'] = home_id[0]

  with open('../data/%s.json' % (line), 'w') as outfile:
    json.dump(game, outfile)
  #print len(away_tr.select('td'))
  #print len(home_tr.select('td'))
  
  #for td in away_tr:
    #print td.string
  
  #for td in home_tr:
    #print td.string
  
  #be a good citizen
  time.sleep(2)

