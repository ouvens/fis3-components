(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else {
        // Browser globals
        root['TRecord'] = factory(root['$']);
    }
}(this, function ($) {

        var cfg = {
                url: "",//每个页面都有一个在测速系统中唯一的标示  flag1=7809&flag2=44&flag3=2
                isd: {//每个测速点都有一个key value 标志
                    "page_start": 0,//页面开始时间
                    "page_css_ready": 1,//css加载完成
                    "page_js_ready": 2,//第三方js加载完成
                    "page_main_start": 3,//主逻辑加载
                    "page_main_end": 4,//主逻辑结束
                    "page_render_end": 5,//全部render 完成
                    "page_render_fp": 6//首屏render 完成
                }
            },//测试点 映射值
            stored = {},
            delayTaskAll = {},
            delay = 500,
            timerAll = {},//延迟上报任务
            cache = window.TRecord;

        if (cache) {
            var cachedData = cache.getCachedData();

            $.extend(cfg, cachedData.cfg);
            $.extend(stored, cachedData.speedPoints);

        }

        function push(k, t) {
            stored[k] = t || (new Date() - 0);
        }

        push("page_start", window.T && window.T[0]); //测速基准点  开始加载  T 是所有页面顶部都加上的开始时间
        //push("page_css_ready");//顺序执行 css加载完才会执行此处脚本


        function doReport(url, delayTask) {//会从
            var s = "";
            var r = Math.random() * 100 + 1;//随机数

            for (var p in delayTask) {
                s += "&" + p + "=" + delayTask[p].cost;
            }
            delayTaskAll[url] = {};//置空
            //window.console&&console.log("isd str=["+s+"]");

            if (url && s) {//如果s有内容
                s = "http://isdspeed.qq.com/cgi-bin/r.cgi?" + url + s + "&r=" + r;//带上测速数据和随机数
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
            return (window.ISD_cgi_map && window.ISD_cgi_map[url]) || 1;//默认测速点是1
        }

        function setTask(delayTask, p, cost) {
            if (typeof(cost) == "number" && cost >= 0) {//避免出现负值
                var task = delayTask[p];
                if (task) {
                    task.cost = Math.round((task.num * task.cost + cost) / (task.num + 1));
                    task.num += 1;
                }
                else {
                    delayTask[p] = {cost: cost, num: 1};
                }
            }
        }

        function report(arr, opt) {//map要求是个
            var url = (opt && opt.url) || cfg.url;
            if (arr.type == "cgi") {//专门增加cgi上报 上报格式 TRecord.report({cgiUrl:url,cost:cost,type:"cgi"});
                url = "flag1=7832&flag2=39&flag3=25";
            }
            else if (arr.type == "cgiFail") {
                url = "flag1=7832&flag2=39&flag3=27";
            }

            timerAll[url] && clearTimeout(timerAll[url]);
            opt = opt || {};
            if (!delayTaskAll[url]) {
                delayTaskAll[url] = {};
            }
            var delayTask = delayTaskAll[url];
            var isd = mix(cfg.isd, opt.isd);
            var base = null;//基准时间

            if (arr && typeof(arr) == "object") {//如果是数组形式
                if (arr instanceof Array) {
                    for (var i = 0; i < arr.length; i++) {
                        var d = arr[i];
                        if (i == 0) {
                            base = stored[d];
                        }
                        else {
                            var cost_time = stored[d] - base;
                            if (cost_time > 0 && !isNaN(cost_time)) {//如果大于0且不是NaN
                                delayTask[isd[d]] = {cost: cost_time, num: 1};
                            }
                        }
                    }
                }
                else {
                    if (arr.type == "cgi" || arr.type == "cgiFail") {//专门增加cgi上报 上报格式 TRecord.report({cgiUrl:url,cost:cost,type:"cgi"});
                        var p = mapISD(arr.cgi);
                        //console.log("mapISD:["+arr.cgi+"] ["+p+"]");
                        setTask(delayTask, p, arr.cost);
                    }
                    else {
                        for (var p in arr) {//直接上报值的方式  key value
                            setTask(delayTask, p, arr[p]);
                        }
                    }
                }
            }

            var delay_time = opt.delay === 0 ? 0 : (opt.delay || delay);//
            if (delay_time) {
                timerAll[url] = setTimeout(function () {
                    doReport(url, delayTask);
                }, delay_time);//延迟上报
            }
            else {
                doReport(url, delayTask);
            }
        }

        return {
            cfg: cfg,
            push: push,//打点
            report: report//上报
        }

}))
