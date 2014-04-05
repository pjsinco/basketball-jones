#!/usr/bin/env python

#selenium webdriver api
#http://selenium-python.readthedocs.org/getting-started.html

####################
# work in progress #
####################

from selenium import webdriver
from datetime import date, datetime, timedelta
import time 
import os

#open firefox
driver = webdriver.Firefox()

csv = open('../data/ids-by-website/sportsref-ids-edit.csv', 'r') \
  .readlines()

for team in csv:
  team = team.strip('\n')

  #abilene-christian was not in div 1 in 2012-13
  if (team == 'abilene-christian'):
    continue

  #open a url
  driver.get('http://www.sports-reference.com/cbb/schools/%s/2013-schedule.html' % \
    (team))
  
  #echo out current game so we know what's going on
  print ('http://www.sports-reference.com/cbb/schools/%s/2013-schedule.html' % \
    (team))

  #be a good citizen
  time.sleep(4)
  
  #if we hit upon a game on that date, scrape it
  if not (driver.title.startswith('School Index')):

    #find the element we want -- the 'CSV' link
    elem = driver.find_element_by_xpath('//span[contains(@onclick, \
      "table2csv(")]')
  
    #click it
    elem.click()
  
    #scrape it
    pre = driver.find_element_by_tag_name('pre')
    text = pre.text
  
    #save scraped data to a file
    file = open('../data/team-schedules/%s.csv' \
      % (team), 'w')
    file.write(text)
    file.close()

#close driver
driver.close()
