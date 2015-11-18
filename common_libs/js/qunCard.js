/**
 * @author 不详，从 qun.qq.com 的代码里剥出来，casper这边负责整合下而已，这里的逻辑需要再严格review下
 * @date 2014-03-31
 * @description 群资料卡组件
 * @example
 * QunCard.show({
 *      gc: 123456, // 群号
 *      name: '群名称',    // 群名称
 *      num: 100,   // 群当前人数
 *      max: 200,   // 群最大人数
 *      face: 'http://p.qlogo.cn/gh/172422926/172422926/100?t=0',   // 群头像
 *      cs: '行业交流-互联网', // 群分类
 *      isrenz: 0,  // 是否认证群
 *      source: 'agency'    // 非必须字段：从哪个入口进来
 * })
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery','groupTencent'], factory);
    } else {
        root['QunCard'] = factory(root['jQuery'],root['groupTencent']);
    }
}(this, function ($, groupTencent) {

    // ======================= code from qun.qq.com, to be refractored ===============
    var $DE_QFACE = 'http://3.url.cn/res/qun_icon/icons/normal/10001/40.png',
        $lastQunCard = null,
        $lastGc = 0,
        $bg = null,
        $mapbg = null,
        $mapDom = null;

    function isLessIE8() {
        var isIE = !!window.ActiveXObject,
            isIE6 = isIE && !window.XMLHttpRequest,
            isIE8 = isIE && !!document.documentMode,
            isIE7 = isIE && !isIE6 && !isIE8;

        if (isIE6 || isIE7 || isIE8) return true;
        return false;
    }

    //显示资料卡
    //param = {name,gc,cs,num,max,isjoin,face,isrenz,source}
    function showQunCard(param) {

        var isIE = isLessIE8(),
            profile_url = '',
            tags_url = '';

        if (isIE) {
            profile_url = 'http://qqun.qq.com/profile/profile.html?';
            tags_url = 'http://qqun.qq.com/profile/profileEx.html?';
        } else {
            profile_url = 'http://qinfo.clt.qq.com/index/index.html#';
        }

        if (!$lastQunCard || $lastGc !== param.gc) {
            if (!$('#js_qun_card')[0]) {
                $lastQunCard = document.createElement('div');
                $lastQunCard.className = 'info-card';
                $lastQunCard.id = 'js_qun_card';
            }
            $lastQunCard.tabIndex = '-1';
            var menNumStr =  (typeof param.num!='undefined' && typeof param.max!='undefined') ? '<p class="ic-hnum">'+param.num+'/'+param.max+'</p>' : '';
            $lastQunCard.innerHTML = '<div class="ic-top">\
                <div class="bd">\
                    <div class="l ic-pic">\
                        <img src="'+param.face+'" class="ic-img" onerror="this.src=\'http://3.url.cn/face/grp/0_100.png\'; this.onerror=null;" />\
                        <a href="javascript:void(0);" class="btn-3 '+(param.isjoin?'dis':'')+'">'+(param.isjoin?"已加群":"加入该群")+'</a>\
                    </div>\
                    <div class="l ic-info">\
                        <p class="ic-name">'+(param.isrenz?'<a href="renzheng.html" target="_blank" class="icon icon-rz" title="腾讯认证群"></a>':'')+'<span class="name" title="'+param.name+'">'+param.name+'</span><span class="ic-num">'+param.gc+'</span></p>\                        <p class="ic-type">'+ param.cs + '</p>'
                        + menNumStr +'\
                    </div>\
                    <div class="clear"></div>\
                </div>\
            </div>\
            <div class="ic-main">\
                '+(tags_url?'<div class="ic-tag">\
                    <div class="ic-tag-m checked"><a href="javascript:void(0);" title="资料" rel="1"><span class="icon icon-zl"></span>资料</a><span class="arr"></span></div>\
                    <div class="ic-tag-m"><a href="javascript:void(0);" title="标签" rel="2"><span class="icon icon-bq"></span>标签</a><span class="arr"></span></div>\
                    <div class="clear"></div>\
                </div>':'')+'\
                <div class="ic-iframe js_qzl">\
                    <iframe width="100%" height="100%" frameborder=no scrolling="no" src="'+profile_url+'groupuin='+param.gc+'"></iframe>\
                </div>\
                '+(tags_url?'<div class="ic-iframe js_qbq" style="display:none;">\
                    <iframe width="100%" height="100%" frameborder=no scrolling="no" src="'+tags_url+'groupuin='+param.gc+'"></iframe>\
                </div>':'')+'\
            </div>\
            <div class="ic-tool"><a href="javascript:void(0)" class="icon icon-close"></a></div>';

            if (!$('#js_qun_card')[0]) $(document.body).append($lastQunCard);
            bindQunCardEvent(isIE);
        }
        var windowH = $(document.body).height();
        if (!$bg) {
            $bg = document.createElement('div');
            $bg.className = 'blackBg';
            $bg.style.height = windowH + 'px';
            $(document.body).append($bg);
        }
        $lastGc = param.gc;
        //$($lastQunCard).css("marginTop",(marginT/2)*-1+"px");
        $($lastQunCard).show();
        $($bg).show();

        $($lastQunCard).keydown(function (evt) {
            if (evt.keyCode === 27) hideQunCard();
        });
    }

    function hideQunCard() {
        $($lastQunCard).hide();
        $($bg).hide();
    }
    function bindQunCardEvent(isIE) {
        if (isIE) {
            var tag = $('.ic-tag-m');
            var taga = $('.ic-tag-m a');
            var tagc = 'checked';
            taga.click(function () {
                var rel = parseInt($(this).attr('rel'));
                tag.siblings().removeClass(tagc);
                $(this).parent().addClass(tagc);
                $('.ic-iframe').hide();
                if (rel === 1) $(".js_qzl").show();
                else if (rel === 2) $(".js_qbq").show();
            });
        }

        $('.ic-tool .icon-close').click(function () {
            hideQunCard();
        });

        $('.ic-pic .btn-3').click(function () {
            if ($(this).hasClass('dis')) return false;
            addClientQun($lastGc);
        });
    }
    function addClientQun(gc, source) {

        groupTencent.join(gc, $.cookie.uin());

        /*
        AQCOM.noLogin = function() {
            Login.show();
        }
        AQCOM.show(gc);
        //上报来源
        // switch (source) {
        //     case 'index':
        //         report_core({aId: 1020});
        //         break;
        //     case 'search_recommend':
        //         report_core({aId: 1030});
        //         break;
        //     case 'search_result':
        //         report_core({aId: 1035});
        //         break;
        //     case 'renzheng':
        //         // 群认证 推荐群 加群上报
        //         report_core({aId: 1046});
        //         break;
        //     default:
        //         break;
        // }

        if (window.event) window.event.returnValue = false;
        return false;
        */
    }

    return {
        show: showQunCard
    };
    // ======================= code from qun.qq.com, to be refractored ===============

}));

