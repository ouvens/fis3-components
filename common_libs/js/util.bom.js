/**
 * @fileoverview 工具函数：bom处理
 * @example @todo
*/
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else {
		root['Bom'] = factory(root['jQuery']);
    }
}(this, function ($) {

    var exports = {
        /**
         * @description 读取location.search
         *
         * @param {String} n 名称
         * @return {String} search值
         * @example
         *      $.bom.query('mod');
         */
        query:function(n){
            var m = window.location.search.match(new RegExp( "(\\?|&)"+n+"=([^&]*)(&|$)"));
            return !m ? "":decodeURIComponent(m[2]);
        },
        /**
         *@description 读取location.hash值
         *
         *@param {String} n 名称
         *@return {String} hash值
         *@example
         *      $.bom.hash('mod');
         */
        getHash:function(n){
            var m = window.location.hash.match(new RegExp( "(#|&)"+n+"=([^&]*)(&|$)"));
            return !m ? "":decodeURIComponent(m[2]);
        },
        //@1.4.1_TODO: 这个方法挂在bom下?? 还依赖Dialog和Badjs???
        checkPlatform: function () {
            var pf = navigator.platform,
                isWin = (!pf || pf === 'Win32' || pf === 'Win64' || pf === 'Windows');

            //isWin = false;
            if (!isWin) {
                $.Dialog.alert('请通过电脑登录Windows系统，再访问该页面。');
                Badjs('非windows pc, ua=' + navigator.userAgent + ', platform=' + navigator.platform, location.href, 0, 410018, 2);

            }
            return  isWin;
        }
    };
    $.bom = exports;

    return exports;
}));
