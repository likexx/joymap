<?php
require_once('./class/dao.php');
require_once('./class/message.php');


$receiver = 0;

error_log('send message');

if (!isset($_POST['receiver'])) {
    // if receiver not defined, get the original sender by message id
    if (!isset($_POST['mid'])) {
        return;
    }
    
    $mid = $_POST['mid'];
        
    $conn = mysql_connect(DAO::SERVER, DAO::USER, DAO::PASSWORD);
            
    mysql_select_db(DAO::DATABASE, $conn);
        
    $sql = "select * from message where id='$mid'";
        
    error_log($sql);
    $result = mysql_query($sql, $conn);
    
    $rows = mysql_num_rows($result);
        
    if ($rows < 1) {
        mysql_close($conn);
        return;
    }
    
    $row = mysql_fetch_assoc($result); 
    
    $_POST['receiver'] = $row['sender'];
    
    mysql_close($conn);
} 

$m = new Message($_POST);

echo $m->save();

?>