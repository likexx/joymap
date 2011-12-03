<?php

require_once('./class/reviewlist.php');

if (!isset($_POST['id'])) {
   echo '{}';
   return;
}  

$gettotal = false;
if (isset($_POST['gettotal'])) {
    $gettotal = true;
}

$startnum = 0;
if (isset($_POST['startnum'])) {
    $startnum = $_POST['startnum'];
}

  
$reviews = new ReviewList();
$reviews->load($_POST['id'], $startnum, $gettotal);

echo $reviews->toJsonString();

?>
