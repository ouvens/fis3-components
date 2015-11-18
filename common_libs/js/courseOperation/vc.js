(function (root, factory) {

    // 模块规范之：依赖声明
    if (typeof define === 'function' && define.amd) {

        define(['jquery', 'commonTemplate/courseOperation'], factory);
    } else {

        root['verifyCode'] = factory(root['jQuery'], root['TmplInline_couseOperation']);
    }
} (this, function ($, TmplInline_couseOperation) {

        return {
            show: function (opt) {
                var content = TmplInline_couseOperation.vc({}), js_vc_ipt_error_timmer;

                var dialog = $.Dialog.confirm(content, {
                    title: '请输入验证码',
                    //submit: '同意',
                    onAccept: function () {
                        var vcCode = $.trim($('.js-vc-ipt').val());
                        if (vcCode.length < 4) {
                            /*alert('请输入正确的验证码！');*/
                            var _ipt_errot = $('.js-vc-ipt-error');
                            _ipt_errot.html('请输入正确的验证码！');
                            if(js_vc_ipt_error_timmer){
                                window.clearTimeout(js_vc_ipt_error_timmer);
                            }
                            js_vc_ipt_error_timmer =  window.setTimeout(function(){
                                _ipt_errot.html('&nbsp;');
                            }, 2000);
                            return true;
                        }
                        opt.succ && opt.succ(vcCode);
                        //data.repay();
                    },
                    onCancel: function () {
                        console.log('取消了');
                        opt.cancel && opt.cancel();
                        //data.cancel({noQuery: true});
                    }

                });
                dialog.find('.js-vc-img').click(function () {
                    $(this).attr('src', 'http://captcha.qq.com/getimage?aid=715021410&r=' + (+new Date));
                });

            }
        }

}));
