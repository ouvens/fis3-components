/**
 * @author littenli
 * @date 2015-7-13 version 1.0
 * @description 通用检测模块
 */
define([
    'require',
    'jquery',
    'util.cookie'
], function (require) {

    var $ = require('jquery');

    return {
        //是否微信登录用户
        isWeixinUser: function(){
            var uidType = $.cookie.get("uid_type");
            //uid_type类型详见tapd：http://tapd.oa.com/QQConnectSys/wikis/view/uid_account_type_x
            return (uidType == 2)? true: false;
            //return true;
        }
    }
});

