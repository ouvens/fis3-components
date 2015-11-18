(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define('base', [
        	'require',
            'jquery',
            'TRecord',
            'es5-safe.wrapper',
            'util.cookie',
            'util.bom',
            'util.str',
            'jquery.lazyload',
            'jquery.slider',
            'jquery.share',
            'jquery.spin',
            'html',
            'report',
            'report.attr',
            'report.cookie',
            'report.common.init',
            'huatuo',
            'huatuo.common.init',
            'login',
            'db',
            'render',
            'header',
            'commonTemplate/common',
            'dialog',
            'modal',
            'strEllipsis',
            'monitorTencentOpen',
            /*'zoomDetect.core',
            'zoomDetect',*/
            'cache',
            'anti_emebed',
            'side_operation'
        	], factory);//TODO: simple from template
    } else {
        factory(root['jQuery']);
    }
}(this, function (require) {

	var $ = require('jquery');

	$.extend({
		cookie: require('util.cookie'),
		bom: require('util.bom'),
		str: require('util.str'),
        initReport: require('report.common.init'),
        loadScript: function (url, callback) {
            $.ajax({
                type: 'GET',
                url: url,
                success: callback,
                dataType: 'script',
                cache: true

            });
        }
	});

    // 初始逻辑，@todo 清理模版、html上的全局变量（如 onclick="xxx()"）
    window['html'] = require('html');
    window['cdn_switch_detector_js_base'] = 1;  // 检测cdn加载对吗（有问题找knight）
    window['strEllipsis'] = require('strEllipsis');
    window['TRecord'] = require('TRecord');

    // 一些公共初始化逻辑，@todo 整理这块的逻辑，比如 Header 模块里面自己调用 自己的 init这种情况，需要尽量避免
    var monitorTencentOpen = require('monitorTencentOpen');
    monitorTencentOpen && monitorTencentOpen.init && monitorTencentOpen.init();

    var Header = require('header');
    Header && Header.init && Header.init();

    var side_open = require('side_operation');
    side_open && setTimeout(function(){
        side_open.init && side_open.init();
    }, 0);
}));

window['BASE_LOAD_SUCC_FLAG'] = 1;
