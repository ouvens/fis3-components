/**
 * main
 * @require './index.scss' // 无需在页面中控制 css
 */


var localAjax = require('localAjax');
var datePicker = require('date-picker');
var placeholder = require('placeholder');

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
                // dialog.init();
            }
        });
    },

    _initComponent: function(data) {
        datePicker.init();
        placeholder.init();
    },

    _bindEvent: function(data) {
        var self = this;
        self.$el.on('click', '[data-href]', function(){
            /**
             * 按需加载处理方式
             */
            // window.location.href = $(this).data('href');

            /*按需异步模块测试*/
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