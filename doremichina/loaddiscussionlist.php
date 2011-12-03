<?php
require_once('./class/dao.php');
require_once('./class/discussion.php');

$gettotal = false;
$MAX_NUM = 5;

if (!isset($_POST['zone']) || !isset($_POST['area'])) {
    return;
}

$startnum = 0;

if (isset($_POST['startnum'])) {
   $startnum = $_POST['startnum'];
}

if (isset($_POST['gettotal'])) {
    $gettotal = true;
}

$sql = "select t.id as teacherid, t.speciality1 as spec1, t.speciality2 as spec2, t.speciality3 as spec3, dis.* from (select d.id,d.userid,d.title,d.timestamp,d.zone,d.area,d.mainid,d.replies,u.nickname as name from discussion d, user_basic u where u.id = d.userid and d.mainid=0 and ";
$gettotal_sql = "select count(*) as total from discussion d, user_basic u where u.id=d.userid and d.mainid=0 and ";

if (isset($_POST['area']) && $_POST['area'] > 0) {
    $condition = " d.area='" . $_POST['area'] . "'";
    $sql .= $condition;
    $gettotal_sql .= $condition;
} else {
    $condition = " d.zone='" . $_POST['zone'] . "'";
    $sql .= $condition;
    $gettotal_sql .= $condition;
}


$sql .= ") dis left join teacher_info t on dis.userid=t.id ";

$sql .= " order by dis.id desc limit " . $startnum . "," . $MAX_NUM;

$discussionlist = array();

$conn = mysql_connect(DAO::SERVER, DAO::USER, DAO::PASSWORD);
mysql_select_db(DAO::DATABASE, $conn);

$total = 0;
if ($gettotal) {
    $result = mysql_query($gettotal_sql, $conn);
    $row = mysql_fetch_assoc($result);
    $total = $row['total'];
}
    
$result = mysql_query($sql, $conn);

$count = 0;
while ($row = mysql_fetch_assoc($result)) {
        $r = new Discussion($row);
        $discussionlist[] = $r;
        $count++;
    }

    
mysql_close($conn);

echo  json_encode(array('total'=>$total, 'islast'=>($count < $MAX_NUM),'list'=>$discussionlist));

?>