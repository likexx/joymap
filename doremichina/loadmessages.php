<?php
require_once('./class/dao.php');
require_once('./class/message.php');

if (!isset($_COOKIE['userId'])) {
        return self::ERROR_INVALID_USER;
}

$userid = 0;
if (!isset($_POST['receiver'])) {
   $userid=$_COOKIE['userId'];
} else {
   $userid=$_POST['receiver'];
}

$sql = "select m.*,u.nickname from message m, user_basic u where m.receiver='$userid' and u.id=m.sender";

$sql .= ' order by m.timestamp desc';
error_log($sql);

$list = array();

$conn = mysql_connect(DAO::SERVER, DAO::USER, DAO::PASSWORD);
mysql_select_db(DAO::DATABASE, $conn);
    
$result = mysql_query($sql, $conn);

while ($row = mysql_fetch_assoc($result)) {
        $r = new Message($row);
        $list[] = $r;
}
    
mysql_close($conn);

echo json_encode(array('list'=>$list));
?>