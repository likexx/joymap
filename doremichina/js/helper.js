var HELPER = {

getSpecNames: function(specialities) {
    GLOBAL.debug(specialities);
    var sIds = specialities.split(',');
    var result = '';

    for(var i in sIds) {
        var id = sIds[i];
        var speciality = GLOBAL.getSpec(id);
        if (speciality != undefined && speciality != null) {
            result+=speciality + ',';
        }
    }    
    
    return result;
},

htmlEncode: function(str) {
    
    return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
}


}