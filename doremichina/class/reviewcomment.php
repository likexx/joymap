<?php
require_once('dao.php');

class ReviewComment {

const ERROR_SUCCESS = 0;
const ERROR_TOO_FAST = 1;
const ERROR_CONTENT_TOO_SHORT = 2;
const ERROR_CONTENT_TOO_LONG = 3;
const ERROR_INVALID_USER = 4;
const ERROR_ERROR = 5;

public $id = 0;
public $reviewid = 0;
public $userid = 0;
public $username ='';
public $timestamp;
public $content = null;

public function __construct($data) {

    if (isset($data['id'])) {
        $this->id = $data['id'];
    }
    if (isset($data['reviewid'])) {
        $this->reviewid = $data['reviewid'];
    }
    if (isset($data['userid'])) {
        $this->userid = $data['userid'];
    }
    if (isset($data['username'])) {
        $this->username = $data['username'];
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
        'reviewid'=>$this->reviewid,
        'userid'=>$this->userid,
        'username'=>$this->username,
        'timestamp'=>$this->timestamp,
        'content'=>$this->content
    ));

}

public function save() {
    if (!isset($_COOKIE['userId'])) {
        return self::ERROR_INVALID_USER;
    }

    if ($this->content == null || strlen($this->content) < 1) {
        return self::ERROR_CONTENT_TOO_SHORT;
    }
    
    if ($this->reviewid == 0) {
        return self::ERROR_ERROR;
    }

    if (strlen($this->content) >= 4000) {
        return self::ERROR_CONTENT_TOO_LONG;
    }
    
    if ($this->userid == 0) {    
        $this->userid = $_COOKIE['userId'];
    }
    
    $this->content = htmlentities(trim($this->content),ENT_QUOTES, "UTF-8");
    
    try {
    $conn = mysql_connect(DAO::SERVER, DAO::USER, DAO::PASSWORD);
        
    mysql_select_db(DAO::DATABASE, $conn);
    
    $sql = "insert into review_comment (reviewid,userid,content) values ('" . $this->reviewid . "','" . $this->userid . "','" .  $this->content . "')";
    
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