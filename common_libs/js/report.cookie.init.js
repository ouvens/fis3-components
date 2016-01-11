/**
 * @author herbertliu
 * @date 2014-02-25 version 0.2 last modified by herbertliu 2014-07-22
 * @description 获取cookie的from参数，并支持cookie from参数的自动化数据配置
 */
;(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD loading: define module named "badjs" with dependencies and build it
        define(['jquery', 'report', 'util.bom'],factory);
    } else {
        // traditional browser loading: build badjs object with dependencies and inject it into window object
        root['report'] = factory(root['report'],root['Bom']);
    }
})(this, function($, report, bom) {
    var _cookie = report.cookie || (report.cookie = {});

    var _COOKIE_BASE = _cookie.__ || (_cookie.__ = '_cookie_tdw_');
    var PROTOCOL=document.location.protocol,
        DOMAIN = "ke.qq.com",
        PATH = '',
        HOUER = 24;//默认24小时

    //设置cookie值
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

    var ver5,
        from = getQueryParam("from") || getCookieParam("from"),
        gdt = getQueryParam("qz_gdt") || getCookieParam("qz_gdt"),
        adposition = getQueryParam("adposition"),
        cid = getQueryParam("course_id");

    var _DATA = {
        '_BASE': {
            action:"From"
        }
    };

    if(gdt){
        ver5 = "gdt="+gdt+";adposition="+adposition;
        _DATA["qz_gdt"] = {};
        _DATA["qz_gdt"][gdt] = {
            ver1: cid,
            ver4: 17,
            ver5: ver5
        };
    }else if(from){
        _DATA["from"] = {};
        _DATA["from"][from] = {
            ver1: cid,
            ver4: from
        };
    }else{
        _DATA["from"] = {};
        _DATA["from"][""] = {
            ver1: cid,
            ver4: "4"
        };
    }

    if(from == 28 || from == 63 || from == 64){
        ver5 = getQueryParam("keyword") || getCookieParam("keyword");
        _DATA["from"][from]["ver5"] = ver5;
    }

    /*if(ver5){
        setCookieParam("keyword", ver5);
    }*/
    var _CONF = _cookie.CONF || (_cookie.CONF = {});
    _CONF.DATA = _DATA;//赋值数据

    return report;
});
