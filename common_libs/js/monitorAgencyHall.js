;(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['db'], factory);
    } else {
        factory(root['DB']);
    }
})(this, function (DB, Badjs) {

    var Badjs = window['Badjs'];

    var counts = {}, maxCount = 10, timers = {}, loadingTimes = {};

    DB.extend( {
        getHallStatus: DB.httpMethod({url: '/cgi-bin/is_in_agency_hall', type:'GET'})
    });

    function getClientStatus(options){

        var opt = {
            param: {aid: options.aid},
            succ: function(data){
                var result = data.result || {};
                result = result.result || {};
                var aid = options.aid;
                if(result == 1){
                    options.succ();
                    //Badjs('enter course success after open tencent in ' + counts[cid] + 's', 'monitorTencentOpen', 0, 410355 + counts[cid] * 2, 2);
                } else {
                    /*var msg = 'time: '+counts[cid]+'s, online: '+(result.onlstat?'yes':'no')+', ip: '+
                        (data.result.cltip||'unknown') + ', client ver:'+(result.cltvers||'unknown');
                    Badjs(msg, 'monitorTencentOpen', 0, 410354+counts[cid]*2, 2);
                    if(counts[cid] == 5){
                        Badjs(msg+', only 5s', 'monitorTencentOpen', 0, result.onlstat?413175:413176, 2);
                    }*/
                    if(counts[aid] < maxCount){
                        counts[aid]++;
                        timers[aid] = setTimeout(function(){
                            getClientStatus(options);
                        }, 1000);
                    }else{
                        // 如果轮询10次还没打开，粗暴地认为是失败。实际上，可能是因为用户一直没有点击“启动”
                        options.err();
                        var content = '<div class="modal-live-guide clearfix" style="width:400px;">\
                                        <div class="module-live-t clearfix">\
                                            <h3 class="live-guide-title">咨询大厅没打开？快试试下面的修复方法</h3>\
                                        </div>\
                                        <div class="guide-hint" style="width:auto;padding-left:57px;">\
                                            <p class="guide-hint-p">1. 浏览器是否有加载提示？若有请点击允许</p>\
                                            <p class="guide-hint-p">2. 确认已安装能够使用机构大厅版本的QQ[<a href="http://im.qq.com/pcqq" target="_blank" class="nor-link">点击下载</a>]</p>\
                                        </div>\
                                    </div>';
                        $.Dialog.alert(content, {
                            title: '提示',
                            confirmText: '我知道了',
                            globalClass: 'live-guide-tips'
                        });
                    }
                }

            },
            err: function(){
                options.err();

                return true;
            }
        };

        //options.course_id && (opt.param = {course_id: options.courseId});

        DB.getHallStatus(opt);
    }

    return {
        init: function (){

            $(document).on('enterAgencyHall', function(e, target){
                var $target = $(target);
                var $entrance = $target;//$target.find('.js_entrace_text');
                var rawHtml = '咨询大厅';
                var aid = $target.data('aid') || 0;
                counts[aid] = 1;
                timers[aid] && clearTimeout(timers[aid]);
                timers[aid] = setTimeout(function(){
                    getClientStatus({
                       target: $target,
                        aid: aid,
                        succ: function(){
                            clearInterval(loadingTimes[aid]);
                            $entrance.html(rawHtml);
                        },
                        err: function(){
                            clearInterval(loadingTimes[aid]);
                            $entrance.html(rawHtml);
                        }
                    });
                }, 1000);

                if(loadingTimes[aid]){
                    clearInterval(loadingTimes[aid]);
                    loadingTimes[aid] = null;
                }

                $entrance.html('进入中<span class="js-loading-dot loading-dot"></span>');
                var $dot = $entrance.find('.js-loading-dot');
                loadingTimes[aid] = setInterval(function(){
                    var text = $dot.text();
                    if(text=='...'){
                        $dot.text('.');
                    }else{
                        $dot.text(text+'.');
                    }
                }, 600);
            });
        }
    };

});

