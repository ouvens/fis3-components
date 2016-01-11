
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else {
        factory(root['jQuery']);
    }
}(this, function ($) {
    $.extend({
        task : function () {
            var tasks = [];
            var taskId;
            var INTERVAL_TIME = 100;

            /**
             * 如果task返回false，则停止该任务
             */
            function execTasks() {
                var len = tasks.length;
                var i = 0;
                while (i < len) {
                    var task = tasks[i];
                    if (!task) {
                        break;
                    }
                    if (task() === false) {
                        len--;
                        tasks.splice(i, 1);
                        continue;
                    }
                    i++;
                }
                stop();
            }

            function stop() {
                if (!tasks.length) {
                    clearInterval(taskId);
                    taskId = null;
                }
            }

            return {
                add:function (task) {
                    if (!$.isFunction(task) || $.inArray(task, tasks) != -1) {
                        return;
                    }
                    tasks.push(task);
                    if (!taskId) {
                        taskId = setInterval(execTasks, INTERVAL_TIME);
                    }
                },
                remove:function (task) {
                    if (!$.isFunction(task) || (task = $.inArray(task, tasks)) == -1) {
                        return;
                    }
                    tasks.splice(task, 1);
                    stop();
                }
            };
        }(),
        image : {
            load : function() {
                var callbacks = {};

                function execCallbacks(img, succ, url) {
                    var cbList = callbacks[url];
                    delete callbacks[url];
                    var len = cbList && cbList.length;
                    if (!len) {
                        return;
                    }
                    cbList[0].call(img, succ);
                    var oriSrc = img.oriSrc;
                    for (var i = 1; i < len; i++) {
                        img = new Image();
                        img.src = url;
                        img.oriSrc = oriSrc;
                        cbList[i].call(img, succ);
                    }
                }

                return function (url, defaultUrl, callback) {
                    if ($.isFunction(defaultUrl)) {
                        callback = defaultUrl;
                    }
                    var cbList = callbacks[url];
                    if (cbList) {
                        $.isFunction(callback) && cbList.push(callback);
                        return;
                    }
                    callbacks[url] = $.isFunction(callback) ? [callback] : [];
                    (typeof defaultUrl != 'string') && (defaultUrl = false);
                    var img = new Image();
                    img.oriSrc = url;
                    var destory = function (succ) {
                        execCallbacks(img, succ, url);
                        img = img.onerror = img.onload = null;
                        $.task.remove(ready);
                    };

                    var ready = function () {
                        if (!img) {
                            return false;
                        }
                        if (img.width > 30 || img.height > 30) {
                            destory(true);
                        }
                    };

                    var reloadCount = 0;
                    img.onerror = function () {
                        switch (++reloadCount) {
                            case 1:
                                img.src = url;
                                break;
                            case 2:
                                defaultUrl ? (img.src = defaultUrl) : destory(false);
                                break;
                            default:
                                destory(false);
                        }
                    };

                    img.onload = function () {
                        destory(true);
                    };
                    img.src = url;
                    $.task.add(ready);
                };
            }()
        }
    });
}));