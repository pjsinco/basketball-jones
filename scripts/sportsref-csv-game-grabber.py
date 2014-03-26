#!/usr/bin/env python

#selenium webdriver api
#https://selenium-python.readthedocs.org/en/latest/api.html

#work in progress

from selenium import webdriver
from selenium.webdriver.common.keys import Keys

#open firefox
driver = webdriver.Firefox()

#open a url
driver.get('http://www.sports-reference.com/cbb/boxscores/2012-12-29-georgia-tech.html')

#find the element we want -- the 'CSV' link
csv = driver.find_element_by_css_selector("span[tip$='comma-separated values']")

#click it
csv.click()

#scrape it

#save it to a file
