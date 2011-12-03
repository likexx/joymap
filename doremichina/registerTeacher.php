<?php
  require_once('./class/registration.php');
  
  $registration = new Registration();
  $result = $registration->registerTeacherInfo();
  echo $result;
?>