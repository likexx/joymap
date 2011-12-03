var ReviewComment = {

NUM_PER_PAGE: 5,

showReviewComments:function(reviewid, reviewContent) {

    $('#REVIEWCOMMENT_LIST_DIALOG').remove();
    
    var content="<div style='width:100%;height:100%;'><div id='REVIEWCOMMENT_ORIGINAL_REVIEW'>" + reviewContent + "</div>" +
                "<span class='discussion_title_unselected' onclick=\"$('#REVIEWCOMMENT_NEW_COMMENT_LAYER').css('display','inline');\">发表新评论</span><hr>" + 
                "<div id='REVIEWCOMMENT_NEW_COMMENT_LAYER' style='display:none;'><textarea id='REVIEWCOMMENT_NEW_COMMENT_CONTENT' rows='4' cols='50'></textarea><br/><input type=button value='发表评论' onclick='ReviewComment.postComment(" 
                + reviewid + ");'><span id='REVIEWCOMMENT_POST_ERROR'></span></div>" +
                "<div id='REVIEWCOMMENT_COMMENTS'><div id='REVIEWCOMMENT_COMMENTS_LIST'></div><div id='REVIEWCOMMENT_COMMENTS_PAGING'></div></div>";
   

    $('<div id="REVIEWCOMMENT_LIST_DIALOG">').css({
        'width':480,
        'height':320,
        'background-color':'#cccccc'
    }).html(content).appendTo('body').dialog({
            show: "Blind",
            hide: "Blind",
            width: 480,
            height: 320
    });

    this.loadReviewComments(reviewid);    

},

loadReviewComments: function(reviewid) {



    $.post('./loadreviewcomments.php',{reviewid:reviewid,gettotal:1}, function(data) {
            GLOBAL.debug(data);
            var d = YAHOO.lang.JSON.parse(data);
            var list = d.list;
            
            var content = ReviewComment.createCommentListContent(list);
            
            var total = d.total;
            var pages = parseInt(total)/ReviewComment.NUM_PER_PAGE;
            
            var paging = '<hr>跳转到 ';
            
            for(var i = 0;i<pages;++i) {
            
                paging+='<span id="REVIEWCOMMENT_LIST_PAGE_' + i + '"  style="cursor:pointer;" onclick="ReviewComment.loadMore(' + reviewid + ',' + (i*DISCUSSION.NUM_PER_PAGE) + ');">' + (i+1) + '</span>&nbsp;';
            
            }
            
            $('#REVIEWCOMMENT_COMMENTS_LIST').html(content);
            $('#REVIEWCOMMENT_COMMENTS_PAGING').attr('total',total);
            $('#REVIEWCOMMENT_COMMENTS_PAGING').html(paging);
        
    });
    

},

postComment:function(reviewid) {

    var content = $('#REVIEWCOMMENT_NEW_COMMENT_CONTENT').val();
    

    var info = {
        reviewid: reviewid,
        content:content
    };
    GLOBAL.debug(info);
    
    $.post('./postreviewcomment.php',info, function(data) {
           switch (data) {
           case '0':
                $('#REVIEWCOMMENT_NEW_COMMENT_LAYER').css('display','none');
                ReviewComment.loadReviewComments(reviewid);
                break;
           case '1':
                $('#REVIEWCOMMENT_POST_ERROR').html('两次发表间隔太短！');
                break;
           case '2':
                $('#REVIEWCOMMENT_POST_ERROR').html('内容太短！');
                break;
           case '3':
                $('#REVIEWCOMMENT_POST_ERROR').html('内容或者标题太长！');
                break;
           case '4':
                $('#REVIEWCOMMENT_POST_ERROR').html('请先登录网站，再发表讨论');
                break;
           case '5':
                $('#REVIEWCOMMENT_POST_ERROR').html('暂时无法发表讨论');
                break;
           }
        });

},


loadMore: function(reviewid,startnum) {

    // update paging ui
    var selectedPage = startnum/this.NUM_PER_PAGE;
    var total = parseInt($('#REVIEWCOMMENT_COMMENTS_PAGING').attr('total'));
    var pages = total/ReviewComment.NUM_PER_PAGE;
    
    for(var i=0;i<pages;++i) {
        if (i==selectedPage) {
            $('#REVIEWCOMMENT_LIST_PAGE_'+i).css('color','red');
        } else {
            $('#REVIEWCOMMENT_LIST_PAGE_'+i).css('color','black');
        }
    
    }

    var info = {
        reviewid: reviewid,
        startnum: startnum
    }
    GLOBAL.debug(info);

    $.post('./loadreviewcomments.php',info, function(data) {
            GLOBAL.debug(data);
            var d = YAHOO.lang.JSON.parse(data);
            var list = d.list;
            
            var content = ReviewComment.createDiscussionListContent(list);
            
            $('#REVIEWCOMMENT_COMMENTS_LIST').html(content);

        });
},

createCommentListContent: function(list) {

    var content="";
            
    for(i in list) {
        var post = list[i];
        
        content += post.username + ':' + post.content + '<hr>';                
            
    }
    
    return content;
 
}

}