
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        // @TODO 去掉对simple的依赖
        define([], factory);//TODO: simple from template
        //define(['jquery','./log', './login','./proj_cfg'], factory);//TODO: simple from template
    } else {
        // Browser globals
        root['localData'] = factory();
    }
}(this, function () {

    var rkey = /^[0-9A-Za-z_@-]*$/;
    var store;

    function init() {
        if (typeof store == 'undefined') {
            store = window['localStorage'];
        }
        return true;
    }

    function isValidKey(key) {
        if (typeof key != 'string') {
            return false;
        }
        return rkey.test(key);
    }

    return {
        set:function (key, value) {
            var success = false;
            if (isValidKey(key) && init()) {
                try {
                    value += '';
                    store.setItem(key, value);
                    success = true;
                } catch (e) {}
            }
            return success;
        },
        get:function (key) {
            if (isValidKey(key) && init()) {
                try {
                    return store.getItem(key);
                } catch (e) {}
            }
            return null;
        },
        remove:function (key) {
            if (isValidKey(key) && init()) {
                try {
                    store.removeItem(key);
                    return true;
                } catch (e) {}
            }
            return false;
        },
        clear : function () {
            if (init()) {
                try {
                    for (var o in store) {
                        store.removeItem(o);
                    }
                    return true;
                } catch (e) {}
            }
            return false;
        }
    };

}));
