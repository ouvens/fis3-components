/**
 * @author herbertliu,littenli
 * @date 2014-06-10 version 0.2
 * @description 通过cookie上报，获取页面参数，然后进行cookie设置，页面cookie上报，依赖report,jquery
 * @example report.cookie.config(params,args) //获取上报的属性字符串
 *          params params {Object} 需要cookie上报字段集合，例如：
 *                                      {
 *                                          '_BASE' : {}
 *                                          'from' : {
 *                                              '_BASE':{}
 *                                              '1' : {'uin':'','ts':'','opername':'','module':'','action':'','obj1':'','obj2':'','obj3':'','action':'','ver1':'','ver2':'','ver3':'','ver4':''}，这里ts表示时间戳，不传使用服务器时间戳，objs表示用户ip，也不需要传
 *                                          }
 *                                      }
 *          params args {Boolean}   是否自动上报
 *
 * @example
 */
;
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD loading: define module named "badjs" with dependencies and build it
        define(['report', 'jquery', 'util.cookie', 'report.cookie.init', 'report.path'], factory);
    } else {
        // traditional browser loading: build badjs object with dependencies and inject it into window object
        root['report'] = factory(root['report'], root['jQuery'], root['Cookie'], root['reportPath']);
    }
})(this, function(report,$,cookie) {

    var _cookie = report.cookie || (report.cookie = {});

    var _user_path = report.getPageCode && report.getPageCode() || '';

    var _COOKIE_BASE = _cookie.__ || (_cookie.__ = '_cookie_tdw_');

    var PROTOCOL=document.location.protocol,
        DOMAIN = "ke.qq.com",
        PATH = '',
        HOUER = 24;//默认24小时

    var _REFERER = document.referrer,
        _REFERER_PROTOCOL = new RegExp('^' + PROTOCOL + '\\/\\/','ig'),
        _REFERER_DEPTH = new RegExp('([^\\.\\/]+)(\\.[^\\.\\/]+)+','ig');

    //report cookie全局配置
    var _CONF = _cookie.CONF || (_cookie.CONF = {});
    if(!_CONF.DATA){
        _CONF.DATA = {//配置需要上报的数据字段,其中BASE都是基于当前上报的基础字段设置
            '_BASE': {
                action:"testFrom"
            },
            'from' : {
                "90":{
                    ver4: "test again"
                }
            }
        };
    }
    _CONF.ISREPORT = true;//是否自动上报

    //增加支持基础参数扩展
    function extend(param){
        if(!param) return;
        for(var i = 0 ,len = arguments.length ; i < len ; i ++){
            if(!i) continue;
            var _arguments = arguments[i];
            for(var j in _arguments){
                param[j] = _arguments[j];
            }
        }
        return param;
    }


    //设置cookie的值
    function setCookieParam(name, value, domain, path, hour){
        if(!name) return;
        domain = domain ||  DOMAIN;
        path = path ||  PATH;
        hour = hour ||  HOUER;
        $.cookie.set(_COOKIE_BASE + name , value ,  domain, path, hour);
    }

    //获取参数或者hash中的固定参数值
    function getQueryParam(name){
        return $.bom.query(name) || $.bom.getHash(name);
    }

    //获取参数或者hash中的固定参数值
    function getCookieParam(name){
        return $.cookie.get(_COOKIE_BASE + name);
    }

    //删除cookie的值
    function delCookieParam(name, domain, path){
        if(!name) return;
        domain = domain ||  DOMAIN;
        path = path ||  PATH;
        $.cookie.del(_COOKIE_BASE + name ,  domain, path);
    }


    //检查cookie的referer是否存在
    function checkCookieReferer(){
        if(_REFERER.match(_REFERER_PROTOCOL)){//协议一致
            var _from_hostname = _REFERER.match(_REFERER_DEPTH);
            if(_from_hostname && (_from_hostname = _from_hostname[0])){
                return DOMAIN.match(new RegExp(_from_hostname,"ig")) || _from_hostname.match(new RegExp(DOMAIN,"ig"));//支持父级域名向子级跳转
            }else{
                return null;
            }
        }else{
            return null;
        }
    }

    var referKey = 'refer';
    function getRefer() {
        var refer = getCookieParam(referKey);
        if(!!refer) {
            return refer;
        }

        var _from_hostname = _REFERER.match(_REFERER_DEPTH);
        if (_from_hostname && (_from_hostname = _from_hostname[0])) {
            refer = _from_hostname;
        } else {
            refer = '-';
        }

        saveReferToCookie(refer);
        return refer;
    }

    function saveReferToCookie(refer) {
        setCookieParam(referKey, refer, DOMAIN, PATH, 2);
    }

    //获取COOKIE上报的字段值集合
    function getCookieReportAttr(cb){
        for(var i in _CONF.DATA){
            if(i === '_BASE') continue;
            cb && cb( i , _CONF.DATA[i] );
        }
    }

    function parseURL(url) {
        var a = document.createElement('a');
        a.href = url;
        return {
            source: url,
            protocol: a.protocol.replace(':', ''),
            host: a.hostname,
            port: a.port,
            query: a.search,
            params: (function() {
                var ret = {},
                seg = a.search.replace(/^\?/, '').split('&'),
                len = seg.length,
                i = 0,
                s;
                for (; i < len; i++) {
                    if (!seg[i]) {
                        continue;
                    }
                    s = seg[i].split('=');
                    ret[s[0]] = s[1];
                }
                return ret;
            })(),
            file: (a.pathname.match(/\/([^\/?#]+)$/i) || [, ''])[1],
            hash: a.hash.replace('#', ''),
            path: a.pathname.replace(/^([^\/])/, '/$1'),
            relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [, ''])[1],
            segments: a.pathname.replace(/^\//, '').split('/')
        };
    }

    function _initialize(){
        //初始化信息
        getCookieReportAttr(function(index, items){
            var isFromReport = 'from' === index;
            var firstFormKey = 'firstForm';
            var keywordKey = 'keyword';

            var value = getQueryParam(index);
            var isFromParent = false;//说明referer来源是父域名并且数据来自cookie

            var _checks = checkCookieReferer();

            //一级跳转记录
            //如果url参数有from，说明是一级跳转，将页面名称记录在cookie里
            //如果有参数，且referer匹配，说明是路径操作行为，获取cookie里面的firstLand
            //如果没有参数，且referer不匹配，说明是用户自己输入，也是一级跳转，将页面名称记录在cookie里
            //理论上只要进入页面，firstland这个cookie都会有；如果是被删除或过期，将当前页面作为首次进入页
            var urlObj = parseURL(location);
            var firstLand = urlObj.path;
            var firstJump = "";
            var keyword = getQueryParam(keywordKey);
            var userPath = _user_path;
            var userPathCode;

            if (_checks) {
                firstLand = getCookieParam("firstLand");
                firstJump = getCookieParam("firstJump");
                userPath = report.getUserPath() + userPath;
                keyword = getCookieParam(keywordKey);

                if (!firstLand) {
                    setCookieParam("firstLand", firstLand);
                }
            } else {
                setCookieParam(keywordKey, keyword);
                setCookieParam("firstLand", firstLand);
                delCookieParam("firstJump");

                report.saveUserPathCode();

            }
            // console.log("firstLand:"+firstLand);

            //如果是一级跳转是首页
            //针对首页会做第一次点击记录


            if(urlObj.path == "/index.html" || urlObj.path == "/" || urlObj.path == "/cgi-bin/index"){
                var hasSaveJump = false;
                //如果reforer匹配，说明是路径操作行为，不存储第一次点击
                if(!_checks && $(document).on){
                    //上报属性
                    $(document).on('click','*[jump-start]',function(e, param){
                        if(!hasSaveJump){
                            var $start = $(this); //当前点击源
                            var $bubble = $start;
                            var idxArr = [];

                            //冒泡
                            while(!$bubble.attr("jump-end") && $bubble[0].tagName != "BODY"){
                                var idx = $bubble.attr("jump-through");
                                if(idx){
                                    idxArr.push(idx);
                                }
                                $bubble = $bubble.parent();
                            }

                            var startVal = $start.attr("jump-start");
                            idxArr.push(startVal);
                            idxArr.reverse();
                            firstJump = idxArr.join("&");
                            setCookieParam("firstJump", firstJump);

                            hasSaveJump = true;
                        }
                    });
                }else{
                    //delCookieParam("firstJump");
                }
            }

            if(!value){
                value = getCookieParam(index);//从cookie中获取，存在cookie值
                if(value){

                    if(!_checks){//来源检查，不合格，清除cookie
                        delCookieParam(index);
                        items[value].ver4 = "4";

                        isFromReport && delCookieParam(firstFormKey);
                        return true;
                    }else{
                        //验证通过
                        if(_checks[0] !== DOMAIN){
                            //说明referer来源是父域名
                            isFromParent = true;
                        }
                    }
                }else{
                    //说明是空值
                    //return true;//不存在value
                }
            }
            var _data = items[value];
            if(!_data){
                //没有上报值
                delCookieParam(index);
                // isFromReport && delCookieParam(firstFormKey);
                return true;
            }else if(isFromParent){
                delCookieParam(index);//删除当前域下同名cookie
                // isFromReport && delCookieParam(firstFormKey);
            }

            var newFrom = _data.ver4;
            if (newFrom) {
                var firstForm = getCookieParam(firstFormKey);
                if (!firstForm/* && newFrom != 4*/) {
                    firstForm = newFrom;
                    setCookieParam(firstFormKey, firstForm);
                }
                _data.ver4 = firstForm;
                _data.ver6 = newFrom;
            }

            if (userPath) {
                userPath = report.saveUserPath(userPath);
                userPathCode = report.getUserPathCode();
                _data.path = [userPath, userPathCode].join('-');
            }

            //第一次进入平台的页面
            _CONF.DATA._BASE.ver7 = firstLand;
            _CONF.DATA._BASE.ver5 = keyword;

            //记录refer
            _CONF.DATA._BASE.refer = getRefer();

            if(firstJump){
                _CONF.DATA._BASE.ver8 = firstJump;
            }
            var _param = extend({}, _CONF.DATA._BASE, items['_BASE'], _data);

            //辅助上报到monitor，排查exposure和from不等的问题
            //@todo: 排查问题后删除下面的逻辑
            /*var pathname = window.location.pathname;
            if(pathname == "/index.html" || pathname == "/"){
                var img = new Image();
                img.src = "http://jsreport.qq.com/cgi-bin/report?id=255&rs=0-0-438937&r="+(+new Date());
            }*/

            _CONF.ISREPORT && report.tdw(_param);

            // 当referer来源是父域名并且数据来自cookie，不需要重新设置本域cookie
            if(!isFromParent) {
                setCookieParam(index, value);
            }

        });
    }

    /**
     * tdw设置cookie方式上报config属性值
     *  params params {Object} 需要cookie上报字段集合，例如：
     *                                      {
     *                                          '_BASE' : {}
     *                                          'from' : {
     *                                              '_BASE':{}
     *                                              '1' : {'uin':'','ts':'','opername':'','module':'','action':'','obj1':'','obj2':'','obj3':'','action':'','ver1':'','ver2':'','ver3':'','ver4':''}，这里ts表示时间戳，不传使用服务器时间戳，objs表示用户ip，也不需要传
     *                                          }
     *                                      }
     *  params args {Boolean}   是否自动上报
    */
    _cookie.config = function(params,args){
        if(params){
            for(var i in params){
                if(params[i] === 0){//当值恒等于0的时候删除改上报字段
                    delete _CONF.DATA[i];
                }else{
                    _CONF.DATA[i] = params[i];
                }
            }
        }
        _CONF.ISREPORT = !args;
    };

    _cookie.getConfig = _CONF;

    _initialize();


    return report;
});
