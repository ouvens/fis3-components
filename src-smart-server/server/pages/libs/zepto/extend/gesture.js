define('gesture', function(require, exports, module) {

  //     Zepto.js
  //     (c) 2010-2015 Thomas Fuchs
  'use strict';
  
  (function (root, factory) {
    if (typeof define === 'function' && define.amd) {
      // AMD
      define(['zepto', './detect'], factory);
    } else if (typeof exports === 'object') {
      // Node, CommonJS之类的
      module.exports = factory(require('zepto'), require('detect'));
    } else {
      // 浏览器全局变量(root 即 window)
      root['Zepto'] = factory(root['Zepto']);
    }
  })(undefined, function ($) {
    if ($.os.ios) {
      var gesture, gestureTimeout;
  
      (function () {
        var parentIfText = function parentIfText(node) {
          return 'tagName' in node ? node : node.parentNode;
        };
  
        gesture = {};
  
        $(document).bind('gesturestart', function (e) {
          var now = Date.now(),
              delta = now - (gesture.last || now);
          gesture.target = parentIfText(e.target);
          gestureTimeout && clearTimeout(gestureTimeout);
          gesture.e1 = e.scale;
          gesture.last = now;
        }).bind('gesturechange', function (e) {
          gesture.e2 = e.scale;
        }).bind('gestureend', function (e) {
          if (gesture.e2 > 0) {
            Math.abs(gesture.e1 - gesture.e2) != 0 && $(gesture.target).trigger('pinch') && $(gesture.target).trigger('pinch' + (gesture.e1 - gesture.e2 > 0 ? 'In' : 'Out'));
            gesture.e1 = gesture.e2 = gesture.last = 0;
          } else if ('last' in gesture) {
            gesture = {};
          }
        });['pinch', 'pinchIn', 'pinchOut'].forEach(function (m) {
          $.fn[m] = function (callback) {
            return this.bind(m, callback);
          };
        });
      })();
    }
    return $;
  });
  //     Zepto.js may be freely distributed under the MIT license.

});
