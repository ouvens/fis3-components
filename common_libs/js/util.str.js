/**
 * @fileoverview 工具函数：str处理
 * @example @todo
*/
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else {
        root['jQuery'] = factory(root['jQuery']);
    }
}(this, function ($) {

    $.extend({
        str : {
            byteLen : function (str, len){
                //正则取到中文的个数，然后len*count+原来的长度。不用replace
                var factor = len || 2;
                str += '';
                var tmp = str.match(/[^\x00-\xff]/g) || [];

                var count = tmp.length;
                return str.length + (factor-1)*count;
            },
            //算法可优化
            cut: function (outer, maxH) {
                var $outer = $(outer);
                while ($outer.outerHeight() > maxH) {
                    $outer.text($outer.text().replace(/(\s)*([a-zA-Z0-9]+|\W)(\.\.\.)?$/, "..."));
                };
            },
            cutByte : function (str, len, endstr) {
                var len = +len,
                    endstr = typeof(endstr) == 'undefined' ? "..." : endstr.toString(),
                    endstrBl = this.byteLen(endstr);

                //用于二分法查找
                function n2(a) {
                    var n = a / 2 | 0; 
                    return (n > 0 ? n : 1);
                }

                if (!(str + "").length || !len || len <= 0) {
                    return "";
                }

                if(len<endstrBl){
                    endstr = "";
                    endstrBl = 0;
                }

                var lenS = len - endstrBl;
                var _lenS = 0;
                var _strl = 0;
                while (_strl <= lenS) {
                    var _lenS1 = n2(lenS - _strl),
                    addn = this.byteLen(str.substr(_lenS, _lenS1));
                    if (addn == 0) {return str;}
                    _strl += addn
                    _lenS += _lenS1
                }
                if(str.length - _lenS > endstrBl || this.byteLen(str.substring(_lenS-1))>endstrBl){
                    return str.substr(0, _lenS - 1) + endstr
                }else{
                    return str;
                }    
            }
        }
    });

    return $;
}));
