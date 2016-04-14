var localAjax = require('localAjax');
var dialog = require('dialog');
var choiceList = require('choice-list');

var page = {
    $el: $('body'),
    init: function() {
        this. _renderData();
    },

   _renderData:function(){
        this._ajaxData();
   },
   _ajaxData : function(){
        var self = this;
        $.localAjax({
            url:'data/detailPage.json',
            method:'get',
            dataType:'json',
            data:{},
            done:function(data){
                self._initComponent(data.result);
            },
            fail:function(msg){
                dialog.init();
            }
        });
   },
    _initComponent: function(data) {
        
        //console.log(data.titleName);

        choiceList.init(data.titleName,data.dataList);

    }

   
}

module.exports = page;