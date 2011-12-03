<?php

require_once('./class/discussion.php');

$discussion = new Discussion($_POST);

echo $discussion->save();

?>