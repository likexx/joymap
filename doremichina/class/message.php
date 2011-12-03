<?php
require_once('dao.php');

class Message {

const ERROR_SUCCESS = 0;
const ERROR_TOO_FAST = 1;
const ERROR_CONTENT_TOO_SHORT = 2;
const ERROR_CONTENT_TOO_LONG = 3;
const ERROR_INVALID_USER = 4;
const ERROR_ERROR = 5;

public $id = 0;
public $receiver = 0;
public $sender = 0;
public $private = 1;
public $timestamp;
public $content = null;

public function __construct($data) {

    if (isset($data['id'])) {
        $this->id = $data['id'];
    }
    if (isset($data['receiver'])) {
        $this->receiver = $data['receiver'];
    }
    if (isset($data['sender'])) {
        $this->sender = $data['sender'];
    }
    if (isset($data['private'])) {
        $this->private = $data['private'];
    }
    if (isset($data['timestamp'])) {
        $this->timestamp = $data['timestamp'];
    }
    if (isset($data['content'])) {
        $this->content = $data['content'];
    }

}

public function toJsonString() {

    return json_encode(array(
        'id'=>$this->id,
        'receiver'=>$this->receiver,
        'sender'=>$this->sender,
        'timestamp'=>$this->timestamp,
        'content'=>$this->content
    ));

}

public function save() {
    if (!isset($_COOKIE['userId'])) {
        return self::ERROR_INVALID_USER;
    }
    error_log('check content');
    if ($this->content == null || strlen($this->content) < 5) {
        return self::ERROR_CONTENT_TOO_SHORT;
    }

    if (strlen($this->content) >= 400) {
        return self::ERROR_CONTENT_TOO_LONG;
    }
    
    error_log('check receiver');
    if ($this->receiver == 0){
        return self::ERROR_ERROR;
    }
    
    $userid = $_COOKIE['userId'];
    
    if ($this->sender == 0) {
        $this->sender = $userid;    
    }
    
    $this->content = htmlentities(trim($this->content),ENT_QUOTES, "UTF-8");
    
    try {
    $conn = mysql_connect(DAO::SERVER, DAO::USER, DAO::PASSWORD);
        
    mysql_select_db(DAO::DATABASE, $conn);
    
    $sql = "insert into message (receiver,sender,private,content) values ('" . $this->receiver . "','" . $this->sender . "','" . $this->private . "','" . $this->content . "')";
    error_log($sql);
    
    $result = mysql_query($sql, $conn);

    mysql_close($conn);
    
    return self::ERROR_SUCCESS;
    } catch(Exception $e) {
        return self::ERROR_ERROR;
    }

}


public function update() {


}

}


?>