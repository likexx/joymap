
MAP={

MAP_MODE_ZONE_ONLY: 1,
MAP_MODE_AREA_ONLY: 2,
MAP_MODE_AREA_USER: 3,
ZONE_PREFIX : 'MAPPIN_ZONE_',
AREA_PREFIX : 'MAPPIN_AREA_',


searchMap:null,

searchMarkers:{},

submaps: {},

overlay: null,

mouseDown: false,

markers: {},

autoZoom: true,

mapMode: 0,

currentZone: 0,
currentArea: 0,

init: function() {

},

initMap: function() {

    GLOBAL.debug('init map');
    // set 重庆 
    var latlng = new google.maps.LatLng(29.562312,106.568614);
    var myOptions = {
      zoom: 5,
      center: latlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    this.searchMap = new google.maps.Map(document.getElementById("map"), myOptions);
  
    google.maps.event.addListener(this.searchMap, 'click', MAP.findLocationByMapClick);

    google.maps.event.addListener(this.searchMap, 'zoom_changed', function() {
        MAP.resetSearchMarkersOnZoom();
      });    

    google.maps.event.addListener(this.searchMap, 'center_changed', function() {
        MAP.resetSearchMarkersOnMove();
        MAP.updateSearchConditionByMapCenter();
      });    

},


resetSearchMarkersOnZoom: function() {
    var zoom = this.searchMap.getZoom();
    var zoomDiff = zoom - this.prevZoom;
    
    GLOBAL.debug('current zoom: ' + zoom);    
    var zones = GLOBAL.get('ZONE_LIST');
    if (zoom < 7 && this.mapMode != this.MAP_MODE_ZONE_ONLY){
        this.removeAllMarks(null,this.AREA_PREFIX);
        for(i in zones){
            var id = this.ZONE_PREFIX+i;
            var zone = zones[i];
            var marker = this.addMark(zone.lat,zone.lng,null,id, {icon:'/images/zonesearch.png',size:new google.maps.Size(20,40)});
            if (marker == null) {
                continue;
            }
            marker.setTitle('点击直接进入并搜索' + zone.name + '地区');
            marker.id = id;
            marker.searchValue = i;
            marker.zoneName = zone.name;
            google.maps.event.addListener(marker, 'click', function(){
                        MAP.moveTo(this.getPosition().lat(),this.getPosition().lng(),9,null);
                        SEARCH.doSearch(this, this.searchValue);
            });
            /*
            google.maps.event.addListener(marker, 'mouseover', function(){
                        var content = "<div style='width:160px;'>点击图标，进入" + this.zoneName + "并展开搜索</div>";
                        var infowindow = new google.maps.InfoWindow({
                                                        content:content,
                                                        pixelOffset: new google.maps.Size(0,40)
                         });

                        infowindow.open(MAP.searchMap,this);
                        this.infowindow = infowindow;
            });
            google.maps.event.addListener(marker, 'mouseout', function(){
                        this.infowindow.close();
            });
            */
        }
        this.mapMode = this.MAP_MODE_ZONE_ONLY;
        
    } else if (zoom>=7 && zoom < 12 && this.mapMode != this.MAP_MODE_AREA_ONLY) {
        GLOBAL.debug('redraw');
        this.removeAllMarks(null,this.ZONE_PREFIX);
        var location = this.searchMap.getCenter();
        var selectedZone = this.findZoneByLocation(location.lat(),location.lng());
        
        if (selectedZone != 0) {
            var areas = zones[selectedZone].areas;
            for(i in areas) {
                var id = this.AREA_PREFIX+i;
                var area = areas[i];
                var marker = this.addMark(area.lat,area.lng, null, id,{icon:'/images/zonesearch.png',size:new google.maps.Size(20,40)});
                if (marker == null) {
                    continue;
                }
                marker.setTitle('点击直接进入并搜索' + area.name + '地区');
                marker.id = id;
                marker.searchValue = i;
                marker.areaName = area.name;
                google.maps.event.addListener(marker, 'click', function(){
                        MAP.moveTo(this.getPosition().lat(),this.getPosition().lng(),12,null);
                        SEARCH.doSearch(this, null, this.searchValue);
                });
                /*
                google.maps.event.addListener(marker, 'mouseover', function(){
                            var content = "<div style='width:160px;'>点击图标，进入" + this.areaName + "并展开搜索</div>";
                            var infowindow = new google.maps.InfoWindow({
                                                            content:content,
                                                            pixelOffset: new google.maps.Size(0,40)
                             });
    
                            infowindow.open(MAP.searchMap,this);
                            this.infowindow = infowindow;
                });
                google.maps.event.addListener(marker, 'mouseout', function(){
                            this.infowindow.close();
                });
                */
             }                    
        }
        
        this.mapMode = this.MAP_MODE_AREA_ONLY;
        this.currentZone = selectedZone;
    } else if (zoom >11 && this.mapMode != this.MAP_MODE_AREA_USER) {
        // do search based on map center
        this.removeAllMarks(null,this.ZONE_PREFIX);
        var location = this.searchMap.getCenter();
        var r = this.findZoneAreaByLocation(location.lat(),location.lng());
        
        SEARCH.doSearch(null, r.zone, r.area);
        
        this.mapMode = this.MAP_MODE_AREA_USER;
        
        this.currentZone = r.zone;
        this.currentArea = r.area;
    }
    
},


resetSearchMarkersOnMove: function() {
    var center = this.searchMap.getCenter();

    switch (this.mapMode) {
    case this.MAP_MODE_ZONE_ONLY:
        // always show all zones in this mode, do nothing;
        this.currentArea = 0;
        this.currentZone = 0;
        break;
    case this.MAP_MODE_AREA_ONLY:
        // for this level, don't search, just show area PINs
        var centerZone = this.findZoneByLocation(center.lat(),center.lng());
        if(this.currentZone != centerZone) {
            var zones = GLOBAL.get('ZONE_LIST');
            var zone = zones[centerZone];
            
            var areas = zone.areas;
            for(i in areas) {
                var area = areas[i];
                var marker = this.addMark(area.lat,area.lng,null,i,{icon:'/images/zonesearch.png',size:new google.maps.Size(20,40)});
                if (marker == null) {
                    continue;
                }
                
                marker.id = this.AREA_PREFIX + i;
                marker.searchValue = i;
                google.maps.event.addListener(marker, 'click', function(){
                            SEARCH.doSearch(this, null, this.searchValue);
                });
                
            }                    
            
            this.currentZone = centerZone;
            this.currentArea = 0;
        }
        break;
    case this.MAP_MODE_AREA_USER:
        // do search based on map center
        this.removeAllMarks(null,this.ZONE_PREFIX);
        var location = this.searchMap.getCenter();
        var r = this.findZoneAreaByLocation(location.lat(),location.lng());
        if (r.area != this.currentArea) {
            SEARCH.doSearch(null, r.zone, r.area);
        }
        this.currentArea = r.area;
        this.currentZone = r.zone;
        break;        
    }
    
},

setupSubMap: function(mapId,lat,lng,zoom,onclickcallback) {
    var latlng = new google.maps.LatLng(lat,lng);
    var myOptions = {
      zoom: zoom,
      center: latlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    var map = new google.maps.Map(document.getElementById(mapId), myOptions);
    if (onclickcallback != undefined) {
        google.maps.event.addListener(map, 'click', onclickcallback);
    }
    
    this.submaps[mapId]=map;
    
},

removeSubmap:function(id){
    this.submaps[id] = null;
},

addMark: function(lat, lng, mapid, id,option) {

    if (SEARCH.isInvalid(lat) || SEARCH.isInvalid(lng)){
        return null;
    }
    
    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(lat,lng),
        title: (!SEARCH.isInvalid(option) && !SEARCH.isInvalid(option.title)) ? option.title : '进入该区域' 
    });  

    if (option != undefined) {
        if (option.icon!=undefined) {
            if (option.size==undefined) {
                marker.icon = new google.maps.MarkerImage(option.icon, undefined,undefined,undefined,new google.maps.Size(10,15));
            } else {
                marker.icon = new google.maps.MarkerImage(option.icon, undefined,undefined,undefined,option.size);
            }
        } 
        if (option.zIndex != undefined) {
            marker.zIndex = option.zIndex;
        }
    }
    
    if (!SEARCH.isInvalid(option) && option.zIndex!=undefined) {
        marker.setZIndex(option.zIndex);
    } else {
        marker.setZIndex(1);
    }
    
    if (!SEARCH.isInvalid(option) && option.animation!=undefined) {
        marker.setAnimation(option.animation);
    } 
    
    var map = this.searchMap;
    
    if (mapid!=undefined) {
        map = this.submaps[mapid];
    }

    if (map != this.searchMap) {
        this.markers[mapid+'_' + id]=marker;
    } else {
        if (!SEARCH.isInvalid(this.searchMarkers[id])) {
            GLOBAL.debug('remove ' + id);
            this.searchMarkers[id].setMap(null);
            this.searchMarkers[id]=null;
        }
        this.searchMarkers[id]= marker;
    }

    marker.setMap(map);
    
    return marker;    
},

removeMark: function(mapid,id){
    if (mapid!=null) {
        var marker = this.markers[mapid+'_'+id];
        if (marker==null || marker==undefined) {
            return;
        }
        marker.setMap(null);
    } else {
        if (!SEARCH.isInvalid(this.searchMarkers[id])) {
            this.searchMarkers[id].setMap(null);
            this.searchMarkers[id]=null;
        }
    }
},

removeAllMarks:function(mapid,prefix) {
    if (mapid==undefined) {
        for(i in this.searchMarkers){
            if (!SEARCH.isInvalid(this.searchMarkers[i])){
                if (!SEARCH.isInvalid(prefix)) {
                    if (this.searchMarkers[i].id.indexOf(prefix)!=0) {
                        continue;
                    }
                } 
                this.searchMarkers[i].setMap(null);
                this.searchMarkers[i] = null;
            }
        }
    } else {
        for(k in this.markers){
            if (k.indexOf(mapid+'_')==0 && this.markers[k]!=null) {
                this.markers[k].setMap(null);
                this.markers[k]=null;
            }
        }
    }
    
},


getMark: function(mapid,id){
    var marker = null;
    if (!SEARCH.isInvalid(mapid)) {
        marker = this.markers[mapid+'_'+id];
        if (marker==null || marker==undefined) {
            return null;
        }
        return marker;
    }
    
    marker = this.searchMarkers[id];
    if (SEARCH.isInvalid(marker)){
        return null;
    }
    
    return marker;
},

disableSearchMap: function() {
    this.disableMap(this.searchMap);
    google.maps.event.clearListeners(this.searchMap, 'click');
},

enableSearchMap: function() {
    this.enableMap(this.searchMap);
    google.maps.event.addListener(this.searchMap, 'click', MAP.findLocationByMapClick);
},

disableMap:function(map) {

    map.setOptions({
      draggable: false,
      disableDoubleClickZoom:true,
      disableDefaultUI:true
    });

},

enableMap: function(map) {
    map.setOptions({
      draggable: true,
      disableDoubleClickZoom:false,
      disableDefaultUI:false
    });
},

showUserLocationPin: function(lat, lng) {

    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(lat,lng),
        title: '你的当前位置',
        icon: new google.maps.MarkerImage('/images/google_blue.png', undefined,undefined,undefined,new google.maps.Size(20,30)),
        animation: google.maps.Animation.DROP
    });  
    
    marker.setMap(this.searchMap);

},

moveToArea: function(areaid,zoom) {

var area = GLOBAL.getArea(areaid);

this.currentArea = areaid;
this.currentZone = Math.floor(areaid/10000);

this.moveTo(area.lat, area.lng, zoom,null);

},

moveTo: function(lat, lng, zoom, mapid) {
var map = this.searchMap;

if (mapid!=undefined && mapid!=null) {
    GLOBAL.debug('mapid:' + mapid);
    map = this.submaps[mapid];
    if (map==null) {
        return;
    }
}
GLOBAL.debug('move to ' + lat + ',' + lng + ', zoom=' + zoom + ', curent zoom ' + map.getZoom());
map.setCenter(new google.maps.LatLng(lat, lng)); 

if (this.autoZoom){
    map.setZoom(zoom==null ? map.getZoom() : zoom); 
}

this.resetSearchMarkersOnZoom();
this.resetSearchMarkersOnMove();

},

findZoneByLocation:function(lat,lng){
        var zones = GLOBAL.get('ZONE_LIST');
        var selectedZone = 0;
        var minDistance = 9999999;

        for(i in zones) {
            var zone = zones[i];
            if(zone.lat != null && zone.lng != null) {
                    var distance = getDistanceByDegree(zone.lat,zone.lng,lat,lng);
                    if (distance < minDistance) {
                        minDistance = distance;
                        selectedZone = i;
                    }
            }
        }

        return selectedZone;        
},

updateSearchConditionByMapCenter:function() {

    if (!PAGE.allowChangeLocationOnMapMove) {
        return;
    }

    var center = this.searchMap.getCenter();
    var lat = center.lat();
    var lng = center.lng();

    var location = this.findZoneAreaByLocation(lat, lng);
    this.currentZone = location.zone;
    this.currentArea = location.area;
   
   if (location.zone != 0 || location.area != 0) {
       PAGE.updateLocationList('DIV_ZONE_LIST', 'DIV_AREA_LIST', location.zone, location.area);
   }
    
},

findZoneAreaByLocation:function(lat, lng) {

    var zones = GLOBAL.get('ZONE_LIST');
    
    var minDistance =9999999;
    var selectedZone = 0;
    var selectedArea = 0;
    
    for(i in zones) {
        var zoneDist = getDistanceByDegree(zones[i].lat,zones[i].lng,lat,lng);

        if (zoneDist >= 1000) {
        // if the zone center distance is too far from current location, skip it
            continue;
        } 
        
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
   
   return {zone: selectedZone, area: selectedArea};
}

};
