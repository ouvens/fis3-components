/**
 * @author littenli
 * @date 2015-5-18 version 1.0
 * @description 上报通用初始化逻辑
 */
define([
    'require',
    'jquery' ,
    'report' ,
    'util.cookie'
], function (require) {

    var $ = require('jquery');
    var report = require('report');
    var utilCookie = require('util.cookie');

    return (function(param){
        var uin = utilCookie.uin();
        var option = {
            uin: uin,  // 必填
            ts: '',  // 必填，留空就行
            opername: 'Edu'
        };

        var cookieConf = report.cookie.getConfig;
        var from = cookieConf.DATA.from;
        var gdt = cookieConf.DATA.qz_gdt;
        var em;

        if(gdt){
            option.ver4 = 17;
            for(em in gdt){
                option.ver5 = gdt[em]["ver5"];
            }
        }else if(from){
            for(em in from){
                if(em){
                    option.ver4 = em;
                    if(from[em].ver5){
                        option.ver5 = from[em].ver5
                    }
                }else{
                    option.ver4 = "4";
                }
            } 
        }

        report.config($.extend(param, option));
    });
});

