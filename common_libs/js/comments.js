/**
 *  @info:
 *  @author: chriscai
 *  @date: 2014/6/5
 */

define([
    'require',
    'jquery' ,
    'db' ,
    'grid' ,
    'commonTemplate/common',
    'commentStar'
], function (require) {

    var $ = require('jquery'),
        DB = require('db'),
        Grid = require('grid'),
        TmplInline_common = require('commonTemplate/common'),
        CommentStar = require('commentStar');

    var $dom ,
    // 0 no ,  1  initing  , 2 inited
        hadInited = 0 ,
        grid  ,
        qualityStar ,
        teacherStar ,
        attitudeStar ,
        $commentsTotal,
        courseId ,
        courseName,
        agencyId ,
        roleType = -1,
        hadCommented = false,
        $commentTab,
        commentBoxParam ;

    DB.extend({
        get_comments: DB.httpMethod({url: '/cgi-bin/comment/course_comment_info_list', noNeedLogin: true}),
        get_comments_info: DB.httpMethod({url: '/cgi-bin/comment/course_comment_info', noNeedLogin: true})
    });


    var init = function (opt){
        courseId = opt.courseId;
        courseName = opt.courseName;
        $dom =  $('#js-comments');
        qualityStar = new  CommentStar({
            el : '#js-comment-quality',
            clickable: false
        });
        attitudeStar = new  CommentStar({
            el : '#js-comment-attitude',
            clickable: false
        });
        teacherStar = new  CommentStar({
            el : '#js-comment-teacher',
            clickable: false
        });


        $commentsTotal = $('#js-omments-total');
        $commentTab = $('.l-side-nav li[data-hook="wraper-comment"] p')

        initGrid();
        hadInited = 1;
        loadList(1 , true);
        renderCommentHeader();

        bindEvent();
    }


    var initGrid = function (){
        if (!grid) {
            grid = new Grid({
                el: '#js-comments-list',
                tableId: 'comments-list-table',
                dataTmpl: TmplInline_common.
                    comments,
                header: [
                    { width: 65 },
                    {  width: 895}
                ]
            });

            grid.onPageChange(function (curPage, prePage) {
                loadList(curPage  , false );
            });

        }

    }

    var bindEvent = function (){
    }




    var timeRender = function (date){
        var now =  new Date();

        var startTime = new Date(now.getFullYear(),now.getMonth(),now.getDate());


        if(date.getTime() - startTime.getTime() >0){
            return $.render.time.formatDate( 'hh:mm' , date);
        }else {
            return  $.render.time.formatDate( 'YYYY-MM-DD' , date);
        }

    }

    var generateStarTtitle = function (data){
        var $tmpl = $('<div></div>');
        var total = parseInt(((data.level_rating + data.attitude_rating + data.quality_rating ) * 100 / 3) )/100;
        new CommentStar({
            el : $tmpl,
            clickable: false,
            showStarLabel : false ,
            star : total
        })
        return $tmpl.wrap('<div></div>').parent().html();
    }

    var renderData = function (data , resetPage){
        if(!data.comments ){
            data.comments = [];
        }

        if (courseName) {

            data.course_id = courseId;
            data.course_name = courseName;
        }

        grid.render(data , {timeRender : timeRender , renderStar : generateStarTtitle});
        resetPage &&  grid.resetPageCtrl({ total: data.pageCount , max: 5 , idx: 1});
        setTimeout(function (){   // 增加 setTimeou ,ie 7 下面否则会有BUG
            $('#js-comments-list').lazyload();
        },0);

    }


    var renderSubmitBox = function (commentFlag){
        return;
    }


    var renderCommentHeader = function (){
        DB.get_comments_info({
            param : {
                cid : courseId
            },
            succ : function (data){
                var ret =data.result;
                agencyId = ret.agency_id;

                var total = (ret.avg_rating/100).toFixed(1);
                if( (total + '').indexOf('.') < 0 ) {
                    total = total + '.0';
                }
                $commentsTotal.text( total);
                qualityStar.setStar(ret.avg_quality/100);
                attitudeStar.setStar(ret.avg_attitude/100);
                teacherStar.setStar(ret.avg_level/100);

                // 系列课上线，屏蔽 评论入口
//               ret.comment_flag  =  2;//1打开评论入口  2屏蔽评论入口 done 发布时屏蔽 设为2


                //resetCommentBoxParam(data);
                renderSubmitBox(ret.comment_flag);
                hadCommented = ret.comment_flag  === 1 ? false : true;

            },
            err : function (){
                return true;
            }

        })
    }


    var loadList = function (page , resetPage){

        grid.showLoad();


        function loadSucc(data) {
            hadInited = 2;
            setTimeout(function (){
                clearSpin();
                grid.hideLoad();
                renderData(data.result , resetPage);
            },150);

            $commentTab.text('学员评论('+data.result.total+')');
        }

        if (courseId == 0) {

            loadSucc({
                result: {
                    total: 0,
                    comments: []
                }
            });
            return;

        }

        DB.get_comments({
            param : {page : page || 1 , count : 7 , course_id : courseId},
            succ:function (data){
                loadSucc(data);
            },
            err:function (){
                hadInited = 2;
                clearSpin();
                grid.hideLoad();
                renderData({} , resetPage);
                return true;
            }
        });
    }

    var clearSpin = function (){
        $dom.css('visibility' , 'visible');
        $dom.parent().find('.spinner').remove();
    }



    var show = function (){

        if(hadInited !== 2){
            $dom.parent().spin();
            return ;
        }
        loadList(1 , true);
        renderCommentHeader();

    }

    var hide = function (){

    }

    return {
        init : init,
        show : show
    }
});
