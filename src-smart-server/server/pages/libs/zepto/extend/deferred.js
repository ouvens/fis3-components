define('deferred', function(require, exports, module) {

  //     Zepto.js
  //     (c) 2010-2015 Thomas Fuchs
  //     Zepto.js may be freely distributed under the MIT license.
  //
  'use strict';
  
  (function (root, factory) {
      if (typeof define === 'function' && define.amd) {
          // AMD
          define(['zepto'], factory);
      } else if (typeof exports === 'object') {
          // Node, CommonJS之类的
          module.exports = factory(require('zepto'));
      } else {
          // 浏览器全局变量(root 即 window)
          root['Zepto'] = factory(root['Zepto']);
      }
  })(undefined, function ($) {
      var slice = Array.prototype.slice;
  
      function Deferred(func) {
          var tuples = [
          // action, add listener, listener list, final state
          ["resolve", "done", $.Callbacks({
              once: 1,
              memory: 1
          }), "resolved"], ["reject", "fail", $.Callbacks({
              once: 1,
              memory: 1
          }), "rejected"], ["notify", "progress", $.Callbacks({
              memory: 1
          })]],
              _state = "pending",
              _promise = {
              state: function state() {
                  return _state;
              },
              always: function always() {
                  deferred.done(arguments).fail(arguments);
                  return this;
              },
              then: function then() /* fnDone [, fnFailed [, fnProgress]] */{
                  var fns = arguments;
                  return Deferred(function (defer) {
                      $.each(tuples, function (i, tuple) {
                          var fn = $.isFunction(fns[i]) && fns[i];
                          deferred[tuple[1]](function () {
                              var returned = fn && fn.apply(this, arguments);
                              if (returned && $.isFunction(returned.promise)) {
                                  returned.promise().done(defer.resolve).fail(defer.reject).progress(defer.notify);
                              } else {
                                  var context = this === _promise ? defer.promise() : this,
                                      values = fn ? [returned] : arguments;
                                  defer[tuple[0] + "With"](context, values);
                              }
                          });
                      });
                      fns = null;
                  }).promise();
              },
  
              promise: function promise(obj) {
                  return obj != null ? $.extend(obj, _promise) : _promise;
              }
          },
              deferred = {};
  
          $.each(tuples, function (i, tuple) {
              var list = tuple[2],
                  stateString = tuple[3];
  
              _promise[tuple[1]] = list.add;
  
              if (stateString) {
                  list.add(function () {
                      _state = stateString;
                  }, tuples[i ^ 1][2].disable, tuples[2][2].lock);
              }
  
              deferred[tuple[0]] = function () {
                  deferred[tuple[0] + "With"](this === deferred ? _promise : this, arguments);
                  return this;
              };
              deferred[tuple[0] + "With"] = list.fireWith;
          });
  
          _promise.promise(deferred);
          if (func) func.call(deferred, deferred);
          return deferred;
      }
  
      $.when = function (sub) {
          var resolveValues = slice.call(arguments),
              len = resolveValues.length,
              i = 0,
              remain = len !== 1 || sub && $.isFunction(sub.promise) ? len : 0,
              deferred = remain === 1 ? sub : Deferred(),
              progressValues,
              progressContexts,
              resolveContexts,
              updateFn = function updateFn(i, ctx, val) {
              return function (value) {
                  ctx[i] = this;
                  val[i] = arguments.length > 1 ? slice.call(arguments) : value;
                  if (val === progressValues) {
                      deferred.notifyWith(ctx, val);
                  } else if (! --remain) {
                      deferred.resolveWith(ctx, val);
                  }
              };
          };
  
          if (len > 1) {
              progressValues = new Array(len);
              progressContexts = new Array(len);
              resolveContexts = new Array(len);
              for (; i < len; ++i) {
                  if (resolveValues[i] && $.isFunction(resolveValues[i].promise)) {
                      resolveValues[i].promise().done(updateFn(i, resolveContexts, resolveValues)).fail(deferred.reject).progress(updateFn(i, progressContexts, progressValues));
                  } else {
                      --remain;
                  }
              }
          }
          if (!remain) deferred.resolveWith(resolveContexts, resolveValues);
          return deferred.promise();
      };
  
      $.Deferred = Deferred;
      return $;
  });
  //     Some code (c) 2005, 2013 jQuery Foundation, Inc. and other contributors

});
