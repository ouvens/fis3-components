
/**
 * main
 * @require './index.scss' // 无需在页面中控制 css
 */

'use strict';

var searchBar = {
    $el: $('#ui-search-bar'),
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
        this.$el.on('click', '.ui-searchbar', function(){
            $('.ui-searchbar-wrap').addClass('focus');
            $('.ui-searchbar-input input').focus();
        });
        this.$el.on('click', '.ui-searchbar-cancel', function(){
            $('.ui-searchbar-wrap').removeClass('focus');
        });
    }
}

module.exports = searchBar;