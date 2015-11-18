
/**
 * @author cecilpeng
 * @date 2014-03-07
 * @description 群tencent组件
 * @param {Object} opt
 * groupUin 为后台存储群真实号，groupCode为外显群号，fuin为选择处理的QQ
 */
(function (root, factory) {

    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        root['groupTencent'] = factory();
    }
}(this, function () {

var groupTencent = function () {
    //创建iframe跳转，不会打开新窗口
    var iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.name = "tencent_iframe";
    iframe.id = "tencent_iframe";
    document.getElementsByTagName("body")[0].appendChild(iframe);
    //var win = window.frames["tencent_iframe"];
    var win = document.getElementById('tencent_iframe');

    function tencent (type, gid, gcode, fuin) {
        var h = "", g = "", k = "";
        switch (type) {
            case "commonGroup":
                h = "groupwpa";
                g = "all";
                k = '{"groupUin":' + gcode + ',"timeStamp":1383552440}';
                break;
            case "openGroup":
                h = "groupwpa";
                g = "OpenGroup";
                k = '{"ExtParam":{"appId":"0"},"groupUin":' + gid + ',"visitor":1}';
                break;
            case "openGroupVideo":
                h = "groupwpa";
                g = "OpenGroup";
                k = '{"ExtParam":{"appId":"21"},"groupUin":' + gid + ',"visitor":1}';
                break;
            case "openGroupCourse":
                h = "groupwpa";
                g = "OpenGroup";
                k = '{"ExtParam":{"appId":"1101123802"},"groupUin":' + gid + ',"visitor":1}';
                break;
            default :
                break;
        }

        var e,f,i;

        if (h) {
            e = "tencent://" + h + "/?subcmd=" + g + "&param=";
            // encode16
            if (k = k) {
                k += "";
                f = [];
                i = 0;
                for (h = k.length; i < h; i++)
                    f.push(k.charCodeAt(i).toString(16).toUpperCase());
                k = f.join("")
            } else {
                k = k;
            }
            k = e + k + (fuin ? "&fuin=" + fuin : '');
        } else {
            k = "";
        }
        return k
    }


    function setFrameSrc($frame, url){
        if (!$.bom.checkPlatform()) return;

        if($frame !== null){
            if($frame.src){
                $frame.src = url; }
            else if($frame.contentWindow !== null && $frame.contentWindow.location !== null){
                $frame.contentWindow.location = url; }
            else{
                $frame.setAttribute('src', url);
            }
        }
    }

    return {
        join : function (groupCode, fuin) {
            //console.log(win);
            //win.location.href = tencent("commonGroup", '', groupCode, fuin);
            setFrameSrc(win, tencent("commonGroup", '', groupCode, fuin));
        },
        open : function (groupUin, fuin) {
            //win.location.href = tencent("openGroup", groupUin, '', fuin);
            setFrameSrc(win, tencent("openGroup", groupUin, '', fuin));
        },
        openVideo : function (groupUin, fuin) {
            //win.location.href = tencent("openGroup", groupUin, '', fuin);
            setFrameSrc(win, tencent("openGroup", groupUin, '', fuin));
        }
    }
}();

return groupTencent;

}));
