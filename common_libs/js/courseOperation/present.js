/*
课程赠送
*/
(function (root , factory){

    if(typeof root.define === 'function' && root.define.amd){
        define(['jquery', 'db', 'report', 'login', 'courseOperation/db.courseOperation', 'commonTemplate/courseOperation', 'courseOperation/notify', 'groupTencent'] , factory)
    }else {
        root['Reserve'] = factory(root['jquery'], root['DB'], root['report'])
    }

}(this, function ($, DB, Report, Login){

    var inopt, inparam;

    var TmplInline_couseOperation = require('commonTemplate/courseOperation');
    var Notify = require('courseOperation/notify');
    var GroupTencent = require('groupTencent');

    function showSuccWin() {


        // inparam.name = html.encode(inparam.name);
        inparam.c = {};//conflictData;

        console.log("inparam", inparam);

        /* $(".fusion_dialog_wrap").remove();
         $(".fusion_dialog_mask").remove();*/

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
                        GroupTencent.join(inparam.qunid, $.cookie.uin());
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
        }

    }

    function present() {
        var succData = {};
        // loskael passcard passcard = 1, termid = 0
        var _param = {
                course_id: inparam.courseId,
                term_id: inparam.termId || 0
            };
        if (inparam.source === 2 && inparam.termId === 0) {
            _param.passcard = 1;
        }
        DB.receiveSend({
            param: _param,
            succ: function(data) {
                Report.tdw({
                    action: 'get-clk',
                    ver1: inparam.courseId,
                    ver2: 1
                });
                DB.getApplyInfo({
                    param: {
                        course_id: inparam.courseId
                    },
                    succ: function(data) {
                        inparam.userInfo || (inparam.userInfo = {});

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

                        inopt.succ && inopt.succ(succData);
                        if(inopt.param.type !== 2) {
                            showSuccWin();
                        }
                        return true;
                    }
                });

            },
            err: function(data) {
                data = data || {};

                Report.tdw({
                    action: 'get-clk',
                    ver1: inparam.courseId,
                    ver2: 0
                });

                var msg;
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
                    case 106457:
                        msg = '接受赠送课程失败，请重试。';
                    case 107043:
                        msg = '接受赠送失败，该课程已下架！';
                        break;
                    case 106633:
                        msg = '接受赠送失败，该机构已被清退！';
                        break;
                }

                msg ? $.Dialog.alert(msg, {
                    onAccept: function() {
                        location.reload();
                    },
                    onClose: function() {
                        location.reload();
                    }
                }) : $.Dialog.alert('服务器繁忙，请稍后再试(' + data.retcode + ')');

                inopt.err && inopt.err();
                return true;
            }
        });
    }





    return {
        init: function (opt) {
            inopt = opt;
            inparam = inopt.param;

            if (!Login.isLogin()) {
                Login.show({
                    succ: function() {
                        present();
                    },
                    close: function() {
                        inopt.cancel && inopt.cancel();
                    }
                });
            } else {
                present();
            }
        }
    }
}));
