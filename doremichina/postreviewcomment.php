<?php

require_once('./class/reviewcomment.php');

$comment = new ReviewComment($_POST);

echo $comment->save();

?>