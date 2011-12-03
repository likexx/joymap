<?php
require_once('dao.php');

class UserReview {

public $reviewid = 0;
public $teacher_id = 0;
public $reviewer_id = 0;
public $spec1_rating = 0;
public $spec2_rating = 0;
public $spec3_rating = 0;

public $strict = 0;
public $easiness = 0;
public $patience = 0;
public $method = 0;

public $comment = '';
public $timestamp = 0;

public $username = '';
public $nickname = '';

public function __construct($row) {
   $this->teacher_id = $row['teacher_id'];

   if (isset($row['id'])){
       $this->reviewid = $row['id'];
   }

   if (isset($row['reviewer_id'])){
       $this->teacher_id = $row['reviewer_id'];
   }

   if (isset($row['spec1_rating'])) {
       $this->spec1_rating = $row['spec1_rating'];
   }
   if (isset($row['spec2_rating'])) {
       $this->spec2_rating = $row['spec2_rating'];
   }
   if (isset($row['spec3_rating'])) {
       $this->spec3_rating = $row['spec3_rating'];
   }
   if (isset($row['strict'])) {
       $this->strict = $row['strict'];
   }
   if (isset($row['easiness'])) {
       $this->easiness = $row['easiness'];
   }
   if (isset($row['patience'])) {
       $this->patience = $row['patience'];
   }
   if (isset($row['method'])) {
       $this->method = $row['method'];
   }
   
   if (isset($row['comment'])) {
       $this->comment = $row['comment'];
   }
   
   if (isset($row['timestamp'])){
       $this->timestamp = $row['timestamp'];
   }
   
   if (isset($row['username'])){
       $this->username = $row['username'];
   }

   if (isset($row['nickname'])){
       $this->nickname = $row['nickname'];
   }
   
}

public function save() {

    if (!isset($_COOKIE['userId'])) {
        return 0;
    }

    $this->reviewer_id = $_COOKIE['userId'];
    $this->timestamp = time();

    $conn = mysql_connect(DAO::SERVER, DAO::USER, DAO::PASSWORD);
    mysql_select_db(DAO::DATABASE, $conn);
    
    $sql = "select * from review where teacher_id='" . $this->teacher_id . "' and reviewer_id='" . $this->reviewer_id . "'";

    $result = mysql_query($sql, $conn);
    $num = mysql_num_rows($result);
    
    if ($num > 0) {
        $sql = "update review set spec1_rating='" . $this->spec1_rating . 
               "',spec2_rating='" . $this->spec2_rating . 
               "',spec3_rating='" . $this->spec3_rating . 
               "',strict='" . $this->strict . 
               "',easiness='" . $this->easiness . 
               "',patience='" . $this->patience . 
               "',method='" . $this->method . 
               "',comment='" . $this->comment . 
               "',timestamp='" . $this->timestamp . 
               "' where teacher_id='" . $this->teacher_id . "' and reviewer_id='" . $this->reviewer_id . "'";
    } else {
        $sql = "insert into review values('" . $this->teacher_id .
               "','" . $this->reviewer_id .
               "','" . $this->spec1_rating .
               "','" . $this->spec2_rating .
               "','" . $this->sepc3_rating .
               "','" . $this->strict .
               "','" . $this->easiness .
               "','" . $this->patience .
               "','" . $this->method .
               "','" . $this->comment .
               "','" . $this->timestamp .
               "')";
    }
    mysql_query($sql, $conn);
    
    $this->_updateTeacherInfo($conn);
    
    mysql_close($conn);
    
    return $this->teacher_id;

}


private function _updateTeacherInfo($conn) {

    $sql = "select sum(spec1_rating) as spec1,sum(spec2_rating) as spec2, sum(spec3_rating) as spec3, " . 
           "sum(strict) as strict, sum(easiness) as easiness, sum(patience) as patience, sum(method) as method, count(*) as num from review where teacher_id='" . $this->teacher_id . "'";

    $result = mysql_query($sql, $conn);
    $row = mysql_fetch_assoc($result);

    $num = $row['num'];
    
    $sql = "update teacher_info set spec1_rating='" . ($row['spec1']/$num) . "'," .
           "spec2_rating='" . ($row['spec2']/$num) . "'," .
           "spec3_rating='" . ($row['spec3']/$num) . "'," .
           "strict='" . ($row['strict']/$num) . "'," .
           "easiness='" . ($row['easiness']/$num) . "'," .
           "patience='" . ($row['patience']/$num) . "'," .
           "method='" . ($row['method']/$num) . "' where id='" . $this->teacher_id . "'";
    
    mysql_query($sql, $conn);
           
}

}

