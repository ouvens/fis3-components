/**
 * @fileoverview 状态码统一处理,供DB的error判断是否阻止默认事件
 * @author herbertliu
*/
(function (root, factory) {

    // 模块规范之：依赖声明
    if (typeof define === 'function' && define.amd) {

        define([], factory);
    } else {

        root['FilterRetcode'] = factory();
    }
}(this, function () {

    return function(data) {
        var msg = '', opt = {};
        var ec = data.retcode || data.ec;
        switch (ec) {
            case 101404://课程不存在
                window.location.href = '/404.html';
                return true;
            default :
                return false;
        }
    };

}));
