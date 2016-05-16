/**
 * main
 * @require './index.scss' // 无需在页面中控制 css
 */

var localAjax = require('localAjax');

var getUrlParam = function(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg); //匹配目标参数
    if (r != null) {
        return unescape(r[2]);
    }
    return null; //返回参数值
};

var searchBar = require('search-bar');
var pageMenu = require('page-menu');
var dialog = require('dialog');
var banner2 = require('banner-2');
var banner3 = require('banner-3');
var slider = require('slider');
var tab = require('tab');
var panel3 = require('panel-3');
// var tpl = require('./index.tpl');

// window.r 用于判断是否使用浏览器端拉数据渲染，有r且含有值则使用浏览器端渲染
window.r = getUrlParam('r');

var page = {
    $el: $('body'),

    init: function() {
        this._renderData();
    },

    _renderData: function() {
        var self = this;
        self._ajaxData();
    },

    _ajaxData: function() {
        var self = this;
        $.localAjax({
            url: '../mock/indexPage.json',
            method: 'get',
            dataType: 'json',
            data: {},
            done: function(data) {
                self._initComponent(data.result);
                self._bindEvent(data.result);
            },
            fail: function(msg) {
                dialog.init();
            }
        });
    },

    _initComponent: function(data) {

        searchBar.init(data && data.keywords);
        pageMenu.init(data && data.pageMenu);

        slider.init(data && data.slider);
        banner2.init(data && data.banner2);
        banner3.init(data && data.banner3);

        tab.init(data && data.tabs);
        panel3.init(data && data.panel3);

    },

    _bindEvent: function(data) {

        var self = this;
        self.$el.on('click', '[data-href]', function() {
            /**
             * 按需加载处理方式
             */
            // window.location.href = $(this).data('href');

            // 按需异步模块测试
            require.async(['testMod'], function(Mod) {
                Mod.init();
            });
            require.async(['testMod1'], function(Mod) {
                Mod.init();
            });
        });
    }
};

module.exports = page;