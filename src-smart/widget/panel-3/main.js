/**
 * main
 * @require './index.scss' // 无需在页面中控制 css
 */

/**
    content string  ''  提示内容，用来填充模板
    stayTime    int 1000    提示停留时间，过了这个时间自动隐藏，设置0则不自动隐藏
    type    string  'info'  提示类型，可选info|warn|success
    callback    funtion function(){}    回调函数，第一个参数指示回调类型，目前有两种show|hide
 */
 
var tips = {
    $el: $('.ui-panel'),

    init: function() {

        this._renderData();
        this._bindEvent();
    },

    _renderData: function() {
        this._ajaxData();
    },

    _ajaxData: function() {

    },

    _bindEvent: function() {
    }
}

module.exports = tips;
