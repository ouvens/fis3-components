(function(root, factory) {

    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'db','report', 'check', 'courseOperation/remind'], factory);
    } else {

        root['Notify'] = factory(root['jQuery'], root['DB'], root['report'], root['Remind']);
    }
} (this, function ($, DB,report, Check, Remind) {

    DB.extend({
        setApplyInfo: DB.httpMethod({
            url: '/cgi-bin/tool/set_user_apply_info',
            type: 'POST'
        }),
        getIdCode: DB.httpMethod({
            url: '/cgi-bin/tool/apply_sms_code'
        }),
        checkIdCode: DB.httpMethod({
            url: '/cgi-bin/tool/check_sms_code'
        })
    });

    var emailNode = [],
        mobileNode = [],
        idCodeNode,
        idCodeBtn,
        clearNode,
        setting = {},
        content;

    /**
     * opt {
     *  data : data,
     *  emailNode : '',
     *  mobileNode : '',
     *  idCodeNode : '',
     *  idCodeBtn : '',
     *
     *  tmpl : template,
     *  confirmOpt : {
     *      title : '' ,
     *      globalClass: '' ,
     *      confirm : true
     *  },
     *  onSubmit :   // after submit
     *  hadProhibit : // 手机是否处于屏蔽状态
     * }
     * @param opt
     */
    var init = function(opt) {
        var data = opt.data,
            tmpl = opt.tmpl;

        //weixin
        data.isweixin = Check.isWeixinUser();

        content = tmpl(data);

        setting = opt;

        return this;
    };

    var oldVal = {};
    var show = function() {

        var confirmOpt = $.extend({
            title: '',
            globalClass: '',
            confirm: true
        }, setting.confirmOpt);
        function showRemind() {
            if(setting.extraObj && setting.extraObj.remind) {
                Remind.init(setting.extraObj.opt);
            }
        }

        function submitInfo() {

            if (emailNode.length <= 0 && mobileNode.length <= 0) {
                $.Dialog.remove();
                showRemind();
                return false;
            }

            var param = {
                email: emailNode.val(),
                mobile: mobileNode.val()
            };

            var sameEmail = false;
            if (param.email == oldVal.email) {
                sameEmail = true;
            }

            var sameMobile = false;
            if (param.mobile == oldVal.mobile) {
                sameMobile = true;
            }

            // 手机屏蔽状态，重启逻辑
            if (setting.hadProhibit && idCodeNode.val().length > 0) {
                sameMobile = false;
            }

            // 没有改变 , 而且手机不处于屏蔽状态，直接退出
            if (sameMobile && sameEmail) {
                $.Dialog.remove();
                showRemind();
                return false;
            }

            var emailValidatedResult = validator.validate(emailNode, validator.rules.email),
                mobileValidateResult = validator.validate(mobileNode, validator.rules.mobile);

            if (!emailValidatedResult || !mobileValidateResult) {
                setting.onValidatedFail && setting.onValidatedFail();
                $.Dialog.remove();
                return true;
            }

            // 已经有新手机号码，必须输入验证码
            if (!sameMobile && mobileNode.val().length > 0 && mobileValidateResult && !(validator.validate(idCodeNode, validator.rules.idCode, '请输入验证码', false))) {
                setting.onValidatedFail && setting.onValidatedFail();
                return true;
            }

            if (setting.submitDataFilter) {
                param = setting.submitDataFilter(param);
            }

            setting.data.userInfo && (param.token = setting.data.userInfo.token);

            // var submitBtn = $('.' + confirmOpt.globalClass);
            submitBtn.text('提交中...');


            function commit() {
                DB.setApplyInfo({
                    param: param,
                    succ: function(data) {
                        showRemind();
                        $.Dialog.remove();

                        submitBtn.text('确定');
                        setting.onSubmit && setting.onSubmit(data);
                    },
                    err: function(data) {
                        if (data.retcode === 106501) {
                            validator.showError(idCodeNode, '验证码错误');
                        } else {
                            validator.showError(idCodeNode, '验证失败');
                        }
                        submitBtn.text('确定');
                        return true;
                    }
                });
            }

            // console.log(param.token);

            if (mobileNode.val().length <= 0) {
                commit();
                return true;
            } else if (sameMobile) {
                //手机号没有改变，使用默认token
                var defaulToken = $('#moblie-no-change-token').val();
                if (defaulToken.length > 0) {
                    param.token = defaulToken;
                }

                commit();
                return true;
            } else {
                DB.checkIdCode({

                    param: {
                        code: idCodeNode.val(),
                        phone: mobileNode.val()
                    },

                    succ: function(data) {

                        param.token = data.result.token;
                        commit();

                    },
                    err: function(data) {
                        if (data.retcode === 106501) {
                            validator.showError(idCodeNode, '验证码错误');
                        } else {
                            validator.showError(idCodeNode, '验证失败');
                        }
                        submitBtn.text('确定');
                        return true;
                    }
                });

                return true;
            }
        }

        var submiting = false;
        $.Dialog.confirm(content, {
            title: confirmOpt.title,
            globalClass: confirmOpt.globalClass,
            confirm: confirmOpt.confirm
        });
        if(setting.data.price > 0) {
            $('.' + confirmOpt.globalClass).css('margin-top', parseInt($('.' + confirmOpt.globalClass).css('margin-top')) - 90);
        }

        emailNode = $(setting.emailNode);
        mobileNode = $(setting.mobileNode);
        idCodeNode = $(setting.idCodeNode);
        idCodeBtn = $(setting.idCodeBtn);
        submitBtn = $(setting.submitNode);

        oldVal = {
            email: emailNode.val(),
            mobile: mobileNode.val()
        };

        setPlaceholder(emailNode);
        setPlaceholder(mobileNode);
        setPlaceholder(idCodeNode);

        setting.onShow && setting.onShow({
            emailNode: emailNode,
            mobileNode: mobileNode,
            idCodeNode: idCodeNode,
            idCodeBtn: idCodeBtn
        });

        submitBtn.on('click', submitInfo);

        bindEvent();

    };



    var setPlaceholder = function(node) {

        if (!$.fn.placeholder) {
            var isOperaMini = Object.prototype.toString.call(window.operamini) == '[object OperaMini]',
                isInputSupported = 'placeholder' in document.createElement('input') && !isOperaMini;

            !isInputSupported &&
                $.loadScript('http://7.url.cn/edu/js/1.2.0/jquery.placeholder.js', function() {
                    $.fn.placeholder && node.placeholder();
                });

        } else {
            node.placeholder();
        }
    };


    var idCodeLabel = '重新获取',
        lock = 0;
    var getIdCode = function($idCodeInput, $idCodeBtn, phone) {
        if (lock == 1) {
            return;
        }
        lock = 1;

        var timestmp = 60;
        $idCodeBtn.addClass('disabled').text(idCodeLabel + '(' + timestmp + ')');

        DB.getIdCode({
            param: {
                phone: phone
            },
            succ: function() {

            },
            err: function() {
                return true;
            }
        });

        var timeId = setInterval(function() {
            if (timestmp <= 1) {
                clearTimeout(timeId);
                $idCodeBtn.text(idCodeLabel);
                $idCodeBtn.removeClass('disabled');
                lock = 0;
            } else {
                $idCodeBtn.text(idCodeLabel + '(' + --timestmp + ')');
            }
        }, 1000);
    };

    var bindEvent = function() {

        emailNode.on("blur", function() {
            validator.validate(emailNode, validator.rules.email);
        });
        emailNode.on("focus", function() {
            emailNode.removeClass('form-item-input-error');
            emailNode.closest('.part-row').find('.error-tip').addClass('error-tip-hidden');
        });

        mobileNode.on("blur", function() {
            validator.validate(mobileNode, validator.rules.mobile);
        });
        mobileNode.on("focus", function() {
            mobileNode.removeClass('form-item-input-error');
            mobileNode.closest('.part-row').find('.error-tip').addClass('error-tip-hidden');
        });

        idCodeNode.on("focus", function() {
            idCodeNode.removeClass('form-item-input-error');
            idCodeNode.closest('.part-row').find('.error-tip').addClass('error-tip-hidden');
        });

        idCodeBtn.click(function(e) {
            e.preventDefault();
            if ($(this).hasClass('disabled')) {
                return;
            }
            if (validator.validate(mobileNode, validator.rules.mobile, false)) {
                getIdCode(idCodeNode, idCodeBtn, mobileNode.val());
            }
        });

        mobileNode.on("keyup paste", function(e) {
            var $this = $(this),
                value = $this.val();

            if (/\D/.test(value)) {
                value = value.replace(/\D/g, '');
                $this.val(value);
                return false;
            } else {
                return true;
            }

        });
    };

    var validator = {
        rules: {
            email: /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
            mobile: /^1\d{10}$/,
            idCode: /^.+$/
        },
        validate: function(node, r, msg, canEmpty) {
            var value = node.val();

            // msg for canEmpty
            if (((typeof msg === 'boolean' && !msg) || (!canEmpty)) && value.length <= 0) {
                this.showError(node, msg);
                return false;
            }

            if (value && !r.test(value)) {
                this.showError(node, msg);
                return false;
            }
            return true;
        },

        showError: function(node, msg) {
            node.addClass('form-item-input-error');
            var errorEl = node.closest('.part-row').find('.error-tip');
            errorEl.removeClass('error-tip-hidden');
            if (msg && typeof msg === 'string') {
                errorEl.find('span').html('<i></i>' + msg);
            }
        }
    };

    return {
        init: init,
        show: show
    };

}));
