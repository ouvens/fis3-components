
//首屏DOM操作
(function () {
    function getRegText(n) {
        return "(^|&|\\?)" + n + "=([^&]*)(&|$)";
    }
    function getValue(mainString, n) {
        var m = mainString.match(getRegText(n));
        return !m ? undefined: decodeURIComponent(m[2])
    }
    function $(n) {
        return document.getElementById(n)
    }
    //被广点通嵌入时，隐藏head头
    //http://shang.qq.com/v3/tutorial.html

    var searchString = location.search || '';
    var outer = getValue(searchString, 'outer');
    if (outer == '1' && /\.ke\.qq\.com$/.test(location.hostname)) {
        $('js_main_nav').style.display = 'none';
    }

    /*var data = window.name || '',
        role = +getValue(data, 'role'),
        platRole = +getValue(data, 'plat_role'),
        nick = getValue(data, 'nick') || '',
        uin = getValue(data,'uin'),
        agencyManage = $('js_agency_manage'),
        agencyJoin = $('js_agency_join');*/
    
    
    //未知,普通用户
    // @备忘 导航改版，“机构管理”的入口放到其他地方
    // if (role == 0 || role == 3 ) {
    //     agencyJoin.style.display = 'block';
    //     //拥有平台权限
    // }  else if(platRole == 1){
    //     agencyManage.style.display = 'block';
    // }

    // var loginTmpl = '<a class="nick" href="http://ke.qq.com/user/index/index.html" id="js_nick" target="_blank" title="<%=nick%>"><%=nick%></a><a href="javascript:void(0)" data-hook="logout" class="logout js-login-op" report-tdw="action=pt-logout">退出</a>';
    // var loginTmpl = '<i class="icon-red-circle" style="display:none"></i>\
    //                 <img src="<%=avatar%>" alt="" class="mod-header__user-img" width="38" height="38" />\
    //                 <span href="#" class="mod-header__my-course">我的课表</span>';
    // var loginOuter = $('js_logout_outer');

    // if (nick) {

    //     loginOuter.style.display = "";
    //     $('js_login').style.display = "none";
    //     $('js_logout').style.display = "";

    //     loginOuter.innerHTML = loginTmpl.replace(/<%=nick%>/g, nick)
    //                                     .replace(/<%=avatar%>/, 'http://q.qlogo.cn/g?b=qq&nk='+uin+'&s=100');
    // }


    // @todo 待确认，还有没有其他地方也会给这个节点绑定事件？
    /*var nav = $('js_main_nav');
    nav.onclick = function(evt){
        evt = evt || window.event;
        var target = evt.target || evt.srcElement;
        var href;

        if(!(href = target.getAttribute('data-href')) && target!=nav){
            target = target.parentNode;
        }
        if(target!=nav){
            //console.log('ctrlKey: ' , evt.ctrlKey);
            window.open(href, evt.ctrlKey ? '_blank' : '_self');
        }

        if(evt.preventDefault){
            evt.preventDefault();
        }else{
            evt.returnValue = false;
        }
    };*/
})();
