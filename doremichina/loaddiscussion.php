<?php
require_once('./class/dao.php');
require_once('./class/discussion.php');

if (!isset($_POST['id'])) {
    return;
}

$id= $_POST['id'];


$sql = "select d.id,d.title,d.content,d.timestamp,d.zone,d.area,d.mainid,u.nickname as name from discussion d, user_basic u " .
       " where (d.id='$id' or d.mainid='$id') and d.userid=u.id";

$discussionlist = array();

$conn = mysql_connect(DAO::SERVER, DAO::USER, DAO::PASSWORD);
mysql_select_db(DAO::DATABASE, $conn);
    
$result = mysql_query($sql, $conn);

while ($row = mysql_fetch_assoc($result)) {
        $r = new Discussion($row);
        $discussionlist[] = $r;
    }
    
mysql_close($conn);

echo  json_encode(array('list'=>$discussionlist));


?>