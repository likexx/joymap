<?php
require_once('./class/user.php');
  
$currentUserId = $_COOKIE['userId'];

$user = new User($currentUserId);

echo $user->toJsonString();

?>