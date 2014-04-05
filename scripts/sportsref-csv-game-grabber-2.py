#!/usr/bin/env python

#selenium webdriver api
#http://selenium-python.readthedocs.org/getting-started.html

####################
# work in progress #
####################

from selenium import webdriver
from datetime import date, datetime, timedelta
import time 
import csv
from collections import defaultdict
import os

#http://stackoverflow.com/questions/10688006/
#  generate-a-list-of-datetimes-between-an-interval-in-python
def perdelta(start, end, delta):
  curr = start
  while curr < end:
    yield curr
    curr += delta

#rough season start and end dates
startdate = date(2012, 11, 01)
enddate = date(2013, 04, 15)

#open firefox
#driver = webdriver.Firefox()


for team in os.listdir('../data/team-schedules/'):

  if team.endswith('csv'):
    team = team.split('.')[0]
    print team

#  #abilene-christian was not in div 1 in 2012-13
  if (team == 'abilene-christian'): 
    continue

  #make a team directory if one doesn't exist
  directory = '../data/' + team
  if not os.path.exists(directory):
    os.makedirs(directory)

  cols = defaultdict(list)

  with open ('/Users/pj/Sites/basketball-jones/data/team-schedules/%s.csv'  % (team)) as f:
            
    reader = csv.DictReader(f)
    for row in reader:
      for (k, v) in row.items():
        cols[k].append(v)

  print cols['Date']
  
#  #loop through the season
#  for d in perdelta(startdate, enddate, timedelta(days = 1)):
#  
#    #be a good citizen
#    time.sleep(2)
#  
#    #open a url
#    driver.get('%s%s-%s.html' % \
#      ('http://www.sports-reference.com/cbb/boxscores/', d, team))
#    
#    #echo out current game so we know what's going on
#    print '%s%s-%s.html' % \
#      ('http://www.sports-reference.com/cbb/boxscores/', d, team)
#
#    #if we hit upon a game on that date, scrape it
#    if not (driver.title.startswith('File Not Found')):
#
#      #initialize opponent
#      opp = None 
#
#      #figure out who the opponent is
#      hrefs = driver.find_elements_by_xpath( \
#        '//*[@id="four_factors"]/tbody/tr/td/a')
#
#      #hrefs = driver.find_elements_by_xpath('//h1/a') 
#      print len(hrefs)
#    
#      if len(hrefs) > 1:
#        for link in hrefs:
#          team_index = 5
#          t = link.get_attribute('href').split('/')[team_index]
#          print 't: %s - team: %s' % (t, team)
#          if t != team:
#            print 't is now opp'
#            opp = t
#            break
#
#      #find the element we want -- the 'CSV' link
#      elem = driver.find_element_by_xpath('//span[contains(@onclick, \
#        "table2csv(\'%s")]' % (team))
#  
#      #click it
#      elem.click()
#  
#      #scrape it
#      pre = driver.find_element_by_tag_name('pre')
#      text = pre.text
#  
#      #save scraped data to a file
#      file = open('../data/%s/%s-%s-%s.csv' \
#        % (team, d, team, opp), 'w')
#      file.write(text)
#      file.close()

#close driver
#driver.close()
