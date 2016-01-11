(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else {
        root['ResourceTiming'] = factory();
    }
}(this, function ($) {


    function genLink(pageId, userPoints){
        var pageId = pageId.split('-'), arr = [];
        $(pageId).each(function(i, sid){
            arr.push('flagid='.replace('id', i + 1) + sid);
        });

        for(var t in userPoints){
            arr.push(t + '=' + userPoints[t]);
        }

        new Image().src = 'http://isdspeed.qq.com/cgi-bin/r.cgi?' + arr.join('&');
    }

    function report(pageId, name) {
        if (!window['performance']) return;
        if (!performance.getEntriesByName && !performance.webkitGetEntriesByName) return;

        var entry = performance.getEntriesByName ? performance.getEntriesByName(name) : performance.webkitGetEntriesByName(name);

        if (!entry || entry.length == 0) return;

        entry = entry[0];

        var pointSet = [
            'connectEnd',
            'connectStart',
            'domainLookupEnd',
            'domainLookupStart',
            'duration',
            'fetchStart',
            'redirectEnd',
            'redirectStart',
            'requestStart',
            'responseEnd',
            'responseStart',
            'startTime'
        ];


        var st = 1, timePoints = [];
        $(pointSet).each(function(i, p){
            timePoints[st++] = Math.ceil(entry[p]);
        });

        genLink(pageId, timePoints);
    }

    return {
        report: function (pageId, name) {
            setTimeout(function () {
                report(pageId, name);
            }, 0);
        }
    };
}));

