
<?php
require_once('./class/teacherinfo.php');

$userId = isset($_COOKIE['userId']) ? $_COOKIE['userId'] : 0;

$teacherId = $_POST['teacher_id'];
$teacher = new TeacherInfo($teacherId);

echo $teacher->toJsonString();
?>
