define(['jquery'], function ($) {

    function init() {
        var h = +(new Date).getHours(), begin;
        if (18 <= h && h <= 24) {
            _init();
        } else {
            begin = new Date;
            begin.setHours(18);
            begin.setMinutes(0);
            begin.setSeconds(0);
            begin.setMilliseconds(0);
            setTimeout(_init, begin - (+new Date));
        }
    }

    function _init() {
        $('#auto-test-nav-5').remove();
        $('.login-area').prepend('<li id="auto-test-nav-5"><a href="http://ke.qq.com/faq.html" target="_blank" report-tdw="action=Title-clk&ver1=6">帮助</a></li><li class="split-line">|</li>');
        //$('#auto-test-3-more').attr('href', '/nightly/index.html');//更多
        $('#js_header .autoM').append('<a href="/nightly/index.html" report-tdw="action=yexue" target="_blank"><div style="cursor: pointer;width: 130px;height: 76px;background: url(/img/nightly.gif);position: absolute;right: 260px;top: -4px;"></div></a>');
        $('#js_logout_outer .nick').css('width', 80);
        $('#js_header .autoM').append('<a href="/nightly/index.html" report-tdw="action=yexue" target="_blank"><div style="cursor: pointer;width: 130px;height: 76px;background: url(/img/nightly.gif);position: absolute;right: 260px;top: -4px;"></div></a>');
    }

    return {
        init: init
    };
});
