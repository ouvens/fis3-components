/**
 * @fileoverview 工具函数：bom处理
 * @example @todo
*/
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else {
        root['Timing'] = factory();
    }
}(this, function ($) {

    var imgs = [];

    function genLink(pageId, userPoints){
        var pageId = pageId.split('-'), arr = [];
        $(pageId).each(function(i, sid){
            arr.push('flagid='.replace('id', i + 1) + sid);
        });

        for(var t in userPoints){
            arr.push(t + '=' + userPoints[t]);
        }

        var img = new Image();
        imgs.push(img);
        img.src = 'http://isdspeed.qq.com/cgi-bin/r.cgi?' + arr.join('&');
    }

    function report(pageId) {
        if(!window['performance']) return;

        var capturePoints = performance.timing,
            basicTime = capturePoints.navigationStart,
            timePoints = {},
            pointSet = [
                "unloadEventStart", "unloadEventEnd", "redirectStart", "redirectEnd",
                "fetchStart", "domainLookupStart", "domainLookupEnd",
                "connectStart", "connectEnd", "requestStart", "responseStart", "responseEnd",
                "domLoading", "domInteractive", "domContentLoadedEventStart", "domContentLoadedEventEnd",
                "domComplete", "loadEventStart", "loadEventEnd"
            ];

        var st = 1;
        $(pointSet).each(function(i, p){
            timePoints[st++] = Math.max(capturePoints[p] - basicTime, 0) ;
        });

        genLink(pageId, timePoints);
    }

    return {
        report: function (pageId) {
            setTimeout(function () {
                report(pageId);
            }, 0);
        }
    };
}));
