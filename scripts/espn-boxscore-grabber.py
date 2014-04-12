#!/usr/bin/env python

from bs4 import BeautifulSoup
import urllib2
import time 
import csv
import re

base_url = 'http://espn.go.com/ncb/boxscore?gameId=400499237'

response = urllib2.urlopen(base_url)
content = response.read()
soup = BeautifulSoup(content)

# indices of home, away totals in list of tbody elems
away_tr_index = 2 
home_tr_index = 5

away_id = soup.select('.team.away a')[0]['href'] \
  .split('/')[-2:-1]
home_id = soup.select('.team.home a')[0]['href'] \
  .split('/')[-2:-1]

away_tr = soup.select('tbody')[away_tr_index].find('tr')

home_tr = soup.select('tbody')[home_tr_index].find('tr')

for td in away_tr:
  print td.string

for td in home_tr:
  print td.string

#be a good citizen
time.sleep(1)

