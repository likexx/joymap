<?php
require_once('./class/dao.php');

$ERROR=0;

$username=$_POST['username'];
$password=$_POST['password'];
error_log($username . '   ' . $password);

if (strlen($password)==0) {
    echo $ERROR;
    return;
}

$username = htmlentities(trim($username),ENT_QUOTES, "UTF-8");
$passwordHash = md5($password);

$conn = mysql_connect(DAO::SERVER, DAO::USER, DAO::PASSWORD);
        
mysql_select_db(DAO::DATABASE, $conn);
    
$sql = "select id from user_basic where username='$username' && password='$passwordHash'";
    
$result = mysql_query($sql, $conn);
    
$rows = mysql_num_rows($result);
    
if ($rows < 1) {
   mysql_close($conn);
   echo $ERROR;
   return;
}

$row = mysql_fetch_assoc($result);

$uid = $row['id'];
setcookie('userId', $uid, time()+3600*24*30);

echo 1;

?>