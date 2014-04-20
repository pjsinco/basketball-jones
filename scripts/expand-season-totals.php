#!/usr/bin/env php

<?php

  $mysqli = new mysqli('127.0.0.1:8889', 'root', 'root', 
    'rempatri_p2_10rempatrick_com');

  if ($mysqli->connect_errno) {
    printf('Connection failed: %s\n', $mysqli->connect_error);
    exit();
  } 

  $new_arr = array();

  $file = fopen('../data/season-totals-by-team.csv', 'r');
  $file_write = fopen('../data/test.csv', 'a');

  $headers = fgetcsv($file);
  print_r($d);
  
  while(($data = fgetcsv($file)) !== FALSE) {
    $sportsref = $data[0];

    $q = "
      select espn_id, friendly_school, conf_abbrev, friendly_full, 
        conf_friendly
      from cbb 
      where sportsref_id = '$sportsref'
    ";
    
    $res = $mysqli->query($q);

    $row = $res->fetch_assoc();

    $data['friendly_school'] = $row['friendly_school'];
    $data['team'] = $data[0];
    print_r($data);
    
  } // end while()

  //print_r($new_arr);  


?>
