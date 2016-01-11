/**
 * main
 * @require './index.scss' // 无需在页面中控制 css
 */

var dialog = require('dialog');
var tab = require('tab');
var slider = require('slider');
var searchBar = require('search-bar');
var pageMenu = require('page-menu');
var tpl = require('./index.tpl')

var page = {
    $el: $('body'),
    init: function() {
        this._renderData();
        this._bindEvent();

        $('body').append(tpl({
            word:'KKK'
        }))
    },

    _renderData: function() {
        this._ajaxData();
    },

    _ajaxData: function() {

    },

    _bindEvent: function() {
        dialog.init();
        tab.init();
        slider.init();
        searchBar.init();
        pageMenu.init();
    }
}

module.exports = page;