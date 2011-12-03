<?php
require_once('dao.php');

class User {

private $_id;

public $name;

public $zone;

public $area;

public $email;

public $gender;

public $image1 ="";
public $image2 ="";

public $lat = null;
public $lng = null;

private $_type;

public function __construct($id) {
    $this->_id = $id;
    $this->loadData($id);
}

private function loadData($id) {

    $conn = mysql_connect(DAO::SERVER, DAO::USER, DAO::PASSWORD);
    mysql_select_db(DAO::DATABASE, $conn);

    $sql = "SELECT * FROM (SELECT * FROM user_basic WHERE id =  '$id') u LEFT JOIN user_images i ON u.id = i.id";
    
    $result = mysql_query($sql, $conn);

    $row = mysql_fetch_assoc($result);
    $this->name = $row['nickname'];
    if (strlen($this->name) == 0) {
        $this->name = $row['username'];
    }
    
    $this->_type = $row['type'];
    $this->zone = $row['zone'];
    $this->area = $row['area'];
    $this->email = $row['email'];
    $this->image1 = $row['image1'];
    $this->image2 = $row['image2'];
    $this->gender = $row['gender'];
    $this->lat = $row['lat'];
    $this->lng = $row['lng'];
    
    mysql_close($conn);
}

private function save() {
    if (!isset($_COOKIE['userId'])) {
        return;
    }
    
    $conn = mysql_connect(DAO::SERVER, DAO::USER, DAO::PASSWORD);
    mysql_select_db(DAO::DATABASE, $conn);

    $sql = "update user_basic set " .
           "nickname='" . $this->name . "'," .
           "zone='" . $this->zone . "'," .
           "area='" . $this->area . "'," .
           "email='" . $this->email . "' where id='" . $this->_id . "'";
    
    mysql_query($sql, $conn);

    mysql_close($conn);
}

public function getName() {

    return $this->name;
}

public function isTeacher() {
    return $this->_type == 0;
}

public function toJsonString() {

   return json_encode(array(
    'id'=>$this->id,
    'type'=>$this->_type,
    'name'=>$this->name,
    'zone'=>$this->zone,
    'area'=>$this->area,
    'email'=>$this->email,
    'image1'=>$this->image1,
    'image2'=>$this->image2,
    'gender'=>$this->gender,
    'lat'=>$this->lat,
    'lng'=>$this->lng
   ));

}

}

?>