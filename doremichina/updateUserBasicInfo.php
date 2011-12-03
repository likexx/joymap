<?php
  require_once('./class/registration.php');
  
  $registration = new Registration();
  $result = $registration->updateUserBasicInfo();
  echo $result;
?>