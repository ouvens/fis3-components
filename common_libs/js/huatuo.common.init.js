/**
 * @author littenli
 * @date 2015-9-10 version 1.0
 * @description 华佗上报通用初始化逻辑
 */
define([
    'require',
    'huatuo'
], function (require) {

    var $ = require('jquery');
    var huatuo = require('huatuo');

    var init = function(url, others) {

        /* others为Object，处理特殊上报点，例子：
         * {
         *    delay: 50,
         *    isd: {
         *        'inline_script_run_time': 8
         *    }
         * }
         */
        
        huatuo.cfg.url = url;

        var param = [
            'page_start',       //页面开始时间
            'page_css_ready',
            'page_js_ready',
            'page_main_start',
            'page_main_end',
            'page_render_end',
            'page_render_fp'
        ];

        if (others && others.isd && typeof(others.isd) === 'object') {
            for (var em in others.isd) {
                param.push(em);
            }
        }
        huatuo.report(param, others || {});
    }

    $.initHuatuo = init;
    
    return {
        init: init
    }
});

