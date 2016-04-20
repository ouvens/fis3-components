define('placeholder', function(require, exports, module) {

  /*
   * jQuery placeholder, fix for IE6,7,8,9
   * @author JENA
   * @since 20131115.1504
   * @website ishere.cn
   */
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
          root['Placeholder'] = factory(root['Zepto']);
      }
  })(undefined, function ($) {
  
      var check = function check() {
          return 'placeholder' in document.createElement('input');
      };
      var fix = function fix($) {
          $('input[placeholder]').each(function () {
              var self = $(this),
                  txt = self.attr('placeholder');
              self.find('input[placeholder]').css({
                  position: 'relative'
              });
              var holder = $('<span class="placeholder"></span>').text(txt).css({
                  position: 'absolute',
                  color: '#aaa',
                  top: 10
              });
  
              self.after(holder);
  
              holder.on('focusin', function () {
                  holder.hide();
              }).on('focusout', function () {
                  if (!self.val()) {
                      holder.show();
                  }
              }).on('click', function () {
                  holder.hide();
                  self.focus();
              });
  
              self.on('focusin', function () {
                  holder.hide();
              }).on('focusout', function () {
                  if (!self.val()) {
                      holder.show();
                  }
              }).on('click', function () {
                  holder.hide();
                  self.focus();
              });
          });
      };
  
      exports = {
          init: function init($) {
              if (!check()) {
                  fix($);
              }
          }
      };
  
      $.placeholder = exports;
      return exports;
  });

});
