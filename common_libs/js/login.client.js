/**
 * @fileoverview 登录模块for client
 * @author knightli
*/

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else {
        // Browser globals
        root['Login'] = factory();
    }
}(this, function () {

    //=======  AMD module inner code begin ========

    /**
     * @namespace
     */
    var Login = {
        notLoginCallback : function(param){
            //页面没有登录
            //获取客户端clientkey
            var info = {};
            try {
                info.clientkey = JSON.parse(top.external.Hummer_IM_GetClientKey()).clientKey;
                //info.clientkey = top.external.Hummer_IM_GetClientKey();
                // console.info('clientkey='+info.clientkey);
            }catch(e){
                // console.info('clientkey_catch_e');
            }

            var clientkey = info.clientkey;
            var clientUin = info.uin || $.cookie.uin();
            if(clientkey && clientUin){
                //通过ptlogin客户clientkey Uin跳转
                var httpRequest=document.createElement("iframe");
                var onloadFunction = function(){
                    if(param && typeof(param.succ) == 'function'){
                        param.succ();//登陆成功回调
                    }
                    httpRequest.onload = null;
                    $.e.remove(httpRequest,'load',onloadFunction);
                    document.body.removeChild(httpRequest);
                    httpRequest=null;
                };
                httpRequest.onload = onloadFunction;
                httpRequest.src='http://ptlogin2.qq.com/jump?clientuin='+ clientUin +'&clientkey='+ clientkey +'&u1=' + encodeURIComponent('/login_proxy.html');
                document.body.appendChild(httpRequest);
            }else{
                // console.info('clientkey && clientUin not defined!');
                if(param && typeof(param.err) == 'function'){
                    param.err();//登陆失败回调
                }
            }
        }
    };

    return Login;

    //=======  AMD module inner code end ========

}));
