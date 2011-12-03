<?php

require_once('./class/userreview.php');

$teacher_id = 0;
if (isset($_COOKIE['userId']) && 
    ($_COOKIE['userId'] != $_POST['teacher_id'])) {
    $review = new UserReview($_POST);
    $teacher_id = $review->save();
}

echo json_encode(array('teacher_id'=>$teacher_id));      
?>