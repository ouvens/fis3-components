/**
 * @description badjs封装
 * @author herbertliu
 */

(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else {
        // Browser globals
        root['Badjs'] = factory();
    }
}(this, function() {

    /*
     * @date 2013-02-25
     * @description badjs上报
     * @param msg {String} 上报错误信息
     * @param url {String} 该上报信息所属的文件路径
     * @param line {Number} 上报信息所属的文件行号，没有为0
     * @param smid {Number} 上报对应的monitor id
     * @param level {Number} 上报对应的级别 debug（调试日志）：1 ; info（流水日志）：2 ; error（错误日志）：4（默认值） ; fail（致命错误日志）：8
     * @example Badjs.init(bid,mid,smid,closed) 初始化badjs一些参数
     * @example Badjs.check(o,mid)  检查页面是否存在某些文件辅助方法
     * @example Badjs.report(retry,total,src,name,loaded)  文件加载失败的辅助上报方法
     */


    //==== module code begin ====
    var global = this || window;
    var imgs = [];
    var badjs = function(msg, url, line, smid, level) {
        var mid = badjs._mid || 390672;
        var bid = badjs._bid || 255;
        if (smid > 0 || smid === 0) {
            mid = smid;
        } else if (smid === -1) { //window onerror事件处理，增加Script Error前缀
            msg = 'Script Error:' + msg;
        }


        level = level || 4; //默认值
        if (!badjs._closed) {
            var img = new Image();
            imgs.push(img);
            img.src = 'http://badjs.qq.com/cgi-bin/js_report?level=' + level + '&bid=' + bid + '&mid=' + mid + '&msg=' + msg + '|_|' + encodeURIComponent(url) + '|_|' + line + '|_|browser:' + encodeURIComponent(navigator.userAgent) + '&r=' + Math.random();
        }
    };


    badjs._closed = window.__DIST_MODE__ == 'dev';


    var BJ_REPORT = (function(global) {
        if (global.BJ_REPORT) return global.BJ_REPORT;

        var _error = [];
        var orgError = global.onerror;
        global.onerror = function(msg, url, line, col, error) {
            _error.push({
                msg: msg,
                target: url,
                rowNum: line,
                colNum: col,
                error: error
            });

            _send();
            /*   if(console && console.error){
                   console.log("[BJ_REPORT]",url +":" + line + ":" + col , msg);
               }*/
            orgError && orgError.apply(global, arguments);

        };

        var _config = {
            id: 0,
            uin: 0,
            url: "",
            combo: 1,
            level: 4, // 1-debug 2-info 4-error 8-fail
            ignore: [],
            delay: 100,
            submit: null
        };

        var _isOBJ = function(o, type) {
            return Object.prototype.toString.call(o) === "[object " + (type || "Object") + "]";
        };

        var _error_tostring = function(error, index) {
            var param = [];
            var params = [];
            var stringify = [];
            if (_isOBJ(error)) {
                error.level = error.level || _config.level;
                for (var key in error) {
                    var value = error[key] || "";
                    if (value) {
                        if (typeof value == 'object') {
                            value = JSON.stringify(value);
                        }
                        stringify.push(key + ":" + value);
                        param.push(key + "=" + encodeURIComponent(value));
                        params.push(key + "[" + index + "]=" + encodeURIComponent(value));
                    }
                }
            }

            //  aa[0]=0&aa[1]=1
            //  aa:0,aa:1
            //  aa=0&aa=1
            return [params.join("&"), stringify.join(","), param.join("&")];
        };



        var _submit = function(url) {
            if (_config.submit) {
                _config.submit(url);
            } else {
                var img = new Image();
                img.src = url;
            }
        };

        var error_list = [], comboTimeout = false, comboTimeoutId;
        var _send = function() {
            if (!_config.report) return;

            while (_error.length) {
                var isIgnore = false;
                var error = _error.shift();
                var error_str = _error_tostring(error, error_list.length); // JSON.stringify(error);
                for (var i = 0, l = _config.ignore; i < l; i++) {
                    var rule = _config.ignore[i];
                    if ((_isOBJ(rule, "RegExp") && rule.test(error_str[1])) ||
                        (_isOBJ(rule, "Function") && rule(error, error_str[1]))) {
                        isIgnore = true;
                        break;
                    }
                }
                if (!isIgnore) {
                    if (_config.combo) {
                        error_list.push(error_str[0]);
                    } else {
                        _submit(_config.report + error_str[2] + "&_t=" + (+new Date));
                    }

                    _config.onReport && (_config.onReport(_config.id, error));
                }
            }

            if (_config.combo) {
                if (comboTimeout) {
                    return;
                }
                comboTimeout = true;

                comboTimeoutId = setTimeout(function() {
                    var count = error_list.length;
                    _submit(_config.report + error_list.join("&") + "&count=" + count + "&_t=" + (+new Date));
                    error_list = [];
                    comboTimeout = false;
                }, _config.delay);
            }

        };


        var _isInited = false;
        var report = {
            push: function(msg) { // 将错误推到缓存池
                _error.push(_isOBJ(msg) ? msg : {
                    msg: msg
                });
                return report;
            },
            report: function(msg) { // 立即上报
                msg && report.push(msg);
                _send();
                return report;
            },
            init: function(config) { // 初始化
                if (_isOBJ(config)) {
                    for (var key in config) {
                        _config[key] = config[key];
                    }
                }
                // 没有设置id将不上报
                var id = parseInt(_config.id, 10);
                if (id) {
                    _config.report = (_config.url || "http://badjs2.qq.com/badjs")
                        + "?id=" + id
                        + "&uin=" + parseInt(_config.uin || (document.cookie.match(/\buin=\D+(\d+)/) || [])[1], 10)
                        + "&from=" + encodeURIComponent(location.href)
                        + "&";
                    //!_isInited && _run();
                    _isInited = true;
                }

                _error = [];
                error_list = [];
                clearTimeout(comboTimeoutId);
                return report;
            }
        };


        return report;

    }(window));

    global.BJ_REPORT = BJ_REPORT;


    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = BJ_REPORT;
        }
        exports.BJ_REPORT = BJ_REPORT;
    }
    ;(function (root) {

        if (!root.BJ_REPORT) {
            return;
        }

        var _onthrow = function(errObj) {
            try {
                if (errObj.stack) {
                    var url = errObj.stack.match('http://[^\n]+')[0];
                    var rowCols = url.match(':([0-9]+):([0-9]+)');
                    var msg = errObj.stack.replace(/\n/gi, '@').replace(/at[\s]/gi, '');

                    //badjs调试逻辑
                    badjs.apply(this, [msg, url, rowCols, -1, null]);

                    root.BJ_REPORT.report({
                        msg: msg,
                        rowNum: rowCols[1],
                        colNum: rowCols[2],
                        target: url.replace(rowCols[0], '')
                    });
                } else {
                    root.BJ_REPORT.report(errObj);
                }
            } catch (err) {
                root.BJ_REPORT.report(err);
            }

        };

        var tryJs = root.BJ_REPORT.tryJs = function init(throwCb) {
            throwCb && (_onthrow = throwCb);


            return tryJs;
        };


        // merge
        var _merge = function(org, obj) {
            var key;
            for (key in obj) {
                org[key] = obj[key];
            }
        };

        // function or not
        var _isFunction = function(foo) {
            return typeof foo === 'function';
        };

        var cat = function(foo, args) {
            return function() {
                try {
                    return foo.apply(this, args || arguments);
                } catch (err) {
                    _onthrow(err);
                    // throw error to parent , hang-up context
                    console && console.log && console.log(["BJ-REPORT"], err.stack);
                    throw new Error("badjs hang-up env");
                    // throw err;
                }
            };
        };

        var catArgs = function(foo) {
            return function() {
                var arg, args = [];
                for (var i = 0, l = arguments.length; i < l; i++) {
                    arg = arguments[i];
                    _isFunction(arg) && (arg = cat(arg));
                    args.push(arg);
                }
                return foo.apply(this, args);
            };
        };

        var catTimeout = function(foo) {
            return function(cb, timeout) {
                // for setTimeout(string, delay)
                if (typeof cb === 'string') {
                    try {
                        cb = new Function(cb);
                    } catch (err) {
                        throw err;
                    }
                }
                var args = [].slice.call(arguments, 2);
                // for setTimeout(function, delay, param1, ...)
                cb = cat(cb, args.length && args);
                return foo(cb, timeout);
            };
        };


        /**
         * makeArgsTry
         * wrap a function's arguments with try & catch
         * @param {Function} foo
         * @param {Object} self
         * @returns {Function}
         */
        var makeArgsTry = function(foo, self) {
            return function() {
                var arg, tmp, args = [];
                for (var i = 0, l = arguments.length; i < l; i++) {
                    arg = arguments[i];
                    _isFunction(arg) && (tmp = cat(arg)) &&
                        (arg.tryWrap = tmp) && (arg = tmp);
                    args.push(arg);
                }
                return foo.apply(self || this, args);
            };
        };

        /**
         * makeObjTry
         * wrap a object's all value with try & catch
         * @param {Function} foo
         * @param {Object} self
         * @returns {Function}
         */
        var makeObjTry = function(obj) {
            var key, value;
            for (key in obj) {
                value = obj[key];
                if (_isFunction(value)) obj[key] = cat(value);
            }
            return obj;
        };

        /**
         * wrap jquery async function ,exp : event.add , event.remove , ajax
         * @returns {Function}
         */
        tryJs.spyJquery = function() {
            var _$ = root.$;

            if (!_$ || !_$.event) {
                return tryJs;
            }

            var _add = _$.event.add,
                _ajax = _$.ajax,
                _remove = _$.event.remove;

            if (_add) {
                _$.event.add = makeArgsTry(_add);
                _$.event.remove = function() {
                    var arg, args = [];
                    for (var i = 0, l = arguments.length; i < l; i++) {
                        arg = arguments[i];
                        _isFunction(arg) && (arg = arg.tryWrap);
                        args.push(arg);
                    }
                    return _remove.apply(this, args);
                };
            }

            if (_ajax) {
                _$.ajax = function(url, setting) {
                    if (!setting) {
                        setting = url;
                        url = undefined;
                    }
                    makeObjTry(setting);
                    if (url) return _ajax.call(_$, url, setting);
                    return _ajax.call(_$, setting);
                };
            }

            return tryJs;
        };


        /**
         * wrap amd or commonjs of function  ,exp :  define , require ,
         * @returns {Function}
         */
        tryJs.spyModules = function() {
            var _require = root.require,
                _define = root.define;
            if (_require && _define) {
                root.require = catArgs(_require);
                _merge(root.require, _require);
                root.define = catArgs(_define);
                _merge(root.define, _define);
            }
            return tryJs;
        };

        /**
         * wrap async of function in window , exp : setTimeout , setInterval
         * @returns {Function}
         */
        tryJs.spySystem = function() {
            root.setTimeout = catTimeout(root.setTimeout);
            root.setInterval = catTimeout(root.setInterval);
            return tryJs;
        };


        /**
         * wrap custom of function ,
         * @param obj - obj or  function
         * @returns {Function}
         */
        tryJs.spyCustom = function(obj) {
            if (_isFunction(obj)) {
                return cat(obj);
            } else {
                return makeObjTry(obj);
            }
        };

        /**
         * run spyJquery() and spyModules() and spySystem()
         * @returns {Function}
         */
        tryJs.spyAll = function() {
            tryJs.spyJquery().spyModules().spySystem();
            return tryJs;
        };



        // if notSupport err.stack , return default function
        try {
            throw new Error("testError");
        } catch (err) {
            if (!err.stack) {
                for (var key in tryJs) {
                    if (_isFunction(tryJs[key])) {
                        tryJs[key] = function() {
                            return tryJs;
                        };
                    }
                }
            }
        }

    }(window));


    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = BJ_REPORT;
        }
        exports.BJ_REPORT = BJ_REPORT;
    }


    return badjs;

}));