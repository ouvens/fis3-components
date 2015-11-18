/* global Badjs, strEllipsis, html */
/**
 * @fileoverview render工具函数，作用是？
 * @example @todo
 */
(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'login', "header", 'check', 'getClientVersion'], factory);
    } else {
        factory(root['jQuery'], root['Login'], root['Header']);
    }
}(this, function($, Login, Header, Check, getClientVersion) {

    $.render = {};

    $.render.time = (function() {

        // 修正为北京时间
        var timezoneOffsetGMT8 = 8 * 60; // 8 * 60 GMT+0800 单位为分
        var timezoneOffset = (new Date()).getTimezoneOffset(); // 系统时区 分 (包含夏令时)
        var timezoneDiff = (timezoneOffsetGMT8 + timezoneOffset) * 60; // 转换成秒
        function fixTimezone(timestamp, isFormatToDate) { // 单位为秒
            if (timezoneDiff === 0) return parseInt(timestamp); // 北京时间直接返回
            return parseInt(parseInt(timestamp) + timezoneDiff * (isFormatToDate ? 1 : -1));
        }

        function fillZero(number) {
            return ("0" + number).slice(-2, 3);
        }

        // 1：默认显示日期+时间
        // 2: 显示日期
        // 3: 显示时间
        function format(timestamp, type, server_time, noFixTimezone) {

            type = type || 1;

            var now = server_time ?
                (new Date(noFixTimezone ? server_time :
                    fixTimezone(server_time, true) * 1000)) :
                (new Date());

            var time = new Date(noFixTimezone ? timestamp :
                fixTimezone(timestamp, true) * 1000);

            var format_time = (time.getHours()) + ":" + fillZero(time.getMinutes());
            var format_date = "";

            //判断是否今天
            if (now.getFullYear() === time.getFullYear() &&
                now.getMonth() === time.getMonth() &&
                now.getDate() === time.getDate()) {
                format_date = "今天";
            } else {
                format_date = ((time.getMonth() + 1)) + "月" + (time.getDate()) + "日";
            }

            var weekdaymap = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

            switch (type) {
                case 1:
                    return format_date + " " + format_time;
                case 2:
                    return format_date;
                case 3:
                    return format_time + ":" + fillZero(time.getSeconds());
                case 4: //2月20日 周四
                    return formatDate('M月DD日', time, true) + ' ' + weekdaymap[time.getDay()];
                case 5: //昨天 一周内 更早
                    return fromNow(time, now, '1-en', true);
                case 6: //2014-02-12 16:08
                    return formatDate('YYYY-MM-DD hh:mm', time, true);
                default:
                    break;
            }
        }

        //秒或分钟转为小时
        function changeHour(time) {

            var hour = Math.floor(time / 60 / 60);
            var mins = Math.floor(time / 60 % 60);

            return hour + ":" + mins;
        }

        /**
         * @日期格式化
         *
         * @param {String} pattern 日期格式 (格式化字符串的符号参考w3标准 http://www.w3.org/TR/NOTE-datetime)
         * @param {Date Object} date 待格式化的日期对象
         * @return {String} 格式化后的日期字符串
         * @example
         *      formatDate("YYYY-MM-DD hh:mm:ss", (new Date()));
         */
        function formatDate(pattern, date, noFixTimezone) {
            if (!date) return "";

            if (typeof date == 'number') date = new Date(date);

            !noFixTimezone && (date = new Date(fixTimezone(parseInt((date.valueOf()) / 1000, 10), true) * 1000));

            function formatNumber(data, format) { //3
                format = format.length;
                data = data || 0;
                return format == 1 ? data : String(Math.pow(10, format) + data).slice(-format);
            }

            return pattern.replace(/([YMDhsm])\1*/g, function(format) {
                switch (format.charAt()) {
                    case 'Y':
                        return formatNumber(date.getFullYear(), format);
                    case 'M':
                        return formatNumber(date.getMonth() + 1, format);
                    case 'D':
                        return formatNumber(date.getDate(), format);
                    case 'w':
                        return date.getDay() + 1;
                    case 'h':
                        return formatNumber(date.getHours(), format);
                    case 'm':
                        return formatNumber(date.getMinutes(), format);
                    case 's':
                        return formatNumber(date.getSeconds(), format);
                }
            });
        }

        var fromNowTimeSepStyles = {
            '1': [
                [0, '今天'],
                [24 * 3600, '昨天'],
                [3 * 24 * 3600, '一周内'],
                [7 * 24 * 3600, '更早']
            ],
            '1-en': [
                [0, 'today'],
                [24 * 3600, 'yesterday'],
                [3 * 24 * 3600, 'thisweek'],
                [7 * 24 * 3600, 'earlier']
            ],
            '2': [
                [60, '刚刚'],
                [60 * 60, '$m分钟前'],
                [10 * 3600, '$h小时前'],
                [23 * 3600, '今天'],
                [24 * 3600, '昨天'],
                [2 * 24 * 3600, '前天'],
                [3 * 24 * 3600, '一周内'],
                [7 * 24 * 3600, '一周前'],
                [30 * 24 * 3600, '一个月前'],
                [3 * 30 * 24 * 3600, '三个月前'],
                [183 * 24 * 3600, '半年前'],
                [365 * 24 * 3600, '一年前']
            ]
        };

        function fromNow(time, now, style) {
            style = style || 'default';
            now = now || new Date();
            time = new Date(time * 1000);

            if (now) {
                now = new Date(now * 1000);
            } else now = new Date();

            var arr = fromNowTimeSepStyles[style] || fromNowTimeSepStyles['1'];

            var t = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            if (time instanceof Date) time = time.getTime();

            var diff = t - time;

            var item, str;
            for (var i = 0, len = arr.length; i < len; i++) {
                item = arr[i];
                if (diff > item[0] * 1000) str = item[1];
                else break;
            }

            return str;
        }

        function fromNowStr(time, now) {

            time = new Date(time * 1000);
            now = now ? new Date(now * 1000) : new Date();

            var diff = (now - time) / 1000;

            if (diff < 60) return "刚刚";

            if (diff < 60 * 60) return Math.floor(diff / 60) + "分钟前";

            if (diff < 24 * 3600) return Math.floor(diff / 3600) + "小时前";

            if (diff < 10 * 24 * 36000) return Math.floor(diff / 24 / 3600) + "天前";

            return "很久之前";
        }

        function fromStartTime(start, now) {

            start = new Date(start * 1000);
            now = now ? new Date(now * 1000) : new Date();

            var diff = (start - now) / 1000;

            if (diff < 0) return "已结束";
            if (diff < 60) return "1分钟";

            var hour = Math.floor(diff / 3600);
            var mins = Math.ceil((diff - hour * 3600) / 60);

            var res = (hour ? hour + "小时" : "") + (mins ? mins + "分钟" : "");

            return res;
        }

        var t_delta_cache = {};
        /**
         * @获取课程的时间相关状态
         *
         * @param item {Object} 课程对象  一般直接传入cgi返回的课程对象即可(约束: 字段名需要cgi统一!)
         * @param result {result} 附加信息对象  一般直接传入cgi返回的result字段即可(主要是从中读取server_time这个信息)
         * @return ret {Object} 时间状态信息
         *    ret.ec                0 成功  1 参数错误(一般是item里字段不对)
         *    ret.status            0 正在直播  1 尚未开始  -1 已经结束
         *    ret.expired_str       过期课程的wording:  今天,昨天,一周内,更早
         *    ret.t_delta           判定时间时使用的参考时间偏移.
         * @example
         *      $.render.time.courseStatus(data.result.items[i],data.result);
         */
        function courseStatus(item, result) {

            if (!item || !item.begintime || !item.endtime) return {
                ec: 1
            };

            var t0 = item.begintime * 1000;
            var t1 = item.endtime * 1000;
            var t_now = new Date().getTime();


            var t_delta = 0;

            if (result && result.server_time) {
                t_delta = (result.server_time * 1000 + 100) - t_now;
            } else if (item.id && t_delta_cache[item.id]) {
                t_delta = t_delta_cache[item.id];
            }

            if (t_delta > 2000 || t_delta < -2000) { //@magic_num: 2s内的误差忽略
                t_delta = 0;
            }

            if (item.id && t_delta) {
                t_delta_cache[item.id] = t_delta;
            }

            t_now += t_delta;

            var status;

            if (t_now < t0) status = 1;
            else if (t_now > t1) status = -1;
            else status = 0;

            var rst = {
                ec: 0,
                status: status
            };

            if (t_delta) {
                rst.t_delta = t_delta;
            }

            if (status == -1) {
                rst.expired_str = $.render.time.format(item.endtime, 5, Math.floor(t_now / 1000));
            }

            return rst;
        }



        //1）如果开课时间不是今年，展示样式为   14年6月开课  ，  15年7月节课 （此时开课节课都用  XX年XX月展示）
        //2）如果开课时间是今年，展示样式为  06月03日开课，（此时如果节课时间是同一年，则展示09月04日节课，如果节课时间跨年了，则展示  16年09月节课）
        function formatTermTime(opt) {
            var strBgtimeOpt, strEndtimeOpt,
                bgtime = new Date(opt.bgtime * 1000),
                endtime = new Date(opt.endtime * 1000),
                systime = new Date(opt.systime * 1000);

            if (bgtime.getFullYear() === systime.getFullYear()) {

                strBgtimeOpt = 'MM月DD日';

                if (endtime.getFullYear() === systime.getFullYear()) {
                    strEndtimeOpt = 'MM月DD日';
                } else {
                    strEndtimeOpt = 'YY年MM月';
                }
            } else {
                strBgtimeOpt = 'YY年MM月';
                strEndtimeOpt = 'YY年MM月';
            }

            return {
                bgtime: formatDate(strBgtimeOpt, bgtime),
                endtime: formatDate(strEndtimeOpt, endtime)
            };
        }

        return {
            fixTimezone: fixTimezone,
            format: format,
            changeHour: changeHour,
            formatDate: formatDate,
            courseStatus: courseStatus,
            fromNow: fromNow,
            fromNowStr: fromNowStr,
            fromStartTime: fromStartTime,
            formatTermTime: formatTermTime
        };
    })();

    $.render.fomartTermDuration = function(opt) {
        var strBegin, strEndtimeOpt;
        if (!opt.bgtime) {

            strBegin = '随到随学';

            var endtime = new Date(opt.endtime * 1000),
                systime = new Date(opt.systime * 1000);

            if (endtime.getFullYear() === systime.getFullYear()) {
                strEndtimeOpt = 'MM月DD日';
            } else {
                strEndtimeOpt = 'YY年MM月';
            }
            return {
                begin: strBegin,
                end: $.render.time.formatDate(strEndtimeOpt, endtime) + '结课'
            };
        } else {
            var termTime = $.render.time.formatTermTime(opt);
            return {
                begin: termTime.bgtime + '开课',
                end: termTime.endtime + '结课',
            };
        }
    };

    $.render.summary = function(summary) {
        return (summary || '').replace(/<br>/g, '');
    };

    $.render.wrap = function(summary) {
        return (summary || '').replace(/<br>/g, '\n');
    };

    $.render.qb = function(price) {
        var formatPrice = (price / 100).toFixed(2);
        return (formatPrice + '').replace(/\.?0{1,2}$/, '') + 'Q币';
    };

    $.render.formatCouponPrice = function(data) {
        var str;
        var passCardPrice = data.passcard_price,
            price = data.price,
            curTermId = data.cur_term_id,
            minPrice = 2,
            couponPrice = data.coupon_price || 0,
            realPrice = Math.max(price - couponPrice, minPrice),
            realpassCardPrice = Math.max(passCardPrice - couponPrice, minPrice);

        if (price === 0) {
            couponPrice = realPrice = realpassCardPrice = 0;
        }

        if (data.passcard === 1 && curTermId === null && passCardPrice !== price) {

            if (realPrice === realpassCardPrice) {
                str = [
                    '&yen;',
                    '<span class="fontsize-22">' + $.render.price(realpassCardPrice, true) + '</span>'
                ];
            } else {
                str = [
                    '&yen;',
                    '<span class="fontsize-22">' + $.render.price(realPrice, true) + ' - </span>',
                    '&yen;',
                    '<span class="fontsize-22">' + $.render.price(realpassCardPrice, true) + '</span>'
                ];
            }

            if (couponPrice) {
                str = str.concat([
                    '<span class="raw-price-range"><span class="raw-price">&yen;', $.render.price(price, true),
                    '</span> - <span class="raw-price">',
                    '&yen;', $.render.price(passCardPrice, true),
                    '</span></span>'
                ]);
            }
        } else {
            str = [
                price !== 0 ? '&yen;' : '',
                '<span class="fontsize-22">' + $.render.price(curTermId === 0 ? realpassCardPrice : realPrice, true) + '</span>'
            ];
            if (couponPrice) {

                str = str.concat([
                    '<span class="raw-price-range"><span class="raw-price">&yen;',
                    $.render.price(curTermId === 0 ? passCardPrice : price, true),
                    '</span></span>'
                ]);
            }
        }

        return str.join('');
    };

    $.render.price = function(price, nounit, sgm, free) {
        if (price === 0) {
            if (free) {
                return nounit ? "0.00" : "0.00元";
            } else {
                return "免费";
            }
        } else {
            if (!price) {
                return "";
            } else {
                var formatPrice = (price / 100).toFixed(2);
                if (sgm) {
                    var priceArr = formatPrice.split(".");
                    var yuan = priceArr[0].split("");
                    var jiao = priceArr[1];
                    var formatYuan = "";

                    for (var len = yuan.length, i = len - 1, j = 0; i >= 0; i--, j++) {
                        if (j % 3 === 0 && j !== 0) {
                            formatYuan = "," + formatYuan;
                        }
                        formatYuan = yuan[i] + formatYuan;
                    }
                    formatPrice = formatYuan + "." + jiao;
                }
                if (nounit) {
                    return formatPrice;
                } else {
                    return formatPrice + '元';
                }
            }
        }
    };

    $.render.formatPrice = function(price, opts) {
        var fPrice;

        opts || (opts = {});

        if (price === 0) {
            fPrice = "免费";
        } else if (!price) {
            fPrice = "";
        } else {
            fPrice = (price / 100).toFixed(2);
            fPrice = '¥' + fPrice;
        }

        return fPrice;
    };

    $.render.url = (function() {

        function encodeParam(k) {
            k += "";
            var f = [];

            for (var i = 0; i < k.length; i++) {
                f.push(k.charCodeAt(i).toString(16).toUpperCase());
            }
            return f.join("");
        }

        function getURL(h, g, k, fuin) {
            if (!h) return "";
            return "tencent://" + h + "/?subcmd=" + g + "&param=" + k + (fuin ? "&fuin=" + fuin : '');
        }

        function getEncodedURL(h, g, k, fuin) {
            if (!h) return "";
            k = encodeParam(k);

            return getURL(h, g, k, fuin);
        }

        /*
         appid:
         0           直接打开群aio
         21          群视频
         1101123802  群课程表
         */
        function getTencentURL(type, obj) {

            var h, g, k;
            var t;

            switch (type) {

                case 'all': //'all'+gc: 打开群  限制:公开群不在群内, 无法直接打开aio, 而是会弹加群窗口
                    h = 'groupwpa';
                    g = 'all';
                    k = '{"groupUin":' + obj.gc + ', "timeStamp":1383552440}';
                    break;
                case 'OpenGroup': //appid 0 打开公开群  限制:非公开群不再群内不会弹加群窗口,而是会弹"群主已将此群设置为非公开，加群后才能继续访问."
                    h = 'groupwpa';
                    g = 'OpenGroup';
                    var appid = obj.appId || 0;
                    k = '{"ExtParam":{"appId":' + appid + '},"groupUin":' + obj.guin + ',"visitor":1}';
                    break;
                case 'VisitPublicGroup': //5.1以上才支持  限制:几乎无限制, 公开群/非公开群都表现正常(非公开群不在群内打开加群窗口,其他情况都能打开)
                    h = 'VisitPublicGroup';
                    g = 'VisitPublicGroup';
                    k = '{"ExtParam":{"appId":"0"},"groupUin":' + obj.gc + ',"visitor":1}';
                    // k = '{"ExtParam":{"appId":""},"groupUin":' + obj.gc + ',"groupuin":'+ obj.gc +',"visitor":1}';
                    break;
                case 'CourseLive': //5.2以上才支持??
                    h = 'VisitPublicGroup';
                    g = 'VisitPublicGroupEx';
                    k = '{"ExtParam":{"appId":"21","appParam":"{\\"CourseId\\":' + obj.courseId + '}"},"groupUin":' + obj.gc + ',"visitor":1}';
                    break;
            }

            if (h) {
                var fuin = $.cookie.uin() || void(0);
                return getEncodedURL(h, g, k, fuin);
            }
            return '';
        }

        function getLoginQQNum() {
            var count = -1;
            try {
                if (window.ActiveXObject) { //IE
                    var q_hummerQtrl = new ActiveXObject("SSOAxCtrlForPTLogin.SSOForPTLogin2"); // jshint ignore: line
                    var vInitData = q_hummerQtrl.CreateTXSSOData();
                    q_hummerQtrl.InitSSOFPTCtrl(0, vInitData);
                    var g_vOptData = q_hummerQtrl.CreateTXSSOData();
                    var vResult = q_hummerQtrl.DoOperation(2, g_vOptData);
                    var vAccountList = vResult.GetArray("PTALIST");
                    count = vAccountList.GetSize();
                } else if (navigator.mimeTypes["application/nptxsso"]) {
                    var obj = document.createElement("embed");
                    obj.type = "application/nptxsso";
                    obj.style.width = "0px";
                    obj.style.height = "0px";
                    document.body.appendChild(obj);
                    if (obj.InitPVANoST()) {
                        count = obj.GetPVACount();
                    }
                }
            } catch (e) {}
            return count;
        }

        return {
            /**
             * @课前讨论: 预期行为--打开课程对应的直播群-群课程应用
             *
             * @param courseId {Number} 课程id
             * @param gc {Number} 该课程的直播群群号(用户可见的群号)
             *
             * @example
             *      dom.html('<a href="'+$.render.url.live(item.id,item.live_room)+'">直播</a>');
             */
            /*live : function(courseId,gc,ext){
             return getTencentURL('CourseLive',{courseId:courseId,gc:gc});
             },*/
            live: function(liveTag, opt) {
                opt || (opt = {});
                var $btnPlay = $(liveTag);
                if (Check.isWeixinUser()) {
                    var cid = $btnPlay.data("cid");
                    var aid = $btnPlay.data("aid");
                    var tid = $btnPlay.data("tid");
                    window.open("/qqlive/index.html?course_id=" + cid + "&aid=" + aid + "&term_id=" + tid);
                    return;
                }

                var url = $btnPlay.data('target'),
                    type = $btnPlay.data('type'),
                    isTencent = (url.indexOf('tencent') === 0);

                var pf = navigator.platform,
                    isWin = (!pf || pf === 'Win32' || pf === 'Win64' || pf === 'Windows');

                $btnPlay.attr('href', 'javascript:void(0);');


                if (isTencent) {
                    if (!Login.isLogin()) {

                        Login.show({
                            succ: function() {
                                $(document).trigger("loginSucc");
                                setTimeout(function() {
                                    $btnPlay.click();
                                }, 200);
                            }
                        });
                        return;
                    }

                    url = url.replace(/(&)?fuin=(\d)*/, '');

                    if (isWin) {

                        var version = getClientVersion();
                        //客户端支持, 版本号与shujianyuan确认的
                        //if (version >= 5353) {

                        //QQ版本真的很低
                        if (version > 0 && version < 5353) {

                            if (type == 4) {
                                url = 'http://ke.qq.com/qqlive/index.html?course_id=' + $btnPlay.data('cid') + '&term_id=' + $btnPlay.data('tid') + '&aid=' + $btnPlay.data('aid');
                                isTencent = false;

                            } else {

                                $.render.showEnterRoomFailureTips();
                                Badjs('普通直播课且客户端版本不支持', location.href, 0, 473916, 2); // jshint ignore:line
                                return;
                            }
                            //version=-1, 没有获取到版本号
                        }

                    } else {

                        url = 'http://ke.qq.com/qqlive/index.html?course_id=' + $btnPlay.data('cid') + '&term_id=' + $btnPlay.data('tid') + '&aid=' + $btnPlay.data('aid');
                        isTencent = false;
                    }

                }
                if (isTencent) {
                    var uin = $.cookie.uin();
                    if (url.indexOf("fuin") < 0 && uin) {
                        url = url + "&fuin=" + uin;
                    }
                    url += "&st=" + (new Date - 0);
                    if (opt.newcard) {
                        $(document).trigger('openQQClientLiveNew', [liveTag]);
                    } else {
                        $(document).trigger('openQQClientLive', [liveTag]);
                    }

                }

                window.open(url, isTencent ? '_self' : '_blank');

            },

            enterAgencyHall: function(entranceTag) {

                var url = $(entranceTag).attr('data-target');

                $(entranceTag).attr('href', 'javascript:void(0);');
                if (!$.bom.checkPlatform()) {
                    return;
                }

                if (!Login.isLogin()) {
                    Login.show({
                        succ: function() {
                            $(document).trigger("loginSucc");
                            setTimeout(function() {
                                $(entranceTag).click();
                            }, 200);
                        }
                    });
                    return;
                }

                if (getLoginQQNum() === 0) {
                    url = url.replace(/(&)?fuin=(\d)*/, '');
                }



                $(document).trigger('enterAgencyHall', [entranceTag]);

                var uin = $.cookie.uin();
                if (url.indexOf("fuin") < 0 && uin) {
                    //console.warn("有uin确没有带进tencent串里 url=["+url+"]");
                    url = url + "&fuin=" + uin;
                }
                url += "&st=" + (new Date - 0);

                window.open(url, '_self');
                //$(liveTag).attr('href', url);
            },
            liveForOpenRoom: function(liveTag, uncheckStatus) {
                var url = $(liveTag).attr('data-target'),
                    isTencent = (url.indexOf('tencent') === 0);

                $(liveTag).attr('href', 'javascript:void(0);');
                if (isTencent && !$.bom.checkPlatform()) {
                    return;
                }
                if (isTencent && getLoginQQNum() === 0) {
                    url = url.replace(/(&)?fuin=(\d)*/, '');
                }

                if (url.indexOf("fuin") < 0) {
                    var uin = $.cookie.uin();
                    if (uin) {
                        url += ("&fuin=" + uin);
                        $(liveTag).attr('href', url);
                    }
                }

                if (isTencent && !uncheckStatus) {
                    $(document).trigger('openQQClientLive', [liveTag]);
                }

                window.open(url, isTencent ? '_self' : '_blank');
            },
            /**
             * @课前讨论: 预期行为--打开课程对应的课前讨论群-群aio
             *
             * @param courseId {Number} 课程id, 目前的行为暂时用不上这个字段, 但既然有就传过来, 便于以后这里行为变更时各处修改
             * @param gc {Number} 该课程的讨论群群号(用户可见的群号)
             * @param ext {Object} 扩展信息字段, 会影响最终调用哪个tencent串
             *    ext.is_member  本用户是否是讨论群的成员
             *    ext.is_pub     讨论群是否是公开群
             *    ext.guin       讨论群的后台群唯一id(用户不可见)
             *
             * @example
             *      dom.html('<a href="'+$.render.url.discuss(item.id,item.discuss_room,item.discuss_ext||{})+'">课前讨论</a>');
             */
            discuss_old: function(courseId, gc, ext) {

                var useOpen = true;

                if (ext.is_member) useOpen = false;
                else if (ext.is_pub && ext.guin) useOpen = true;
                else useOpen = false;

                if (useOpen) {
                    return getTencentURL('openGroup', {
                        guin: ext.guin
                    });
                } else {
                    return getTencentURL('all', {
                        gc: gc
                    });
                }
            },
            discuss: function(courseId, gc, ext) {

                var useOpen = true;

                if (ext && ext.is_member) useOpen = false;

                if (useOpen) {
                    return getTencentURL('VisitPublicGroup', {
                        gc: gc
                    });
                } else {
                    return getTencentURL('all', {
                        gc: gc
                    });
                }
            },
            course_pay: function(courseId) {
                return 'http://ke.qq.com/cgi-bin/courseDetail?course_id=' + courseId + '&pay=1';
            },
            teacher_detail: function(teacherUin) {
                return 'http://ke.qq.com/cgi-bin/teacher?tid=' + teacherUin;
            },
            course_detail: function(courseId) {
                return 'http://ke.qq.com/cgi-bin/courseDetail?course_id=' + courseId;
            },
            video_play_page: function(courseId) {
                return 'http://ke.qq.com/cgi-bin/courseDetail?course_id=' + courseId;
            },
            agency_detail: function(agencyId) {
                return 'http://ke.qq.com/cgi-bin/agency?aid=' + agencyId;
            },
            agency_domain: function(agencyDomain) {
                return 'http://' + agencyDomain;
            },
            getLoginQQNum: getLoginQQNum

        };

    })();

    // 关于时间展示问题, 这里增加一个字段 show_id 表示展示方式
    // 1. 若日期与原始填写循环方式一致，时刻固定则与现网展示方式一致：
    //      x月x日起，循环方式 + 时刻上课
    //      例子：9月24日起，每周三16:00~17:00，19:00~20:00上课
    // 2. 若日期与原始填写循环方式一致，时刻不固定则展示方式如下：
    //      x月x日起，每天上课，x月x日结束
    //      x月x日起，每周x，x，x上课，x月x日结束
    //      x月x日起，每月x号，x号，x号上课，x月x日结束
    // 3. 若日期与原始填写循环方式不一致。展示方式为：
    //      x月x日起，x月x日，x月x日...x月x日结束。（展示起始的三个日期）
    $.render.courseTime = function(termInfo) {
        var formatString = '';
        if (!termInfo || !termInfo.show_id) return formatString;
        if (termInfo.show_id == 1) {
            formatString = $.render.courseTimeMode1(termInfo);
        } else if (termInfo.show_id == 2) {
            formatString = $.render.courseTimeMode2(termInfo);
        } else if (termInfo.show_id == 3) {
            formatString = $.render.courseTimeMode3(termInfo);
        }

        if (termInfo.filter_holiday == 1) {
            formatString += '(节假日除外)';
        }
        return formatString;
    };

    $.render.formatLiveTime = function(bgtime, endtime) {

        var timeString = $.render.time.formatDate('M月D日 hh:mm', bgtime * 1000);

        timeString += '-';

        if (new Date(bgtime * 1000).getDate() != new Date(endtime * 1000).getDate()) {
            timeString += '次日';
        }


        timeString += $.render.time.formatDate('hh:mm', endtime * 1000);

        return timeString;

    };

    $.render.timeSpan = function(spans, noFixTimezone) {
        var stringBuff = [];

        var wrapTimeWithZero = function(t) {
            return t < 10 ? '0' + t : t;
        };

        spans = spans || [];

        for (var j = 0, plan_len = spans.length; j < plan_len; j++) {
            var st = new Date((noFixTimezone ? spans[j].bgtime : $.render.time.fixTimezone(spans[j].bgtime, true)) * 1000),
                et = new Date((noFixTimezone ? spans[j].endtime : $.render.time.fixTimezone(spans[j].endtime, true)) * 1000);
            stringBuff.push([
                (st.getHours()) + ':' + wrapTimeWithZero(st.getMinutes()),
                '~', (et.getHours()) + ':' + wrapTimeWithZero(et.getMinutes()),
                et.getDate() != st.getDate() ? '(第二天)' : ''
            ].join(''));
        }

        return stringBuff.join('、');
    };

    $.render.formatTimeSpan = function(spans, noFixTimezone) {
        var stringBuff = [];

        var wrapTimeWithZero = function(t) {
            return t < 10 ? '0' + t : t;
        };

        spans = spans || [];

        for (var j = 0, plan_len = spans.length; j < plan_len; j++) {
            var st = new Date((noFixTimezone ? spans[j].bgtime : $.render.time.fixTimezone(spans[j].bgtime, true)) * 1000);
            stringBuff.push([
                (st.getHours()) + ':' + wrapTimeWithZero(st.getMinutes())
            ].join(''));
        }

        return stringBuff.join('、');
    };

    /**
     * 处理数字过大时超出显示区域问题
     */
    $.render.number = function(input, max, outputFormat) {
        input = parseInt(input, 10) || 0;
        max = parseInt(max, 10);
        outputFormat = typeof outputFormat === "function" ? outputFormat : function(input, output) {
            return '<span title="' + input + '"' +
                (input === output ? '' : ' class="over-size"') +
                '>' + output + '</span>';
        };
        var output = input;
        if (max) {
            output = input >= max ? ((max - 1) + "+") : input;
        }
        return outputFormat(input, output);
    };

    $.render.number_plus = function(input) {
        input = parseInt(input, 10) || 0;
        return (input.toString().length > 4 ? (input / 1e4).toFixed(0) + 'W' : input.toString()).replace(/\.0+/, '');
    };

    $.render.formatTitle = function(str) {
        str = str || '';
        return str.replace(/<br>/g, '\n');
    };

    /**
     * [提供给 “机构管理 - 数据分析中心” 特殊使用的时间格式化]
     * @return {[type]} [description]
     */
    $.render.formatAnalyzeTime = function(count, type, sgm, notshowYear) {
        count = count || 0;
        sgm = sgm || "";

        var dd = new Date();
        dd.setDate(dd.getDate() + count);

        function twoChar(str) {
            if (str.toString().length == 1) {
                return "0" + str;
            } else {
                return str;
            }
        }
        var y = twoChar(dd.getFullYear());
        var m = twoChar(dd.getMonth() + 1);
        var d = twoChar(dd.getDate());
        if (notshowYear) {
            return m + sgm + d;
        } else {
            return y + sgm + m + sgm + d;
        }
    };
    $.render.cgiErrorWording = function() {
        return '    <div class="section-msg">\
                        <div class="msg-inner">\
                            <i class="icon-msg-large icon-font i-info"></i>\
                            <div class="msg-text">服务器异常，请稍后再试!</div>\
                        </div>\
                    </div>';
    };
    $.render.showEnterRoomFailureTips = function() {
        var content = '<div class="modal-live-guide clearfix">\
            <div class="module-live-t clearfix">\
                <h3 class="live-guide-title">课堂还没打开？快试试下面的修复方法</h3>\
            </div>\
            <div class="guide-hint">\
                <p class="guide-hint-p">1. 浏览器是否有加载提示？若有请点击允许</p>\
                <p class="guide-hint-p">2. 确认已安装最新版QQ[<a href="http://im.qq.com/pcqq" target="_blank" class="nor-link">点击下载</a>]。若新装了<br>&nbsp;&nbsp;&nbsp;&nbsp;QQ，请重启浏览器。</p>\
                <p class="guide-hint-p">3. 从QQ客户端进入课堂，入口如右图所示</p>\
            </div>\
            <div class="guide-pic"></div>\
        </div>';
        $.Dialog.alert(content, {
            title: '提示',
            confirmText: '我知道了',
            globalClass: 'live-guide-tips'
        });
    };

    $.render.courseFlags = function(flags, max, isAdd, autoTest) {
        var fmin = 0;
        var html = [];
        if ($.isArray(flags)) {
            var fl = flags.length;
            fmin = Math.min(max, fl);
            for (var fi = 0; fi < fmin; fi++) {
                $.trim(flags[fi].name).length > 0 && html.push('<a class="flags-item flags-item-' + flags[fi].id + '" data-id="' +
                    flags[fi].id + '" href="javascript:;" title="' + flags[fi].name + '">' +
                    strEllipsis.substring(flags[fi].name, 84, 1) + '<i class="flags-close"></i></a>');
            }
        }

        isAdd && fmin < max &&
            html.push('<a class="flags-add" href="javascript:;"' + (autoTest ? ' auto-test="' + autoTest + '"' : '') + '><i class="plus">+</i>添加</a>');
        return html.join('');
    };

    $.render.orderCourseStateMap = function(state) {
        var result = '';

        switch (state) {
            case 4:
                result = '报名失败';
                break;
            case 1:
            case 5:
                result = '报名成功';
                break;
            case 2:
            case 3:
            case 6:
            case 7:
                result = '订单确认中';
                break;
            case 8:
            case 9:
                result = '退款中';
                break;
            case 10:
                result = '退款完成';
                break;
            case 11:
                result = '退款失败';
                break;
        }

        return result;
    };

    $.render.orderStateMap = function(state) {
        var map = ['', '待付款', '付款确认中', '已付款', '', '退款中', '已退款'];

        return map[state] || '';
    };

    $.render.settlemenStateMap = function(state) {
        var result = '';

        switch (state) {
            case 1:
                result = '结算中';
                break;
            case 2:
                result = '已结算';
                break;
            case 3:
                result = '未结算';
                break;
            case 4:
                result = '无需结算';
                break;
        }

        return result;
    };

    $.render.fixImageWidth = function(str, width) {
        return str + (str.indexOf("/eth/") > -1 ? width : "");
    };

    /**
     * 转换为数组
     * @param  {array} data       数组
     * @param  {bool} needDecode 是否需要html解码
     * @return {array}            数组
     */
    $._toArray = function(data, needDecode) {
        if ($.isArray(data)) return data;
        try {
            needDecode && (data = html.decode(data));
            data = JSON.parse(data);
            return $.isArray(data) ? data : [];
        } catch (err) {
            return [];
        }
    };

    $.render.number_cn = function(num, def) {
        def = def || 1;
        var output = [];
        var UNIT_STR = ['', '十', '百', '千'];
        var NUMBER_STR = '零一二三四五六七八九十';

        num = Math.max(parseInt(num, 10) || def, def).toString().split('');

        while (num.length) {
            var val = parseInt(num.shift(), 10);
            output.push(NUMBER_STR.charAt(val) + (val === 0 ? '' : UNIT_STR[num.length]));
        }

        return output.join('').replace(/^一(十)|零+$/g, '$1');
    };

    return $;
}));