

var PAGE = {

allowChangeLocationOnMapMove: true,

createTeacherSummary:function(t, markerId) {
    var s = '<div id="DIV_TEACHER_SUMMARY_' + t.id +
            '"  class="teachersummary" onclick="PAGE.showTeacherDetails(\'' + t.id + "','" + markerId + 
            '\');" onmouseover="this.style.backgroundColor=\'#DDDDDD\';" style="cursor:pointer;" onmouseout="this.style.backgroundColor=\'\';">';

    s+="<table><tr><td style='width:90px;'>" + t.name + '</td><td>';

    var sIds = t.specialities.split(',');

    var temp = {};
    for(var i in sIds) {
        var id = sIds[i];
        var c = GLOBAL.getSpecClass(id);
        if (c==null) {
            continue;
        }
        if (SEARCH.isInvalid(temp[c.icon])) {
            s+='<img src="/images/' + c.icon + '" width="15px" height="20px"/>';
            GLOBAL.debug(c);
            temp[c.icon] = true;
        }
    }    

    s+="</td></tr><tr><td>综合评分</td><td>";
    if (t.rating > 0) {
        for(var i=0;i<t.rating;++i) {
           s+='<img src="./images/star.png"/>';
        }
    } else {
        s+="尚无任何评分";
    }
    s+='</td></tr><tr><td>专长</td><td>';

    s+=HELPER.getSpecNames(t.specialities);
    
    s+='</td></tr>';
    
    if (t.image1!=null &&
        t.image1!=undefined &&
        t.image1.length>4) {
        s += '<tr><td colspan=\'2\'><img src="./imageuploader/uploads/thumb/' + t.image1  + '"/></td></tr>';
        }
    
    
    s+='</table></div>';
    
    return s;
},

updateLocationList: function(zoneDiv, areaDiv, zoneid, areaid) {
       if (SEARCH.isInvalid(areaid) || SEARCH.isInvalid(zoneid)) {
        return;
       }
       
       if (areaid!=0 && zoneid!=0 && Math.floor(areaid/10000) != zoneid) {
          GLOBAL.debug('update location list failed. area ' + areaid + ', zone ' + zoneid);
          return;
       }
       
       var zoneListId = zoneDiv + '_SELECT_ZONE';
       var areaListId = areaDiv + '_SELECT_AREA';

       $('#'+zoneListId).val(zoneid);
       
       this.loadAreaList(areaDiv,zoneListId,false,areaid);
},


showTeacherDetails:function(id, markerId) {

	var params = {
			teacher_id: id
	};

	$.post('./teacherDetails.php', params, function(data){
	    GLOBAL.debug(data);
	    var teacher = YAHOO.lang.JSON.parse(data);
	    var html = PAGE.renderTeacherDetailsPage(teacher);

        var offset = $('#map').offset();

        $( "#DIV_TEACHER_DETAILS_VIEW" ).dialog({
            autoOpen: false,
            show: "Blind",
            hide: "Blind",
            width: 680,
            height: 480,
            maxWidth:640,
            title: '<b>' + teacher.nickname + '的详细情况</b>',
            position: [offset.left+60, offset.top+50]
        });

	    
        $( "#DIV_TEACHER_DETAILS_VIEW" ).dialog('open');

        $('#DIV_TEACHER_DETAILS_VIEW').html(html);
	    
	    var lat = teacher.lat;
	    var lng = teacher.lng;
	    
	    if (SEARCH.isInvalid(lat, 0) || SEARCH.isInvalid(lng, 0)) {
	       var area = GLOBAL.getArea(teacher.area);
    	   lat = area.lat;
    	   lng = area.lng;    
	    }
	    
	    PAGE.showUsermap('user_map',lat, lng,'user_geolocation');
        REVIEW.loadReviews(id);

	});
	
},

showUsermap: function(divid,lat,lng,markid) {
        if (SEARCH.isInvalid(lat, 0) && SEARCH.isInvalid(lng, 0)) {
            return;
        }
        
        MAP.removeSubmap(divid);
        MAP.setupSubMap(divid,
                        lat, lng,
                        6);
        MAP.removeMark(divid,markid);
        MAP.addMark(lat,lng,divid,markid); 
        MAP.moveTo(lat,lng, null, divid);
},

createRatingHtml: function(displayName, rating, addinfo) {
    
    var content = '<td>' + displayName + (addinfo==undefined?'':addinfo) + '</td><td>';
    
    if (rating > 0) {
        var expected = 1.0;
        for(;expected<=5.0;expected+=1.0) {
            if (expected>rating) {
                break;
            }
            content += '<img src="./images/star.png"/>';
        }
        
        var diff = expected - rating;
        if (diff > 0.5 && diff < 1.0) {
            content += '<img src="./images/star_more_half.png"/>';
        }
        
        if (diff < 0.5 && diff > 0.0) {
            content += '<img src="./images/star_less_half.png"/>';
        }
    } else {
        content +='(<span style="font-size:10px;color:blue;">还没有人作出评分</span>)';
    }
    content += '</td>';
    return content;

},

createSpecRatingHtml: function(specId, rating, addinfo) {
    if (specId == 0) {
        return "";
    }
    var specName = GLOBAL.getSpec(specId);
    return this.createRatingHtml(specName, rating, addinfo);
},

createSpecReviewHtml: function(specSeq, specId,addinfo) {
    if (specId == 0) {
        return "";
    }
    
    var specName = GLOBAL.getSpec(specId);
    
    var content = specName + (addinfo==undefined?'':addinfo);
    
    for(var i = 1;i<=5;++i){
        content += '<span id="new_review_spec' + specSeq + '_rating_v' + i + 
                   '" style="cursor:pointer;" onmouseover="PAGE.setReviewSpecValue(' + specSeq + ', ' + i + 
                   ');" onmouseout="PAGE.resetReviewSpecValue(' + specSeq + ', ' + i + 
                   ');" onclick="PAGE.saveReviewSpecValue(' + specSeq + ', ' + i + ');">★</span>';
    }
    content += "<input type='hidden' id='new_review_spec" + specSeq + "_rating'/><br/>";

    return content;
    
},

createTeachingReviewHtml: function(displayName, name, addinfo) {
    
    var content = displayName + (addinfo==undefined?'':addinfo);
    
    for(var i = 1;i<=5;++i){
        content += '<span id="new_review_teaching_rating_' + name + '_' + i + 
                   '" style="cursor:pointer;" onmouseover="PAGE.setTeachingReviewValue(\'' + name +'\',' + i + 
                   ');" onmouseout="PAGE.resetTeachingReviewValue(\'' + name +'\',' + i + 
                   ');" onclick="PAGE.saveTeachingReviewValue(\'' + name +'\',' + i + ');">★</span>';
    }
    content += "<input type='hidden' id='new_review_teaching_rating_" + name + "'/><br/>";

    return content;
    
},


createUserEducationContent:function(degree, gradyear, school) {
    var content = gradyear + '年，' + GLOBAL.getEducation(degree) +'，' + school + '<br/>';
    return content;
},

closeUserImage:function() {
    $("#user_image_normal").remove();
},

showUserImage: function(imageName) {

    var html = '<span style="float:right;text-align:right;font-weight:bold;font-size:20px; cursor:pointer;" onclick="PAGE.closeUserImage();">关闭</span><br/>';
    html += '<img src="./imageuploader/uploads/medium/' + imageName  + '"/> ';

    $('<div id="user_image_normal">').appendTo('body').html(html).css({
        'position': 'absolute',
        'top': '50px',
        'left': '500px',
        'z-index': '10'
    }).addClass('userimage');
},

renderTeacherDetailsPage:function(teacher) {
    if (teacher.teacher_id == undefined) {
       return "";
    }
    
    if (teacher.userLoggedIn == 0) {
        teacher.realName = '<font color="red">你必须登陆后才能察看</font>';
        teacher.mobileNumber = '<font color="red">你必须登陆后才能察看</font>';
        teacher.phoneNumber = '<font color="red">你必须登陆后才能察看</font>';
        teacher.qq = '<font color="red">你必须登陆后才能察看</font>';
    }
    
    var html = '<div id="DIV_TEACHER_DETAILS_INFO" class="teacherdetails"><table><tr><td style="vertical-align:text-top;"><input type="hidden" id="teacher_review_markerid"><div class="rounded" style="width:320px;height:420px"><table>' +
               '<tr><td>真实姓名：</td><td>' + teacher.realName + '</td></tr>' +
               '<tr><td>性别：</td><td>' + (teacher.gender==1 ? '男':'女') + '</td></tr>' +
               '<tr><td>手机号码：</td><td> ' + teacher.mobileNumber + '</td></tr>' +
               '<tr><td>其它号码：</td><td>' + teacher.phoneNumber + '</td></tr>' +
               '<tr><td>QQ：</td><td>' + teacher.qq + '</td></tr>';

    html += '<tr>' + this.createSpecRatingHtml(teacher.speciality1, teacher.spec1_rating,'(课时费:'+DATA.class_fee[teacher.spec1cost]+')') + '</tr>';
    html += '<tr>' + this.createSpecRatingHtml(teacher.speciality2, teacher.spec2_rating,'(课时费:'+DATA.class_fee[teacher.spec2cost]+')') + '</tr>';
    html += '<tr>' + this.createSpecRatingHtml(teacher.speciality3, teacher.spec3_rating,'(课时费:'+DATA.class_fee[teacher.spec3cost]+')') + '</tr>';
    html += '<tr>' + this.createRatingHtml('严格程度', teacher.strict) + '</tr>';
    html += '<tr>' + this.createRatingHtml('易学程度', teacher.easiness) + '</tr>';
    html += '<tr>' + this.createRatingHtml('耐心程度', teacher.patience) + '</tr>';
    html += '<tr>' + this.createRatingHtml('教学方式', teacher.method) + '</tr>';
    html += '<tr style="vertical-align:text-top;">' +
            '<td style="vertical-align:text-top;" colspan="2"><div id="DIV_TEACHER_INFO_SEND_MESSAGE_LAYER">' +
            '<textarea id="DIV_TEACHER_INFO_SEND_MESSAGE_CONTENT" rows="8" cols="30"></textarea><br/><input type=button value="发送消息联系" onclick="MESSAGE.sendto(' + teacher.teacher_id + ',\'DIV_TEACHER_INFO_SEND_MESSAGE_CONTENT\');"></div></td></tr>';
    html += '</table></div></td>';
    
    html += '<td style="vertical-align:text-top;"><div class="rounded" style="width:320px;height:420px;">';
    
    html += '<table><tr><td  style="vertical-align:text-top;">当前职业：</td><td>' + GLOBAL.getOccupation(teacher.occupation) + "</td></tr>";
    html += '<tr><td style="vertical-align:text-top;">学历</td><td>';
    if (teacher.degree1 != 0) {
        html += this.createUserEducationContent(teacher.degree1, teacher.gradyear1, teacher.school1);
    }

    if (teacher.degree2 != 0) {
        html += this.createUserEducationContent(teacher.degree2, teacher.gradyear2, teacher.school2);
    }

    if (teacher.degree3 != 0) {
        html += this.createUserEducationContent(teacher.degree3, teacher.gradyear3, teacher.school3);
    }
    
    html += '</td></tr>';
    
    html += '<tr><td>所在地区：</td><td>' + GLOBAL.getZone(teacher.zone).name + ',' + GLOBAL.getArea(teacher.area).name + '</td></tr>' +
            '<tr><td>教学地点：</td><td>' + DATA.class_location[teacher.teachtype] + '</td></tr>';

    html +='<tr><td colspan="2"><div id="user_map" style="width:320px;height:240px;font-size:18px;color:red;">读入地图中...</div></td></tr>';
    
    html += '</table></div></td></tr><tr><td colspan="2">';

    html += '<div class="rounded">';

    for(i in teacher.images) {
        if (teacher.images[i]!=null && teacher.images[i].length>4) {
            html += '<img src="./imageuploader/uploads/thumb/' + teacher.images[i]  + '" style="cursor:pointer;" onclick=\'PAGE.showUserImage("'+teacher.images[i] + '");\'/> ';
        }
    }
    html += '</div>';

    html += '</td></tr>';
    
    html += '<tr><td colspan="2">个人介绍<hr>'+ HELPER.htmlEncode(teacher.info)  + '<hr></td></tr>' +
            '</table></div>';
    
    if (teacher.userLoggedIn != teacher.teacher_id) {
        var newReviewHTML = '<hr><div id="DIV_TEACHER_DETAILS_NEW_REVIEW">请鉴定该老师<br/>' +
                            '<input type="hidden" id="new_review_teacher_id" value="' + teacher.teacher_id + '"/>';
                            
        if (teacher.speciality1 > 0) {
            newReviewHTML +=this.createSpecReviewHtml(1,teacher.speciality1);
        }
        if (teacher.speciality2 > 0) {
            newReviewHTML +=this.createSpecReviewHtml(2,teacher.speciality2);
        }
        if (teacher.speciality3 > 0) {
            newReviewHTML +=this.createSpecReviewHtml(3,teacher.speciality3);
        }
        
        newReviewHTML += this.createTeachingReviewHtml('严格程度','strict');
        newReviewHTML += this.createTeachingReviewHtml('易学程度','easiness');
        newReviewHTML += this.createTeachingReviewHtml('耐心程度','patience');
        newReviewHTML += this.createTeachingReviewHtml('教学方式','method');
        
        newReviewHTML += '<textarea id="new_review_comment" rows="5" cols="40"></textarea><br/>' +
                         '<input type="button" onclick="REVIEW.postReview();" value="提交评论"/></div>';
        html+=newReviewHTML;
    }
    
    html += '<input type="hidden" id="review_teacher_spec1_value" value="' + teacher.speciality1 + '"/>' +
            '<input type="hidden" id="review_teacher_spec2_value" value="' + teacher.speciality2 + '"/>' +
            '<input type="hidden" id="review_teacher_spec3_value" value="' + teacher.speciality3 + '"/>' +
            '<hr>反馈及评分' + 
            '<div id="DIV_TEACHER_DETAILS_REVIEWS"></div><div id="DIV_TEACHER_DETAILS_REVIEWS_PAGING"></div>';
    
    return html;                            
},

setReviewSpecValue:function(spec, value) {
	for(var i=1;i<=value;++i){
		var elementName = 'new_review_spec' + spec + '_rating_v' + i;
		$('#'+elementName).css('color','red');
	}
},

setTeachingReviewValue:function(name, value) {
    for(var i=1;i<=value;++i){
        var elementName = 'new_review_teaching_rating_' + name + '_' + i;
        $('#'+elementName).css('color','red');
    }
},

resetReviewSpecValue:function(spec, value) {
	for(var i=1;i<=value;++i){
		var elementName = 'new_review_spec' + spec + '_rating_v' + i;
		$('#'+elementName).css('color','');
	}
},

resetTeachingReviewValue:function(name, value) {
    for(var i=1;i<=value;++i){
        var elementName = 'new_review_teaching_rating_' + name + '_' + i;
        $('#'+elementName).css('color','');
    }
},

saveReviewSpecValue:function(spec, value) {
	var elementName = '';
	for(var i=1;i<=5;++i){
		elementName = 'new_review_spec' + spec + '_rating_v' + i;
		document.getElementById(elementName).onmouseout=function(){};
		document.getElementById(elementName).onmouseover=function(){};
		PAGE.resetReviewSpecValue(spec, i);
	}

	elementName = 'new_review_spec' + spec + '_rating';
	$('#'+elementName).val(value);
	PAGE.setReviewSpecValue(spec, value);
},

saveTeachingReviewValue:function(name, value) {
    var elementName = '';
    for(var i=1;i<=5;++i){
        var elementName = 'new_review_teaching_rating_' + name + '_' + i;
        document.getElementById(elementName).onmouseout=function(){};
        document.getElementById(elementName).onmouseover=function(){};
        PAGE.resetTeachingReviewValue(name, i);
    }

    elementName = 'new_review_teaching_rating_' + name;
    $('#'+elementName).val(value);
    PAGE.setTeachingReviewValue(name, value);
},


onSelectArea:function(zoneId, areaSelectName, doSearch, mapId) {

    var areaId = $('#' + areaSelectName).val();
    var area = GLOBAL.getArea(areaId);
    
    if(area!= null && area.lat!=null && area.lng!=null) {
        this.allowChangeLocationOnMapMove = false;
        MAP.moveTo(area.lat, area.lng, area.zoom, (mapId==undefined || mapId.length<1) ? null : mapId);
        MAP.searchMap.setZoom(12);
        MAP.resetSearchMarkersOnZoom();
        this.allowChangeLocationOnMapMove = true;
    }
   
},

onZoneSelected:function(areaDivName, zoneSelectName, doSearch, expectArea, mapId) {

    this.loadAreaList(areaDivName,zoneSelectName,doSearch,expectArea);

    var zoneId = $('#' + zoneSelectName).val();
    if (zoneId == 0) {
        return;
    }

    var zones = GLOBAL.get('ZONE_LIST');
    var zone = zones[zoneId];

    if(zone!= null && zone.lat!=null && zone.lng!=null) {
        GLOBAL.debug('move to zone');
        MAP.searchMap.setZoom(8);
        MAP.moveTo(zone.lat, zone.lng, zone.zoom, (mapId==undefined || mapId.length<1) ? null : mapId);
        MAP.resetSearchMarkersOnZoom();
    }
    
},

loadAreaList:function(areaDivName, zoneSelectName, doSearch, expectArea,mapId) {

    var zoneId = $('#' + zoneSelectName).val();
    
    if (zoneId == 0) {
        return;
    }
    
    if (mapId == undefined) {
        mapId = '';
    }

    var zones = GLOBAL.get('ZONE_LIST');
    var zone = zones[zoneId];
    var areas = zone.areas;

    var areaSelectName = areaDivName + '_SELECT_AREA';
    content = "<select id='" + 
              areaSelectName + 
              "' onchange='PAGE.onSelectArea("  + zoneId + ",\"" + 
              areaSelectName + 
              "\"," + 
              doSearch + ",\"" +
              mapId + "\"" +
              ");'><option value='0'>--</option>";
       
    for(var areaId in areas) {
        var area = areas[areaId];
        content += "<option value='" + areaId + "' "
        if(areaId==expectArea) {
            content +=" selected";
        }
        content += ">" + area.name + "</option>";
    }
    content += "</select>";

    $('#'+areaDivName).html(content);
    
},

showZoneList:function(zoneDivName,areaDivName,showTeachers, expectZone, expectArea, mapId) {
       // show city list
       var content = "";
       var zones = GLOBAL.get('ZONE_LIST');
       var zoneSelectName = zoneDivName + '_SELECT_ZONE';
       if (mapId == undefined) {
        mapId = '';
       }
       content += "<select id='" + zoneSelectName + "' onchange='PAGE.onZoneSelected(\"" + areaDivName + "\",\"" + zoneSelectName + "\"," + showTeachers + "," + expectArea + ",\"" + mapId + "\");'><option value='0'>--</option>";

       for(var zoneId in zones) {
           var zone = zones[zoneId];
           content += "<option value='" + zoneId + "'";
           if(zoneId == expectZone) {
             content+=" selected";
           }
           content += ">" + zone.name + "</option>";
       }
       content += "</select>";
       $('#'+zoneDivName).html(content);
       
       if (expectZone != 0) {
            this.onZoneSelected(areaDivName, zoneSelectName, showTeachers, expectArea, mapId);
       }
},

onSearchSpecSelected:function() {
    SEARCH.doSearch();
},

loadSpecsForClass: function(divName, classListId,expectSpec) {

    var classId = $('#'+classListId).val();

    var classes = GLOBAL.get('SPEC_CLASSES');
    var c = classes[classId];
    GLOBAL.debug(c);
    var specs = c.specs;
    
    var specListId = classListId + '_SPECS';
    
    $('#'+specListId).remove();

    var content = "";
    var count = 0;
    for(i in specs) {
        var spec = specs[i];
        if (count == 0) {
            // search all specs within this class. the id is the NEXT_CLASS_ID (dividable by 1000)
            var max = (Math.floor(i/1000) + 1)*1000;
            content +="<option value='" + max + "'";
            if (expectSpec == max) {
                content+=' selected';
            }
            content += ">--</option>";
        }
        content += "<option value='" + i + "' ";
        if (expectSpec == i) {
            content += ' selected';
        }
        content += '>' + spec + '</option>';
        ++count;
    }
    
    GLOBAL.debug(content);

    var div = $("#"+divName);
    
    $("<select id='" + specListId + "' onchange='SEARCH.doSearch();'>").html(content).appendTo(div);

    if (divName=='DIV_SPEC_LIST') {
        SEARCH.doSearch();
    }
    
    return;
},

showSpecList: function(divName, specid) {
    
    var expectspec = null;
    var expectclassid = null;
    
    if (specid != -1 && specid != undefined) {
        var id = specid-1;
        expectclassid = id - id%1000;
    }
    
    var classes = GLOBAL.get('SPEC_CLASSES');
    
    var classListId = divName +'_CLASS_SELECT_LIST';
    
    var content = "<select id='" + classListId + "' onchange='PAGE.loadSpecsForClass(\"" + divName + "\",\"" + classListId + '"';
    
    if (specid!=null && specid!=undefined) {
        content +="," + specid + "";
    }
    content += ");'><option value=''>--</option>";
    
    for(i in classes) {
        var c = classes[i];
        content += "<option value='" + i + "' ";
        if (expectclassid == i) {
            content += ' selected';
        }
        content += '>' + c.name + '</option>';
    }
    content+='</select>';
    
    $('#'+divName).html(content);


    if (expectclassid!=null) {
        this.loadSpecsForClass(divName,classListId,specid);
    }

},

showLoggedInUserMenu: function(showUserInfo) {
	var d = new Date();
	
	$.get('./getuser.php?d=' + d.getTime(), function(data) {
		var user = YAHOO.lang.JSON.parse(data);

        GLOBAL.debug(user);		
		
		GLOBAL.set('userId', user.id);
		
		var content = user.name + "&nbsp;&nbsp;<span style='cursor:pointer;' onmouseover='this.style.color=\"red\";' onmouseout='this.style.color=\"black\";' onclick='PAGE.loadUserUpdateData();'>个人资料</span>" + 
                      "&nbsp;&nbsp;<span style='cursor:pointer;' onmouseover='this.style.color=\"red\";' onmouseout='this.style.color=\"black\";' onclick='MESSAGE.showMessageList();'>查看消息</span>"+
		              "&nbsp;&nbsp;<span style='cursor:pointer;' onmouseover='this.style.color=\"red\";' onmouseout='this.style.color=\"black\";' onclick='PAGE.logout();'>退出登录</span>";
		
		$('#DIV_USER_MENU').css({
		  'left':900,
		  'width':300
		}).html(content);
		
		if (showUserInfo == true) {
			PAGE.showUserInfoUpdatePanel(user);
		}
		
		if (!SEARCH.isInvalid(user.lat) && !SEARCH.isInvalid(user.lng)) {
		  MAP.moveTo(user.lat, user.lng, 12, null);
		} else {
		  MAP.moveToArea(user.area,12);
		}
		
		MAP.showUserLocationPin(user.lat, user.lng);

	});

},

logout: function() {

	var d = new Date();
	
	$.get('./logout.php?d=' + d.getTime(), function(data) {
	   /*
		PAGE.clearUserUpdatePanel();
		var content = GLOBAL.USERMENU_DEFAULT_TEXT;
		GLOBAL.set('userId', 0);		
		$('#DIV_USER_MENU').html(content);
       */
       window.location = './';		
	});
	
},

clearUserUpdatePanel: function() {
    $('#DIV_USER_INFO_UPDATE').html('');
    $('#DIV_USER_INFO_UPDATE').css("display", "none");
    $('#DIV_USER_INFO_UPDATE').css("visibility", "hidden");
    
    PAGE.showSearchLayer();
},

loadUserUpdateData: function() {
	
	var d = new Date();
	
	$.get('./getuser.php?d=' + d.getTime(), function(data) {
		var user = YAHOO.lang.JSON.parse(data);
		
		GLOBAL.set('userId', user.id);

		PAGE.showUserInfoUpdatePanel(user);

	});
	
},

showUserInfoUpdatePanel: function(data) {
       PAGE.hideSearchLayer();

	   $('#DIV_USER_INFO_UPDATE').css("display", "inline");
	   $('#DIV_USER_INFO_UPDATE').css("visibility", "visible");

       var genderList = '<tr><td>性别 </td><td><INPUT TYPE=RADIO NAME="update_gender" VALUE="1"';
       if (data.gender == 1) {
           genderList += ' checked';
       }
       genderList += '>男 ' +
                     '<INPUT TYPE=RADIO NAME="update_gender" VALUE="2"';
       if (data.gender == 2) {
           genderList += ' checked';
       }
       genderList += '>女</td></tr>'; 


	   var content = "<div style='background-color:#DDDDDD;border-radius:5px;border:1px solid #CCCCCC;'>" +
	                 "<span style='color:blue;border-radius:5px;border:1px solid #CCCCCC;cursor:pointer;float:right;text-align:right;' onclick='PAGE.clearUserUpdatePanel();'>关闭</span>" +
	                 "<table><tr style='vertical-align:text-top;'>";
       content +='<td><div id="div_update_user_basic_info" style="width:500px; border-radius:9px;border:1px solid #CCCCCC;"><table>'+
	                '<tr><td>输入新密码</td><td><input id="update_password" type="password"/><span id="update_password_error" style="color:red;"/></td></tr>' +
	                '<tr><td>重复新密码</td><td><input id="update_password_retype" type="password"/></td></tr>' +
	                '<tr><td>昵称(其它用户所看到的名字)</td><td><input id="update_nickname" type="text" value="' + data.name + '"/><span id="update_name_error" style="color:red;"/></td></tr>' +
	                '<tr><td>电子邮件</td><td><input id="update_email" type="text" value="' + data.email + '"/><span id="update_email_error" style="color:red;"/></td></tr>' +
	                genderList + 
	                '<tr><td>重新选择地区<br/>(当前:' + GLOBAL.getZone(data.zone).name +','+ GLOBAL.getArea(data.area).name + ')</td><td>' +
	                '<table><tr><td><div id="UPDATE_ZONE_LIST"></div></td>' +               
	                '<td><div id="UPDATE_AREA_LIST"></div></td></tr></table><span id="reg_area_error" style="color:red;"/></td></tr>' +               
                    '<tr><td colspan="2">修正你所在的大致位置<div id="user_map" style="width:360px;height:240px"></div></td></tr>' +
                    '<tr><td colspan="2"><input type="button" onclick="REGISTRATION.updateUserBasicInfo();" value="修改资料"/><span id="update_error"/></td></tr></table></div>' +
	                '<div style="background-color:#DDDDDD;border-radius:5px;border:1px solid #CCCCCC;width:420px;"><div class="imageForms"></div>' +
                    '<div class="buttonSave"><button id="imageuploader_buttonSave">确认选择的图片</button></div><div>' +
                    '<input type="hidden" id="keywords" style="width: 400px;" value="" /></div></div>' +
	                '</td>';
	  
       if (data.type==1) {
    	   content+= '<td><div id="div_update_teacher_info" style="border-radius:9px;border:1px solid #CCCCCC;"></div></td>';
    		var d = new Date();
    		$.get('./getteacherinfo.php?d=' + d.getTime(), function(data) {
                GLOBAL.debug('teacher: ' + data);
    			var teacher = YAHOO.lang.JSON.parse(data);
    			PAGE.showTeacherInfoPanel(teacher);

    		});
       }
       
        content+='</td></tr></table></div>';
	    
	    $('#DIV_USER_INFO_UPDATE').html(content);
	    this.showZoneList('UPDATE_ZONE_LIST', 'UPDATE_AREA_LIST', false, data.zone, data.area);
	    
        if ($('div.imageForms').length) {

        $('div.imageForms').append($.uploaderPreviewer.createImageForms({}, data));

        // the images are populated if the admin form is to edit, and not
        // to insert
        if ($('div.imageForms[images]').length) {
            var imageFilenames = $('div.imageForms[images]').attr('images').split(',');
            $.uploaderPreviewer.populateImages(imageFilenames);
            $('div.imageForms[images]').removeAttr('images');
            }
        }

        $('#imageuploader_buttonSave').click(function() {
            var itemId = $(this).attr('itemId');
            if (itemId) {
                $.itemForm.update(itemId);
            }
            else {
                $.itemForm.insert();
            }
        });
        
        MAP.removeSubmap('user_map');
        
        
        MAP.setupSubMap('user_map',
                        data.lat == null ? 29.562312  : data.lat,
                        data.lng == null ? 106.568614 : data.lng,
                        6,function(e){
            var prevAutoZoom = MAP.autoZoom;
            MAP.autoZoom = false;
            var lat = e.latLng.lat();
            var lng = e.latLng.lng();
            
            var map = MAP.submaps['user_map'];
            var zoom = map.getZoom();
                        
            var zones = GLOBAL.get('ZONE_LIST');
            
            var minDistance =9999999;
            var selectedZone = 0;
            var selectedArea = 0;
        
            for(i in zones) {
                    var areas = zones[i].areas;
                    for(j in areas) {
                        var area = areas[j];
                        if(area.lat != null && area.lng != null) {
                            var distance = getDistanceByDegree(area.lat,area.lng,lat,lng);
                            if (distance < minDistance) {
                                minDistance = distance;
                                selectedArea = j;
                                selectedZone = i;
                            }
                        }
                    }
                }
                
            if (selectedZone != 0 && selectedArea != 0 && minDistance < 200) {
                    PAGE.showZoneList('UPDATE_ZONE_LIST', 'UPDATE_AREA_LIST', false, selectedZone, selectedArea, 'user_map');
                }
           MAP.moveTo(lat, lng, null, 'user_map');
           MAP.removeMark('user_map','user_geolocation');
           MAP.addMark(lat,lng,'user_map','user_geolocation'); 
           MAP.autoZoom = prevAutoZoom;
    });
        
    if (data.lat != null) {
        MAP.removeMark('user_map','user_geolocation');
        MAP.addMark(data.lat,data.lng,'user_map','user_geolocation'); 
    }
	
},

createOptionsList: function(values, matchingValue) {
	var list='';
    for(i in values) {
        list += '<option value="' + i +'"';
        if(i==matchingValue) {
      	  list+=' selected';
        }
        list += '>' + values[i] + '</option>';
	}
	return list;
},

createYearsList: function(max, min, matchingValue) {
	var list='';
    for(var i = max; i>=min; --i) {
        list += '<option value="' + i +'"';
        if(i==matchingValue) {
      	  list+=' selected';
        }
        list += '>' + i + '</option>';
	}
	return list;
},

createSpecCostList: function(listId, matchingValue) {
  
  var list='<select id="' + listId + '">';
  var costs = DATA.class_fee;
  for(i in costs) {
    list+='<option value="' + i + '" ';
    if (i == matchingValue) {
        list+=' selected';
    }
    list += '>' + costs[i] + '</option>';
  }
  
  list+='</select>';
  
  return list;

},

createTeachTypeList: function(listId, matchingValue) {
// just hard code for now

  var types = DATA.class_location;
  
  var list='';
  
  for(i in types) {
    list+= '<INPUT TYPE=RADIO NAME="'+ listId + '" VALUE="' + i + '"';
    if (i == matchingValue) {
        list+=' checked';
    }
    list += '>' + types[i];
  }
  
  return list;

},


showTeacherInfoPanel:function(teacher) {
	    var occupations = GLOBAL.get('OCCUPATIONS');
	    GLOBAL.debug(teacher);
	    var occupationList = '<select id="teacher_update_occupation">' + 
	                         this.createOptionsList(occupations, teacher.occupation) +
	                         '</select>';

	    var educations = GLOBAL.get('EDUCATIONS');
	    var eduList1 = '<option value="">--</option>' + this.createOptionsList(educations, teacher.degree1);
	    var eduList2 = '<option value="">--</option>' + this.createOptionsList(educations, teacher.degree2);
	    var eduList3 = '<option value="">--</option>' + this.createOptionsList(educations, teacher.degree3);
	    
	    var date = new Date();
	    var currentYear = date.getFullYear();
	    var earliestYear = currentYear-100;

	    var yearList1=this.createYearsList(currentYear, earliestYear, teacher.gradyear1);
	    var yearList2=this.createYearsList(currentYear, earliestYear, teacher.gradyear2);
	    var yearList3=this.createYearsList(currentYear, earliestYear, teacher.gradyear3);
	    
	    var specCostList1 = this.createSpecCostList('teacher_update_spec1_cost', teacher.spec1cost);
        var specCostList2 = this.createSpecCostList('teacher_update_spec2_cost', teacher.spec2cost);
        var specCostList3 = this.createSpecCostList('teacher_update_spec3_cost', teacher.spec3cost);
        
        var teachTypeList = this.createTeachTypeList('teacher_update_teachtype', teacher.teachtype);

       var content ='<div style="width:600px;"><table>'+
       '<tr><td>真实姓名</td><td><input id="teacher_update_realname" type="text" value="' + teacher.realName + '"/></td></tr>' +
       '<tr><td>职业</td><td>' + occupationList + '</td></tr>' +
       '<tr><td>手机号码</td><td><input id="teacher_update_mobile" type="text" value="' + teacher.mobileNumber + '"/></td></tr>' +
       '<tr><td>联系电话</td><td><input id="teacher_update_phonenumber" type="text" value="' + teacher.phoneNumber + '"/></td></tr>' +
       '<tr><td>QQ</td><td><input id="teacher_update_qq" type="text" value="' + teacher.qq + '"/></td></tr>' +
       '<tr><td>教学地点</td><td>' + teachTypeList + '</td></tr>' +
       '<tr><td>专长1</td><td><table><tr><td><div id="teacher_update_speciality_1"></div></td><td>收费标准（每小时）' + specCostList1 + '</td></tr></table></td></tr>' +               
       '<tr><td>专长2</td><td><table><tr><td><div id="teacher_update_speciality_2"></div></td><td>收费标准（每小时）' + specCostList1 + '</td></tr></table></td></tr>' +               
       '<tr><td>专长3</td><td><table><tr><td><div id="teacher_update_speciality_3"></div></td><td>收费标准（每小时）' + specCostList1 + '</td></tr></table></td></tr>' +   
       '<tr><td colspan="2">学位 <select id="teacher_update_degree_1">' + eduList1 + '</select> 毕业时间<select id="teacher_update_gradyear_1">' + yearList1 + '</select> 学校<input id="teacher_update_school_1" type="text" value="' + teacher.school1 + '"/></td><tr/>' +   
       '<tr><td colspan="2">学位 <select id="teacher_update_degree_2">' + eduList1 + '</select> 毕业时间<select id="teacher_update_gradyear_2">' + yearList2 + '</select> 学校<input id="teacher_update_school_2" type="text" value="' + teacher.school2 + '"/></td><tr/>' +   
       '<tr><td colspan="2">学位 <select id="teacher_update_degree_3">' + eduList1 + '</select> 毕业时间<select id="teacher_update_gradyear_3">' + yearList3 + '</select> 学校<input id="teacher_update_school_3" type="text" value="' + teacher.school3 + '"/></td><tr/>' +   
       '<tr><td colspan="2"><textarea id="teacher_update_info" rows="8" cols="70">' + teacher.info + '</textarea></td><tr/>' +   
       '<tr><td colspan="2"><input type="button" onclick="REGISTRATION.updateTeacherInfo();" value="修改教师相关信息"/><span id="teacher_update_error"/></td></tr></table></div>';
	    $('#div_update_teacher_info').html(content);

        this.showSpecList("teacher_update_speciality_1", teacher.speciality1);
        this.showSpecList("teacher_update_speciality_2", teacher.speciality2);
        this.showSpecList("teacher_update_speciality_3", teacher.speciality3);
},

showRegistration:function() {

   $('#DIV_USER_INFO_UPDATE').css("display", "inline");
   $('#DIV_USER_INFO_UPDATE').css("visibility", "visible");
   this.hideSearchLayer();
   
   var content='<div><table><tr><td style="vertical-align:text-top;"><br/><div style="border-radius:9px;border:2px solid #CCCCCC;"><table style="width:400px;"><tr><td style="width:200px;">'+
                '登录用户名</td><td><input id="registration_username" type="text"/></td></tr>' +
                '<tr><td>密码</td><td><input id="registration_password" type="password"/><span id="reg_password_error" style="color:red;"/></td></tr>' +
                '<tr><td>重复密码</td><td><input id="registration_password_retype" type="password"/></td></tr>' +
                '<tr><td>昵称(其它用户所看到的名字)</td><td><input id="registration_nickname" type="text"/></td></tr>' +
                '<tr><td>电子邮件</td><td><input id="registration_email" type="text"/></td></tr>' +
                '<tr><td>用户类型</td><td><INPUT TYPE=RADIO NAME="registration_type" VALUE="1" checked>私人教师 ' +
                '<INPUT TYPE=RADIO NAME="registration_type" VALUE="2">普通用户<span id="reg_type_error" style="color:red;"/></td></tr>' + 
                '<tr><td>性别 </td><td><INPUT TYPE=RADIO NAME="registration_gender" VALUE="1">男 ' +
                '<INPUT TYPE=RADIO NAME="registration_gender" VALUE="2" checked>女</td></tr>' + 
                '<tr><td>地区</td><td>' +
                '<table><tr><td><div id="REG_ZONE_LIST"></div></td><td>' +               
                '<div id="REG_AREA_LIST"></div></td></tr></table><span id="reg_area_error" style="color:red;"/></td></tr>' +               
                '<tr><td colspan="2"><input type="button" onclick="REGISTRATION.registerUser();" value="注册"/><span id="registration_error_info" style="color:red;"></span></td></tr></table></div></td>' +
                '<td>请点击你所在的大致位置<div id="user_map" style="width:640px;height:300px"></div></td></tr></table></div>';
                
    $('#DIV_USER_INFO_UPDATE').html(content);
    this.showZoneList('REG_ZONE_LIST', 'REG_AREA_LIST', false, 0, 0, 'user_map');
    
    MAP.setupSubMap('user_map',29.562312,106.568614,6,function(e){
            var prevAutoZoom = MAP.autoZoom;
            MAP.autoZoom = false;
            var lat = e.latLng.lat();
            var lng = e.latLng.lng();
            
            var map = MAP.submaps['user_map'];
            var zoom = map.getZoom();
                        
            var zones = GLOBAL.get('ZONE_LIST');
            
            var minDistance =9999999;
            var selectedZone = 0;
            var selectedArea = 0;
        
            for(i in zones) {
                    var areas = zones[i].areas;
                    for(j in areas) {
                        var area = areas[j];
                        if(area.lat != null && area.lng != null) {
                            var distance = getDistanceByDegree(area.lat,area.lng,lat,lng);
                            if (distance < minDistance) {
                                minDistance = distance;
                                selectedArea = j;
                                selectedZone = i;
                            }
                        }
                    }
                }
                
            if (selectedZone != 0 && selectedArea != 0 && minDistance < 200) {
                    PAGE.showZoneList('REG_ZONE_LIST', 'REG_AREA_LIST', false, selectedZone, selectedArea, 'user_map');
                }
           MAP.moveTo(lat, lng, null, 'user_map');
           MAP.removeMark('user_map','user_geolocation');
           MAP.addMark(lat,lng,'user_map','user_geolocation'); 
           MAP.autoZoom = prevAutoZoom;
    });
    
},

showTeacherRegistration: function() {

    var occupations = GLOBAL.get('OCCUPATIONS');
    
    var occupationList = '<select id="reg_teacher_occupation">';
    for(i in occupations) {
      occupationList += '<option value="' + i +'">' + occupations[i] + '</option>';
    }
    occupationList+='</select>';

    var educationList='<option value="">--</option>';
    var educations = GLOBAL.get('EDUCATIONS');
    for(i in educations) {
      educationList += '<option value="' + i +'">' + educations[i] + '</option>';
    }
    educationList+='</select>';

    var specList='';
    var specialities = GLOBAL.get('SPECIALITIES');
    for(i in specialities) {
      specList += '<option value="' + i +'">' + specialities[i] + '</option>';
    }
    
    var yearList='';
    var date = new Date();
    var currentYear = date.getFullYear();
    var earliestYear = currentYear-100;
    for(var year=currentYear; year>=earliestYear; --year) {
        yearList+='<option value="' + year + '">' + year + '</option>';
    }
    yearList+='</select>';
    
    var specCostList1 = this.createSpecCostList('reg_teacher_spec1_cost', 0);
    var specCostList2 = this.createSpecCostList('reg_teacher_spec2_cost', 0);
    var specCostList3 = this.createSpecCostList('reg_teacher_spec3_cost', 0);
        
    var teachTypeList = this.createTeachTypeList('reg_teacher_teachtype', 0);
    

    var content='<div style="border-radius:9px;border:2px solid #CCCCCC;"><table><tr><td>'+
                '真实姓名(会员可见)</td><td><input id="reg_teacher_realname" type="text"/><span id="reg_teacher_realname_error" style="color:red;"/></td></tr>' +
                '<tr><td>职业</td><td>' + occupationList + '<span id="reg_teacher_occupation_error" style="color:red;"/></td></tr>' +
                '<tr><td>手机号码</td><td><input id="reg_teacher_mobile" type="text"/></td></tr>' +
                '<tr><td>联系电话</td><td><input id="reg_teacher_phonenumber" type="text"/></td></tr>' +
                '<tr><td>QQ</td><td><input id="reg_teacher_qq" type="text"/></td></tr>' +
                '<tr><td>教学地点</td><td>' + teachTypeList + '</td></tr>' +
                '<tr><td colspan="2"><b>请列出不超过三项专长技能，以便学生参考查找</b></td></tr>' +
                '<tr><td>专长1</td><td><table><tr><td><div id="reg_teacher_spec_class_list1"></div></td><td>收费标准（每小时）' + specCostList1 + '</td></tr></table></td></tr>' +               
                '<tr><td>专长2</td><td><table><tr><td><div id="reg_teacher_spec_class_list2"></div><option value="">--</option>' + specList + '</select></td><td>收费标准（每小时）' + specCostList2 + '</td></tr></table></td></tr>'  +               
                '<tr><td>专长3</td><td><table><tr><td><div id="reg_teacher_spec_class_list3"></div><option value="">--</option>' + specList + '</select></td><td>收费标准（每小时）' + specCostList3 + '</td></tr></table></td></tr>'  +               
                '<tr><td colspan="2"><b>请从最近毕业时间开始，填写你的教育背景，以便学生对你有更好的了解。最多填三个近期院校</b></td></tr>' +
                '<tr><td colspan="2">毕业时间<select id="reg_teacher_gradyear1"><option value="0">--</option>'+yearList + '  学位<select id="reg_teacher_education1">'+educationList + '毕业院校<input type="text" id="reg_teacher_school_1"/></td></tr>' +
                '<tr><td colspan="2">毕业时间<select id="reg_teacher_gradyear2"><option value="0">--</option>'+yearList + '  学位<select id="reg_teacher_education2">'+educationList + '毕业院校<input type="text" id="reg_teacher_school_2"/></td></tr>' +
                '<tr><td colspan="2">毕业时间<select id="reg_teacher_gradyear3"><option value="0">--</option>'+yearList + '  学位<select id="reg_teacher_education3">'+educationList + '毕业院校<input type="text" id="reg_teacher_school_3"/></td></tr>' +
                '<tr><td colspan="2">若还有额外信息，可在下栏补充，请勿超过500字</td></tr>' +
                '<tr><td colspan="2"><textarea id="reg_teacher_additional_info" rows=10 cols=50></textarea></td></tr>' +
                '<tr><td colspan="2"><input type="button" onclick="REGISTRATION.registerTeacherInfo();" value="补充教师信息"/><span id="reg_teacher_error" style="color:red;"/></td></tr></table>';

    $('#DIV_USER_INFO_UPDATE').html(content);
    this.showSpecList("reg_teacher_spec_class_list1", -1);
    this.showSpecList("reg_teacher_spec_class_list2", -1);
    this.showSpecList("reg_teacher_spec_class_list3", -1);
},

hideSearchLayer:function() {
   $('#DIV_DISPLAY_CANVAS').css('visibility','hidden');
   $('#DIV_SEARCH').css('visibility','hidden');
},

showSearchLayer:function() {
   $('#DIV_DISPLAY_CANVAS').css('visibility','visible');
   $('#DIV_SEARCH').css('visibility','visible');
},

showResultLayer:function() {
    $('#DIV_DISPLAY_CANVAS').css('display','none');
    $('#DIV_SEARCH_RESULT_LAYER').css('display','inline');
},

showMapLayer:function() {
    $('#DIV_DISPLAY_CANVAS').css('display','inline');
    $('#DIV_SEARCH_RESULT_LAYER').css('display','none');
}

};