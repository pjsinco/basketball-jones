#!/usr/bin/env python

#selenium webdriver api
#http://selenium-python.readthedocs.org/getting-started.html

####################
# work in progress #
####################

from selenium import webdriver
from datetime import date, datetime, timedelta
import time 

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

team = 'georgia-tech'

#open firefox
driver = webdriver.Firefox()

for d in perdelta(startdate, enddate, timedelta(days = 1)):

  #be a good citizen
  time.sleep(2)

  #open a url
  driver.get('%s%s-%s.html' % \
    ('http://www.sports-reference.com/cbb/boxscores/', d, team))
  
  #if we hit upon a game on that date, scrape it
  if not (driver.title.startswith('File Not Found')):

    #find the element we want -- the 'CSV' link
    elem = driver.find_element_by_xpath('//span[contains(@onclick, \
      "table2csv(\'%s")]' % (team))

    #click it
    elem.click()

    #scrape it
    pre = driver.find_element_by_tag_name('pre')
    text = pre.text

    #save scraped data to a file
    file = open('../data/%s-%s.csv' % (d, team), 'w')
    file.write(text)
    file.close()

#close driver
driver.close()


"""
NOTES


"""
