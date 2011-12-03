
var REVIEW = {

NUM_PER_PAGE: 2,		
		
	postReview:function() {
		var teacher_id=$('#new_review_teacher_id').val();
		var spec1_rating=$('#new_review_spec1_rating').val();
		var spec2_rating=$('#new_review_spec2_rating').val();
		var spec3_rating=$('#new_review_spec3_rating').val();
		
		var strict = $('#new_review_teaching_rating_strict').val();
        var easiness = $('#new_review_teaching_rating_easiness').val();
        var patience = $('#new_review_teaching_rating_patience').val();
        var method = $('#new_review_teaching_rating_method').val();
		var markerId = $('#teacher_review_markerid').val();
		var comment=$('#new_review_comment').val();
		
		var review = {
				"teacher_id":teacher_id,
				"spec1_rating":spec1_rating,
				"spec2_rating":spec2_rating,
				"spec3_rating":spec3_rating,
				"strict":strict,
				"easiness":easiness,
				"patience":patience,
				"method":method,
				"comment":comment
		};
		
		GLOBAL.debug(review);
		
	    $.post('./updateReview.php',review, function(data) {
			var d = YAHOO.lang.JSON.parse(data);
			if (d.teacher_id > 0) {
			/*
			    if (REVIEW.infowindow != undefined && REVIEW.infowindow != null){
			         REVIEW.infowindow.close();
			         REVIEW.infowindow = null;
			    }
			*/
                PAGE.showTeacherDetails(d.teacher_id, markerId);
            }
        });
		
	},	
	
	loadReviews:function(id) {
		
		var req = {
		        gettotal: 1,
				id: id
		};
		
		$.post('./loadReviews.php?', req, function(data){
		    GLOBAL.debug(data);
			var d = YAHOO.lang.JSON.parse(data);

            $('#DIV_TEACHER_DETAILS_REVIEWS').html(REVIEW.createReviewContent(d));
            
            var total = d.total;
            var pages = parseInt(total)/REVIEW.NUM_PER_PAGE;
            
            var paging = '<hr>跳转到 ';
            
            for(var i = 0;i<pages;++i) {
            
                paging+='<span id="REVIEW_LIST_PAGE_' + i + '"  style="cursor:pointer;" onclick="REVIEW.loadMoreReviews(' + id + ',' + (i*REVIEW.NUM_PER_PAGE) + ');">' + (i+1) + '</span>&nbsp;';
            
            }
            
            $('#DIV_TEACHER_DETAILS_REVIEWS_PAGING').attr('total',total);
            $('#DIV_TEACHER_DETAILS_REVIEWS_PAGING').html(paging);
            
        });	
    },
    
loadMoreReviews: function(id, startnum) {

    // update paging ui
    var selectedPage = startnum/this.NUM_PER_PAGE;
    var total = parseInt($('#DIV_TEACHER_DETAILS_REVIEWS_PAGING').attr('total'));
    var pages = total/this.NUM_PER_PAGE;
    
    for(var i=0;i<pages;++i) {
        if (i==selectedPage) {
            $('#REVIEW_LIST_PAGE_'+i).css('color','red');
        } else {
            $('#REVIEW_LIST_PAGE_'+i).css('color','black');
        }
    
    }

        var req = {
                id: id,
                startnum:startnum
        };
        
        $.post('./loadReviews.php?', req, function(data){
            GLOBAL.debug(data);
            var d = YAHOO.lang.JSON.parse(data);

            $('#DIV_TEACHER_DETAILS_REVIEWS').html(REVIEW.createReviewContent(d));
            
        }); 

},

createReviewContent: function(d) {

            var spec1id = $('#review_teacher_spec1_value').val();
            var spec2id = $('#review_teacher_spec2_value').val();
            var spec3id = $('#review_teacher_spec3_value').val();
            
            var content = "";
            for(i in d.reviews){
                
                var r = YAHOO.lang.JSON.parse(d.reviews[i]);
                GLOBAL.debug(r);
                var postDate = new Date(r.timestamp*1000);
                var thiscontent = "";
                thiscontent += r.reviewername + '  日期:' + postDate.toLocaleDateString() + '<br/>';
                if (spec1id>0) {
                    thiscontent += GLOBAL.getSpec(spec1id) + ':' + r.spec1_rating + '<br/>';
                }

                if (spec2id>0) {
                    thiscontent += GLOBAL.getSpec(spec2id) + ':' + r.spec2_rating + '<br/>';
                }
                
                if (spec3id>0) {
                    thiscontent += GLOBAL.getSpec(spec3id) + ':' + r.spec3_rating + '<br/>';
                }
                
                thiscontent += "教学严格程度：" + r.strict + "<br/>";
                thiscontent += "教学易学程度：" + r.easiness + "<br/>";
                thiscontent += "教学耐心程度：" + r.patience + "<br/>";
                thiscontent += "教学方式方法：" + r.method + "<br/>";
                
                thiscontent += r.comment;

                content += '<hr>';
                content += thiscontent;
                content += '<br/><span class="discussion_title_unselected" onclick="ReviewComment.showReviewComments(' + r.reviewid + ",'" + thiscontent + "');\">查看关于此评分的更多讨论</span>";
            }
            
            return content;

}

}