/*
    Pay.init({
         param: {
             courseId: kid,
             name: metaData.name,
             aid: metaData.aid,
             agency: metaData.agency,
             price: metaData.price,
             nick: nick,
             time: metaData.time || (new Date - 0)
         },
         openSucc: function () {},
         openFail: function (data) {
            data.retcode = 10001;云支付组件加载失败
            data.retcode = 10002;课程冲突时，用户取消购买
            data.retcode = 其他;参见cgi返回码
         },
         succ: function (data) {
            data = {discussQun: 1324}
         },
         cancel: function () {
         },
         err: function (data) {
            //CGI返回错误时，有相应的错误码retcode;
            //data = {orderState: 'nopay' |'confirm'|'back'|'unknow'}
            //data = {retcode: retcode}
                //retcode取以下值：
                 '166412': '报名失败，请稍候重试。',//订单流程错误
                 '166415': '您已购买该课程，不需要再次付款！',

                 '166416': '购买失败，免费课程请走免费的流程！',

                 '101404': '报名失败，该课程已经下架！',
                 '166411': '报名失败，此课程已经开始上课。',
                 '106409': '报名失败，您报名的课程已经结束！',
                 '101402': '您已经报名了此课程。',
                 '106437': '报名失败，超出直播类型最大500人的限制！',
                 '106446': '报名失败，机构创建者不能报名此课程！',
                 '106447': '报名失败，此课程的老师或助教不能报名！',
                 '106410': '报名失败，您报名的课程为付费课程！'
                 其他
         },
         nologin: function (data) {
         },
         close: function () {
         }
    });
 付费->时间冲突->获取token->弹出支付窗口->付费/报名成功->拉取学生信息->更新学生信息
 免费->时间冲突->报名成功->拉取学生信息->更新学生信息
 */
(function(root, factory) {

    // 模块规范之：依赖声明
    if (typeof define === 'function' && define.amd) {

        define(['jquery', 'db', 'login', 'report', 'commonTemplate/courseOperation', 'groupTencent', 'courseOperation/vc', 'courseOperation/notify', 'base', 'courseOperation/db.courseOperation','modal'], factory);
    } else {

        root['Pay'] = factory(root['jQuery'], root['DB'], root['Login'], root['report'], root['TmplInline_couseOperation'], root['groupTencent'], root['verifyCode']);
    }
}(this, function($, DB, Login, report, TmplInline_couseOperation, groupTencent, verifyCode, Notify) {

    var fusion2 = window['fusion2'];
    var TRecord = window['TRecord'];
    var loadNum = 0;
    //var enterPayTime;
    var fusionLoaderUrl = 'http://fusion.qq.com/fusion_loader?appid=1450000627&platform=qzone';

    function loadCloudPay(cb) {

        if (!window.fusion2) {
            if (loadNum++ >= 1) {
                Badjs(fusionLoaderUrl, location.href, 0, 428269, 4);
                fusionLoaderUrl = 'http://7.url.cn/edu/js/pay/fusion_bak.9964.js';
            }
            $.ajax({
                url: fusionLoaderUrl,
                dataType: 'script',
                cache: true,
                success: function() {
                    fusion2 = window.fusion2;
                    cb && cb();
                }
            });
        } else {
            cb && cb();
        }
    }



    function openPayWindow(data, mode) {
        var mask = $('<div class="mask"></div>').appendTo(document.body);
        var param = data.param;
        var timer = 0;

        function detach() {
            timer && clearTimeout(timer);
            mask && mask.remove();
            mask = null;
        }

        TRecord.push('pay_ready');

        var startLoadTime = new Date;

        TRecord.push("page_start", startLoadTime);

        console.log(data);
        fusion2.dialog.buy({
            // 可选。仅当接入“道具寄售”模式的应用使用游戏币快捷支付功能时，必须传该参数。取值固定为“true”。
            // 其他支付场景不需要传入该参数。
            // disturb : true,

            // 必须。 表示购买物品的url参数，url_params是调用Q点直购接口v3/pay/buy_goods或道具寄售接口v3/pay/exchange_goods接口返回的参数。
            param: param.url_params,
            token: param.token,

            // 可选。表示是否使用沙箱测试环境。应用发布前，请务必注释掉该行。
            // sandbox值为布尔型。true：使用； false或不指定：不使用。
            sandbox: mode === 'exp',
            title: '购买课程',

            //可选。前台使用的上下文变量，用于回调时识别来源。
            context: "henryguo_seq001",

            //可选。用户购买成功时的回调方法，其中opt.context为上述context参数。如果用户购买成功，则立即回调JS中的onSuccess，当用户关闭对话框时再回调onClose。
            onSuccess: function(opt) {
                detach();
                data.succ();
            },
            //可选。用户取消购买时的回调方法，其中opt.context为上述context参数。如果用户购买失败或没有购买，关闭对话框时将先回调onCancel再回调onClose。
            onCancel: function(opt) {
                data.cancel();
            },
            //可选。如果在实现Q点直购功能时调用了发货通知接口，即需要实现本方法，其中opt.context为上述context参数。如果发货超时或返回的数据无法解析时，则立即回调onSend。
            /*onSend : function(opt) {
             mask.remove();
             mask = null;
             },*/
            //可选。对话框关闭时的回调方法，主要用于对话框关闭后进行UI方面的调整，onSuccess和onCancel则用于应用逻辑的处理，避免过度耦合。
            onClose: function(opt) {
                /*mask.remove();
                 mask = null;*/
                detach();
                data.close();
            }

        });

        function checkPayWin() {

            if ($('.fusion_dialog_frame').length == 1) {
                //console.log('*********has add iframe');
                $('.fusion_dialog_frame').bind('load', function() {
                    TRecord.push('pay_delay');
                    //console.log('*********************iframe is loaded');
                    TRecord.report([
                        'page_start', //基准点  这个点不会上报 是基准点
                        //'pay_ready',
                        'pay_delay'
                    ], {
                        //delay: 0,
                        isd: {
                            //pay_ready: 12,
                            pay_delay: 13
                        }
                    });
                });

            } else {
                if (new Date - startLoadTime < 10 * 1000) {
                    setTimeout(function () {
                        checkPayWin();
                    }, 16);
                } else {
                    Badjs('加载支付组件超时', location.href, 0, 462656, 2);
                }
            }

        }


        checkPayWin();

        function attachProtocal() {
            timer = setTimeout(function() {
                var wrap = $('.fusion_dialog_wrap');
                var dlgTitle = $('.fusion_dialog_header h3').html();
                timer = 0;
                if (wrap.length === 1 && dlgTitle.indexOf('购买课程') > -1) {
                    var footer = $('.fusion_dialog_footer_ext');
                    if (!footer.length) {
                        wrap.append('<div style="height: 28px;line-height: 28px;" class="fusion_dialog_footer_ext"><input checked="checked" id="js_accept_pay_contact" type="checkbox" style="border:none;margin: 0 2px 0 10px;padding:0;"></input>同意<a target="_blank" class="nor-link" href="http://ke.qq.com/proService.html">腾讯课堂服务协议</a></div>');
                        $('#js_accept_pay_contact').change(function() {
                            $(".fusion_dialog_wrap").remove();
                            $(".fusion_dialog_mask").remove();
                            detach();

                            $.Dialog.confirm('您好，购买课程需同意<a target="_blank" class="nor-link" href="http://ke.qq.com/proService.html">腾讯课堂服务协议</a>。', {
                                title: '购买课程',
                                submit: '同意',
                                onAccept: function() {

                                    data.repay();
                                },
                                onCancel: function() {

                                    data.cancel({
                                        noQuery: true
                                    });
                                }

                            });
                        });
                    }
                }
                attachProtocal();
            }, 300);
        }

        attachProtocal();

    }

    function destroyPayWin() {
        $(".fusion_dialog_wrap").remove();
        $(".fusion_dialog_mask").remove();
    }

    function init(inopt) {

        var conflictData = {};
        //inopt.param.price = 10;
        var inparam = $.extend({}, inopt.param);
        //enterPayTime = new Date;
        /****************
         * 报名及付款之前的课程时间冲突判断
         ***************/
        function checkTimeConflict(options, callback) {
            options || (options = {});

            function apply() {
                if (inparam.price !== 0 && inparam.souce != 2 && conflictData.pflag) {
                    var dlgContent = TmplInline_couseOperation.checkTimeConflict(conflictData);
                    dlgContent = dlgContent.replace("继续报名", "继续购买");
                    dlgContent = dlgContent.replace("已报名课程", "已购买课程");

                    $.Dialog.confirm(dlgContent, {
                        submit: '仍然购买',

                        onAccept: function() {
                            callback && callback();
                        },
                        onCancel: function() {
                            inopt.openFail && inopt.openFail({
                                retcode: 10002
                            });
                            dealError({});
                        },
                        onClose: function() {
                            inopt.openFail && inopt.openFail({
                                retcode: 10003
                            });
                            dealError({});
                        }
                    });
                } else {

                    callback && callback();

                }
            }

            DB.checkTimeConflict({
                param: {
                    course_id: options.courseId,
                    term_id: options.termId

                },
                succ: function(data) {
                    conflictData = data.result || conflictData;
                    apply();

                },
                err: function(data) {
                    if (data.retcode === 100000 || data.retcode === 100021 || data.retcode === -1001 || data.retcode === 111) {

                        handleLogin();

                    } else {
                        apply();
                        //dealError(data);
                    }
                    return true;
                }
            });
        }



        function showSuccWin() {


            // inparam.name = html.encode(inparam.name);
            inparam.c = conflictData;

            console.log("inparam", inparam);

            /* $(".fusion_dialog_wrap").remove();
             $(".fusion_dialog_mask").remove();*/
            destroyPayWin();

            var title = "报名成功";
            if(inparam&&(inparam.price>0 || location.href.indexOf("#sid=signup")>0)){
                if (inparam.source != 2 ||  inparam.source === 2 && inparam.pay_status == 10) {

                    title = "购买课程";
                }
            }


            function show() {
                Notify.init({
                    data: inparam,
                    tmpl :  TmplInline_couseOperation.paySucc,
                    emailNode : '#js_pay_email',
                    idCodeNode : '#js_id_code',
                    idCodeBtn : '#js_id_code_btn',
                    mobileNode :'#js_pay_mobile',
                    submitNode: '#js_pay_submit',
                    hadProhibit : (inparam.user_notify_status == 1),
                    confirmOpt : {
                        title: title,
                        globalClass: 'pay-succ',
                        confirm: true
                    },
                    onShow: function(nods) {
                        if(!$('.part-form').hasClass('part-form-expand')) {
                            $('#js_pay_mobile').focus();
                        }

                        $('#part-expand').on('click', function() {
                            var formNode = $('.part-form');
                            if (formNode.hasClass('part-form-expand')) {
                                $(this).text('开课提醒设置');
                            } else {
                                $(this).text('收起');
                            }
                            formNode.toggleClass('part-form-expand');
                        });


                        $('.js-pay-continue').click(function(){
                            window.open('/cgi-bin/courseList', '_blank');
                            $.Dialog.remove();
                        });

                        $('.js-pay-studynow').click(function(){
                            window.open('/user/index/index.html', '_blank');
                            $.Dialog.remove();
                        });


                        $(".pay-succ").delegate('#js_addgroup_tencent, #js_discuss_tencent', 'click', function() {
                            groupTencent.join(inparam.qunid, $.cookie.uin());
                        });


                        $('.tips .tips-er-code').hover(function() {
                            $(this).find('.tips-er-code-float').show();
                        }, function() {
                            $(this).find('.tips-er-code-float').hide();
                        });
                    },
                    submitDataFilter: function(data) {
                        data.course_id =  inparam.courseId;
                        data.term_id =  inparam.termId;
                        return data;
                    },
                    onValidatedFail: function() {
                        var formNode = $('.part-form');
                        if (!formNode.hasClass('part-form-expand')) {
                            $('#part-expand').text('收起');
                            formNode.toggleClass('part-form-expand');
                        }
                    }

                }).show();

                //上报用户报名课程成功后弹出
                report.tdw({
                    action: 'ApplySuccess',
                    module: 'course',
                    opername: 'Edu',
                    uin: $.cookie.uin(),
                    ver1: inparam.courseId,
                    ver2: inparam.has_record ? 2 : 1
                });
            }

            DB.notifyStatus({
                succ: function(data) {
                    inparam.user_notify_status = data.result.status
                    show();
                },
                err: function() {
                    inparam.user_notify_status  = 0;
                    show();
                }
            });

            if(inparam.couponId){
                report.tdw({
                    module: 'youhuiquan',
                    action: 'coursepage_realpay',
                    ver3: inparam.price,
                    ver1: inparam.courseId
                });

                report.tdw({
                    module: 'index',
                    action: inparam.type != 2 ? 'payment_coupon_livecourse_result' : 'payment_coupon_videocourse_result',
                    ver3: inparam.price,
                    ver1: inparam.courseId
                });

            }

        }

        /*function applyFree() {
            var param = {
                course_id: inparam.courseId,
                term_id: inparam.termId,
                from_uin: inparam.from_uin
            };
            if (inparam.vcCode) {
                param.vfcode = inparam.vcCode;
            }
            DB.applyFree({
                param: param,
                succ: applySucc,
                err: function(data) {
                    if (data.retcode === 100000) {

                        handleLogin();
                    } else if (data.retcode === 99999) {

                        verifyCode.show({
                            succ: function(code) {
                                inparam.vcCode = code;
                                console.log('pay vc:', code);
                                applyFree();
                            },
                            cancel: function(code) {
                                dealError({
                                    retcode: 198401
                                });
                            }
                        });

                    } else {
                        dealError(data);
                    }
                    return true;
                }
            });
        }*/

        /*function applySend() {
            DB.receiveSend({
                param: {
                    course_id: inparam.courseId,
                    term_id: inparam.termId
                },
                succ: function(data) {
                    report.tdw({
                        action: 'get-clk',
                        ver1: inparam.courseId,
                        ver2: 1
                    });

                    applySucc(data);
                },
                err: function(data) {
                    data = data || {};

                    report.tdw({
                        action: 'get-clk',
                        ver1: inparam.courseId,
                        ver2: 0
                    });

                    var msg = '';
                    switch (data.retcode) {
                        case 101402:
                            msg = '已接受过赠送，无法再接受了';
                            break;
                        case 106409:
                            msg = '课程已结束，无法接受赠送了';
                            break;
                        case 106447:
                            msg = '您为该课程的老师、助教，无需赠送';
                            break;
                        case 106357:
                            msg = '接受赠送失败，您已经接受过该门课程的赠送';
                            break;
                        case 106458:
                            msg = '接受赠送失败，你已购买该门课的班级通，可进入任意课堂进行上课';
                            break;
                    }
                    msg ? $.Dialog.alert(msg, {
                        onAccept: function() {
                            location.reload();
                        },
                        onClose: function() {
                            location.reload();
                        }
                    }) : $._alert('服务器繁忙，请稍后再试(' + data.retcode + ')');
                    return true;
                }
            });
        }*/

        function queryPayState() {
            DB.checkPayState({
                param: {
                    courseid: inparam.courseId,
                    term_id: inparam.termId,
                    passcard: inparam.passcardClass ? 1 : 0
                },
                succ: function(data) {
                    var orderState = data.result.order_state;

                    if (orderState === 5) {
                        //需要通知后台，报名成功
                        if (inparam.passcardClass) {
                            //报名班级通，需要给出开课提醒
                            selectRemindTime({
                                stateSrc: 'server'
                            }, applySucc);
                        } else {
                            applySucc({
                                stateSrc: 'server'
                            });
                        }
                    } else {
                        //并未调dealErr方法
                        //var orderState = data.orderState;
                        var state = 'unknown';
                        if (orderState == 1 || orderState == 4 || orderState == 10 || orderState == 11) {
                            state = 'nopay';
                        } else if (orderState == 2 || orderState == 3 || orderState == 6 || orderState == 7) {
                            state = 'confirm';
                        } else if (orderState == 8 || orderState == 9) {
                            state = 'back';
                        }
                        inopt.err && inopt.err({
                            orderState: state
                        });
                    }
                },
                err: function(data) {
                    //并未调dealErr方法
                    inopt.err && inopt.err({
                        orderState: 'confirm'
                    });
                }
            });
        }

        function applySucc(succData) {
            succData || (succData = {});

            DB.getApplyInfo({
                param: {
                    course_id: inparam.courseId
                },
                succ: function(data) {
                    inparam.userInfo || (inparam.userInfo = {});
                    inparam.has_record = data.result.has_record;
                    var result = data.result,
                        info = inparam.userInfo;

                    info.mobile = result.mobile;
                    info.qq = $.cookie.uin();
                    info.email = result.email;
                    info.gname = result.gname;
                    info.token = result.token;
                    //inparam.publicAccountERCode = true;
                    if (result.gcode) {
                        inparam.qunid = result.gcode;
                        succData.discussQun = result.gcode;
                    }

                    inopt.succ && inopt.succ(succData);

                    if(inopt.param.type !== 2) {
                        showSuccWin();
                    }
                },
                err: function() {
                    inparam.userInfo || (inparam.userInfo = {});
                    inparam.userInfo.qq = $.cookie.uin();
                    inparam.has_record = 0;
                    inopt.succ && inopt.succ(succData);
                    showSuccWin();
                    return true;
                }
            });

            if (inparam.price !== 0 && succData.stateSrc !== 'server' && inparam.source !== 2) {
                DB.payConfirm({
                    param: {
                        courseid: inparam.courseId,
                        term_id: inparam.termId,
                        passcard: inparam.passcardClass ? 1 : 0
                    }
                });
            }
        }

        function handleLogin() {
            if (inopt.nologin) {
                inopt.nologin();
            } else {
                Login.show({
                    succ: function() {
                        location.reload();
                    },
                    close: function() {
                        inparam.price && inopt.openFail && inopt.openFail({
                            retcode: 100000
                        });
                        inopt.err && inopt.err({});
                    }
                });
            }
        }

        function dealError(data) {
            var errMsg,
                errWordings = {
                    '106409': '报名失败，您报名的课程已经结束',
                    '166411': '报名失败，此课程已经开始上课',
                    '166412': '报名失败，请稍候重试', //订单流程错误
                    '166415': '您已购买该课程，不需要再次付款',
                    '166416': '购买失败，免费课程请走免费的流程',
                    '101404': '报名失败，该课程已经下架',
                    '101402': '您已经报名了此课程',
                    '106437': '报名失败，超出直播类型最大500人的限制',
                    '106446': '报名失败，机构创建者不能报名此课程',
                    '106447': '报名失败，此课程的老师或助教不能报名',
                    '106410': '报名失败，您报名的课程为付费课程',
                    '106666': '报名失败，您输入的验证码错误',
                    '106438': '您选择的优惠券不存在，请重新尝试！',
                    '106439': '您选择的优惠券已被锁定，请重新尝试！',
                    '106440': '您选择的优惠券已被使用，请重新尝试！',
                    '106441': '您选择的优惠券已被删除，请重新尝试！',
                    '106442': '您选择的优惠券已过期，请重新尝试！',
                    '166417': '购买失败，该课程还在审核中！',
                    '113137': '优惠券不适用于本课程',
                    '106631': '该班级名额已报满，请选择名额未满班级报名。',
                    '106633': '购买失败，该机构已被清退。',
                    '166418': ' 由于课程变化，该订单已失效 ，请选择其他可报名班级购买。',
                    '113137': '优惠券不适用于本课程',
                    '106457': '您已接受《' + inparam.name + '》第' + inparam.termId + '期的赠送，您可进入我的报名记录（可直接点击进入）里查询并上课'
                };


            if (data.retcode) {
                errMsg = errWordings[data.retcode];
                if (!errMsg) {
                    errMsg =  '服务器繁忙，请稍后再试' + '(' + data.retcode + ')';
                }
                $.Dialog.alert(errMsg, {
                    onAccept: function() {
                        location.reload();
                    },
                    onClose: function() {
                        location.reload();
                    }
                });
            }

            inopt.err && inopt.err(data);
            return true;
        }

        function selectRemindTime(data, callback) {
            var terms = inparam.terms.slice();

            //销毁掉支付弹窗
            destroyPayWin();

            //默认每期都设提醒
            for (var i = 0; i < terms.length; i++) {
                if (terms[i].term_id === 0) {
                    //需要去掉班级通
                    terms.splice(i, 1);
                } else {
                    terms[i].isRemind = true;
                }
            }

            var content = TmplInline_couseOperation.remindTime({
                terms: terms
            }, {
                getTermTimeString: $.render.courseTime
            });

            $.Dialog.alert({
                body:content,
                title: '上课提醒',
                type: 'succ',
                globalClass: 'remindt',
                onAccept: function() {
                    cb();
                    window.open('/user/index/index.html', '_blank');
                },
                onCancel: function() {
                    cb();
                    window.open('/cgi-bin/courseList', '_blank');
                },
                onClose: function() {
                    cb();
                }
            });


            function cb() {
                var items = dialog.find('.mod-choose-time__li_current'),
                    sTerms = [];

                for (var i = 0, len = items.length; i < len; i++) {
                    sTerms.push($(items[i]).data('termid'));
                }

                DB.remindTime({
                    param: {
                        tids: JSON.stringify(sTerms),
                        cid: inparam.courseId
                    },
                    succ: function(res) {
                        callback && callback(data);
                    },
                    err: function(res) {return true;}
                });
            }
            var dialog = $('.remindt');
            dialog.on('click', '.mod-choose-time__li', function() {
                $(this).toggleClass('mod-choose-time__li_current');
            });
        }

        function applyPay() {
            var ajax;
            var _opt = {
                param: {
                    courseid: inparam.courseId,
                    term_id: inparam.termId,
                    passcard: inparam.passcardClass ? 1 : 0
                },
                succ: function(data) {
                    var _opt = {
                        param: data.result,
                        succ: function(data) {
                            if (inparam.passcardClass) {
                                //报名班级通，需要给出开课提醒
                                selectRemindTime(data, applySucc);
                            } else {
                                applySucc(data);
                            }
                        },
                        cancel: function(data) {
                            // debug
                            // selectRemindTime(data);
                            // end debug

                            if (data && data.noQuery) {
                                report.tdw({
                                    action: 'pay-cancelAgreement',
                                    ver1: inparam.courseId
                                });
                                inopt.cancel && inopt.cancel(data);
                            } else {
                                queryPayState();
                            }
                        },
                        close: function(data) {
                            inopt.close && inopt.close(data);
                        },
                        repay: function() {
                            report.tdw({
                                action: 'pay-show-again',
                                ver1: inparam.courseId
                            });
                            init(inopt);
                        }
                    };

                    loadCloudPay(function() {
                        if (fusion2) {
                            inopt.openSucc && inopt.openSucc();

                            /*if(Check.isWeixinUser()){
                                var url = 'http://pay.qq.com/h5/?wxWapPay=1&openid='+$.cookie.get("uid_uin")+'&openkey=openkey&sessionid=hy_gameid&sessiontype=st_dummy&m=buy&c=goods&pf=wechat_guest-2001-html5-2001&dc=qdqb,qqcard,mcard,hfpay';
                                url += '&sandbox=1';

                                var returnUrl = 'http://ke.qq.com/';
                                url +="&ru=" + encodeURIComponent(returnUrl);

                                var tokenData = JSON.parse(ajax.responseText).result;
                                console.log(tokenData);
                                console.log(url + '&token=' + tokenData.token + "&params=" + encodeURIComponent(tokenData.url_params));
                            }else{
                                openPayWindow(_opt, ajax.getResponseHeader('DevMode'));
                            }*/
                            openPayWindow(_opt, ajax.getResponseHeader('DevMode'));
                        } else {
                            dealError({
                                retcode: 10001
                            });
                            inopt.openFail && inopt.openFail({
                                retcode: 10001
                            }); //组件加载失败
                        }
                    });

                },
                err: function(data) {
                    if (data.retcode === 100000) {
                        handleLogin();
                    } else {
                        inopt.openFail && inopt.openFail(data);
                        dealError(data);
                    }
                    return true;
                }
            };
            if (inparam.couponId) {
                _opt.param.cou_id = inparam.couponId;
            }

            /*if(Check.isWeixinUser()){
                ajax = DB.getPayTokenWeixin(_opt);
            }else{
                ajax = DB.getPayToken(_opt);
            }*/

            ajax = DB.getPayToken(_opt);

            /*
            setTimeout(function () {
                applySucc();
            }, 0);*/
        }



        if(inparam.passcardClass) {
            //班级通不需要判断时间冲突
            applyPay();
        /*} else if (inparam.source === 2 && inparam.pay_status != 10) { //此处有bug 不能光按照souce来判断 来要根据订单状态  10状态是赠送已取消
            applySend();*/
        } else {
            checkTimeConflict({
                courseId: inparam.courseId,
                termId: inparam.termId
            }, function() {
                /*if (inparam.price === 0) {
                    applyFree();
                } else {
                    applyPay();
                }*/
                applyPay();
            });


        }


        if (inparam.couponId) {

            report.tdw({
                module: 'index',
                action: inparam.type !=2 ? 'payment_use_coupon_livecourse' : 'payment_use_coupon_videocourse',
                ver3: inparam.price,
                ver1: inparam.courseId
            });

        }
    }

    loadCloudPay();

    return {
        init: init
    };
}));
