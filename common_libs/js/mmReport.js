define(function() {
    var taskList = [];
    var delay = 1000;
    var timer = null;
    var browser;


    function do_report() { //
        //每次最多上报10条  避免超出 get请求长度限制
        var len = taskList.length;
        if (len > 10) len = 10; //每次最多合并上报10条数据
        var tempArray = taskList.splice(0, len);
        if (tempArray.length == 0) return;

        var uin = tempArray[0].uin;
        var src = "http://c.isdspeed.qq.com/code.cgi?domain=" + conf.domain + "&uin=" + uin + "&apn=" + tempArray[0].apn;
        src += "&key=cgi,type,code,time";
        var attrArray = ["cgi", "type", "code", "time"];

        for (var j = 0; j < attrArray.length; j++) {
            for (var i = 0; i < tempArray.length; i++) {
                var data = tempArray[i];
                src += "&" + (i + 1) + "_" + (j + 1) + "=" + data[attrArray[j]];
            }
        }
        src += "&ignoreRandom=" + Math.random();
        var img = new Image();
        img.src = src;
    }


    var conf = {
        domain: document.domain || 'ke.qq.com', //在线教育平台
        code: null,
        uin: null,
        time: null,
        rate: 1,
        apn: 'pc'
    }

    function mix(a, b) {
        for (var i = 1; i < arguments.length; i++) {
            var obj = arguments[i];
            if (!obj) continue;
            for (var p in obj) {
                a[p] = obj[p];
            }
        }
        return a;
    }

    /**
     * 	
     * @param  {[type]} url  [url,格式前不能带域名或其他非url字段]
     * @param  {[type]} ec   [返回码直接上报 另外ec=0时type为1-表示正常，状态码为4xx-5xx时为2-表示失败，状态码为其他则type为3-表示逻辑失败]
     * @param  {[type]} cost [description]
     * @param  {[type]} uin  [description]
     * @param  {[type]} opt  [description]
     * @return {[type]}      [description]
     */
    function reportMM(url, ec, cost, uin, opt) { //url ec cost opt
        if (timer) clearTimeout(timer);
        var data = mix({}, conf, opt);
        data.cgi = encodeURIComponent(url);
        data.type = ec === 0 ? 1 : 2;
        data.code = ec;
        data.time = cost;
        data.releaseversion = browser || "unknown";
        data.uin = uin;

        if (ec === 0) {
            data.type = 1;
        } else if (/^[4|5][0-9]{2}$/.test(ec)) {
            data.type = 2;
        } else {
            data.type = 3;
        }
        taskList.push(data);
        timer = setTimeout(do_report, delay);
    }


    return {
        report: reportMM
    }
});
