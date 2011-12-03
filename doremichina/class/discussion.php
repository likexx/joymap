<?php
require_once('dao.php');

class Discussion {

const ERROR_SUCCESS = 0;
const ERROR_TOO_FAST = 1;
const ERROR_CONTENT_TOO_SHORT = 2;
const ERROR_CONTENT_TOO_LONG = 3;
const ERROR_INVALID_USER = 4;
const ERROR_ERROR = 5;

public $id = 0;
public $zone = 0;
public $area = 0;
public $mainid = 0;
public $userid = 0;
public $timestamp;
public $title = null;
public $content = null;
public $username = null;
public $replies = 0;
public $teacherid = 0;
public $spec1 = 0;
public $spec2 = 0;
public $spec3 = 0;

public function __construct($data) {

    if (isset($data['id'])) {
        $this->id = $data['id'];
    }
    if (isset($data['zone'])) {
        $this->zone = $data['zone'];
    }
    if (isset($data['area'])) {
        $this->area = $data['area'];
    }
    if (isset($data['mainid'])) {
        $this->mainid = $data['mainid'];
    }
    if (isset($data['userid'])) {
        $this->userid = $data['userid'];
    }
    if (isset($data['timestamp'])) {
        $this->timestamp = $data['timestamp'];
    }
    if (isset($data['title'])) {
        $this->title = $data['title'];
    }
    if (isset($data['content'])) {
        $this->content = $data['content'];
    }
    
    if (isset($data['name'])) {
        $this->username = $data['name'];
    }
    
    if (isset($data['replies'])) {
        $this->replies = $data['replies'];
    }
    
    if (isset($data['teacherid'])) {
        $this->teacherid = $data['teacherid'];
    }

    if (isset($data['spec1'])) {
        $this->spec1 = $data['spec1'];
    }
    if (isset($data['spec2'])) {
        $this->spec2 = $data['spec2'];
    }
    if (isset($data['spec3'])) {
        $this->spec3 = $data['spec3'];
    }

}

public function toJsonString() {

    return json_encode(array(
        'id'=>$this->id,
        'zone'=>$this->zone,
        'area'=>$this->area,
        'mainid'=>$this->mainid,
        'userid'=>$this->userid,
        'username' => $this->username,
        'timestamp'=>$this->timestamp,
        'title'=>$this->title,
        'content'=>$this->content,
        'replies' => $this->replies,
        'teacherid'=>$this->teacherid,
        'spec1'=>$this->spec1,
        'spec2'=>$this->spec2,
        'spec3'=>$this->spec3
    ));

}

public function save() {
    if (!isset($_COOKIE['userId'])) {
        return self::ERROR_INVALID_USER;
    }
    
    if ($this->content == null || strlen($this->content) < 5) {
        return self::ERROR_CONTENT_TOO_SHORT;
    }

    if (strlen($this->content) >= 10000 || strlen($this->title) >= 1000) {
        return self::ERROR_CONTENT_TOO_LONG;
    }
    
    if ($this->zone == 0 && $this->area == 0){
        return self::ERROR_ERROR;
    }
    
    $userid = $_COOKIE['userId'];
    
    $this->title = htmlentities(trim($this->title),ENT_QUOTES, "UTF-8");
    $this->content = htmlentities(trim($this->content),ENT_QUOTES, "UTF-8");
    
    
    try {
    $conn = mysql_connect(DAO::SERVER, DAO::USER, DAO::PASSWORD);
        
    mysql_select_db(DAO::DATABASE, $conn);
    
    $sql = "insert into discussion (zone,area,userid,mainid,title,content) values ('" . $this->zone . "','" . $this->area . "','" . $userid . "','" . $this->mainid . "','" . $this->title . "','" . $this->content . "')";
    
    $result = mysql_query($sql, $conn);
    
    if ($this->mainid > 0 ) {
        $sql = "update discussion set replies=replies+1 where id='" . $this->mainid . "'";
        mysql_query($sql, $conn);
    }

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