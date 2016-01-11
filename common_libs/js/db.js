/**
 * @description DB层公共函数
 *
 * opt 增加新参数： -- by vienwu 20150615
 *     isUseModal：true/false true时使用新的modal.js弹框，支持多实例。false时使用旧的alert。
 */
(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery', './login', './mmReport', 'util.cookie', 'check'], factory);
    } else {
        // Browser globals
        root['DB'] = factory(root['$'], root['Login'], root['MM'], root['Cookie']);
    }
}(this, function($, Login, MM, Cookie, Check) {
    var global = this;

    var Badjs = window['Badjs'];
    var __DEBUG_STR__ = window['__DEBUG_STR__'];

    var $reportParam = {
        _404: 0,
        _5xx: 0
    };

    function noop() {}

    // extend callback
    function extendCallBack(scope, args, cb, _fun) {
        return function() {
            !cb.apply(scope, args) && _fun.apply(scope, args);
        };
    }

    // extend
    function extend(scope, args, ex) {
        if (typeof(scope) != 'object') return scope;
        args = args || {};
        for (var i in args) {
            var _fun, cb;
            if (ex && typeof(_fun = scope[i]) === 'function' && typeof(cb = args[i]) === 'function') {
                scope[i] = extendCallBack(scope, arguments, cb, _fun);
            } else {
                scope[i] = args[i]; // add window global callback function
            }
        }
    }

    var isLoginError = false;

    /*
     * @description 加密skey
     * @param skey生成hash
     */
    function encryptSkey(str) {
        if (!str) {

            return "";
        }
        var hash = 5381;
        for (var i = 0, len = str.length; i < len; ++i) {
            hash += (hash << 5) + str.charAt(i).charCodeAt(); // jshint ignore:line
        }
        return hash & 0x7fffffff; // jshint ignore:line
    }

    function getSkey() {
        var __skey;
        if (Check.isWeixinUser()) {
            __skey = getCookie("uid_a2") || ''; // 获取当前skey
        } else {
            __skey = getCookie("skey") || ''; // 获取当前skey
        }
        return __skey;
    }

    /**
     * @description 获取cookie值
     *
     * @param {String} n cookie名称
     * @example
     *         getCookie('uin');
     */
    var getCookie = Cookie.get;


    // 增加本地cookie验证逻辑，统一处理
    var _uin, _skey = getSkey();
    if (Check.isWeixinUser()) {
        _uin = getCookie("uid_uin") || 0; // 获取当前用户id
    } else {
        _uin = getCookie("uin") || 0; // 获取当前用户id
    }


    /**
     * @description发出ajax请求
     *
     * @param {String} url 请求路径--不能跨域
     * @param {Object} [para] 参数列表
     * @param {Function} cb 回调函数
     * @param {Function} method 请求方式: [post|get]
     * @param {String} [type = json] 数据类型：[json|text] --默认为json
     * @example
     *         ajax('/cgi-bin/info',{'uin':10001},fnCallBack,'get');
     */

    var uinCache = {};
    var ajax = function(url, param, cb, method, dataType, timeout, async) {

        // 返回jQuery.ajax实例
        var ajax_startTime = new Date(); // 每个ajax请求前记录时间

        var hasUin2 = false;

        function checkHasUin(obj) {
            if (typeof(obj) == "string" && obj.indexOf("uin") >= 0) {
                hasUin2 = true;
            } else {
                for (var em in obj) {
                    if (typeof(em) == "string" && em.indexOf("uin") >= 0) {
                        hasUin2 = true;
                    }
                    if (typeof(obj[em]) == "object") {
                        checkHasUin(obj[em]);
                    }
                }
            }
        }
        checkHasUin(param);

        var cgiUrl = (url.split("?"))[0];
        if (hasUin2 && !uinCache[cgiUrl]) {
            uinCache[cgiUrl] = true;
            console.log("hasUin-send：" + cgiUrl);
        }

        var opt = {
            type: method,
            url: url,
            data: param,
            async: async === false ? false : true,
            success: function(msg) {

                //检测uin - start
                var hasUin = false;

                function checkHasUin(obj) {
                    for (var em in obj) {
                        if (typeof(em) == "string" && em.indexOf("uin") >= 0) {
                            hasUin = true;
                        }
                        /*if(/^[1-9](\d{4,10}|\d{17})$/.test(obj[em])){
                         console.log("hasUin：" + obj[em]);
                         hasUin = true;
                         }*/

                        if (typeof(obj[em]) == "object") {
                            checkHasUin(obj[em]);
                        }
                    }
                }
                checkHasUin(msg);

                var cgiUrl = (url.split("?"))[0];
                if (hasUin && !uinCache[cgiUrl]) {
                    uinCache[cgiUrl] = true;
                    console.log("hasUin-res：" + cgiUrl);
                }
                //检测uin - end


                var cost = new Date() - ajax_startTime; // 每个ajax回调函数的第二个参数为 耗时
                cb && cb(msg, cost);
            },
            error: function(xhr) {
                var cost = new Date() - ajax_startTime; // 每个ajax回调函数的第二个参数为 耗时
                cb && cb({
                    ec: !xhr.status ? -1000 : xhr.status
                }, cost); // 兼容http，abort之后返回status为0
            }
        };
        timeout && (opt.timeout = timeout);
        // console.log(url, dataType);
        dataType && (opt.dataType = dataType);
        return $.ajax(opt);
    };

    var cache = {};

    // 暴露接口
    return {
        abTest: !!((new Date) % 2), // jshint ignore:line
        'status': {
            // 存储其他状态信息
            bkn: '' // 页面的base_key信息，拉取base_key更新此字段
        },
        'data-cache': { // data-cache

        },
        isLoginError: function() {

            return isLoginError;
        },
        encryptSkey: encryptSkey, // get skey encrypt to token
        getCookie: getCookie, // getcookie

        // 初始化上报信息
        // 目前提供404,5xx上报
        // param object
        // _404:mid,_5xx:mid
        initReport: function(param) {

            // $reportParam._404 = param._404 || 0;
            // $reportParam._5xx = param._5xx || 0;
        },
        get: function(url, param, callback, type, timeout, async) {

            var params = [];
            for (var i in param) {
                params.push(i + "=" + encodeURIComponent(param[i]));
            }
            params.push("r=" + Math.random());
            if (url.indexOf("?") == -1) {
                url += "?";
            }
            url += params.join('&');
            return ajax(url, null, callback, "GET", type, timeout, async);
        },
        post: function(url, param, callback, type, timeout, async) {

            /*var s = "";
            for(var i in param){
                s+="&" + i + "=" + param[i];
            }*/
            var params = [];
            for (var i in param) {
                params.push(i + "=" + encodeURIComponent(param[i]));
            }
            params.push("r=" + Math.random());
            return ajax(url, params.join('&'), callback, "POST", type, timeout, async);
        },
        /**
         * @opt  obj {url:String,param:Object,type:String,isBkn:Boolean,cb:Function}
         * @description cgi请求统一处理,此处不包含拉取base_key cgi请求（单独处理）
         * @private
         * @url   {String} 请求地址,必选
         * @param    {Object} 请求传入参数
         * @type    {String} 请求方式 POST , GET,可选，默认是POST
         * @succ {Function} 成功，回调函数,可选
         * @err:  {Function} 失败，回调函数,可选
         * @returns undefined
         */
        cgiHttp: function(opt) {
            // cgi请求
            if (!opt || !opt.url) return undefined;
            var _this = this;
            opt.param = opt.param || {};
            // just for test
            // opt.param.aid = 1917152038;
            var timeOpt = {
                url: opt.url
            }; // 用于数据上报
            var httpFunction;
            var callBack = function(data, ajax_cost) {
                // console.log("cgi ["+opt.url+"] ajax_cost=["+ajax_cost+"]");
                timeOpt.time = +new Date(); // 返回结果的时间
                // 直接http错误，simple返回对象
                if (typeof data !== 'object') {
                    // 包体不能为空
                    if (data) {
                        // 是否json格式
                        if (data.charAt(0) === '{' && data.charAt(data.length - 1) === '}') {
                            // json能否被正确解析出来
                            try {
                                if (window.JSON && JSON.parse) {
                                    data = JSON.parse(data);
                                } else {
                                    data = eval("(" + data + ")"); // jshint ignore:line
                                }
                            } catch (e) {
                                data = {
                                    ec: 999,
                                    text: data,
                                    msg: 'data is no json'
                                }; // json error
                            }

                        } else {
                            data = {
                                ec: 998,
                                text: data,
                                msg: 'data is hijack'
                            }; // 被劫持
                        }
                    } else {
                        data = {
                            ec: 997,
                            text: data,
                            msg: 'data is null'
                        };
                    }
                }

                // 请求回调函数
                // data = data || {};
                data.delay = ajax_cost;
                if ('retcode' in data) {
                    data.ec = data.retcode;
                } else {
                    data.retcode = data.ec;
                }
                var ec = data.ec; // ('retcode' in data) ? data.retcode : data.ec;
                var errFlag;
                // if(typeof ec =="undefined") ec = 999;
                // 处理公共错误，弹出一个对话框，执行指定的操作。
                // 例如鉴权失败会重新加载当前页面。
                switch (ec) {
                    case 0: // 成功
                        errFlag = false;
                        (opt.succ || function() {})(data); // 执行成功回调函数
                        break;
                    case 111: // uin不存在，实际上应当也是失去登录态
                    case -1001: // 自定义登录处理，没有登录态
                    case 100000: // 没有登陆态或登陆态失效或bkn失效
                    case 100021: // 需要验证登录，但是Bkn不存在
                        // console.log('login', opt.noNeedLogin, Login);
                        isLoginError = true;
                        // 如果有jQuery 触发logout全局事件
                        if (window.jQuery) {
                            window.jQuery.event.trigger("logout");
                        }
                        if (opt.noNeedLogin) { // 有该参数时,直接走err流程,不再走登陆流程
                            errFlag = true;
                        } else {

                            if (typeof Login != "undefined") {
                                // Login.show({succ: function () {console.log('login success')}})
                                Login.show({
                                    succ: function() {
                                        // 登陆成功后,自动重发cgi请求
                                        opt.param.bkn = _this.status.bkn = _this.encryptSkey(getSkey());
                                        httpFunction(opt.url, opt.param, callBack, opt.dataType, opt.timeout, opt.async); // 回调函数
                                    },
                                    close: function() {
                                        if (typeof opt.close == 'function') {
                                            opt.close.call(this);
                                        }
                                        Badjs("CGI Error , LoginFailed , req:" + opt.url + ", ec:" + ec, location.href, 0, 403860, 4); // jshint ignore:line
                                    }
                                });
                            } else {
                                errFlag = true;
                            }
                        }
                        Badjs("CGI Error , Need Login,  req:" + opt.url + ", ec:" + ec, location.href, 0, 403855, 2); // jshint ignore:line
                        break;
                    case 100021: // basekeyError
                        if (!opt.ldwRetry) {
                            opt.ldwRetry = true;
                            _this.status.bkn = _this.encryptSkey(getSkey());
                            opt.param.bkn = _this.status.bkn;
                            httpFunction(opt.url, opt.param, callBack, opt.dataType, opt.timeout, opt.async);
                        } else {
                            errFlag = true;
                        }
                        Badjs("CGI Error , Basekey Error , req:" + opt.url + ", ec:" + ec, location.href, 0, 403856, 4); // jshint ignore:line
                        break;
                    case 100001: // 输入参数错误
                        errFlag = true;
                        Badjs("CGI Error , Param Error:" + JSON.stringify(opt.param) + " , req:" + opt.url + ", ec:" + ec, location.href, 0, 403858, 4); // jshint ignore:line
                        break;
                    case 100003: // 系统内部错误
                        errFlag = true;
                        Badjs("CGI Error , Internal Error , req:" + opt.url + ", ec:" + ec, location.href, 0, 403857, 4); // jshint ignore:line
                        break;
                    case -1000:
                        errFlag = true;
                        ec = data.ec = 0; // 兼容http abort之后 status 为0
                        break;
                    case 99999:
                        errFlag = true;
                        Badjs("CGI Error , Need Show VerifyCode Error , red:" + opt.url + ", ec:" + ec, location.href, 0, 0, 2); // jshint ignore:line
                        break;
                    case 101402: // 用户已经报名此课程
                    case 101403: // 课程没有相关招生群
                    case 101404: // 没有找到课程记录信息
                    case 101405: // 课程没有这个招生群
                    case 101406: // 课程已经被下架
                    case 102404: // 没有找到机构记录信息
                    case 103404: // 没有找到老师记录信息
                    case 106401: // 不能找到这个群号
                    case 106402: // 不能找到这个QQ号码
                    case 106403: // 错误的domain格式
                    case 106404: // domain已经被绑定
                    case 106405: // 错误的key
                    case 106406: // 用户已经被绑定
                    case 106407: // 账户状态错误
                    case 106409: // 报名的课程已经结束
                    case 106410: // 报名的课程是收费的
                    case 106411: // 报名的课程已经开始
                    case 106412: // 课程是收费，价格不能为0
                    case 106413: // 课程是免费，价格大于0
                    case 106415: // 用户没有报名此课程
                    case 106416: // 用户取消报名的课程是支付课程，请走支付课程退款流程
                    case 106425: // 上传的图片大小不能是0
                    case 106427: // 课程已经开始，不能取消报名
                    case 106435: // QQLive聊天长连接读取失败
                    case 106457: // 课程赠送 根据uin未查到QQ号码
                    case 110403: // 没有找到机构的结算信息
                        errFlag = true;
                        Badjs("CGI Error , Bussines Error , req:" + opt.url + ", ec:" + ec, location.href, 0, 408941, 2); // jshint ignore:line
                        break;
                    default: // 未知返回值
                        errFlag = true;
                        Badjs("CGI Error , Other Error , req:" + opt.url + ", ec:" + ec, location.href, 0, 403859, 4); // jshint ignore:line
                        break;
                }
                // 新增底层统一处理跳转信息，没有管理权限

                // 新增mm上报
                MM.report(opt.url, ec, ajax_cost, _uin);

                // cgi接口返回出错时：
                if (errFlag) {
                    // 执行失败回调函数，并保存返回的结果true/false
                    var isBlockDefaultErr = (opt.err || function() {})(data);


                    // console.log(ec,_this.status.isDialog);
                    // ec是retcode，106457是 课程赠送，根据uin未查到qq号码
                    // isDialog：是否显示了对话框
                    if (ec && !_this.status.isDialog && ec !== 106457) {
                        // 兼容http abort
                        if (isBlockDefaultErr) {
                            var msg = isBlockDefaultErr.msg;
                            if (msg) {
                                //  如果有opt参数，则实行
                                msg += __DEBUG_STR__({
                                    url: opt.url,
                                    ret: data
                                }, 'info');
                                var __opt = isBlockDefaultErr.opt || {};
                                var _onCancel = __opt.onCancel;
                                opt.onCancel = function() {
                                    _onCancel.apply(__opt, arguments);
                                    _this.status.isDialog = false;
                                };

                                $.modal.alert(msg, __opt);

                                _this.status.isDialog = true;
                            }
                        } else {
                            var defaultWording = '服务器繁忙，请稍后再试';
                            var wording = {
                                '100001': '输入参数错误',
                                '100003': '服务器内部错误，请稍后再试',
                                '110405': '没有管理权限，请重新刷新页面'
                            }[ec] || defaultWording;
                            var _finally = function() {
                                _this.status.isDialog = false;
                                switch (ec) {
                                    case 106507:
                                        location.href = '/index.html';
                                        break;
                                    case 106406:
                                    case 106407:
                                    case 110405:
                                        location.reload();
                                        break;
                                }
                            };
                            if (ec === 106507) {
                                _this.status.isDialog = true;
                                return $.modal.alert('由于触犯平台规则，机构功能禁止使用7天', {
                                    title: '提示',
                                    onCancel: _finally,
                                    onAccept: _finally,
                                    onClose: _finally
                                });
                            }

                            // 备注：
                            // 110405：无权限，无论GET、POST，都会弹错误提示，除非明确阻止
                            // 其他：如果是POST，弹错误提示
                            if (ec == 110405 || opt.type == 'POST') {
                                $.modal.alert(wording + ('(' + ec + ')') + __DEBUG_STR__({
                                    url: opt.url,
                                    ret: data
                                }, 'info'), {
                                    type: 'err',
                                    onCancel: _finally,
                                    onAccept: _finally,
                                    onClose: _finally
                                });

                                _this.status.isDialog = true;
                            }
                        }
                    }
                }

            };


            if (_this.status.uin) {
                if (_this.status.uin != _uin) {
                    // 帐号已变更，重新计算Bkn
                    _this.status.bkn = 0; // 清除bkn
                    _this.status.uin = _uin; // 保存bkn
                    // 监听注册事件

                }
            } else {
                _this.status.uin = _uin;
            }


            // 重新计算Bkn
            if (!_this.status.bkn) {
                // 当不存在Bkn的时候进行Bkn复制
                _this.status.bkn = _this.encryptSkey(getSkey());
            }

            _this.status.bkn && (opt.param.bkn = _this.status.bkn); // 设置bkn参数

            // console.log(opt.noNeedLogin,opt)

            if (!opt.type) {
                // console.error('opt.type if not Specified! The url is ' + opt.url);
                //Badjs('opt.type if not Specified! The url is ' + opt.url, location.href, 0, 0, 2); // jshint ignore:line
            }

            // CGI请求登录逻辑
            if (!opt.type || opt.type.toUpperCase() == 'GET') {
                opt.type = 'GET';
                httpFunction = _this.get;
            } else {
                opt.type = 'POST';
                httpFunction = _this.post;
            }

            var ret = httpFunction(opt.url, opt.param, callBack, opt.dataType, opt.timeout, opt.async); // 回调函数
            return ret;
        },
        // the default scope is commonapi, you can use the other scope like window for example this.extend('call',function(){console.log(3333,arguments;return false;);},window,true)
        // or this.extend({'call':function(){console.log(3333,arguments;return false;);}},window,true);
        extend: function(args, cb, scope, ex) { // scope
            // add function to this object
            var type = Object.prototype.toString.call(args);
            if (type === '[object String]') {
                scope = scope || this;
                var _args = {};
                _args[args] = cb;
                extend(scope, _args, ex);
            } else if (type === '[object Object]') {
                if ((cb === null || cb === undefined) && arguments.length >= 4) {
                    scope = scope || this;
                    extend(scope, args, ex);
                } else {
                    ex = scope;
                    scope = cb || this;
                    extend(scope, args, ex);
                }
            }
        },
        // 提供最简单的添加cgi方式
        addCgi: function(name, url) {

            var _this = this;

            var cgi = {};

            cgi[name] = function(opt) {

                var _opt = {};
                _opt.param = opt.param || {};
                _opt.url = url;
                _opt.succ = function(data) {
                    (opt.succ || function() {})(data); // 调用回调函数
                };
                _opt.err = function(data) {
                    (opt.err || function() {})(data); // 调用回调函数
                };

                _this.cgiHttp(_opt);
            };

            this.extend(cgi);
        },
        httpMethod: function(cfg) {

            var _this = this;

            return function(opt) {
                var _opt = {};
                _opt.async = cfg.async === false ? false : true;
                _opt.param = opt.param;
                _opt.timeout = opt.timeout;
                cfg.type && (_opt.type = cfg.type);
                cfg.dataType && (_opt.dataType = cfg.dataType);
                cfg.noNeedLogin && (_opt.noNeedLogin = cfg.noNeedLogin);
                _opt.url = cfg.url;
                _opt.succ = function(data) {
                    return (cfg.succ || opt.succ || noop)(data); // 调用回调函数
                };
                _opt.err = function(data) {
                    return (cfg.err || opt.err || function() {})(data); // 调用回调函数
                };
                _opt.close = function(data) {
                    return (cfg.close || opt.close || function() {})(data); // 调用回调函数
                };
                _opt.isUseModal = opt.isUseModal;
                return _this.cgiHttp(_opt);
            };
        },
        wrapGroup: function(param) {
            // 为整个项目增加公共参数
            return param || {};
        },
        save: function(apiName, data) {
            cache[apiName] = data;
        },
        getCache: function(apiName) {
            return cache[apiName];
        },
        clearCache: function(apiName) {
            cache[apiName] = null;
        }
    };

}));