/**
 * main
 * @require './index.scss' // 无需在页面中控制 css
 */

var listTpl = require('./index.tpl');

var tips = {
    $el: $('#ui-recmend-list'),

    init: function(data) {

        this._renderData(data);
        this._bindEvent();
    },

    _renderData: function(data) {
        var self = this;
        if(self.$el.data('type')){
            self.$el.html(listTpl({data: data}));
        }
        self.$el.next().hide();
    },

    _bindEvent: function() {

    }
}

module.exports = tips;
