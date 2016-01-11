/**
 * @description cdn切换逻辑的配置文件
 * @note 注意, 本组件需要配合`im-cdn-switch`组件(bower install im-cdn-switch)以及grunt task使用
 *
 * 使用步骤:
 *
 *    1) 在html里增加detector元素, 设置id(如:`js_cdn_switch_detector`)和class(如:`js_cdn_switch_detector`). 例:
 *
 *    <div id="js_cdn_switch_detector" class="js_cdn_switch_detector" style="height:0;font-size:0;height:0;"></div>
 *
 *    2) 在html的css link区域, 给usemin合并的block内最后,增加一个`im-cdn-switch`组件的css引用,如:
 *
 *    <link rel="stylesheet" href="bower_components/im-cdn-switch/cdn_switch.css">
 *
 *    3) 在require加载主模块的data-main的script下,增加两段inline的script(第一个就是本配置文件,第二个是`im-cdn-switch`组件的js):
 *
 *    script src="js/common/g_cfg_cdn_switch.js?__inline"
 *    script src="bower_components/im-cdn-switch/cdn_switch.js?__inline"
 *
 *    4) 保证grunt-task里有`add_cdn_switch`这个任务
 *
 *
 */

//ID: 406957    名称：容灾-主css失败
//ID: 406958    名称：容灾-主css重试后成功
//ID: 406959    名称：容灾-主css重试后仍失败
//ID: 406960    名称：容灾-主js失败
//ID: 406961    名称：(预留)容灾-主js重试后成功
//ID: 406962    名称：(预留)容灾-主js重试后仍失败

window['g_cfg_cdn_switch'] = (function() {

    var __cdn_switch = function(str) {
        return str;
    };

    return {
        report: {
            'bid': 255 //为了减少耦合, 这个bid配置需要单独在这里配置, 配置的值和g_cfg_proj里的badjsCfg内bid相同即可
        },
        css: {
            'target': __cdn_switch('css/main.min.css'),
            'detector': 'js_cdn_switch_detector',
            'mids': {
                'err': 406957,
                'retry_succ': 406958,
                'retry_err': 406959
            }
        },
        /*
        js: {
            'target': __cdn_switch('js/index_aio.js'),
            'require': __cdn_switch('bower_components/requirejs/require.js'),
            'mids': {
                'err': 365695,
                'retry_succ': 365696,
                'retry_err': 365697
            },
            'require_mids': {
                'err': 365692,
                'retry_succ': 365693,
                'retry_err': 365694
            }
        }
        */
        js: {
            'target': __cdn_switch('js/base.min.js'),
            'detector': 'cdn_switch_detector_js_base',
            'mids': {
                'err': 365695,
                'retry_succ': 365696,
                'retry_err': 365697
            }
        }
    };

})();