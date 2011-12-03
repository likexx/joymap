var GLOBAL = {
debug: true,
USERMENU_DEFAULT_TEXT: "<span id='login_error' style='color:red;'></span>用户名<input id='login_username' type='text'> 密码<input id='login_password' type='password'> <input onclick='REGISTRATION.login();' type='button' value='登录'>  | <span onclick='PAGE.showRegistration();' style='cursor:pointer;'>快速加入</span>",

HOST: './',

debug: function(value) {
    if (this.debug){
        console.log(value);
    }
},

set: function(key, value) {
   this[key] = value;
},

get: function(key) {
   return this[key];
},

getArea: function(areaId) {

   return this.get('AREA_'+areaId);
},

getZone: function(zoneId) {
	
	var zones = this.get('ZONE_LIST');
    var zone = zones[zoneId];
    return zone;
},

getAreas: function(zoneId) {
    var zones = this.get('ZONE_LIST');
    var zone = zones[zoneId];
    return zone.areas;
},

getOccupation: function(id) {
 var jobs = GLOBAL.get('OCCUPATIONS');
 return jobs[id];
},

getEducation: function(id) {
 var edus = GLOBAL.get('EDUCATIONS');
 return edus[id];
},

getSpecClass: function(specid) {
    if (specid < 1) {
        return null;
    }

    if (id<=1000) {
        return this.get('SPEC_CLASSES')[0];
    }    

    // note, if specid is N*1000, it means for all specs within (N*1000-1000, N*1000-1]    
    var id = specid-1;

    return this.get('SPEC_CLASSES')[id - id%1000];
},

getSpec:function(id) {
    if (id<1) {
        return null;
    }
    var c = this.getSpecClass(id);
    if (id%1000==0) {
        return c.name;
    }
    return c.specs[id];
}

};

// earth radius in miles
var EARTH_RADIUS = 3958.761;
var MAX_DISTANCE = 999999;

function getDistanceByDegree(lat1, lng1, lat2, lng2) {

if (SEARCH.isInvalid(lat1) || 
    SEARCH.isInvalid(lng1) ||
    SEARCH.isInvalid(lat2) ||
    SEARCH.isInvalid(lng2)) {
    
        return MAX_DISTANCE;
    
    }

var aLat1 = lat1*Math.PI/180;
var aLng1 = lng1*Math.PI/180;
var aLat2 = lat2*Math.PI/180;
var aLng2 = lng2*Math.PI/180;

var diffLat = aLat1 - aLat2;
var diffLng = aLng1 - aLng2;
var medianLat = (aLat1 + aLat2)/2;

var distance = Math.sqrt(diffLat * diffLat + Math.pow(Math.cos(medianLat) * diffLng, 2)) * EARTH_RADIUS;
return distance;
}

function initPage() {

	var userId = GLOBAL.get('userId');

	if (userId<1) {
	   $('#DIV_USER_INFO_UPDATE').css("display", "inline");
	   $('#DIV_USER_INFO_UPDATE').css("visibility", "visible");
	} else {
		
		PAGE.showLoggedInUserMenu();
	}
	
	$("#DIV_SEARCH_RESULT_LAYER").tabs();
	
    MAP.initMap();
	loadAreaData();
	loadOccupations();
	loadEducations();
	loadSpecialities();
	showOncallSearchList();
	showPriceRange();
	
	initPopularCityList();
//	setInterval('mainLoop();',2000);
	showHeaderContent();
}


function mainLoop() {
    var div = $('#LOGO_ANIMATION');
    
    // TO DO: do some fancy animation    
}

function showHeaderContent() {
    var sentence = LogoAnimation.getRandomSentence();
    var image = LogoAnimation.getRandomNpcImage();
    
    var content = "<div id='HEADER_LOGO_INFO_CONTENT'><table><tr><td>"+
                  "<img src='" + image + "'/></td><td><span style='font-size:14px;color:white;font-weight:bold;'>" + 
                  sentence +
                  "</div></td></tr></table></div>";
    
    $('#HEADER_LOGO_INFO').html(content);
    
    setTimeout('fadeoutHeader();', 3000);
}

function fadeoutHeader() {
    $("#HEADER_LOGO_INFO_CONTENT").effect( 'fade', {}, 1000,function() {
      showHeaderContent();
    });
}


function initPopularCityList() {

var cities=[
    {id:10001,name:'北京'},
    {id:20001,name:'上海'},
    {id:30001,name:'重庆'},
    {id:40001,name:'天津'},
    {id:50001,name:'成都'}];

var content = "";

var count = 0;
for (i in cities) {
    var city = cities[i];
    content += "<span class='city_unselected' onmouseout='this.style.color=\"#069\";' onmouseover='this.style.color=\"red\";' onclick='MAP.moveToArea(" + city.id + ",10);'>" + city.name + "</span>&nbsp;&nbsp;";
    if (count>=2) {
        content+='<br/>';
        count = 0;
    } else {
        ++count;
    }
}

$('#DIV_POPULAR_CITY_LIST').html(content);

}


function loadAreaData() {
	$.ajax({
        type: "GET",
		url: "config/area.xml",
		dataType: "xml",
		success: function(xml) {

            var zoneList={};

            $(xml).find('zone').each(function(){
				var id= $(this).attr('id');
			    var name = $(this).attr('name');
			    var zoneLat = $(this).attr('lat');
                var zoneLng = $(this).attr('lng');

                if ((SEARCH.isInvalid(zoneLat) || SEARCH.isInvalid(zoneLng)) && 
                    !SEARCH.isInvalid($(this).attr('lnglat'))) {
                    var lnglatStr = $(this).attr('lnglat');
                    var data = lnglatStr.split(',');
                    if (data.length > 1) {
                        zoneLng = data[0];
                        zoneLat = data[1];
                    }
                }
                
                var zoneZoom = $(this).attr('zoom');

			    var areas = {};
			    var count = 1;
			    
			    $(this).find('area').each(function() {
                  var areaId = parseInt(id)*10000 + count; 
			      var areaName = $(this).attr('name');
                  var lat = $(this).attr('lat');
                  var lng = $(this).attr('lng');
                  var zoom = $(this).attr('zoom');
                  var showat = $(this).attr('showat');
                  
                  if ((SEARCH.isInvalid(lat) || SEARCH.isInvalid(lng)) && 
                        !SEARCH.isInvalid($(this).attr('lnglat'))) {
                        var lnglatStr = $(this).attr('lnglat');
                        var data = lnglatStr.split(',');
                        if (data.length > 1) {
                            lng = data[0];
                            lat = data[1];
                        }
                    }
                  
			      areas[areaId] = {
			          zoneId: id,
			          name: areaName,
			          lat:lat == null || lat == undefined ? null : parseFloat(lat),
			          lng:lng == null || lng == undefined? null : parseFloat(lng),
                      zoom:zoom == null || zoom == undefined ? null : parseInt(zoom),
                      showat: SEARCH.isInvalid(showat) ? 9 :parseInt(showat)
			      };
			      GLOBAL.set('AREA_' + areaId, areas[areaId]);
			      count++;
			    });
			    
			    zoneList[id] = {
			      name: name,
			      areas: areas,
			      lat:zoneLat == null || zoneLat== undefined ? null : parseFloat(zoneLat),
			      lng:zoneLng == null || zoneLng == undefined ? null : parseFloat(zoneLng),
			      zoom:zoneZoom == null || zoneZoom == undefined ? null : parseInt(zoneZoom)
			    };
			    
			    
			});
			
			GLOBAL.set('ZONE_LIST',zoneList);
			
            MAP.resetSearchMarkersOnZoom();
            
            PAGE.showZoneList('DIV_ZONE_LIST', 'DIV_AREA_LIST', true);			
			
		}
	});

}


function loadOccupations() {
    $.ajax({
        type: "GET",
        url: "config/occupation.xml",
        dataType: "xml",
        success: function(xml) {

            var jobs={};

            $(xml).find('occupation').each(function(){
                var id= $(this).attr('id');
                var name = $(this).attr('name');
                
                jobs[id] = name;
            });
            
            GLOBAL.set('OCCUPATIONS',jobs);
            
        }
    });

}

function loadEducations() {
    $.ajax({
        type: "GET",
        url: "config/education.xml",
        dataType: "xml",
        success: function(xml) {

            var educations={};

            $(xml).find('education').each(function(){
                var id= $(this).attr('id');
                var name = $(this).attr('name');
                
                educations[id] = name;
            });
            
            GLOBAL.set('EDUCATIONS',educations);

            var content = '学历<select id="SEARCH_EDUCATION" onchange="PAGE.doSearch();"><option value="">--';
    
            for (i in educations) {
                content+='<option value="' + i + '">' + educations[i] + '</option>';
            }
            
            content+='</select>';
            
            $('#DIV_SEARCH_EDUCATION').html(content);   
        }
    });

}

function loadSpecialities() {
    $.ajax({
        type: "GET",
        url: "config/specialities.xml",
        dataType: "xml",
        success: function(xml) {

            var classes={};

            $(xml).find('class').each(function(){
                var id= $(this).attr('id');
                var name = $(this).attr('name');
                var icon = $(this).attr('icon');

                var specs = {};
                
                $(this).find('speciality').each(function() {
                  var specid = $(this).attr('id');
                  var specname = $(this).attr('name');
                  
                  specs[specid] = specname;
                  
                  GLOBAL.set('SPEC_'+id,specs[specid]);
                });
                
                classes[id] = {
                  name: name,
                  specs: specs,
                  icon:icon
                };
            });
            
            GLOBAL.set('SPEC_CLASSES',classes);
            
            PAGE.showSpecList('DIV_SPEC_LIST',-1);
        }
    });

}

function showOncallSearchList() {
    var content = '教学方式<select id="SEARCH_TEACH_LOCATION" onchange="PAGE.doSearch();"><option value="">--';
    
    for (i in DATA.class_location) {
        content+='<option value="' + i + '">' + DATA.class_location[i] + '</option>';
    }
    
    content+='</select>';
    
    $('#DIV_ONCALL_LIST').html(content);
}

function showPriceRange() {
    var content = '收费标准（小时）<select id="SEARCH_PRICE_RANGE" onchange="PAGE.doSearch();"><option value="">--';
    
    for (i in DATA.class_fee) {
        content+='<option value="' + i + '">' + DATA.class_fee[i] + '</option>';
    }
    
    content+='</select>';
    
    $('#DIV_PRICE_RANGE').html(content);
}
