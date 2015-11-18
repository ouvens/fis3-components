/**
 * @author moonye
 * @date 2015-08-06
 * @description 
 * @example 
 * @example 
 * @example 
 */
;
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD loading: define module named "badjs" with dependencies and build it
        define(['jquery', 'report', 'util.bom', 'util.cookie', 'report.cookie.init'], factory);
    } else {
        // traditional browser loading: build badjs object with dependencies and inject it into window object
        root['reportPath'] = factory(root['jQuery'], root['report'], root['Bom']);
    }
})(this, function ($, report, bom, cookie) {
    report = report || {};

    var _cookie = report.cookie || (report.cookie = {});

    var _COOKIE_BASE = _cookie.__ || (_cookie.__ = '_cookie_tdw_');

    var DOMAIN = "ke.qq.com",
        PATH = '',
        HOUER = 24; //默认24小时

    var host = location.host,
        pathname = location.pathname;

    //cookie对应的key    
    var userPathKey = 'userPath';
    var userPathCodeKey = 'userPathCode'

    var MAIN_HOST = 'ke.qq.com';
    var ALL_COURSE = '/cgi-bin/courseList';


    var regex_a = /\/(index\.html)/;
    var regex_m = /^([a-z])+\.ke\.qq\.com/;
    var regex_o = /^\/huodong\//;
    var regex_p = /^\/activity\//;
    var regex_q = /^\/channel\//;

    //默认页面对应的值
    var DEFAULT = 'r';

    var KEY_MAP = {
        '/': 'a',
        '/index.html': 'a',
        '/cgi-bin/index': 'a',
        '/cgi-bin/courseDetail': 'h',
        '/activity/list/index.html': 'i',
        '/bbs/': 'j',
        '/bbs/index.html': 'j',
        '/cgi-bin/bbs/xbar_info': 'k',
        '/cgi-bin/bbs/posts/post_detail': 'l',
        '/cgi-bin/teacher': 'n'
    }

    var COURSE_MAP = {
        'label_filter': 'c',
        'word': 'd',
        'tt': 'g',
        'st': 'f',
        'mt': 'e'
    };

    var APPLY_CODE = 'A';

    /**
     * 全部课程页编码 通过获取query或hash里面值来判断
     * @return {[type]} [description]
     */
    function _all_course() {
        if (ALL_COURSE !== pathname) return;

        for (var key in COURSE_MAP) {
            if (!!getQueryParam(key)) {
                return COURSE_MAP[key];
            }
        }
        return 'b';
    }

    function _agency() {
        if (regex_m.test(host)) {
            return 'm';
        }
    }

    function _huodong() {
        if (regex_o.test(pathname)) {
            return 'o';
        } else if (regex_p.test(pathname)) {
            return 'p';
        } else if (regex_q.test(pathname)) {
            return 'q';
        }
    }

    function _base() {
        if (host == MAIN_HOST) {
            key = KEY_MAP[pathname];
            if (key) {
                return key;
            } 
        }
    }

    function getPageCode() {
        var ret;
        var listFunction = [_base, _all_course, _agency, _huodong];
        for (var i = 0, len = listFunction.length; i < len; i++) {
            ret = listFunction[i].call(this)
            if (ret) {
                break;
            }
        }
        return ret || DEFAULT;
    }

    function getUserPath() {
        return getCookieParam(userPathKey);
    }

    function saveUserPath(userPath) {
        if (userPath.length > 100) {
            userPath = userPath.substring(0, 100);
        } else {
            setCookieParam(userPathKey, userPath);
        }
        return userPath;
    }

    function getUserPathCode() {
        var code = getCookieParam(userPathCodeKey);
        if (!code) {
            saveUserPathCode();
        }
        return getCookieParam(userPathCodeKey);
    }

    function saveUserPathCode() {
        setCookieParam(userPathCodeKey, Math.random());
    }

    /**
     * 报名成功页面的编码
     * @return {[type]} [description]
     */
    function getApplyPath() {
        var userPath = getUserPath() + APPLY_CODE;
        userPath = saveUserPath(userPath);
        return [userPath, getUserPathCode()].join('-');
    }

    //获取参数或者hash中的固定参数值
    function getQueryParam(name) {
        return $.bom.query(name) || $.bom.getHash(name);
    }
    //设置cookie的值
    function setCookieParam(name, value, domain, path, hour) {
        if (!name) return;
        domain = domain || DOMAIN;
        path = path || PATH;
        hour = hour || HOUER;
        $.cookie.set(_COOKIE_BASE + name, value, domain, path, hour);
    }

    //获取参数或者hash中的固定参数值
    function getCookieParam(name) {
        return $.cookie.get(_COOKIE_BASE + name);
    }

    //删除cookie的值
    function delCookieParam(name, domain, path) {
        if (!name) return;
        domain = domain || DOMAIN;
        path = path || PATH;
        $.cookie.del(_COOKIE_BASE + name, domain, path);
    }

    $(document).on('logout', function () {
        delCookieParam(userPathKey);
        delCookieParam(userPathCodeKey);
    });

    report.getPageCode = getPageCode;
    report.getUserPath = getUserPath;
    report.saveUserPath = saveUserPath;
    report.getUserPathCode = getUserPathCode;
    report.saveUserPathCode = saveUserPathCode;

    report.getApplyPath = getApplyPath;

    return report;
});