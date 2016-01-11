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

        define(['jquery', 'db', 'login', 'report', 'commonTemplate/courseOperation', 'groupTencent', 'courseOperation/vc', 'courseOperation/notify', 'base', 'courseOperation/db.courseOperation'], factory);
    } else {

        root['Pay'] = factory(root['jQuery'], root['DB'], root['Login'], root['report'], root['TmplInline_couseOperation'], root['groupTencent'], root['verifyCode']);
    }
}(this, function($, DB, Login, report, TmplInline_couseOperation, groupTencent, verifyCode, Notify) {

    var conflictData = {};
    var inopt, inparam;



    function checkTimeConflict(options) {
        options || (options = {});


        DB.checkTimeConflict({
            param: {
                course_id: options.courseId,
                term_id: options.termId

            },
            succ: function(data) {
                conflictData = data.result || conflictData;
                applyFree();

            },
            err: function(data) {
                if (data.retcode === 100000 || data.retcode === 100021 || data.retcode === -1001 || data.retcode === 111) {

                    handleLogin();

                } else {
                    applyFree();
                }
                return true;
            }
        });
    }

    function applyFree() {
        var param = {
            course_id: inparam.courseId,
            term_id: inparam.termId,
            from_uin: inparam.from_uin || 0
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
                //inParam.publicAccountERCode = true;
                if (result.gcode) {
                    inparam.qunid = result.gcode;
                    succData.discussQun = result.gcode;
                }

                inopt.succ && inopt.succ(succData);
                showSuccWin();
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

    }

        function showSuccWin() {

            inparam.c = conflictData;

            function show() {
                Notify.init({
                    data: inparam,
                    tmpl :  TmplInline_couseOperation.paySucc,
                    emailNode : '#js_pay_email',
                    idCodeNode : '#js_id_code',
                    idCodeBtn : '#js_id_code_btn',
                    mobileNode :'#js_pay_mobile',
                    hadProhibit : (inparam.user_notify_status == 1),
                    confirmOpt : {
                        title: "报名成功",
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
                    inparam.user_notify_status = data.result.status;
                    show();
                },
                err: function() {
                    inparam.user_notify_status  = 0;
                    show();
                }
            });

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

    return {
        init: function (opt) {
            inopt = opt;
            inparam = inopt.param;
            checkTimeConflict({
                courseId: inparam.courseId,
                termId: inparam.termId || 0
            });
        }
    };
}));
