var DISCUSSION = {

NUM_PER_PAGE: 5,

showNewDiscussionDialog:function() {

    $('#DISCUSSION_POST_DIALOG').remove();
    
    var zone = $('#DISCUSSION_ZONE').val();
    var area = $('#DISCUSSION_AREA').val();
    
    var zoneInfo = GLOBAL.getZone(zone);
    var areaInfo = GLOBAL.getArea(area);
    var areaName = SEARCH.isInvalid(areaInfo) ? '' : (',' + areaInfo.name);
    var content="<div style='width:100%;height:100%;'><table><tr><td colspan='2'><span class='discussion_location_name'>" + zoneInfo.name +(areaName.length>0 ? (areaName) : '') + "</span></td></tr><tr><td>标题</td><td><input id='NEW_DISCUSSION_TITLE' type='text' size='40' maxlength='40'></td></tr>" +
                "<tr><td>内容</td><td><textarea id='NEW_DISCUSSION_CONTENT' rows='10' cols='40'></textarea></td></tr>" +
                "<tr><td><input type='button' onclick='DISCUSSION.postDiscussion(" + zone + "," + area + ");' value='发布'></td><td><span id='DISCUSSION_POST_ERROR' style='color:red;font-size:11px;'></span></td></tr>" + 
                "</table></div>";
   
    var offset = $('#map').offset();
    
    $('<div id="DISCUSSION_POST_DIALOG">').css({
        'width':500,
        'height':320,
        'title':zoneInfo.name + areaName
    }).html(content).appendTo('body').dialog({
            show: "Blind",
            hide: "Blind",
            width: 500,
            height: 320,
            position: [offset.left+80, offset.top+80],
            dialogClass: 'discussion_dialog_class'
    });

},

showDiscussion:function(id) {
    var info = {id:id};

    $.post('./loaddiscussion.php',info, function(data) {

            $('#DISCUSSION_POST_DIALOG').remove();
            
            var d = YAHOO.lang.JSON.parse(data);
            var list = d.list;
            
            var content="<div class='discussion_content'>";
            var title = '';
            var mainid=0;
            var zone = 0;
            var area = 0;
            
            for(i in list) {
                var post = list[i];
                
                if (i==0) {
                    title = post.title;
                    mainid = post.id;
                    zone = post.zone;
                    area = post.area;
                }
                
                content+='发言人  ' + post.username + ': ' + post.title + '</br>' + post.content + '<hr>';
            }
            
            if (mainid>0){
                content +='<textarea id="DISCUSSION_REPLY_CONTENT" rows="5" cols="40"></textarea><br/><input type="button" onclick="DISCUSSION.postReply(' + mainid + ',' + zone + ',' + area + ');" value="回复">';
            }
            
            content+="</div>";
        
            var offset = $('#map').offset();
            $('<div id="DISCUSSION_POST_DIALOG">').css({
                'width':480,
                'height':320,
                'background-color':'#FFFFFF'
            }).appendTo('body').dialog({
                    show: "Blind",
                    hide: "Blind",
                    width: 480,
                    height: 240,
                    title: title,
                    position: [offset.left+80, offset.top+80],
                    dialogClass: 'discussion_dialog_class'
            }).html(content);

    });



},


closeNewDiscussionDialog: function() {
    $('#DISCUSSION_POST_DIALOG').remove();
},

postDiscussion:function(zone, area) {

    var title = $('#NEW_DISCUSSION_TITLE').val();
    var content = $('#NEW_DISCUSSION_CONTENT').val();
    

    var info = {
        title:title,
        content:content,
        zone:zone,
        area:area
    };
    GLOBAL.debug(info);
    
    $.post('./postDiscussion.php',info, function(data) {
           switch (data) {
           case '0':
                DISCUSSION.closeNewDiscussionDialog();
                DISCUSSION.loadDiscussionList(zone,area);
                break;
           case '1':
                $('#DISCUSSION_POST_ERROR').html('两次发表间隔太短！');
                break;
           case '2':
                $('#DISCUSSION_POST_ERROR').html('内容或者标题太短！');
                break;
           case '3':
                $('#DISCUSSION_POST_ERROR').html('内容或者标题太长！');
                break;
           case '4':
                $('#DISCUSSION_POST_ERROR').html('请先登录网站，再发表讨论');
                break;
           case '5':
                $('#DISCUSSION_POST_ERROR').html('暂时无法发表讨论');
                break;
           }
        });

},

postReply:function(mainid, zone, area) {
    var content = $('#DISCUSSION_REPLY_CONTENT').val();
    
    var info = {
        mainid: mainid,
        zone:zone,
        area: area,
        content: content
    }
    
    GLOBAL.debug(info);
    
    $.post('./postDiscussion.php',info, function(data) {
           GLOBAL.debug(data);
           switch (data) {
           case '0':
                DISCUSSION.closeNewDiscussionDialog();
                DISCUSSION.loadDiscussionList(zone,area);
                break;
           
           }
        });
    
},

loadDiscussionList:function(zone,area) {

    var zoneid = zone;
    var areaid = area;
    
    if (SEARCH.isInvalid(zoneid) && SEARCH.isInvalid(areaid)) {
        zoneid = $('#DISCUSSION_ZONE').val();
        areaid = $('#DISCUSSION_AREA').val();
    }

    var info = {
        zone: zoneid,
        area: areaid,
        gettotal: 1
    }
    GLOBAL.debug(info);

    $.post('./loaddiscussionlist.php',info, function(data) {
            GLOBAL.debug(data);
            var d = YAHOO.lang.JSON.parse(data);
            var list = d.list;
            
            var content = DISCUSSION.createDiscussionListContent(list);
            
            var total = d.total;
            var pages = parseInt(total)/DISCUSSION.NUM_PER_PAGE;
            
            var paging = '<hr>跳转到 ';
            
            for(var i = 0;i<pages;++i) {
            
                paging+='<span id="DISCUSSION_LIST_PAGE_' + i + '"  style="cursor:pointer;" onclick="DISCUSSION.loadMoreDiscussion(' + zoneid + ',' +  areaid + ',' + (i*DISCUSSION.NUM_PER_PAGE) + ');">' + (i+1) + '</span>&nbsp;';
            
            }
            
            $('#DIV_SEARCH_RESULT_DISCUSSION_LIST').html(content);
            $('#DIV_SEARCH_RESULT_DISCUSSION_LIST_PAGING').attr('total',total);
            $('#DIV_SEARCH_RESULT_DISCUSSION_LIST_PAGING').html(paging);

        });
},

loadMoreDiscussion: function(zone,area,startnum) {

    // update paging ui
    var selectedPage = startnum/this.NUM_PER_PAGE;
    var total = parseInt($('#DIV_SEARCH_RESULT_DISCUSSION_LIST_PAGING').attr('total'));
    var pages = total/DISCUSSION.NUM_PER_PAGE;
    
    for(var i=0;i<pages;++i) {
        if (i==selectedPage) {
            $('#DISCUSSION_LIST_PAGE_'+i).css('color','red');
        } else {
            $('#DISCUSSION_LIST_PAGE_'+i).css('color','black');
        }
    
    }

    var info = {
        zone: zone,
        area: area,
        startnum: startnum
    }
    GLOBAL.debug(info);

    $.post('./loaddiscussionlist.php',info, function(data) {
            GLOBAL.debug(data);
            var d = YAHOO.lang.JSON.parse(data);
            var list = d.list;
            
            var content = DISCUSSION.createDiscussionListContent(list);
            
            $('#DIV_SEARCH_RESULT_DISCUSSION_LIST').html(content);

        });
},

createDiscussionListContent: function(list) {

    var content="<table style='border:1px solid #74b5e5'><tr><td style='width:150px;'>标题</td><td style='width:100px;'>发言人</td><td>跟贴</td></tr>";
            
            
    for(i in list) {
        var post = list[i];
                
        content+='<tr><td><span class="discussion_title_unselected" onmouseover="this.style.color=\'red\';" onmouseout="this.style.color=\'#069\';" onclick="DISCUSSION.showDiscussion(' + post.id + ');">' + post.title + 
                 '</span></td><td>';
                 
        if (post.teacherid==post.userid) {
            content+='<span class="discussion_title_unselected" onclick="PAGE.showTeacherDetails(' + post.userid + ');">';
            content += post.username;
            
            var c = GLOBAL.getSpecClass(post.spec1);
            if (c!=null) {
                content += '<img src="images/' + c.icon + '" width="8px" height="15px"/>';
            }
            c = GLOBAL.getSpecClass(post.spec2);
            if (c!=null) {
                content += '<img src="images/' + c.icon + '" width="8px" height="15px"/>';
            }
            c = GLOBAL.getSpecClass(post.spec3);
            if (c!=null) {
                content += '<img src="images/' + c.icon + '" width="8px" height="15px"/>';
            }

            content +='</span>';
        }else {
            content += post.username;
        }
        content += '</td><td>' + post.replies + '</td></tr>';
            
    }
    content += "</table>";
    
    if (list.length == 0) {
        content = '没有在本地找到更多的讨论';
    }
    
    return content;
 
}

}