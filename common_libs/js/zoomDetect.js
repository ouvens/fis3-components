(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'localstorage', 'zoomDetect.core'], factory);
    } else {
        root['ZoomDetect'] = factory(root['jQuery', root['localData'], root['zoomDetectCore']]);
    }
}(this, function ($, localstorage, ZoomCore) {
    var initialize =  false;
    var localKey = 'never_detect_zoom';
    var tips = '<div class="mod-zoomdetect"><a href="#" class="wzd-btnclose" title="关闭">关闭</a><div><span class="wzd-txt">您的浏览器处于<q class="x-tip">缩小</q>状态，将会导致显示不正常，您可以用键盘按<q class="x-key">Ctrl+数字0</q>恢复正常比例。</span><a href="#" class="wzd-nevertip" title="永久不再提示">不再提示</a></div></div>';
    var zoomMode = 0, scale, pauseScale;
    var $tips = null;
    var timer, duration = 1000;

    function start() {
        timer = setTimeout(function () {
            var t1 = new Date;
            scale = ZoomCore.device() ;
            //console.log('zoomMode:', zoomMode, ' scale:', scale, ' pauseScale:', pauseScale);
            var zoom = scale == 1 ? 0 : (scale > 1 ? 1 : -1);
            if (zoom !== 0) {
                if (!initialize) {
                    $tips = $(tips);
                    $(document.body).before($tips);
                    initialize = 1;
                    $('.wzd-btnclose').click(function () {
                        zoomMode = 0;
                        pauseScale = scale;
                        $tips.hide();
                    });
                    $('.wzd-nevertip').click(function () {
                        zoomMode = 0;
                        $tips.remove();
                        $tips = null;
                        clearInterval(timer);
                        // localstorage.set(localKey, 1);
                    });
                    Badjs("useragent's scale happened!", location.href, 0, 415854, 2);
                }

                if (zoomMode != zoom && pauseScale !== scale) {
                    zoomMode = zoom;
                    $('.x-tip').html(zoomMode === -1 ? '缩小' : '放大');
                    $tips.show();
                    pauseScale = null;
                }
                duration = 500;
            } else {
                pauseScale = null;
                duration = 1000;

                if (zoomMode !== 0) {
                    zoomMode = 0;
                    $tips.hide();
                }
            }
            start();

            // console.log('diff:', new Date - t1);
        }, duration);
    }

    (function () {
        // if (!localStorage.get(localKey)) {
        //     start();
        // }
    }());



}));