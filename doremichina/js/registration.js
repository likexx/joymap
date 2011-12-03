

var REGISTRATION = {

selectedZone:null,
selectedArea:null,

resetBasicRegErrors: function() {
        $('#registration_error_info').html('');
},

processBasicRegistrationResult: function(value) {
this.resetBasicRegErrors();
switch(value) {
 case '1':
        $('#registration_error_info').html('(用户名已经存在)');
        break;
 case '2':
        $('#registration_error_info').html('(用户名太长)');
        break;
 case '3':
        $('#registration_error_info').html('(密码必须4-15位)');
        break;
 case '4':
        $('#registration_error_info').html('(请填写所有资料)');
        break;
 case '5':
        $('#registration_error_info').html('(数据库错误)');
        break;
 case '6':
        $('#registration_error_info').html('(电子邮件错误)');
        break;
 case '7':
        PAGE.showTeacherRegistration();
        break;
 default:
        PAGE.showLoggedInUserMenu(false);
        PAGE.clearUserUpdatePanel();
        PAGE.showSearchLayer();
        break;
 }

},

processBasicUpdateResult: function(value) {
    $('#update_error').html('');
	switch(value) {
	 case '1':
	        $('#update_error').html('(用户名已经存在)');
	        break;
	 case '2':
	        $('#update_error').html('(用户名太长)');
	        break;
	 case '3':
	        $('#update_error').html('(密码必须4-15位)');
	        break;
	 case '4':
	        $('#update_error').html('(请填写必须的资料)');
	        break;
	 case '5':
	        $('#update_error').html('(数据库错误)');
	        break;
	 default:
	        PAGE.showLoggedInUserMenu(true);
//            PAGE.showSearchLayer();
	        break;
	 }

},

processUserLoginResult: function(value) {

	switch(value) {
	 case '0':
	        $('#login_error').html('登录失败    ');
	        break;
	 default:
	        PAGE.showLoggedInUserMenu(false);
	        break;
	 }

},

processTeacherRegistrationResult: function(value) {
    GLOBAL.debug(value);
	switch(value) {
	 case '100':
	        $('#reg_teacher_error').html('用户不存在');
	        break;
	 case '101':
	        $('#reg_teacher_error').html('(请填入至少一项专长)');
	        break;
	 case '102':
	        $('#reg_teacher_error').html('(请填入至少一种联系方式)');
	        break;
	 default:
		 	PAGE.showLoggedInUserMenu();
		 	PAGE.clearUserUpdatePanel();
            PAGE.showSearchLayer();
	        break;
	 }

},

processTeacherUpdateResult: function(value) {
	switch(value) {
	 case '100':
	        $('#teacher_update_error').html('用户不存在');
	        break;
	 case '101':
	        $('#teacher_update_error').html('(请填入至少一项专长)');
	        break;
	 case '102':
	        $('#teacher_update_error').html('(请填入至少一种联系方式)');
	        break;
	 default:
            $('#teacher_update_error').html("修改完成");
	        break;
	 }

},

login: function() {
    $('#login_error').html('');
	var username=$('#login_username').val();
	var password=$('#login_password').val();
	var loginInfo = {
			username:username,
			password:password
	};
	
	$.post('./login.php',loginInfo, function(data) {REGISTRATION.processUserLoginResult(data);});
},

registerUser: function() {

    var username = $('#registration_username').val();
    var password = $('#registration_password').val();
    var password2 = $('#registration_password_retype').val();
    var nickname = $('#registration_nickname').val();
    var email = $('#registration_email').val();
    var zone = $('#REG_ZONE_LIST_SELECT_ZONE').val();
    var area = $('#REG_AREA_LIST_SELECT_AREA').val();
    
    var type = $('input:radio[name=registration_type]:checked').val();
    var gender = $('input:radio[name=registration_gender]:checked').val();
    
    var lat = null;
    var lng = null;
    var marker = MAP.getMark('user_map','user_geolocation');
    if (marker !=null) {
       GLOBAL.debug(marker);
       lat = marker.position.lat();
       lng = marker.position.lng();
       GLOBAL.debug(lat +','+lng);
    } else {
        lat = GLOBAL.getArea(area).lat;
        lng = GLOBAL.getArea(area).lng;
    }
    
    if (password!=password2) {
        this.resetBasicRegErrors();
        $('#reg_password_error').html('(密码设置不一致)');
        return;
    }
    
    if (password.length < 4 || password.length>15) {
        this.resetBasicRegErrors();
        $('#reg_password_error').html('(密码必须是4-15位)');
        return;
    }
    
    if (type==null || type==undefined) {
        this.resetBasicRegErrors();
        $('#reg_type_error').html('(请选择用户类型)');
        return;
    }
    
    if (zone==0 || area == 0) {
        this.resetBasicRegErrors();
        $('#reg_area_error').html('(请选择所在地区)');
        return;
    }
    
    var userBasicInfo = {
        username: username,
        password: password,
        nickname: nickname,
        email: email,
        type: type,
        zone: zone,
        area: area,
        gender: gender,
        lat: lat,
        lng: lng
    };

    GLOBAL.debug(userBasicInfo);
    
    $.post('./registerUser.php',userBasicInfo, function(data) {REGISTRATION.processBasicRegistrationResult(data);});
    
},

updateUserBasicInfo: function() {
	
    var password = $('#update_password').val();
    var password2 = $('#update_password_retype').val();
    var nickname = $('#update_nickname').val();
    var email = $('#update_email').val();
    
    var zone = $('#UPDATE_ZONE_LIST_SELECT_ZONE').val();
    var area = $('#UPDATE_AREA_LIST_SELECT_AREA').val();
    var gender = $('input:radio[name=update_gender]:checked').val();
    
    var lat = null;
    var lng = null;
    var marker = MAP.getMark('user_map','user_geolocation');
    if (marker !=null) {
       GLOBAL.debug(marker);
       lat = marker.position.lat();
       lng = marker.position.lng();
       GLOBAL.debug(lat +','+lng);
    }

    $('#update_password_error').html('');
    $('#update_error').html('');
    $('#update_email_error').html('');
    
    if (password!=password2) {
        this.resetBasicRegErrors();
        $('#update_password_error').html('(密码设置不一致)');
        return;
    }
    
    if ((password.length > 0 && password.length<4) || password.length>15) {
        this.resetBasicRegErrors();
        $('#update_password_error').html('(密码必须是4-15位)');
        return;
    }
    
    if (zone==undefined || area == undefined) {
    	zone = 0;
    	area = 0;
    }
    
    var info = {
        password: password,
        nickname: nickname,
        email: email,
        zone: zone,
        area: area,
        gender: gender,
        lat: lat,
        lng: lng
    };
    
    GLOBAL.debug('update info');    
    
    GLOBAL.debug(info);
    
    $.post('./updateUserBasicInfo.php',info, function(data) {REGISTRATION.processBasicUpdateResult(data);});
	
},

registerTeacherInfo: function() {
	
    var realname = $('#reg_teacher_realname').val();
    var occupation = $('#reg_teacher_occupation').val();
    var mobileNumber = $('#reg_teacher_mobile').val();
    var phoneNumber = $('#reg_teacher_phonenumber').val();
    var qq = $('#reg_teacher_qq').val();
    
    var spec1 = $('#reg_teacher_spec_class_list1_CLASS_SELECT_LIST_SPECS').val();
    var spec2 = $('#reg_teacher_spec_class_list2_CLASS_SELECT_LIST_SPECS').val();
    var spec3 = $('#reg_teacher_spec_class_list3_CLASS_SELECT_LIST_SPECS').val();

    var gradyear1 = $('#reg_teacher_gradyear1').val();
    var degree1 = $('#reg_teacher_education1').val();
    var school1 = $('#reg_teacher_school_1').val();

    var gradyear2 = $('#reg_teacher_gradyear2').val();
    var degree2 = $('#reg_teacher_education2').val();
    var school2 = $('#reg_teacher_school_2').val();

    var gradyear3 = $('#reg_teacher_gradyear3').val();
    var degree3 = $('#reg_teacher_education3').val();
    var school3 = $('#reg_teacher_school_3').val();
    
    var addInfo = $('#reg_teacher_additional_info').val();


    var spec1cost = $('#reg_teacher_spec1_cost').val();
    var spec2cost = $('#reg_teacher_spec2_cost').val();
    var spec3cost = $('#reg_teacher_spec3_cost').val();
 
    var teachtype = $('input:radio[name=reg_teacher_teachtype]:checked').val();
    GLOBAL.debug(teachtype);   
    var teacherInfo = {
    	realname: realname,
    	occupation: occupation,
    	mobile_number: mobileNumber,
    	phone_number: phoneNumber,
    	qq: qq,
    	speciality_1: spec1,
    	speciality_2: spec2,
    	speciality_3: spec3,
    	gradyear_1: gradyear1,
    	degree_1: degree1,
    	school_1: school1,
    	gradyear_2: gradyear2,
    	degree_2: degree2,
    	school_2: school2,
    	gradyear_3: gradyear3,
    	degree_3: degree3,
    	school_3: school3,
    	additional_info: addInfo,
    	spec1cost:spec1cost,
    	spec2cost:spec2cost,
    	spec3cost:spec3cost,
    	teachtype:teachtype
    		
    };
    GLOBAL.debug(teacherInfo);
    
    $.post('./registerTeacher.php',teacherInfo, function(data) {REGISTRATION.processTeacherRegistrationResult(data);});

},

updateTeacherInfo: function() {
	
    var realname = $('#teacher_update_realname').val();
    var occupation = $('#teacher_update_occupation').val();
    var mobileNumber = $('#teacher_update_mobile').val();
    var phoneNumber = $('#teacher_update_phonenumber').val();
    var qq = $('#teacher_update_qq').val();
    
    var spec1 = $('#teacher_update_speciality_1_CLASS_SELECT_LIST_SPECS').val();
    var spec2 = $('#teacher_update_speciality_2_CLASS_SELECT_LIST_SPECS').val();
    var spec3 = $('#teacher_update_speciality_3_CLASS_SELECT_LIST_SPECS').val();

    var gradyear1 = $('#teacher_update_gradyear_1').val();
    var degree1 = $('#teacher_update_degree_1').val();
    var school1 = $('#teacher_update_school_1').val();

    var gradyear2 = $('#teacher_update_gradyear_2').val();
    var degree2 = $('#teacher_update_degree_2').val();
    var school2 = $('#teacher_update_school_2').val();

    var gradyear3 = $('#teacher_update_gradyear_3').val();
    var degree3 = $('#teacher_update_degree_3').val();
    var school3 = $('#teacher_update_school_3').val();
    
    var info = $('#teacher_update_info').val();

    var spec1cost = $('#teacher_update_spec1_cost').val();
    var spec2cost = $('#teacher_update_spec2_cost').val();
    var spec3cost = $('#teacher_update_spec3_cost').val();
    var teachtype = $('input:radio[name=teacher_update_teachtype]:checked').val();
    
    var teacherInfo = {
    	realname: realname,
    	occupation: occupation,
    	mobile_number: mobileNumber,
    	phone_number: phoneNumber,
    	qq: qq,
    	speciality_1: spec1,
    	speciality_2: spec2,
    	speciality_3: spec3,
    	gradyear_1: gradyear1,
    	degree_1: degree1,
    	school_1: school1,
    	gradyear_2: gradyear2,
    	degree_2: degree2,
    	school_2: school2,
    	gradyear_3: gradyear3,
    	degree_3: degree3,
    	school_3: school3,
    	info: info,
    	spec1cost: spec1cost,
        spec2cost: spec2cost,
        spec3cost: spec3cost,
        teachtype: teachtype
    };
    
    GLOBAL.debug(teacherInfo);
    
    $.post('./updateTeacherInfo.php',teacherInfo, function(data) {REGISTRATION.processTeacherUpdateResult(data);});

}

};