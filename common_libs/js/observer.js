/**
 * @author littenli
 * @date 2015-7-14 version 1.0
 * @description 观察者模式简单实现
 */
define([], function () {

    var Observer = function() {
        var obj = {};   

        return {
            /**
            *   监听
            *   @param {string} key
            *   @param {function} fn
            */
            listen: function(key, fn) {
                obj[key] = obj[key] || [];

                obj[key].push(fn);

                return this;
            },

            /**
            *   移除监听
            *   @param {string} key     
            */
            remove: function(key) {
                var ref = obj[key];
                if (ref) {
                    ref.length = 0;
                } else {
                    obj[key] = void 0;
                }           
                return this;
            },

            /**
            *   只监听一次
            *   @param {string} key 
            *   @param {function} fn    
            */
            one: function(key, fn) {
                this.remove(key);
                return this.listen(key, fn);
            },

            /**
            *   触发监听        
            */
            trigger: function() {
                var fn, stack, key;

                key = Array.prototype.shift.call(arguments);

                if (obj[key]) {
                    stack = obj[key];   
                } else {
                    stack = obj[key] = [];
                }           

                for (var i = 0, j = stack.length; i < j; i++) {
                    fn = stack[i];
                    if (fn.apply(this, arguments) === false) {
                        return this;
                    }
                }   
                return this;        
            }
        }
    };

    var _obj = {};

    var ObserverHandel = Observer();

    ObserverHandel.get = function(key) {
        if (!_obj[key]) {
            _obj[key] = Observer();
        }
        return _obj[key]
    }

    return ObserverHandel;
});