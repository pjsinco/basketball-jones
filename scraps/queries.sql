create table cbb_games(
  espn_game_id CHAR(9) UNIQUE PRIMARY KEY,
  date_time VARCHAR(256),
  away_espn_id VARCHAR(8),
  away_friendly_school VARCHAR(128),
  away_score SMALLINT,
  home_espn_id VARCHAR(8),
  home_friendly_school VARCHAR(128),
  home_score SMALLINT,
  conf_friendly VARCHAR(128)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

create table cbb (
  espn_id VARCHAR(8) UNIQUE PRIMARY KEY,
  sportsref_id VARCHAR(64),
  teamrankings_id VARCHAR(64),
  friendly_school VARCHAR(128),
  friendly_full VARCHAR(128),
  conf_abbrev VARCHAR(128),
  conf_friendly VARCHAR(128),
  conf_sportsref_id VARCHAR(128)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

load data local infile '/home/rempatri/public_html/new-master-id.csv'
  into table cbb
  fields terminated by ','
  lines terminated by '\n'
  (@col1,@col2,@col3,@col4,@col5)
  set espn_id=@col1,
    sportsref_id=@col2,
    teamrankings_id=@col3,
    friendly_school=@col4,
    friendly_full=@col5

