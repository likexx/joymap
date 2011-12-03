<?php
require_once('./class/dao.php');
require_once('./class/reviewcomment.php');

$gettotal = false;
$MAX_NUM = 5;

if (!isset($_POST['reviewid'])) {
    return;
}

$startnum = 0;

if (isset($_POST['startnum'])) {
   $startnum = $_POST['startnum'];
}

if (isset($_POST['gettotal'])) {
    $gettotal = true;
}

$sql = "select c.*, u.nickname as username from review_comment c, user_basic u where u.id = c.userid and c.reviewid='" . $_POST['reviewid'] . "' ";
$gettotal_sql = "select count(id) as total from review_comment where reviewid='" . $_POST['reviewid'] . "'";

$sql .= " order by c.id desc limit " . $startnum . "," . $MAX_NUM;

$commentlist = array();

$conn = mysql_connect(DAO::SERVER, DAO::USER, DAO::PASSWORD);
mysql_select_db(DAO::DATABASE, $conn);

$total = 0;
if ($gettotal) {
    $result = mysql_query($gettotal_sql, $conn);
    $row = mysql_fetch_assoc($result);
    $total = $row['total'];
}
    
$result = mysql_query($sql, $conn);

while ($row = mysql_fetch_assoc($result)) {
        $r = new ReviewComment($row);
        $commentlist[] = $r;
    }
    
mysql_close($conn);

echo  json_encode(array('total'=>$total, 'list'=>$commentlist));

?>