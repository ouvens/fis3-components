(function () {
    function $(id) {
        return document.getElementById(id);
    }

    //hash算法用bkn生成算法
    function hash(str) {
        var hash = 5381;
        for (var i = 0, len = str.length; i < len; ++i) {
            hash += (hash << 5) + str.charAt(i) .charCodeAt();
        }
        return hash & 2147483647;
    }
    //提取url中的域名部分
    function getHost(url) {
        var match = url.match(/.*\:\/\/([^\/]*).*/);
        return match[1];
    }

    //获取外部CSS节点集合
    function getLinkElements() {
        var links = [],
            nodeList = [].concat.apply([], document.getElementsByTagName('LINK'));
        for (var i = 0, len = nodeList.length; i < len; i++) {
            var node = nodeList[i];
            if (node.rel == 'stylesheet') {
                node.relNodeId = '_' + hash(node.href);
                node.oriUrl = node.href;
                links.push(node);
            }
        }
        return links;
    }

    //获取节点的display属性值
    function getDisplayStyle(el) {
        return window.getComputedStyle ? window.getComputedStyle(el, null)['display'] : el.currentStyle['display'];
    }

    //检查css文件是否加载成功：若节点的display属性为none，表示加载成功
    function check(link) {
        return getDisplayStyle($(link.relNodeId)) == 'none';
    }

    //创建探测节点
    function genChecker(id) {
        var el = document.createElement('DIV');
        el.id = id;
        el.style = 'position:absolute;height:0;display:block;';
        //el.className = 'js-css-checker';
        return el;
    }

    function detachChecker(id) {
        var checker = $(id);
        if (checker) {
            checker.parentNode.removeChild(checker);
        }
        checker = null;
    }

    //重试样式文件：默认切回主域
    function retry(link, rule) {
        var fileName = link.href,
            host = getHost(fileName);
        if (rule) {
            link.href = rule(fileName);
        } else {
            link.href = fileName.replace(host + '/edu', location.host);
        }
    }

    function init() {

        var links = getLinkElements(),//link节点集合
            failLinks = [],//拉失败的link节点集合
            domCache = document.createDocumentFragment();

        //添加探测节点到dom树上
        for (i = 0, len = links.length; i < len; i++) {
            domCache.appendChild(genChecker(links[i].relNodeId));
        }
        document.body.appendChild(domCache);
        domCache = null;

        //逐个检查探测节点，探测到失败时重试
        for (var i = 0, len = links.length; i < len; i++) {
            var link = links[i];
            if (!check(link)) {
                retry(link);
                failLinks.push(link);
            }
        }

        var failLinkNum = failLinks.length,
            startCheckTime = +new Date;
        //检查重试的情况&上报
        if (failLinkNum > 0) {

            setTimeout(repeatCheck, 1000);
            Badjs('拉取失败的样式文件列表:' + getFailureFileList(), location.href, 0, 445440, 4);

        } else {

            release();

        }

        function getRunTime() {
            return new Date - startCheckTime;
        }

        function repeatCheck() {
            var curFailLinkNum = failLinks.length, link;
            for (var len = curFailLinkNum - 1; len > - 1; len--) {
                link = failLinks[len];
                if (check(link)) {
                    failLinks.splice(len, 1);
                }
            }
            if (failLinks.length > 0) {

                if(getRunTime() < 3 * 1000) {

                    setTimeout(repeatCheck, 1000);
                    if (curFailLinkNum > failLinks.length) {
                        Badjs('部分样式文件仍没拉下来:' + getFailureFileList() + ', 耗时:' + getRunTime(), location.href, 0, 0, 4);
                    }

                } else {

                    Badjs('10秒都没拉下来的文件列表:' + getFailureFileList() + ', 耗时:' + getRunTime(), location.href, 0, 445443, 4);
                    release();

                }

            } else {

                Badjs('所有样式文件都重试成功，耗时: ' + getRunTime(), location.href, 0, 445441, 1);
            }
        }

        function getFailureFileList() {
            var buf = [];
            for (var i = 0, len = failLinks.length; i < len; i++) {
                buf.push(failLinks[i].oriUrl);
            }
            return buf.join(', ');
        }

        function release() {
            for (var i = 0, len = links.length; i < len; i++) {
                var link = links[i];
                detachChecker(link.relNodeId);
                delete link.relNodeId;
                delete link.oriUrl;
            }
            links = failLinks = null;
        }

    }
    init();
}());