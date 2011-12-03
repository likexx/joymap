<?php
require_once('userreview.php');

class ReviewList {

const MAX_NUM=2;

private $total = 0;
private $reviewNum = 0;

protected $reviews = array();

public function __construct() {
}

public function load($teacher_id, $startnum, $needTotal) {

    $conn = mysql_connect(DAO::SERVER, DAO::USER, DAO::PASSWORD);
    mysql_select_db(DAO::DATABASE, $conn);
    
    if ($needTotal) {
        $gettotal_sql = "select count(reviewer_id) as total from review r, user_basic u where r.teacher_id='$teacher_id' and u.id=r.reviewer_id";
        $result = mysql_query($gettotal_sql, $conn);
        $row = mysql_fetch_assoc($result);
        $this->total = $row['total'];
    }
    
    $sql = "select r.id as id, r.teacher_id as teacher_id, r.reviewer_id as reviewer_id, r.spec1_rating as spec1_rating, r.spec2_rating as spec2_rating, r.spec3_rating as spec3_rating, " . 
           "r.strict as strict, r.easiness as easiness, r.patience as patience, r.method as method, " .
           "r.comment as comment, r.timestamp as timestamp, u.nickname as nickname, u.username as username " .
           "from review r, user_basic u where r.teacher_id='$teacher_id' and u.id=r.reviewer_id";
    $sql .= " order by timestamp desc limit " . $startnum . "," . self::MAX_NUM;

    $result = mysql_query($sql, $conn);
    $num = mysql_num_rows($result);

    $reviewNum = 0;
    while ($row = mysql_fetch_assoc($result)) {
        $r = new UserReview($row);
        $this->reviews[] = $r;
        $this->reviewNum++;
    }
    
    mysql_close($conn);

}

public function toJsonString() {

//    $data='{"reviews":[';
    $num = count($this->reviews);
    $i = 0;
    $reviewList = array();
    
    while ($i < $num) {
        $r = $this->reviews[$i];
        $name = strlen($r->nickname) > 0 ? $r->nickname : $r->username;
        
        $teacher=json_encode(array(
            'reviewid'=>$r->reviewid,
            'reviewer_id'=>$r->reviewr_id,
            'reviewername'=>$name,
            'spec1_rating'=>$r->spec1_rating,
            'spec2_rating'=>$r->spec2_rating,
            'spec3_rating'=>$r->spec3_rating,
            'strict'=>$r->strict,
            'easiness'=>$r->easiness,
            'patience'=>$r->patience,
            'method'=>$r->method,
            'comment'=>$r->comment,
            'timestamp'=>$r->timestamp
        ));
        $reviewList[] = $teacher;
        $i++;
        
        /*
        $teacher='{"reviewer_id":' . $r->reviewer_id . ',' .
                 '"reviewername":"' . $name . '",' .
                 '"spec1_rating":"' . $r->spec1_rating . '",' .
                 '"spec2_rating":"' . $r->spec2_rating . '",' .
                 '"spec3_rating":"' . $r->spec3_rating . '",' .
                 '"strict":"' . $r->strict . '",' .
                 '"easiness":"' . $r->easiness . '",' .
                 '"patience":"' . $r->patience . '",' .
                 '"method":"' . $r->method . '",' .
                 '"comment":"' . $r->comment . '",' .
                 '"timestamp":' . $r->timestamp .
                 '}';
        
        $data = $data . $teacher;
        $i++;
        if ($i < $num) {
            $data = $data . ',';
        }
        */
    }

//    $data = $data . ']}';

    $result = json_encode(array(
        'total'=>$this->total, 
        'islast'=>($i < self::MAX_NUM),
        'reviews'=>$reviewList
    ));
    error_log($result);
    echo $result;
 }

}

?>