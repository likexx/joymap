var MESSAGE= {

DIALOG_ID: 'MESSAGE_DIALOG',

showContentInDialog:function(title, content) {

            $('#' + this.DIALOG_ID).remove();
            
            $('<div id="' + this.DIALOG_ID + '">').css({
                'width':480,
                'height':360,
                'background-color':'#cccccc'
            }).html(content).appendTo('body').dialog({
                    show: "Blind",
                    hide: "Blind",
                    width: 480,
                    height: 360,
                    title: title
            });


},

showMessageList:function() {

    $.post('./loadmessages.php',{}, function(data) {
            GLOBAL.debug(data);
            var d = YAHOO.lang.JSON.parse(data);
            var list = d.list;
            
            var content="";
            
            for(i in list) {
                var m = list[i];
                content+= m.content + '<br/><span style="cursor:pointer;" onclick="' +"$('#MESSAGE_REPLY_LAYER_"+m.id+"').css('display','inline');"+ '">回复</span>';
                
                content += '<br/><div id="MESSAGE_REPLY_LAYER_' + m.id + '" style="display:none"><textarea id="MESSAGE_REPLY_CONTENT_' + m.id + '" rows="5" cols="40"></textarea><input type="button" value="发送" onclick="MESSAGE.reply(' +
                           m.id + ');"></div></br>';
            }
            
            MESSAGE.showContentInDialog('消息列表', content);

        });

},

sendto: function(id, contentName) {
    var content = $('#'+contentName).val();

    $.post('./sendmessage.php',{receiver:id, content:content}, function(data) {
            if (data!='0') {
                return;
            }
            $('#'+contentName).val('');
        });
    
},

reply: function(mid) {

    var content = $('#MESSAGE_REPLY_CONTENT_' + mid).val();
    
    GLOBAL.debug(content);

    $.post('./sendmessage.php',{mid:mid, content:content}, function(data) {
            if (data!='0') {
                return;
            }
            
            $('#MESSAGE_REPLY_CONTENT_' + mid).val('');
            $('#MESSAGE_REPLY_LAYER_'+mid).css('display','none');
        });

}


};