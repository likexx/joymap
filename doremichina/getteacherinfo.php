<?php
require_once('./class/teacherinfo.php');

  
$currentUserId = $_COOKIE['userId'];

$teacher = new TeacherInfo($currentUserId);

echo $teacher->toJsonString();


?>
