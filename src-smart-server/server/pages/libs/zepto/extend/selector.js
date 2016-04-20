define('selector', function(require, exports, module) {

  //     Zepto.js
  //     (c) 2010-2015 Thomas Fuchs
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
      var zepto = $.zepto,
          oldQsa = zepto.qsa,
          oldMatches = zepto.matches;
  
      function _visible(elem) {
          elem = $(elem);
          return !!(elem.width() || elem.height()) && elem.css("display") !== "none";
      }
  
      // Implements a subset from:
      // http://api.jquery.com/category/selectors/jquery-selector-extensions/
      //
      // Each filter function receives the current index, all nodes in the
      // considered set, and a value if there were parentheses. The value
      // of `this` is the node currently being considered. The function returns the
      // resulting node(s), null, or undefined.
      //
      // Complex selectors are not supported:
      //   li:has(label:contains("foo")) + li:has(label:contains("bar"))
      //   ul.inner:first > li
      var filters = $.expr[':'] = {
          visible: function visible() {
              if (_visible(this)) return this;
          },
          hidden: function hidden() {
              if (!_visible(this)) return this;
          },
          selected: function selected() {
              if (this.selected) return this;
          },
          checked: function checked() {
              if (this.checked) return this;
          },
          parent: function parent() {
              return this.parentNode;
          },
          first: function first(idx) {
              if (idx === 0) return this;
          },
          last: function last(idx, nodes) {
              if (idx === nodes.length - 1) return this;
          },
          eq: function eq(idx, _, value) {
              if (idx === value) return this;
          },
          contains: function contains(idx, _, text) {
              if ($(this).text().indexOf(text) > -1) return this;
          },
          has: function has(idx, _, sel) {
              if (zepto.qsa(this, sel).length) return this;
          }
      };
  
      var filterRe = new RegExp('(.*):(\\w+)(?:\\(([^)]+)\\))?$\\s*'),
          childRe = /^\s*>/,
          classTag = 'Zepto' + +new Date();
  
      function process(sel, fn) {
          // quote the hash in `a[href^=#]` expression
          sel = sel.replace(/=#\]/g, '="#"]');
          var filter,
              arg,
              match = filterRe.exec(sel);
          if (match && match[2] in filters) {
              filter = filters[match[2]], arg = match[3];
              sel = match[1];
              if (arg) {
                  var num = Number(arg);
                  if (isNaN(num)) arg = arg.replace(/^["']|["']$/g, '');else arg = num;
              }
          }
          return fn(sel, filter, arg);
      }
  
      zepto.qsa = function (node, selector) {
          return process(selector, function (sel, filter, arg) {
              try {
                  var taggedParent;
                  if (!sel && filter) sel = '*';else if (childRe.test(sel))
                      // support "> *" child queries by tagging the parent node with a
                      // unique class and prepending that classname onto the selector
                      taggedParent = $(node).addClass(classTag), sel = '.' + classTag + ' ' + sel;
  
                  var nodes = oldQsa(node, sel);
              } catch (e) {
                  console.error('error performing selector: %o', selector);
                  throw e;
              } finally {
                  if (taggedParent) taggedParent.removeClass(classTag);
              }
              return !filter ? nodes : zepto.uniq($.map(nodes, function (n, i) {
                  return filter.call(n, i, nodes, arg);
              }));
          });
      };
  
      zepto.matches = function (node, selector) {
          return process(selector, function (sel, filter, arg) {
              return (!sel || oldMatches(node, sel)) && (!filter || filter.call(node, null, arg) === node);
          });
      };
      return $;
  });
  //     Zepto.js may be freely distributed under the MIT license.

});
