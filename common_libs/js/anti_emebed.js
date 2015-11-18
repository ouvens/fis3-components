/*global self*/

;(function (root, factory) {

    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        root['antiEmbed'] = factory();
    }
} (this, function () {
    //反嵌入逻辑
    //window.console&&console.warn("0反嵌入逻辑start");
    var delay = 0;

    function jump() {
        top.location.href = document.location;//强制设置top.location
    }

    function tryAgain() {
        try {
            //window.console&&console.warn("3降域结果 mydomain=["+document.domain+"]");
            var top_url = top.window.location.href;
            //window.console&&console.warn("4topurl=["+top_url+"]");

            if (/^http[s]*\:\/\/[^\/]+?qq.com/g.test(top_url)) {//允许自家内嵌

            }
            else {
                jump();
            }
        }
        catch (ex) {
            //window.console&&console.warn("5降域仍无法访问location.href");
            jump();
        }
    }

    if (top != self) {//如果被iframe了
        try {//如果能访问到top_url 代表是同源站点
            var top_url = top.window.location.href;
            if (/^http[s]*\:\/\/[^\/]+?qq.com/g.test(top_url)) {//允许自家内嵌

            }
            else {
                jump();
            }
        } catch (ex) {//非同源下 无法访问 location.href属性
            //window.console&&console.warn("1无法访问location.href");
            try {//尝试降域
                document.domain = "qq.com";
            } catch (ex) {
                //window.console&&console.warn("2无法设置document.domain");
                //jump();
            }

            if (delay) {
                setTimeout(tryAgain, delay);//延迟一段时间后再次尝试访问location.href
            }
            else {
                tryAgain();
            }
        }
    }
}));