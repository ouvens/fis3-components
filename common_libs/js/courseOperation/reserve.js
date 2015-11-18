/*
付费课预约试听
*/
(function (root , factory){

    if(typeof root.define === 'function' && root.define.amd){
        define(['jquery', 'db', 'report', 'login', 'courseOperation/db.courseOperation', 'commonTemplate/courseOperation', 'courseOperation/vc'], factory)
    }else {
        root['Reserve'] = factory(root['jquery'], root['DB'], root['report'])
    }

}(this, function ($, DB, Report, Login){

    var TmplInline_courseOperation = require('commonTemplate/courseOperation');
    var verifyCode = require('courseOperation/vc');

    var inopt, inparam;


    function showNofication() {
        $.Dialog.alert({
            globalClass : 'dialog-reservation-succ',
            type: 'succ',
            title: '免费试听',
            content: TmplInline_courseOperation.reserveSucc(inparam)
        });
    }

    /*function playVideo() {
        window.open('http://ke.qq.com/cgi-bin/courseDetail?course_id=' + inparam.courseId, '_blank');
    }*/

    function reserve() {
        var param = {
            course_id: inparam.courseId,
            term_id: inparam.termId,
            from_uin: inparam.from_uin || 0,
            reserve_flag: 1
        };

        var opt = {
            param: param,
            succ: function (data) {
                //直播课显示提醒
                if (inparam.type != 2) {
                    showNofication();
                }/* else {
                    playVideo();
                }*/
                inopt.succ && inopt.succ();
            },
            err: function (data) {
                if (inparam.type == 2) return true;//录播的屏蔽掉错误信息
                var msg;
                /*if (data.retcode == 106411 || data.retcode == 106409) {

                    msg = '该课程的试听已结束，继续学习请付费后进行!';


                } else if (data.retcode == 166417 || data.retcode == 1016601) {

                    msg = '您已经预约此课程，无需再次预约！';

                }*/

                if (data.retcode === 99999) {

                    verifyCode.show({
                        succ: function (code) {
                            param.vfcode = code;
                            DB.reserve(opt);
                        },
                        cancel: function (code) {
                            /*dealError({
                                retcode: 198401
                            });*/
                        }
                    });

                    return true;

                }

                if (data.retcode == 106411) {

                    msg = '您已经报名此课程，无需再次预约！';

                } else if (data.retcode == 106601) {

                    msg = '您已经预约此课程，无需再次预约！';

                } else if (data.retcode == 104103) {

                    msg = '预约失败，该课程还在审核中！';

                } else if (data.retcode == 106409) {

                    msg = '该课程的试听已结束，继续学习请付费后进行！';
                }

                if (msg) {

                    $.Dialog.alert(msg, {
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
        };

        /*if (inparam.type == 2) {
            DB.reserveVideoCourse(opt);
        } else {
            DB.reserve(opt);
        }*/
        DB.reserve(opt);

    }


    return {
        init: function (opt) {
            inopt = opt;
            inparam = inopt.param;
            if (!Login.isLogin()) {
                Login.show({
                    succ: function() {
                        reserve();
                    },
                    close: function() {
                        inopt.cancel && inopt.cancel();
                    }
                });
            } else {
                reserve();
            }


        }
    }
}));
