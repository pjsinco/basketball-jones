# Basketball Jones
![NCAA basketball](images/ncaa-bb.jpg)
### Background and motivation
I like college basketball. I follow it on TV, on the Web and in newspapers. I read game summaries and analysis, pore over box scores, fret over the standings and chew on statistics. 

After a season has ended, we have thousands of games to look back on and try to make sense of. As a fan, I'm interested in performance--of players, teams, conferences. And I'm interested in comparing performance.


### Project objectives
College basketball junkies love statistics. But data, as found on popular sites like ESPN.com, Yahoo! Sports and Sports-Reference.com, as well as in newspapers, have one thing in common: They're tabular. Apparently, that's by convention. With this project, I've tried to reinvent descriptive statistics for college basketball as visualizations.

This project visually contextualizes the performance of all 342 Division I teams in the 2012-13 season. 

This visualization tracks several statistical categories, like points per game, rebounds, assists, for each time in the season. 

The question I want to answer: How does the performance of this team measure up?


### Data
For team and game data, I scraped ESPN.com and Sports-Reference.com. 

I found and used some Python scripts on Github for scraping Sports-Reference.com. I adapted those scripts to grab the season totals for each team.

Because the 2013-14 season was not over when I started collecting data, I used the 2012-13 season data so I didn't have to worry about rescraping as the season played out.

Although I myself ended up scraping all the data that I used in the project, I used some techniques I'm grateful to have learned from my former project partner, Juancarlos Aponte.

The data scraping was a huge job. In particular, scraping summary data for every game was a large project. Although I'm not very fluent in Python, it seemed the best tool for the job. So I learned as I went along. With more than 5,000 games, and needing to pause the script a few seconds between every call to a new page, the scraping process itself took a long time.

My data folder is full of data that I didn't end up using. I did spend a lot of time gathering that data. I don't see that spent time as a loss because I learned a lot about scraping. It's good to practice those skills, and it's fun to go out and grab data. 


### Data processing
Besides Python, I also wrote scripts in PHP, some of which involved MySQL queries, to process the data. I found Bash helpful for small tasks, like comparing files, checking for duplicates and other QC work. In particular, I used wc, uniq, curl, awk and grep.

Bringing all the data together--matching up team conference IDs from ESPN and sportsreference.com, and matching those IDs to full team and conference names--was also a chore. I relied heavily on a MySQL database I created.

One problem I had was when one of the 342 Division I schools played a team from a lower division. I didn't gather data on those non-Division I teams. So I punted and used a generic identifier for those teams: 'Lower Division Opponent.' 


### Visualization
![Basketball Jones](images/bjones.png)
The main visualization is based on parallel coordinates, with all 342 teams represented across several statistical categories. The attributes are season totals for stats, such as field-goal percentage, points-per-game, assists, turnovers, steals, three-point percentage and free-throw percentage. 

From the second I got it up and running, I was hooked on the parallel coordinates as the driving visualization. It is a very efficient way to compare team performance. Each category is filterable by brushing along the axis. It's fun to play with.

![Filter](images/bjones-filter.png)

Below the parallel coordinates is a table reflecting details of all the teams filtered in the parallel coordinates. Mousing over a table row highlights that team in the main vis, so it's easy to see how that team stacks up. Clicking on a table header sorts that column of data, either ascending or descending. 

Clicking on a table row, each of which represents a team, introduces another visualization. A bar chart appears, with a bar for every game of the season. The alignment and color of each bar indicates whether the game was a win or a loss, and height encodes the margin of the game result.

Also, subtle but helpful, after clicking on a table row, the team stays highlighted in the parallel coordinates, maintaining a view of the team's performance compared with the other teams.

Finally, mousing over a bar reveals a visualized summary for that game, with a radar chart showing a comparison of several statistics for both teams. 

![Layered view](images/bjones-game-view.png)

### Sketches
I stuck fairly closely to the sketch I liked best (labeled 'Latest working sketch'). I was happy with it. Also, in the beginning of the project I had flailed a bit in gathering the data and spent more time scraping than I had planned. So I was determined to be more focused in working on the actual vis. 

![Sketch](images/10-sketch.jpg)
![Sketch](images/01-sketch.jpg)
![Sketch](images/02-sketch.jpg)
![Sketch](images/03-sketch.jpg)
![Sketch](images/04-sketch.jpg)
![Sketch](images/05-sketch.jpg)
![Sketch](images/06-sketch.jpg)
![Sketch](images/07-sketch.jpg)
![Sketch](images/08-sketch.jpg)
![Sketch](images/09-sketch.jpg)


### Inspiration
![Inspiration - exposedata.com](images/01-inspiration.png)


![Inspiration - censusreporter.org](images/02-inspiration.png)


![Inspiration - sports-reference.com](images/03-inspiration.png)


![Inspiration - Wall Street Journal](images/04-inspiration.jpg)
