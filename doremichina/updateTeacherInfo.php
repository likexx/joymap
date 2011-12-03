<?php
  require_once('./class/registration.php');
  
  $registration = new Registration();
  $result = $registration->updateTeacherInfo();

  echo $result;
?>