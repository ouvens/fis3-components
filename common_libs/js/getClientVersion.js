/*****************
 * 获取客户端QQ版本号
 ***********************/

(function (root, factory) {

    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        root['GetClientVersion'] = factory();
    }
}(this, function () {
    function suportActiveX() {
        var ActiveObjectSuppot = true;
        try {
            if (window.ActiveXObject || window.ActiveXObject.prototype) {
                ActiveObjectSuppot = true;

                /*if (window.ActiveXObject.prototype && !window.ActiveXObject) {
                    $.report.nlog("activeobject 判断有问题"); //ie11，古老的360浏览器会到这里来
                }*/

            } else {
                ActiveObjectSuppot = false;
            }
        } catch (e) {
            ActiveObjectSuppot = false;
        }
        return ActiveObjectSuppot;
    }

    function getNode(tagName,cfg){
        var node = document.createElement(tagName);
        var f = {
            "class":function(){node.className = cfg["class"];},
            "style":function(){node.style.cssText = cfg["style"];}
        }
        for(var prop in cfg){
            if(f[prop])  f[prop]();
            else node.setAttribute(prop,cfg[prop]);
        }

        return node;
    }

    var getClientVersion =  function(){
        return this.clientVersion || (this.clientVersion=(function(){
            var version = -1,retry = 0,embed;
            var get = function(){
                try{
                    if(!suportActiveX()){//chrome、safari、firefox
                        embed = $('webkit_embed').length || document.body.appendChild(getNode('embed',{'id':'webkit_embed','type':'application/qscall-plugin','width':0,'height':0,'hidden':'true'}));//npchrome
                        embed.InitActiveX("TimwpDll.TimwpCheck");
                        version = embed.GetHummerQQVersion();

                    }else{
                        version = (new ActiveXObject("TimwpDll.TimwpCheck")).GetHummerQQVersion() || -1;
                    }
                }catch(e){

                }finally{
                    embed = null;
                }
            }
            //获取版本号
            while(version == -1 && retry < 3){
                get();
                retry ++;
            }
            return version;
        })());
    };

    return getClientVersion;

}));