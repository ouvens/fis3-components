/**
 * @author littenli
 * @date 2014-03-10 version 0.2
 * @description 图片延时加载，裂图替换，图片错误上报处理
 * @update 增加非可视区域延时加载
 * @example $(".container").lazy(options);
 *          遍历$(".container")节点内的img节点，都应用lazyload；若此节点为img节点，只应用此节点
 *          options.srcSign {String} 可为空.img节点约定的src标志，默认为lazy-src；响应img节点为：<img lazy-src="img/hello.jpg" />
 *          options.errCallBack {Function} 可为空.提供img加载失败回调，供业务额外去处理加载失败逻辑
 *          options.container {Dom} 提供容器节点内可视区域的加载能力，默认为window
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'util.cookie'], factory);
    } else {
        factory(root['jQuery']);
    }
}(this, function ($, Cookie) {
    var reportTime = function(e , target){
        //console.log(performance.getEntriesByName(target[0].src) , '===========');
        var _time = target.data('data-first-date');
        var _src = target[0].src;
        if(!_src.match(/\/qqcourse_logo(?:_rn)?\//)) return;
        //console.log(_time,target.attr('src') ,'++++++++++++');
        if(_time){
            _time =  new Date() - _time;
            if(_time < 0){
                _time = 0 ;
            }
            _time += 1;//保证上报次数的hack
            var _img = new Image();
            var _isSupportedWebP = target.data("data-isSupportedWebP");
            var rs = ["http://isdspeed.qq.com/cgi-bin/r.cgi?flag1=7832&flag2=39&flag3=63"];

            var isLoad;
            if(window.localStorage && window.JSON){
                var _srcid;
                if(_src && (_srcid = _src.match(/(?:\/)([^\/]+)\/*(?:\d+)/)) && (_srcid = _srcid[1])){
                    isLoad = 0;
                    //console.log(_srcid , '=========');
                    var isloadlocal = localStorage.getItem('EDU_ISLOAD_IMG')
                    if(isloadlocal){
                        isloadlocal = JSON.parse(isloadlocal);
                        if(isloadlocal[_srcid]){
                            isLoad = 1;
                        }
                    }else{
                        isloadlocal = {};//第一次
                    }
                    isloadlocal[_srcid] = 1;
                    try {

                        localStorage.setItem('EDU_ISLOAD_IMG',JSON.stringify(isloadlocal));

                    } catch (e) {

                        Badjs("写localStorage异常", location.href, 0, 507221, 2);

                    }
                }
            }

            if(_isSupportedWebP){
                rs.push("2=" + _time);
                if(!isNaN(isLoad)){
                   if(isLoad){
                        rs.push("4=" + _time);
                   }else{
                        rs.push("5=" + _time);
                   }
                    rs.push("6=" + _time);
                }
            }else{
                rs.push("1=" + _time);
                if(!isNaN(isLoad)){
                   if(isLoad){
                        rs.push("7=" + _time);
                   }else{
                        rs.push("8=" + _time);
                   }
                    rs.push("9=" + _time);
                }
            }

            if(window.performance && window.performance.getEntriesByName){
                resourceTiming(_src , _isSupportedWebP);
            }

            rs.push("3=" + _time);
            //console.log(rs.join("&"));
            _img.src = rs.join("&");
        }
    }

     var performanceDict = {
            redirectStart: 3,
            redirectEnd: 4,
            fetchStart: 5,
            domainLookupStart: 6,
            domainLookupEnd: 7,
            connectStart: 8,
            connectEnd: 9,
            requestStart: 10,
            responseStart: 11,
            responseEnd: 12
        }
        /*unloadEventStart:1,
        unloadEventEnd:2,
        redirectStart:3,
        redirectEnd:4,
        fetchStart:5,
        domainLookupStart:6,
        domainLookupEnd:7,
        connectStart:8,
        connectEnd:9,
        requestStart:10,
        responseStart:11,
        responseEnd:12,
        domLoading : 13,
        domInteractive : 14,
        domContentLoadedEventStart : 15,
        domContentLoadedEventEnd  :  16,
        domComplete : 17,
        loadEventStart : 18,
        loadEventEnd  :  19*/

    var resourceTiming = function(src , iswebp){
        if(!src || !window['performance'] || !performance['getEntriesByName']) return;
        var entries = window.performance.getEntriesByName(src);
        //console.log(entries);
        if(entries && entries.length){
            var entry = entries[0], st = entry.startTime;
            if(st){
                var reportArgs = [];
                for(var key in performanceDict){
                    if(entry[key]) {
                        var _time = entry[key] - st;
                        if(!(key == 'redirectStart' || key == 'redirectEnd') && _time < 0 ) continue;
                        reportArgs.push(performanceDict[key] + '=' + Math.floor(Math.abs(_time)));
                    }
                }
                reportArgs.push('20=' + (Math.floor(Math.abs(entry.duration)) || 0));
                reportArgs.push('21=' + Math.floor(st));
                //console.log(reportArgs ,'============');
                var src = 'http://isdspeed.qq.com/cgi-bin/r.cgi?flag1=7832&flag2=39&flag3='+ (iswebp?'64':'65') +'&'+ reportArgs.join('&');
                new Image().src = src;
            }

        }
    }

    $.fn.loadWebP = (function(){
        var supportedWebP , supportedWebPStr = $.cookie.get("iswebp") || "", supportedWebPQueue = [], supportedWebPIsLoading = false;

        var execute = function(){
            for(var i= 0, len=supportedWebPQueue.length; i<len; i++){
                supportedWebPQueue[i](supportedWebP);
            }
            supportedWebPQueue = [];
        };

        var isSupportedWebP = function(cb){
            supportedWebPStr && (supportedWebP = supportedWebPStr === "1");
            if(supportedWebP === undefined){
                //console.log(supportedWebP,'===========' ,supportedWebPStr,'===========');
                supportedWebPQueue.push(cb);
                if(!supportedWebPIsLoading) {
                    supportedWebPIsLoading = true;
                    var images = {
                        basic: "data:image/webp;base64,UklGRjIAAABXRUJQVlA4ICYAAACyAgCdASoCAAEALmk0mk0iIiIiIgBoSygABc6zbAAA/v56QAAAAA=="
                    }, $img = new Image();
                    $img.onload = function () {
                        supportedWebP = this.width === 2 && this.height === 1;
                        supportedWebPIsLoading = false;
                        $.cookie.set("iswebp" , +supportedWebP);
                        execute();
                    };
                    $img.onerror = function () {
                        supportedWebP = false;
                        supportedWebPIsLoading = false;
                        $.cookie.set("iswebp" , +supportedWebP);
                        execute();
                    };
                    $img.src = images.basic;
                }
            }else{
                cb(supportedWebP);
            }
        }

        var _toString = Object.prototype.toString;
        return function(opts , cb){
            switch(_toString.call(opts)){
                case "[object Object]"://对象
                    opts = opts || {};
                    cb = cb || opts.callback || function(){};
                    break;
                case "[object Function]"://函数
                    cb = opts || function(){};
                    opts = {};
                    break;
                default:
                    return this;
            }

            return this.each(function(i,n){
                var srcSign = opts.srcSign || "lazy-src"
                ,   target = $(n)
                ,   src = target.attr(srcSign);

                if(!src) return;//需要有数据源

                var desSign = opts.desSign || "lazy-src";
                isSupportedWebP(function(supported){
                    if(supported){
                        //支持webp
                        src += (src.indexOf('?')!=-1?'&':'?') + 'tp=webp';
                        target.data("data-isSupportedWebP" , true);
                    }
                    if(desSign === 'src'){
                        //直接加载，需要添加上报处理
                        var _time = +new Date();
                        //console.log(_time , src,"------------");
                        target.data('data-first-date', _time);
                        target[0].onload = function (e) {
                            reportTime(e, target);//成功时候上报处理
                        }
                    }
                    target.attr(desSign , src);
                    cb(supported);
                })

            });
         }
    })();

    $.fn.lazyload = function(options) {

        return this.each(function() {

            options = options || {};
            var defualts = {};

            var opts = $.extend({}, defualts, options);
            var obj = $(this);
            var dom = this;

            var srcSign = options.srcSign || "lazy-src";
            var errCallBack = options.errCallBack || function(){};
            var container = options.container || $(window);

            /*var _ReportFun = null;
            var getReport = function(){
                console.log('++++++',_ReportFun);
                if(_ReportFun){
                    return _ReportFun;
                }else{
                    var imgs = [], index = 0;
                    _ReportFun = function(){
                       var _index = (index ++ ) % 5;
                       console.log(_index,'==============',index);
                        return imgs[_index] || (imgs[_index] = new Image());//生成对象
                    }
                    console.log('++++++',_ReportFun);
                    return _ReportFun;
                }
            }*/

            /**
             * @description src正常
             */
            var imgload = function (e, target) {
                //todo: 上报
                reportTime(e, target);
            }

            /**
             * @description src失效
             */
            var imgerr = function (e, target, fn, src) {
                if(target[0].src && (target[0].src.indexOf("img-err.png")>0 || target[0].src.indexOf("img-err2.png")>0)){
                    return ;
                }
                var w = target.width();
                var h = target.height();
                if(w/h == 1){
                    target[0].src = "http://9.url.cn/edu/img/img-err.png";
                }else{
                    target[0].src = "http://9.url.cn/edu/img/img-err2.png";
                }

                fn();

                Badjs("lazyload拉取图片失败上报", location.href, 0, 414342, 2);
                /*LOG({
                    'type': 'error',
                    'msg': 'lazyload拉取图片失败上报 ',
                    'url': window.location.href,
                    'mid': 414342
                });*/
            };

            var tempImg = function(target){
                var w = target.width();
                var h = target.height();
                var t = target.offset().top;
                var l = target.offset().left;
                //var tempDom = target.clone().addClass("lazy-loding").insertBefore(target);
                if(w/h == 1){
                    target[0].src = "http://9.url.cn/edu/img/img-loading.png";
                }else{
                    target[0].src = "http://9.url.cn/edu/img/img-loading2.png";
                }
                //target.hide();
            }
            /**
             * @description src替换，loading过程中添加类lazy-loading;
             */
            var setSrc = function(target, srcSign, errCallBack){

                if(target.attr("src"))return ;

                tempImg(target);

                //处理webp
                target.loadWebP(function(supported){
                    //console.log( target.data() , supported , '============');
                    var src = target.attr(srcSign);
                    var _time = +new Date();
                    //console.log(_time , src,"------------");
                    target.data('data-first-date', _time);
                    //var newTarget = target.clone(true);
                    target[0].onerror = function (e) {
                        imgerr(e, target, errCallBack, src);
                    };
                    target[0].onload = function (e) {
                        //target.parent().find(".lazy-loding").remove();
                        //target.show();
                        //target.replaceWith(newTarget);
                        //newTarget.show();
                        imgload(e, target);
                    }
                    target[0].src = src;

                });
            }

            /**
             * @description 重组
             */
            opts.cache = [];

            if(dom.tagName == "IMG"){
                var data = {
                    obj: obj,
                    tag: "img",
                    url: obj.attr(srcSign)
                };
                opts.cache.push(data);
            }else{
                var imgArr = obj.find("img");
                imgArr.each(function(index) {
                    var node = this.nodeName.toLowerCase(), url = $(this).attr(srcSign);
                    //重组
                    var data = {
                        obj: imgArr.eq(index),
                        tag: node,
                        url: url
                    };
                    opts.cache.push(data);
                });
            }


            //动态显示数据
            var scrollHandle = function() {
                var contHeight = container.height();
                var contop;
                if ($(window).get(0) === window) {
                    contop = $(window).scrollTop();
                } else {
                    contop = container.offset().top;
                }
                $.each(opts.cache, function(i, data) {
                    var o = data.obj, tag = data.tag, url = data.url, post, posb;
                    if (o) {
                        post = o.offset().top - contop;
                        postb = post + o.height();

                        if ((post >= 0 && post < contHeight) || (posb > 0 && posb <= contHeight)) {
                            if (url) {
                                //在浏览器窗口内
                                if (tag === "img") {
                                    //改变src
                                    setSrc(o, srcSign, errCallBack);
                                }
                            }
                            data.obj = null;
                        }
                    }
                });
            }

            //加载完毕即执行
            scrollHandle();
            //滚动执行
            container.bind("scroll", scrollHandle);
            container.bind("resize", scrollHandle);

        });
    };

}));
