var SEARCH = {

SEARCH_HELP_CONTENT: "<img src='./images/google_green.png' width='8px' height='15px'/>该地区有符合条件的用户，放大地图后可查看具体位置 <br/>" +
                     "<img src='./images/google_orange.png' width='8px' height='15px'/>该地区有符合条件的用户 ,但用户没有给出具体地图位置<br/>" + 
                     "<img src='./images/google_black.png' width='8px' height='15px'/>该地区尚无符合条件的用户 <br/>"+
                     "<table>" +
                     "<tr><td><img src='./images/music.png' width='15px' height='20px'/>音乐乐器</td>"+
                     "<td><img src='./images/art.png' width='15px' height='20px'/>艺术/美术 </td>"+
                     "<td><img src='./images/dance.png' width='15px' height='20px'/>舞蹈 </td>"+
                     "<td><img src='./images/language.png' width='15px' height='20px'/>外语 </td></tr>"+
                     "<tr><td><img src='./images/elementschool.png' width='15px' height='20px'/>小学家教 </td>"+
                     "<td><img src='./images/middleschool.png' width='15px' height='20px'/>初中家教 </td>"+
                     "<td><img src='./images/highschool.png' width='15px' height='20px'/>高中家教</td>" + 
                     "<td><img src='./images/university.png' width='15px' height='20px'/>考研/出国</td></tr>"+
                     "<tr><td><img src='./images/sport.png' width='15px' height='20px'/>运动健身</td>" + 
                     "<td><img src='./images/language.png' width='15px' height='20px'/>计算机 </td>"+
                     "<td></td>"+
                     "<td></td></tr>"+
                     "</table>",

NUM_PER_PAGE: 5,

isInvalid:function(value, invalidValue) {

    if (invalidValue == null) {
        return value==undefined || value==null;
    }
    
    return value==undefined || value==null || value == invalidValue;

},

doSearch:function(locationMarker, zoneid, areaid,specid,gettotal,startnum) {
    GLOBAL.debug('do search');


    var zoneId = (this.isInvalid(zoneid) && this.isInvalid(areaid)) ? $('#DIV_ZONE_LIST_SELECT_ZONE').val() : zoneid;
    var areaId = (this.isInvalid(areaid) && this.isInvalid(zoneid)) ? $('#DIV_AREA_LIST_SELECT_AREA').val() : areaid;
    var specId = this.isInvalid(specid) ? $('#DIV_SPEC_LIST_CLASS_SELECT_LIST_SPECS').val() : specid;
    var getTotal = this.isInvalid(gettotal) ? 1 : 0;
    var start = this.isInvalid(startnum) ? 0 : startnum;
    
    var teachtype = $('#SEARCH_TEACH_LOCATION').val();
    var pricerange = $('#SEARCH_PRICE_RANGE').val();
    var education = $('#SEARCH_EDUCATION').val();
    var gender = $('input:radio[name=SEARCH_GENDER]:checked').val();
    
    if (specId == undefined) {
        specId = 0;
    }
    
    if (areaId==undefined){
        areaId=0;
    }
    
    if (this.isInvalid(zoneId, 0) && this.isInvalid(areaId, 0)){
        return;
    }
    
    if (teachtype.length<1) {
        teachtype = -1;
    }
    
    if (pricerange.length < 1){
        pricerange = -1;
    }
    
    if (education.length<1){
        education = -1;
    }
    
    if (gender== null || gender==undefined) {
        gender = -1;
    }

    GLOBAL.debug('create info');
    var info = {
            'area': areaId,
            'spec': specId,
            'teachtype': teachtype,
            'pricerange': pricerange,
            'education':education,
            'gender':gender,
            'gettotal':getTotal,
            'startnum':start
    };
        
    if (this.isInvalid(areaId, 0)) {
   
        info = {'zone':zoneId,
                'spec': specId,
                'teachtype': teachtype,
                'pricerange': pricerange,
                'education':education,
                'gender':gender,
                'gettotal':getTotal,
                'startnum':start
               };
   };
   
    
   
   GLOBAL.debug(info);
    
   $.post('./findteachers.php', info, function(data) {
            GLOBAL.debug(data);
            var d = YAHOO.lang.JSON.parse(data);
            var teachers = d.teachers;
            var content = "";

            if (teachers.length<1) {
                content="<div style='width:240px;height:50px;'>";
            } else if (teachers.length<3) {
                content="<div style='width:240px;height:100px;'>";
            } else {
                content="<div style='width:240px;height:320px;'>";
            }

            var optionStr = "&nbsp;&nbsp;<span onclick='DISCUSSION.loadDiscussionList();' class='discussion_title_unselected' >刷新</span> | " + 
                            "<span onclick='DISCUSSION.showNewDiscussionDialog();' class='discussion_title_unselected'>提问</span>";

            $('#DIV_SEARCH_RESULT_DISCUSSION_LIST').html('读入中...');
            if (SEARCH.isInvalid(areaId, 0)){
                PAGE.updateLocationList('DIV_ZONE_LIST', 'DIV_AREA_LIST', zoneId, 0);
                var zone = GLOBAL.getZone(zoneId);
                $('#DIV_SEARCH_RESULT_DISCUSSION_CURRENT_LOCATION').html('<span class="discussion_location_name">' + zone.name + '</span>' + optionStr);
                $('#DISCUSSION_ZONE').val(zoneId);
                $('#DISCUSSION_AREA').val(0);
                
                DISCUSSION.loadDiscussionList(zoneId,0);
                
            } else {
                var zone = Math.floor(areaId/10000);
                PAGE.updateLocationList('DIV_ZONE_LIST', 'DIV_AREA_LIST', zone, areaId);
                var zoneInfo = GLOBAL.getZone(zone);
                var areaInfo = GLOBAL.getArea(areaId);



                $('#DIV_SEARCH_RESULT_DISCUSSION_CURRENT_LOCATION').html('<span class="discussion_location_name">' +  zoneInfo.name + ',' + areaInfo.name + '</span>' + optionStr);
                $('#DISCUSSION_ZONE').val(zone);
                $('#DISCUSSION_AREA').val(areaId);
                
                DISCUSSION.loadDiscussionList(zone,areaId);
            }
            
            var teacherSearchConent = SEARCH.processTeacherSearchResult(teachers,d.zonesearch,locationMarker);
            $('#DIV_SEARCH_RESULT').html(teacherSearchConent);
            
            var total = d.total;
            var pages = parseInt(total)/SEARCH.NUM_PER_PAGE;
                
            var paging = '<hr>跳转到 ';
                
            for(var i = 0;i<pages;++i) {
                paging+='<span id="TEACHER_LIST_PAGE_' + i + '"  style="cursor:pointer;" onclick="SEARCH.searchMoreTeachers(' + zoneId + ',' +  areaId + ',' + specId + ',' + (i*DISCUSSION.NUM_PER_PAGE) + ');">' + (i+1) + '</span>&nbsp;';
            }
                
            $('#DIV_SEARCH_RESULT_TEACHER_LIST_PAGING').attr('total',total);
            $('#DIV_SEARCH_RESULT_TEACHER_LIST_PAGING').html(paging);
            
            
//            GLOBAL.debug(allTeachersContent);
        });

},

searchMoreTeachers: function(zoneid,areaid,specid,startnum) {

    // update paging ui
    var selectedPage = startnum/this.NUM_PER_PAGE;
    var total = parseInt($('#DIV_SEARCH_RESULT_TEACHER_LIST_PAGING').attr('total'));
    var pages = total/DISCUSSION.NUM_PER_PAGE;
    
    for(var i=0;i<pages;++i) {
        if (i==selectedPage) {
            $('#TEACHER_LIST_PAGE_'+i).css('color','red');
        } else {
            $('#TEACHER_LIST_PAGE_'+i).css('color','black');
        }
    
    }


    var teachtype = $('#SEARCH_TEACH_LOCATION').val();
    var pricerange = $('#SEARCH_PRICE_RANGE').val();
    var education = $('#SEARCH_EDUCATION').val();
    var gender = $('input:radio[name=SEARCH_GENDER]:checked').val();
    
    if (teachtype.length<1) {
        teachtype = -1;
    }
    
    if (pricerange.length < 1){
        pricerange = -1;
    }
    
    if (education.length<1){
        education = -1;
    }
    
    if (gender== null || gender==undefined) {
        gender = -1;
    }

    var info = {
            'area': areaid,
            'spec': specid,
            'teachtype': teachtype,
            'pricerange': pricerange,
            'education':education,
            'gender':gender,
            'startnum':startnum
    };
        
    if (this.isInvalid(areaid, 0)) {
   
        info = {'zone':zoneid,
                'spec': specid,
                'teachtype': teachtype,
                'pricerange': pricerange,
                'education':education,
                'gender':gender,
                'startnum':startnum
               };
   };
   
   GLOBAL.debug(info);
   $('#DIV_SEARCH_RESULT').html('搜索中。。。');
   $.post('./findteachers.php', info, function(data) {
            GLOBAL.debug('search more: ' + data);
            var d = YAHOO.lang.JSON.parse(data);
            var teachers = d.teachers;
            var content = "";

            if (teachers.length<1) {
                content="<div style='width:240px;height:50px;'>";
            } else if (teachers.length<3) {
                content="<div style='width:240px;height:100px;'>";
            } else {
                content="<div style='width:240px;height:320px;'>";
            }
            
            var teacherSearchConent = SEARCH.processTeacherSearchResult(teachers,d.zonesearch);
            $('#DIV_SEARCH_RESULT').html(teacherSearchConent);
            
        });

},

processTeacherSearchResult: function(teachers,zonesearch,originalLocationMarker) {
            /*
            * users MUST be from the same zone or area
            * if from same zone but different area (zone search), create PINs for each area, and distribute user to each pin. NO invividual user pin.
            * if from the same area, show users without lat/lng in a single PIN (at the area location), and show other users in their geolocation place
            */
            var zoneSearch = zonesearch == 'true';
            
            var result = {};
            var pinContent = "";
            var foundUsers = false;
            
            var allTeachersContent = "";
            
            allTeachersContent+= "<div style='font-size:12px;'>" + this.SEARCH_HELP_CONTENT + "</div>";
            
            if (zoneSearch) {
                GLOBAL.debug('zone search');
                var zone = 0;
                for(i in teachers) {
                    var teacher = YAHOO.lang.JSON.parse(teachers[i]);
                    zone = teacher.zone;
                    var zonePinId = 'SEARCHMARK_ZONE_'+ zone;
                    
                    var areaInfo = GLOBAL.getArea(teacher.area);
                    if (SEARCH.isInvalid(areaInfo.lat, 0) && SEARCH.isInvalid(areaInfo.lng, 0)) {
                        var s= PAGE.createTeacherSummary(teacher, zonePinId);
                        pinContent += s;
                        allTeachersContent+=s;
                    } else {
                        var markerId = 'SEARCHMARK_AREA_' + teacher.area;
                        if (SEARCH.isInvalid(result[markerId])) {
                            var marker = MAP.addMark(areaInfo.lat, areaInfo.lng,null, markerId,{icon:'/images/google_green.png',zIndex:5,title:'显示' + areaInfo.name + '地区的私人教师'});
                            var _lat = areaInfo.lat;
                            var _lng = areaInfo.lng;
                            marker.id = markerId;
                            marker.htmlContent = PAGE.createTeacherSummary(teacher, markerId);
                            allTeachersContent += marker.htmlContent;
                            google.maps.event.addListener(marker, 'click', function(){
                                   GLOBAL.debug(this.htmlContent);
                                   MAP.moveTo(_lat,_lng,12,null);
                                   var infowindow = new google.maps.InfoWindow({
                                                        content:this.htmlContent
                                   });

                                   infowindow.open(MAP.searchMap,this);
                                   infowindow.setContent(this.htmlContent);
                                   this.infowindow = infowindow;
                            });
                            result[markerId] = marker;
                        } else {
                            var s = PAGE.createTeacherSummary(teacher, markerId);
                            result[markerId].htmlContent += s;
                            allTeachersContent += s;
                        }
                    }
                    
                }
                
                if (pinContent.length>1 && zone!=0) {
                    var markerId = zonePinId;
                    
                    var zoneInfo = GLOBAL.getZone(zone);
                    
                        var marker = MAP.addMark(zoneInfo.lat, zoneInfo.lng,null, markerId,{icon:'/images/google_green.png',zIndex:5,title:'显示' + zoneInfo.naem +'区域的私人教师'});
                        var _lat = zoneInfo.lat;
                        var _lng = zoneInfo.lng;
                        marker.id = markerId;
                        marker.htmlContent = pinContent;
                        google.maps.event.addListener(marker, 'click', function(){
                                       GLOBAL.debug(this.htmlContent);
                                       MAP.moveTo(_lat,_lng,9,null);
                                       var infowindow = new google.maps.InfoWindow({
                                                            content:this.htmlContent
                                       });
                                       infowindow.open(MAP.searchMap,this);
                                       infowindow.setContent(this.htmlContent);
                                       this.infowindow = infowindow;
                        });
                    
                    result[markerId] = marker;
                }
                
            } else {
                GLOBAL.debug('area search');

                var area = 0;
                for(i in teachers) {
                    var teacher = YAHOO.lang.JSON.parse(teachers[i]);
                    area = teacher.area;
                    var areaPinId = 'SEARCHMARK_AREA_'+ area;
                    
                    var areaInfo = GLOBAL.getArea(teacher.area);
                    if (SEARCH.isInvalid(teacher.lat, 0) && SEARCH.isInvalid(teacher.lng, 0)) {
                        GLOBAL.debug("teacher info");
                        GLOBAL.debug(teacher);
                        var s=PAGE.createTeacherSummary(teacher, areaPinId);
                        pinContent += s;
                        allTeachersContent += s;
                    } else {
                        GLOBAL.debug('create user pin');
                        var markerId = 'SEARCHMARK_USER_' + teacher.id;
                        
                        var sIds = teacher.specialities.split(',');
                        GLOBAL.debug('/images/'+ SEARCH.getSpecIcon(sIds));
                        var summary = PAGE.createTeacherSummary(teacher, markerId);
                        var marker = MAP.addMark(teacher.lat, teacher.lng,null, markerId,
                                    {icon:'/images/'+ SEARCH.getSpecIcon(sIds),
                                    animation: google.maps.Animation.BOUNCE,
                                    size:new google.maps.Size(16,30),
                                    zIndex:5,
                                    title:teacher.name+'\r\n' + teacher.rating + '\r\n' + HELPER.getSpecNames(teacher.specialities)
                                    });
                                    
                        marker.id = markerId;
                        marker.htmlContent = summary;
                        allTeachersContent += marker.htmlContent;
                        google.maps.event.addListener(marker, 'click', function(){
                                   GLOBAL.debug(this.htmlContent);
                                   var infowindow = new google.maps.InfoWindow({
                                                        content:this.htmlContent
                                   });
                                   infowindow.open(MAP.searchMap,this);
                                   infowindow.setContent(this.htmlContent);
                                   this.infowindow = infowindow;
                         });
                         result[markerId] = marker;
                         foundUsers = true;
                    }
                    
                }
                
                if (pinContent.length>1 && area!=0) {
                    var markerId = areaPinId;
                    
                    var areaInfo = GLOBAL.getArea(area);

                        var marker = MAP.addMark(areaInfo.lat, areaInfo.lng,null, markerId,{icon:'/images/google_orange.png',zIndex:5,title:'显示'+areaInfo.name+'地区的私人教师'});
                        var _lat = areaInfo.lat;
                        var _lng = areaInfo.lng;
                        marker.id = markerId;
                        marker.htmlContent = pinContent;
                        google.maps.event.addListener(marker, 'click', function(){
                                       GLOBAL.debug(this.htmlContent);
                                       MAP.moveTo(_lat,_lng,12,null);
                                       var infowindow = new google.maps.InfoWindow({
                                                            content:this.htmlContent
                                       });
                                       infowindow.open(MAP.searchMap,this);
                                       infowindow.setContent(this.htmlContent);
                                       this.infowindow = infowindow;
                        });

                    result[markerId] = marker;
                }                
                
            }
            
            
            if (!SEARCH.isInvalid(originalLocationMarker) && pinContent.length<1 && !foundUsers) {
                // no user. set the marker icon as black
                originalLocationMarker.setIcon('/images/google_black.png');
                originalLocationMarker.setTitle('该地区目前暂时没有任何信息');
                //MAP.removeMark(null,locationMarker.id);
            }
            
            return allTeachersContent;

},

getSpecIcon:function(specs) {

    for(i in specs) {
        var id = specs[i];
        var c = GLOBAL.getSpecClass(id);
        if (!this.isInvalid(c)){
            return c.icon;
        }
    }
}

};