;(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['db', 'db.status'], factory);
    } else {
        factory(root['DB']);
    }
})(this, function (DB, Badjs) {

    var Badjs = window['Badjs'];

    var counts = {}, maxCount=10, timers = {}, loadingTimes = {};

    function getClientStatus($link, succCallback, errCallback){
        var url = $link.getAttribute('data-tid') || $link.getAttribute('data-cid') || $.bom.query('course_id');

        DB.getClientStatus({
            param: {course_id: url},
            succ: function(data){
                if(data.result.info.s == 0){
                    var msg = 'time: '+counts[url]+'s, online: '+(data.result.onlstat?'yes':'no')+', ip: '+
                        (data.result.cltip||'unknown') + ', client ver:'+(data.result.cltvers||'unknown');
                    Badjs(msg, 'monitorTencentOpen', 0, 410354+counts[url]*2, 2);
                    if(counts[url]==5){
                        Badjs(msg+', only 5s', 'monitorTencentOpen', 0, data.result.onlstat?413175:413176, 2);
                    }
                    if(counts[url]<maxCount){
                        counts[url]++;
                        timers[url] = setTimeout(function(){
                            getClientStatus($link, succCallback, errCallback);
                        }, 1000);
                    }else{
                        // 如果轮询10次还没打开，粗暴地认为是失败。实际上，可能是因为用户一直没有点击“启动”
                        errCallback && errCallback();

                        $.render.showEnterRoomFailureTips();
                    }
                }else{
                    succCallback && succCallback();
                    Badjs('enter course success after open tencent in '+counts[url]+'s', 'monitorTencentOpen', 0, 410355+counts[url]*2, 2);
                }
            },
            err: function(){
                errCallback && errCallback();
                return true;
            }
        });
    }

    return {
        init: function(){

            $(document).on('openQQClientLive', function(e, $link){
                var $node = $($link);
                // var oriHtml = $node.html();
                if (!$link || !$link.getAttribute) return;

                var url = $link.getAttribute('data-tid') || $link.getAttribute('data-cid') || $.bom.query('course_id');
                counts[url] = 1;
                timers[url] && clearTimeout(timers[url]);
                timers[url] = setTimeout(function(){
                    getClientStatus($link, function(){
                        clearInterval(loadingTimes[url]);
                        $node.html('进入课堂');
                    }, function(){
                        clearInterval(loadingTimes[url]);
                        $node.html('进入课堂');
                    });
                }, 1000);

                if(loadingTimes[url]){
                    clearInterval(loadingTimes[url]);
                    loadingTimes[url] = null;
                }

                $node.html('进入中<span class="js-loading-dot loading-dot"></span>');
                var $dot = $node.find('.js-loading-dot');
                loadingTimes[url] = setInterval(function(){
                    var text = $dot.text();
                    if(text=='...'){
                        $dot.text('.');
                    }else{
                        $dot.text(text+'.');
                    }
                }, 600);
            }).on('openQQClientLiveNew', function(e, $link){
                setTimeout(function () {
                    getClientStatus($link);
                }, 1000);
            });

            $(document).on('click', '.js-open-tencent[data-target]', function (e) {
                $.render.url.live(this, {newcard: true, event: e});
            });

        }
    };

});

