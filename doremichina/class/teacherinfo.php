<?php
require_once('dao.php');
require_once('user.php');

class TeacherInfo {

private $_id;

public $user = null;

public $userLoggedIn = 0;

public $realName = "";

public $mobileNumber = "";

public $phoneNumber = "";

public $qq = "";

public $occupation = 0;

public $specialities = array();

public $educations = array();

public $spec1_rating = 0;
public $spec2_rating = 0;
public $spec3_rating = 0;
public $strict = 0;
public $easiness = 0;
public $patience = 0;
public $method = 0;

public $info = "";

public $spec1cost = 0;
public $spec2cost = 0;
public $spec3cost = 0;
public $teachtype = 0;

public $lat = null;
public $lng = null;

public $images = array();

public $overallRating = 0;

public function __construct($id) {
    $this->_id = $id;
    $this->user = new User($id);
    $this->loadData($id);
}

private function loadData($id) {

    $conn = mysql_connect(DAO::SERVER, DAO::USER, DAO::PASSWORD);
    mysql_select_db(DAO::DATABASE, $conn);

    $sql = "SELECT * FROM (SELECT u.lat, u.lng, info.* FROM teacher_info info,user_basic u WHERE u.id =  '$id' && info.id=u.id) t LEFT JOIN user_images i ON t.id = i.id";
    
    $result = mysql_query($sql, $conn);

    $row = mysql_fetch_assoc($result);
    $this->realName = $row['realname'];
    $this->mobileNumber = $row['mobilenumber'];
    $this->phoneNumber = $row['phonenumber'];
    $this->occupation = $row['occupation'];
    $this->qq = $row['qq'];
    
    $this->spec1_rating = $row['spec1_rating'];
    $this->spec2_rating = $row['spec2_rating'];
    $this->spec3_rating = $row['spec3_rating'];
    $this->strict = $row['strict'];
    $this->easiness = $row['easiness'];
    $this->patience = $row['patience'];
    $this->method = $row['method'];
    
    $this->specialities[] = $row['speciality1'];
    $this->specialities[] = $row['speciality2'];
    $this->specialities[] = $row['speciality3'];
    
    $this->spec1cost = $row['spec1_cost'];
    $this->spec2cost = $row['spec2_cost'];
    $this->spec3cost = $row['spec3_cost'];
    $this->teachtype = $row['teach_type'];
    
    $this->lat = $row['lat'];
    $this->lng = $row['lng'];
    
    $edu1 = array(
        'degree'=>$row['degree1'],
        'gradyear'=>$row['gradyear1'],
        'school'=>$row['school1']
    );
    
    $edu2 = array(
        'degree'=>$row['degree2'],
        'gradyear'=>$row['gradyear2'],
        'school'=>$row['school2']
    );
    
    $edu3 = array(
        'degree'=>$row['degree3'],
        'gradyear'=>$row['gradyear3'],
        'school'=>$row['school3']
    );
    
    $this->educations[]=$edu1;
    $this->educations[]=$edu2;
    $this->educations[]=$edu3;
    
    $this->info = $row['info'];
    
    $this->images[] = $row['image1'];
    $this->images[] = $row['image2'];
    
    $this->getOverallRating();
    
    mysql_close($conn);
}

function getOverallRating() {
    
        $overallRating = 0;
        $count=0;
        if ($this->spec1_rating>0.0) {
            $overallRating +=$this->spec1_rating;
            $count++;
        }
        if ($this->spec2_rating>0.0) {
            $overallRating +=$this->spec2_rating;
            $count++;
        }
        if ($this->spec3_rating>0.0) {
            $overallRating +=$this->spec3_rating;
            $count++;
        }
                
        $this->overallRating =  $count == 0 ? 0 : $overallRating/$count;
    
}


public function save() {

    $conn = mysql_connect(DAO::SERVER, DAO::USER, DAO::PASSWORD);
    mysql_select_db(DAO::DATABASE, $conn);

    $sql = "update teacher_info set realname='" . $this->realName . "'," .
           "mobileNumber='" . $this->mobileNumber . "'," .
           "phoneNumber='" . $this->phoneNumber . "'," .
           "occupation='" . $this->occupation . "'," .
           "qq='" . $this->qq . "'," .
           "speciality1='" . $this->specialities[0] . "'," .
           "speciality2='" . $this->specialities[1] . "'," .
           "speciality3='" . $this->specialities[2] . "'," .
           "degree1='" . $this->educations[0]['degree'] . "'," .
           "gradyear1='" . $this->educations[0]['gradyear'] . "'," .
           "school1='" . $this->educations[0]['school'] . "'," .
           "degree2='" . $this->educations[1]['degree'] . "'," .
           "gradyear2='" . $this->educations[1]['gradyear'] . "'," .
           "school2='" . $this->educations[1]['school'] . "'," .
           "degree3='" . $this->educations[2]['degree'] . "'," .
           "gradyear3='" . $this->educations[2]['gradyear'] . "'," .
           "school3='" . $this->educations[2]['school'] . "' " .
           "where id='" + $this->_id + "'";
    
    mysql_query($sql, $conn);

    mysql_close($conn);

}

public function toJsonString() {

    $loggedin =  isset($_COOKIE['userId']);
    $this->userLoggedIn = $loggedin ? $_COOKIE['userId'] : 0;
    
    return json_encode(array(
            'teacher_id'=>$this->_id,
            'userLoggedIn' => $this->userLoggedIn,
            'realName'=> ($loggedin ? $this->realName : ''),
            'mobileNumber' => ($loggedin ? $this->mobileNumber : ''),
            'phoneNumber' => ($loggedin ? $this->phoneNumber : ''),
            'qq' => ($loggedin ? $this->qq : ''),
            'occupation' => $this->occupation,
            'speciality1' => $this->specialities[0],
            'speciality2' => $this->specialities[1],
            'speciality3' => $this->specialities[2],
            'degree1' => $this->educations[0]['degree'],
            'gradyear1' => $this->educations[0]['gradyear'],
            'school1' => $this->educations[0]['school'],
            'degree2' => $this->educations[1]['degree'],
            'gradyear2' => $this->educations[1]['gradyear'],
            'school2' => $this->educations[1]['school'],
            'degree3' => $this->educations[2]['degree'],
            'gradyear3' => $this->educations[2]['gradyear'],
            'school3' => $this->educations[2]['school'],
            'spec1_rating' => $this->spec1_rating,
            'spec2_rating' => $this->spec2_rating,
            'spec3_rating' => $this->spec3_rating,
            'strict' => $this->strict,
            'easiness' => $this->easiness,
            'patience' => $this->patience,
            'method' => $this->method,
            'info' => $this->info,
            'spec1cost' => $this->spec1cost,
            'spec2cost' => $this->spec2cost,
            'spec3cost' => $this->spec3cost,
            'teachtype' => $this->teachtype,
            'zone' => $this->user->zone,
            'area' => $this->user->area,
            'gender' => $this->user->gender,
            'nickname' => $this->user->name,
            'lat'=>$this->lat,
            'lng'=>$this->lng,
            'images' => $this->images,
            'overallrating' => $this->overallRating
    
    ));
            
//    return $json;

}

}

?>