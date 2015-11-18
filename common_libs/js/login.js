/**
 * @author fredwu
 * @date 2013-12-29
 * @description 登录组件
 * @param {Object} opt
    {
       needMask: true,   //是否需要蒙板, 默认为"true"
       mode: 'xui',      //支持降域（ui）和不降域(xui)两种登录模式，默认为"xui"不降域
       closeIcon: false, //是否需要右上角的关闭icon，默认为"false"不需要
       target: 'self',   //指定登录后的重定向的页面窗口（top|parent|self）,默认为“self”
       appid: 715030901, //业务向ptlogin2申请的ID,
       succUrl: 'url',  //成功跳转的url,需要业务encodeURIComponent，降域方式默认为“http：//ui.ptlogin2.qq.com/login_proxy.html”，
                        //非降域方式默认为："http://id.qq.com/login_proxy.html"
       proxyUrl: 'url'  //代理页面URL，用于在不降域的情况下页面与父页面在IE6/7下进行通信, ,需要业务encodeURIComponent，
                        //默认为“http://id.qq.com/login_proxy.html”，切记将proxy.html文件拷到站点的根目录下
   }
 * @example Login.show({succ: function () {console.log('login success')}})
 */

/**
 * jQuery全局事件抛出
 * login 登录成功
 * loginShow 登录框显示
 * loginCancel 登录框隐藏（并未登录）
 * logout 登录态丢失（这个处理在DB层）
 *        或主动登出（由于目前logout处理是reload页面，所以当前不触发该事件）
 * @example $(document).on('login', function () { console.log('login success') });
 */


(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['check', 'observer'], factory);
    } else {
        root['Login'] = factory();
    }
}(this, function (Check, Observer) {

    var global = window;
    
    // 各种状态变量
    var status = {
        curUin: 0
    };

    //防止被多次加载
    if (global['Login'] ) {
        return global['Login'];
    };

    //------------  通用方法代码块 start ---------------------------------------------
    function $(n) {
        return typeof(n) === "string" ? document.getElementById(n) : n;
    }

    function extend(dst, src){
        if (arguments.length < 2) {
            return extend(this, dst);
        } else {
            dst = dst || {};
            for(var prop in src){
                dst[prop] = src[prop];
            }
        }
        return dst;
    }

    //获得cookie值
    function getCookie(n){
        var m = document.cookie.match(new RegExp( "(^| )"+n+"=([^;]*)(;|$)"));
        return !m ? "":decodeURIComponent(m[2]);
    }

    function uin(){
        var u = getCookie("uin");
        return !u ? null : parseInt(u.substring(1, u.length),10);
    }

    function skey(){
        return getCookie("skey");
    }
    //删除cookie
    function delCookie(name, domain, path) {
        document.cookie = name + "=; expires=Mon, 26 Jul 1997 05:00:00 GMT; path="+ (path ? path :"/")+ "; "
            + (domain ? ("domain=" + domain + ";") : "");
    }

    function addEvent( obj, type, fn ) {
        if (obj.attachEvent) {
            obj.attachEvent('on' + type, fn);
        } else {
            obj.addEventListener( type, fn, false);
        }
    }

    function removeEvent( obj, type, fn ) {
        if ( obj.detachEvent ) {
            obj.detachEvent('on' + type, fn);
        } else {
            obj.removeEventListener(type, fn, false);
        }
    }

    function str2JSON(str) {
        var __pt_json = eval('(' + str + ')');
        return __pt_json;
    }
    //------------  通用方法代码块 end ---------------------------------------------

    //------------  微信长轮询 start ---------------------------------------------
    var longpoll = {
        timeout: null,
        timespace: 2000,
        handle: function(){
            var self = this;
            if(Check.isWeixinUser()){
                clearTimeout(self.timeout);
                Observer.get('login').trigger('weixinDone');
            }
        },
        init: function(){
            var self = this;
            clearTimeout(self.timeout);
            self.timeout = setInterval(function(){
                self.handle();
            }, self.timespace);
        },
        destroy: function(){
            clearTimeout(self.timeout);
        }
    }
    //------------  微信长轮询 end ---------------------------------------------

    //各种配置项
    var config = {
        needMask: true,
        mode: 'xui',
        closeIcon: true,
        target: 'self',
        appid: 715030901
    };

    var hostDomain= (location.hostname.match(/(\.\w+){2}$/) || ['.' + location.hostname])[0];

    var userConfig = {}, ptConfig = {};

    var __cbSucc = [], __cbClose = [];

    var onStatusChanged;

    var undefined;

    var outer, loginFrame, mask, isShowFrame = false;

    function showMask(opt) {
        mask = document.createElement('div');
        mask.className = "ptlogin-mask";
        mask.style.cssText = 'position:fixed;_position:absolute;width:100%;height:100%;padding:0;' +
            'margin:0;left:0;top:0; z-index:999;filter:alpha(opacity=80);opacity:0.8;background-color:gray;';
        document.body.appendChild(mask);
    }

    function showFrame(url){

        outer = document.createElement('div');
        outer.footerHeight = 52; //底部“微信登录”工具条高度
        outer.className = "ptlogin-wrap";
        outer.wrapHeight = 414 + outer.footerHeight;
        outer.marginTop = -(outer.wrapHeight / 2);
        outer.style.cssText = 'position:fixed;_position:absolute;visibility:hidden;width:490px;height:'+ outer.wrapHeight +'px;' +
        'padding:0;margin-left:-245px; margin-top:'+ outer.marginTop + 'px; left:50%; top: 50%; z-index:1000;';
        outer.innerHTML = '<iframe  name="login_frame" src="' + url + ' "frameborder="0" scrolling="no" width="100%" height="100%"></iframe>' +
        '<div class="ptlogin-toolbar"><span class="toolbar-span"><p class="other-way">其他登录方式：</p><i class="btn-weixin js-login-weixin">微信登录</i></span></div>';
        loginFrame = outer.firstChild;
        document.body.appendChild(outer);
    }

    //微信登录处理
    function weixinHandle(){
        var url = "http://ke.qq.com/weixinCallBack.html";
        var src = 'http://open.weixin.qq.com/connect/qrconnect?appid=wxa1fd810b3796f1a4' +
            '&redirect_uri=' + encodeURIComponent('http://ke.qq.com/cgi-bin/uidaccount/login?ttype=4&account_type=2' +
            '&appid=wxa1fd810b3796f1a4&buz_id=122052647&redirect_uri='+encodeURIComponent(url)) +
            '&response_type=code&scope=snsapi_login#wechat_redirect';
        var feature = "location=yes,left=755,top=225,width=400,height=570,resizable=yes";
        var newWindow = window.open(src, "wechat", feature);
        newWindow.focus();
        longpoll.init();
    }

    function makeLoginUrl(options) {

        var param = {
            'target': ptConfig.target,
            'appid': ptConfig.appid,
            'hide_close_icon': 1 - !!ptConfig.closeIcon,
            's_url': ptConfig.succUrl
        };

        var strBuffer = [];
        var jumpUrl = '/login_proxy.html' + (options.domain ? '#domain='+options.domain : '');
        if (ptConfig.mode === 'xui') {
            strBuffer.push('http://xui.ptlogin2' + hostDomain +'/cgi-bin/xlogin?');
            var pureUrl = location.href.split(/#|\?/)[0],
                startFileName = pureUrl.indexOf('/', pureUrl.indexOf('//') + 2);
            var proxyUrl = encodeURIComponent((startFileName !== -1 ? pureUrl.substring(0, startFileName) : pureUrl) + jumpUrl);
            param['proxy_url'] = ptConfig.proxyUrl || proxyUrl;
            param['s_url'] = ptConfig.succUrl || proxyUrl;
        } else {
            param['s_url'] = ptConfig.succUrl || encodeURIComponent('http://ui.ptlogin2.' + hostDomain + jumpUrl);
            strBuffer.push('http://ui.ptlogin2' + hostDomain + '/cgi-bin/login?');
        }
        ptConfig.style && (param['style'] = ptConfig.style);
        for (var key in param) {
            strBuffer.push(key + "=" + param[key]);
        }

        return strBuffer.join('&');
    }

    //------------  h5 message api封装 start ---------------------------------------------

    function onmessage(event) {
        var msg = event || global.event; // 此处兼容IE8
        if ((event.origin || '').indexOf('ptlogin2') === -1) return;

        var data;
        if (typeof JSON !== 'undefined')
            data = JSON.parse(msg.data);
        else
            data = str2JSON(msg.data);

        switch (data.action) {
            case 'close':
                global.ptlogin2_onClose();
                break;

            case 'resize':
                global.ptlogin2_onResize(data.width, data.height);
                break;
        }
    }


    function bindMessageAPI() {
        if (typeof global.postMessage !== 'undefined') {
            addEvent(global, 'message', onmessage);
        }
    }

    function unbindMessageAPI() {
        if (typeof global.postMessage !== 'undefined') {
            removeEvent(global, 'message', onmessage);
        }
    }
    //----------- h5 message api封装 end ---------------------------------------------


    //----------- 统一登录回调方法 start ---------------------------------------------

    global['ptlogin2_onClose'] = function () {
        execTasks(__cbClose);
        // 如果有jQuery 触发loginCancel全局事件
        if(global.jQuery){
            global.jQuery.event.trigger("loginCancel");
        }
        hide();
        //清除微信轮询
        clearTimeout(longpoll.timeout);
    }

    global['ptlogin2_onResize'] = function (width, height) {
        //console.log('ptlogin2_onResize', width, height);
        //获得浮动Div对象
        if (outer)	{
            outer.wrapHeight = height + outer.footerHeight;
            outer.marginTop = -(outer.wrapHeight / 2);
            //重新设置大小注意，一定要加px，否则firefox下有问题
            outer.style.width = width + "px";
            outer.style.height = outer.wrapHeight + "px";
            outer.style.marginLeft = -width / 2  + 'px';
            outer.style.marginTop = outer.marginTop  + 'px';
            outer.style.visibility = "visible";

            outer.getElementsByClassName("js-login-weixin")[0].onclick = weixinHandle;

        }
    }

    global['ptlogin2_login_ok'] = function (obj){
        //如果是微信用户切到qq用户 - 飞机票场景
        if(!status.uin){
            delCookie("uid_a2", hostDomain);
            delCookie("uid_type", hostDomain);
            delCookie("uid_uin", hostDomain);
        }
        execTasks(__cbSucc);
        // 如果有jQuery 触发login全局事件
        if(global.jQuery){
            global.jQuery.event.trigger("login");
        }
        onStatusChanged && onStatusChanged();
        hide();
    }

    //执行回调任务
    function execTasks(tasks) {
        for (var i = 0, len = (tasks|| []).length; i < len; i++) {
            try {
                tasks[i]();
            } catch (e) {

            }
        }
    }

    function setUin(uin){
        status.uin = uin;
    }

    function isUinChanged(){
        return status.uin != uin();
    }

    //----------- 统一登录回调方法 end ---------------------------------------------

    //----------- 外部接口 start ---------------------------------------------
    /**
     * @description 显示登录面板
     */
    function setOpt(opt) {
        if (!opt) return;
        opt.succ && (__cbSucc.push(opt.succ));
        opt.close && (__cbClose.push(opt.close));
        for(var key in opt){
            if(typeof opt[key] !== 'undefined') userConfig[key] = opt[key];
        }
    }
    /**
     * @description 初始化登录面板
     */
    function init(opt){
        opt && opt.onStatusChanged && (onStatusChanged = opt.onStatusChanged);
        if (outer) {
            opt && setOpt({succ: opt.succ, close: opt.close});
            return;
        }
        setOpt(opt);
    }

    /**
     * @description 显示登录面板
     */
    function show(opt) {
        opt = opt || {};
        if (outer) {
            opt && setOpt({succ: opt.succ, close: opt.close});
            return;
        }

        setOpt(opt);

        if (!isShowFrame) {
            isShowFrame = true;
            extend(extend(ptConfig, config), userConfig);
            ptConfig.needMask && showMask(ptConfig);

            showFrame(makeLoginUrl({domain:opt.domain || ''}));
            // 如果有jQuery 触发loginShow全局事件
            if(global.jQuery){
                global.jQuery.event.trigger("loginShow");
            }
            ptConfig.mode === 'xui' && bindMessageAPI();
        }
    }

    /**
     * @description 隐藏登录面板
     */
    function hide() {
        isShowFrame = false;
        if (outer) {
            document.body.removeChild(outer);
            outer = loginFrame = undefined;
        }

        if (mask) {
            document.body.removeChild(mask);
            mask = undefined;
        }
        __cbSucc = [];
        __cbClose = [];
        ptConfig.mode === 'xui' && unbindMessageAPI();
    }

    /**
     * @description 退出登录(删除登录态)
     */
    function logout(){
        //qq
        delCookie("uin", hostDomain);
        delCookie("skey", hostDomain);
        delCookie("lskey", hostDomain);
        //weixin
        delCookie("uid_a2", hostDomain);
        delCookie("uid_type", hostDomain);
        delCookie("uid_uin", hostDomain);

        //clear path 
        if(global.jQuery){
            global.jQuery.event.trigger("logout");
        }

        onStatusChanged && onStatusChanged();
        location.reload();
    }
    /**
     * 检查是否有登录态
     * @return {Boolean} true：有，false：无
     */
    function isLogin() {
        return (!!getCookie('uin') && !!getCookie('skey')) || (!!getCookie('uid_uin') && !!getCookie('uid_a2'));
    }
    //----------- 外部接口 end ---------------------------------------------

    return {
        init: init,
        show: show,
        hide: hide,
        logout: logout,
        isLogin: isLogin,
        uin: uin,
        skey: skey,
        setUin: setUin,
        isUinChanged: isUinChanged
    };

}));

