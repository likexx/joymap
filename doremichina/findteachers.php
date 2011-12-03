<?php
    require_once('./class/dao.php');
    
    function getUserRating($row) {
    
        $overallRating = 0;
        $count=0;
        if ($row['spec1_rating']>0.0) {
            $overallRating +=$row['spec1_rating'];
            $count++;
        }
        if ($row['spec2_rating']>0.0) {
            $overallRating +=$row['spec2_rating'];
            $count++;
        }
        if ($row['spec3_rating']>0.0) {
            $overallRating +=$row['spec3_rating'];
            $count++;
        }
        
        return $count == 0 ? 0 : $overallRating/$count;
    
    };
    
    $MAX_NUM=5;
    $gettotal = 0;
    
    $startnum = 0;

    if (isset($_POST['startnum'])) {
       $startnum = $_POST['startnum'];
    }
    
    if (isset($_POST['gettotal'])) {
        $gettotal = 1;
    }
  
    // search based on zone
    $zoneSearch = true;
  
    $sql = "select * from (select b.id as teacherid,b.username, b.nickname, b.zone,b.area,b.lat,b.lng,t.speciality1 as spec1,t.speciality2 as spec2,t.speciality3 as spec3," . 
           "t.spec1_rating,t.spec2_rating,t.spec3_rating,t.teach_type,t.spec1_cost,t.spec2_cost,t.spec3_cost,t.degree1,t.degree2,t.degree3,b.gender from user_basic b, teacher_info t where b.id=t.id";

    if (isset($_POST['area'])) {
        $area = $_POST['area'];
        $sql = $sql . " and area='$area'";
        $zoneSearch = false;
    } else if (isset($_POST['zone'])) {
        $zone = $_POST['zone'];
        $sql = $sql . " and zone='$zone'";
    } else {
        return;
    }
    
    $specid = 0;
    
    if (isset($_POST['spec'])) {
        $specid = $_POST['spec'];
        if ($specid > 0) {

            if ($specid%1000 == 0) {
                // if dividable by 1000, search for all specs within (specid-1000, specid)
                $min = $specid -1000;
                $sql .= " and ((speciality1>'$min' && speciality2<'$specid') or (speciality2>'$min' && speciality2<'$specid') or (speciality3>'$min' && speciality3<'$specid')) ";
            } else {
                $sql .= " and (speciality1='$specid' or speciality2='$specid' or speciality3='$specid') ";
            }
        }
    }
    
    if (isset($_POST['teachtype'])) {
        $value = $_POST['teachtype'];
        if ($value != -1) {
            if ($value < 3) {
                $sql .= " and teach_type='$value' ";
            }
        }
    }
    
    if (isset($_POST['pricerange'])) {
        $value = $_POST['pricerange'];
        if ($specid > 0 && $value > 0) {
            $sql .= " and ((spec1_cost='$value' and speciality1='$specid') || (spec2_cost='$value' and speciality2='$specid') || (spec3_cost='$value' and speciality3='$specid')) ";
        } else if ($value>0) {
            $sql .= " and (spec1_cost='$value' || spec2_cost='$value' || spec3_cost='$value') ";
        }
    }

    if (isset($_POST['education'])) {
        $value = $_POST['education'];
        if ($value != -1) {
            $sql .= " and (degree1='$value' || degree2='$value' || degree3='$value') ";
        }
    }
    
    if (isset($_POST['gender'])) {
        $value = $_POST['gender'];
        if ($value != -1) {
            $sql .= " and gender='$value' ";
        }
    }
    
    $sql = $sql . ") t left join user_images i on t.teacherid=i.id";
    
    $gettotal_sql = str_replace('select * from (select ', 'select count(*) as total from (select ',$sql);
    
    $sql .= " order by spec1_rating desc limit " . $startnum . "," . $MAX_NUM;
    
    
    error_log($sql);
    
    $conn = mysql_connect(DAO::SERVER, DAO::USER, DAO::PASSWORD);
    mysql_select_db(DAO::DATABASE, $conn);

    $total = 0;
    if ($gettotal == 1) {
        $result = mysql_query($gettotal_sql, $conn);
        $row = mysql_fetch_assoc($result);
        $total = $row['total'];
    }


    $result = mysql_query($sql, $conn);
    
    $teacherlist = array();
    
    $i = 0;
    while ($row = mysql_fetch_assoc($result)) {
        $name=$row['nickname'];
        if (strlen($name)==0) {
            $name=$row['username'];
        }
        $id=$row['teacherid'];
        
        $specs = $row['spec1'] . ',' . $row['spec2'] . ',' . $row['spec3'];
        
        $teacher = json_encode(array(
           'id'=>$id,
           'name'=>$name,
           'zone'=>$row['zone'], 
           'area'=>$row['area'], 
           'lat'=>$row['lat'], 
           'lng'=>$row['lng'], 
           'rating'=>getUserRating($row),
           'image1'=> $row['image1'],
           'specialities'=>$specs
        ));
        
        $teacherlist[] = $teacher;
        
        $i++;
    }
    
    mysql_close($conn);

    $result = json_encode(array(
        'total'=>$total, 
        'zonesearch'=>$zoneSearch ? 'true' : 'false',
        'islast'=>($i < $MAX_NUM),
        'teachers'=>$teacherlist
    ));
    echo $result;

?>