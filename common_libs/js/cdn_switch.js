;(function(){
    ////////////////////// 非client的兼容代码 //////////////////
    //非client, 兼容没有console的情况
    var console = window.console ? window.console : {
        log : function(){},
        debug : function(){},
        info : function (){},
        warn : function(){},
        error : function () {}
    };

    var getComputedStyle = (function(){

        var supportedComputedStyle = !!(document.defaultView && document.defaultView.getComputedStyle);

        return function(node, prop) {

            if (supportedComputedStyle) {
                var ret = document.defaultView.getComputedStyle(node, null);
                return ret && ret.getPropertyValue(prop);
            }
            else if (node.currentStyle) {
                return node.currentStyle[prop];
            }

        };
    })();

    var _cfg;

    var _cgi_report = function(bid, level, msg, mid){
        var arr = [];
        arr.push('bid='+bid);
        arr.push('level='+level);
        arr.push('msg='+msg);
        if(mid) arr.push('mid='+mid);
        arr.push('r='+Math.random());

        var params = arr.join('&');

        var url = 'http://badjs.qq.com/cgi-bin/js_report?'+params;

        var img = new Image();
        img.src = url;
        img = null;

    };

    var __report = function(mid,content,bid){

        if(!mid){
            console.error('cdn_switch without mid!??');
            return;
        }

        bid = bid || _cfg.report.bid;

        //TODO:根据情况看这里的report要不要做延时
        var level = 2;
        var msg = [
            'CDNSW: ' + content,//content
            encodeURIComponent(window.location), //url
            0 //line
        ].join('|_|');

        _cgi_report(bid, level, msg, mid);

        console.warn('__report:'+mid+','+content);
    };

    function check_css(){
        var CFG = _cfg.css;
        var MIDS = CFG.mids || {};

        //小卡发现立即检测有可能取computedStyle拿不到正确的值,所以延迟100ms以后触发检测逻辑
        setTimeout(function(){
            function isCssLoadSucc(){
                var visibility = getComputedStyle(document.getElementById(CFG.detector),'visibility');
                return visibility==='hidden';
            }

            if(!isCssLoadSucc()){
                
                var link = document.createElement('link');
                link.rel = 'stylesheet';
                link.type = 'text/css';
                link.href = CFG.target;
                
                //退化: 5秒后检测, link的onload事件客户端webkit还未支持
                setTimeout(function(){
                    if(isCssLoadSucc()){
                        __report(MIDS['retry_succ'], 'css cdn switch succ to:'+CFG.target); // 加载失败
                    }
                    else{
                        __report(MIDS['retry_err'], 'css cdn switch err to:'+CFG.target); // 加载重试失败
                    }
                }, 5000);

                document.head.appendChild(link);
                __report(MIDS['err'], 'css load failed, we are switching css cdn to:'+CFG.target); // 加载失败
            }
        },100);
    }

    function check_js(){
        var CFG = _cfg.js;
        var MIDS = CFG.mids || {};

        if(CFG.detector){

            if(typeof window[CFG.detector]=='undefined'){

                __report(MIDS['err'], 'js load failed, we are switching js cdn to:'+CFG.target); // 加载失败

                //TODO
            }

        }

        /*
        //TODO: 暂未考虑非require项目的情景
        if(CFG.require){
            if(typeof define==='undefined'){

                __err_record.add(CFG.require);

                var script = document.createElement('script');
                script.setAttribute('data-main', CFG.target);
                script.src = CFG.require;

                script.onload = function(){
                    check_js_target();

                    __report(MIDS['retry_succ']);
                };
                //TODO: require retry失败要不要上报? 怎么报?

                document.body.appendChild(script);

                __report(MIDS['err']);
            }
            else{
                check_js_target();
            }
        }
        */
    }

    function run(){
        //这里的设计暂时是从另一个inline的script里读取window下的一个变量来获取项目内的cdn切换配置
        //TODO: 有没有办法设计的更优雅一点?
        _cfg = window['g_cfg_cdn_switch'];
        if(!_cfg){
            console.error('cdn cfg load error!');
            __report(406963,'cdn cfg load error!'); //TODO:这里暂时只能先手写了一个项目的mid了, 以后这里应该是一个多项目通用的id,发现问题就在nlog上查content确定是哪个项目出了问题
        }

        check_css();

        check_js();
    }

    run();

})();