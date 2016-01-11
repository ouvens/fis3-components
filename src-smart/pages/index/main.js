/**
 * main
 * @require './index.scss' // 无需在页面中控制 css
 */

var localAjax = require('localAjax');

var dialog = require('dialog');
var tab = require('tab');
var slider = require('slider');
var searchBar = require('search-bar');
var pageMenu = require('page-menu');
var banner2 = require('banner-2');
var banner3 = require('banner-3');
var panel3 = require('panel-3');
var tpl = require('./index.tpl');

var page = {
    $el: $('body'),
    init: function() {
        this._renderData();
    },

    _renderData: function() {
        this._ajaxData();
    },

    _ajaxData: function() {
        var self = this;
        $.localAjax({
            url: 'data/indexPage.json',
            method: 'get',
            dataType: 'json',
            data: {},
            done: function(data){
                self._initComponent(data.result);
                self._bindEvent(data.result);
            },
            fail: function(msg){
                dialog.init();
            }
        });
    },

    _initComponent: function(data) {

        searchBar.init(data.keywords);
        pageMenu.init(data.pageMenu);
        banner2.init(data.banner2);
        slider.init(data.slider);
        banner3.init(data.banner3);
        tab.init(data.tabs);
        panel3.init(data.panel3);

    },

    _bindEvent: function(data) {
        var self = this;
        self.$el.on('click', '[data-href]', function(){
            /**
             * 按需加载处理方式
             */
            // window.location.href = $(this).data('href');

            /*异步模块测试*/
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