#!/usr/bin/env python

#selenium webdriver api
#http://selenium-python.readthedocs.org/getting-started.html

####################
# work in progress #
####################

from bs4 import BeautifulSoup
import urllib2
import time 
import csv
import re

# string we'll take out of conference names 
replace = ' Conference'

csv_file = \
  open('../data/ids-by-website/sportsref-ids-edit.csv', 'r') \
    .readlines()

#save scraped data to a file
file = open('../scraps/sportsref-confs.csv', 'wb')

csvwriter = csv.writer(file)
csvwriter.writerow(['team_id', 'conf_abbrev', 'conf_friendly', 'conf_id'])

for team in csv_file:
  team = team.strip('\n')

  #abilene-christian was not in div 1 in 2012-13
  if (team == 'abilene-christian'):
    continue

  base_url = 'http://www.sports-reference.com/cbb/schools/' + \
    '%s/2013-schedule.html' % (team)

  response = urllib2.urlopen(base_url)
  content = response.read()
  soup = BeautifulSoup(content)
  title = soup.find('title').text
  
  # if we have an actual school page and not the school index
  if not (title.startswith('School Index')):
    # fetch full conference name
    try:
      conf_abbrev = soup.find('div', {'id': 'info_box'}) \
        .select('a[href*="/cbb/conference"]')[0].text

      conf_id = soup.find('div', {'id': 'info_box'}) \
        .select('a[href*="/cbb/conference"]')[0] \
          ['href'].split('/')[3]

      conf_url = \
        'http://www.sports-reference.com/cbb/conferences/%s/2013.html' \
        % (conf_id)
      conf_response = urllib2.urlopen(conf_url)
      conf_content = conf_response.read()
      conf_soup = BeautifulSoup(conf_content)
      conf_selector = '/cbb/conferences/%s' % (conf_id)
      conf_friendly = conf_soup.select('a[href*="' + conf_selector \
        + '"]')[0].text
      conf_friendly = re.sub(replace, '', conf_friendly)

    except (IndexError, AttributeError) as e:
      conf_abbrev = 'NONE'
      conf_id = 'none'
      conf_friendly = 'None'
        
    else:
      print team, conf_abbrev, conf_id, conf_friendly

      csvwriter.writerow([team, conf_abbrev, conf_friendly, conf_id])
      continue

  #be a good citizen
  time.sleep(1)

file.close()
csv_file.close()
