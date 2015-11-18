(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        // Browser globals
        root['huatuo'] = factory();
    }
}(this, function() {

    var cfg = {
            url: "", //每个页面都有一个在测速系统中唯一的标示  flag1=7809&flag2=44&flag3=2
            isd: { //每个测速点都有一个key value 标志
                "unloadEventStart": 1,
                "unloadEventEnd": 2,
                "redirectStart": 3,
                "redirectEnd": 4,
                "fetchStart": 5,
                "domainLookupStart": 6,
                "domainLookupEnd": 7,
                "connectStart": 8,
                "connectEnd": 9,
                "requestStart": 10,
                "responseStart": 11,
                "responseEnd": 12,
                "domLoading": 13,
                "domInteractive": 14,
                "domContentLoadedEventStart": 15,
                "domContentLoadedEventEnd": 16,
                "domComplete": 17,
                "loadEventStart": 18,
                "loadEventEnd": 19,
                "page_start": 20, //页面开始时间
                "page_css_ready": 21, //css加载完成
                "page_js_ready": 22, //第三方js加载完成
                "page_main_start": 23, //主逻辑加载
                "page_main_end": 24, //主逻辑结束
                "page_render_end": 25, //全部render 完成
                "page_render_fp": 26 //首屏render 完成
            },
            appid: 10028, //产品id 固定
            device: '',
            platform: '',
            apn: '',
            userid: ''
        },
        param,
        stored = {}, //测试点 映射值
        delayTaskAll = {},
        delay = 500,
        timerAll = {}, //延迟上报任务
        cache = window.TRecord;

    // 取script start的push数据
    if (cache) {
        var cachedData = cache.getCachedData();
        $.extend(cfg, cachedData.cfg);
        $.extend(stored, cachedData.speedPoints);
    }

    function getParam(opt) {
        var ret = [];
        for (var key in cfg) {
            if (key === 'url' || key === 'isd') {
                continue;
            }

            !!opt[key] && (cfg[key] = opt[key]);
            cfg[key] && ret.push(key + '=' + cfg[key]);
        }
        return ret.join('&');
    }

    function push(k, t) {
        stored[k] = t || (new Date() - 0);
    }



    function doReport(url, delayTask) { //会从
        var s = [];
        var r = Math.random() * 100 + 1; //随机数

        s.push(cfg.url);
        for (var p in delayTask) {
            s.push(p + "=" + delayTask[p].cost);
        }
        delayTaskAll[url] = {}; //置空
        //window.console&&console.log("isd str=["+s+"]");

        if (url && s) { //如果s有内容
            s = "http://report.huatuo.qq.com/report.cgi?" + param + "&speedparams=" + encodeURIComponent(s.join('&')) + "&r=" + r; //带上测速数据和随机数
            var img = new Image();
            img.src = s;
            img = null;
        }
    }

    function mix(a, b) {
        if (a && b) {
            for (var p in b) {
                a[p] = b[p];
            }
        }
        return a;
    }

    function mapISD(url) {
        return (window.ISD_cgi_map && window.ISD_cgi_map[url]) || 1; //默认测速点是1
    }

    function setTask(delayTask, p, cost) {
        if (typeof(cost) == "number" && cost >= 0) { //避免出现负值
            var task = delayTask[p];
            if (task) {
                task.cost = Math.round((task.num * task.cost + cost) / (task.num + 1));
                task.num += 1;
            } else {
                delayTask[p] = {
                    cost: cost,
                    num: 1
                };
            }
        }
    }

    function report(arr, opt) { //map要求是个
        var url = (opt && opt.url) || cfg.url;

        opt = opt || {};


        param = getParam(opt);


        timerAll[url] && clearTimeout(timerAll[url]);
        if (!delayTaskAll[url]) {
            delayTaskAll[url] = {};
        }
        var delayTask = delayTaskAll[url];
        debugger
        var isd = mix(cfg.isd, opt.isd);
        var base = null; //基准时间

        if (arr && typeof(arr) == "object") { //如果是数组形式
            if (arr instanceof Array) {
                for (var i = 0; i < arr.length; i++) {
                    var d = arr[i];
                    if (i == 0) {
                        base = stored[d];
                    } else {
                        var cost_time = stored[d] - base;
                        if (!isNaN(cost_time) && cost_time > 0) { //如果大于0且不是NaN
                            delayTask[isd[d]] = {
                                cost: cost_time,
                                num: 1
                            };
                        }
                    }
                }
                getExtrasReportData(opt.isPrevent, delayTask);
            } else {
                for (var p in arr) { //直接上报值的方式  key value
                    setTask(delayTask, p, arr[p]);
                }
            }
        }

        var delay_time = opt.delay === 0 ? 0 : (opt.delay || delay); //
        if (delay_time) {
            timerAll[url] = setTimeout(function() {
                doReport(url, delayTask);
            }, delay_time); //延迟上报
        } else {
            doReport(url, delayTask);
        }
    }

    /**
     * 这里如果支持performance，是否会上报performance相关字段数据
     * 如果不希望上报performance数据，配置中加入isPrevent=true即可
     * @param  {Boolean} isPrevent [description]
     * @param  {[type]}  delayTask [description]
     * @return {[type]}            [description]
     */
    function getExtrasReportData(isPrevent, delayTask) {
        if (!window.performance || isPrevent) return delayTask;

        var perfData = window.performance.timing;

        delayTask || (delayTask = []);
        base = perfData.navigationStart;

        var value, cost;

        for (var key in cfg.isd) {
            value = cfg.isd[key];
            if (value < 20) {
                cost = perfData[key] - base;
                if (!isNaN(cost) && cost > 0) {
                    delayTask[value] = {
                        cost: cost,
                        num: 1
                    };
                }

            }
        }

        return delayTask;
    }

    push("page_start", window.T && window.T[0]); //测速基准点  开始加载  T 是所有页面顶部都加上的开始时间

    window.huatuo = {
        cfg: cfg,
        push: push, //打点
        report: report //上报
    };

    return window.huatuo;

}))
