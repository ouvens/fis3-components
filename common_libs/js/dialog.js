/**
 * @author jarvisjiang
 * @date 2014-03-11 version 0.0.1
 * @description 腾讯课堂项目模态对话框
 * @example $.Dialog.show(options);
    options:
      title: 对话框标题
      submit: 确定按钮文字
      isDisabled: 确定按钮初始化时是否不可点击
      globalClass: 自定义对话框全局样式
      extraClass: 确定按钮自定义样式，可以根据此参数绑定事件
      content: 对话框内容，一段html
      onAccept: 点确定的回调
      onCancel: 点取消的回调
      onClose: 点关闭的回调
 */
(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'commonTemplate/common'], factory);
    } else {
        factory(root['jQuery'], root['TmplInline_common']);
    }
}(this, function($, TmplInline_common) {

    // !function($) {
    //     'use strict';
    var isIE6 = 'undefined' === typeof document.body.style.maxHeight;

    $.Dialog = {
        show: function(opt) {
            if (!$('.modal-bg').length) $(document.body).append('<div class="modal-bg hide"></div>');
            $('.modal-bg').show();
            opt = opt || {};

            var modal = $($.trim(TmplInline_common.modal({
                dialog: opt,
                id: ("dialog_" + (+new Date()) + Math.random()).replace(/\W/g, "")
            }))).insertAfter('.modal-bg');
            //alert($('.tips').css('height'));
            $('.tips').css('marginTop', '-' + parseInt($('.tips').css('height'), 10) / 2 + 'px');

            // ie6，滚动条置顶
            if (isIE6) {
                $('.modal-bg').css('height', $(document).height());
                $(window).scrollTop(0);
            }

            //去除滚动条
            $("body").css({
                "overflow-y": ""
            });

            var $accept = $('.tips .modal-accept');
            opt.notAutoFocus && $accept.focus();
            opt.onAccept && $accept.on('click', function(e) {
                e.preventDefault();
                if (opt.onAccept()) return;
                $.Dialog.remove();
                $.Dialog.reshow();
            });
            opt.onCancel && $('.tips .modal-cancel').on('click', opt.onCancel);
            opt.onClose && $('.tips .modal-close').on('click', opt.onClose);

            return modal;
        },

        remove: function() {
            $('.tips').remove();
            $('.modal-bg').hide();
            $('.js-modal-bg, .js-modal').remove();
        },

        alert: function(msg, opt) {
            this.remove();

            if (arguments.length == 1 && typeof msg == 'object') {
                opt = msg;
                msg = opt.content;
            }

            opt = opt || {};
            opt.content = msg;
            opt.type = opt.type || 'warn';
            opt.title = opt.title || '提示';
            opt.globalClass = opt.globalClass ? opt.globalClass + ' alert-tips' : 'alert-tips';
            if (!opt.onAccept) {
                opt.onAccept = function() {
                    return false;
                };
            }
            return this.show(opt);
        },

        confirm: function(msg, opt) {
            if (!opt.keep) {
                this.remove();
            } else {
                this.$tips = $('.tips').removeClass('tips').hide();
            }
            opt = opt || {};
            opt.content = msg;
            opt.confirm = opt.confirm !== undefined ? opt.confirm : true;
            opt.title = opt.title || '提示';
            opt.globalClass = opt.globalClass ? opt.globalClass + ' alert-tips' : 'alert-tips';
            return this.show(opt);
        },

        showConfirm: function(opt) {
            this.remove();
            opt = opt || {};
            opt.confirm = true;
            opt.title = opt.title || '提示';
            opt.content = opt.content || '呵呵...';
            opt.globalClass = opt.globalClass ? opt.globalClass + ' alert-tips' : 'alert-tips';
            return this.show(opt);
        },

        showWarn: function(msg, opt) {
            opt = opt || {};
            opt.title = '警告';
            opt.type = 'warn';
            opt.content = msg;
            if (!opt.onAccept) {
                opt.onAccept = function() {
                    return false;
                };
            }
            return this.show(opt);
        },

        showSuccess: function(msg, opt) {
            opt = opt || {};
            opt.title = '成功提示';
            opt.type = 'succ';
            opt.content = msg;
            opt.globalClass = opt.globalClass ? opt.globalClass + ' alert-tips' : 'alert-tips';
            if (!opt.onAccept) {
                opt.onAccept = function() {
                    return false;
                };
            }
            return this.show(opt);
        },

        showError: function(msg, opt) {
            opt = opt || {};
            opt.title = '错误提示';
            opt.type = 'err';
            opt.content = msg;
            opt.globalClass = opt.globalClass ? opt.globalClass + ' alert-tips' : 'alert-tips';
            if (!opt.onAccept) {
                opt.onAccept = function() {
                    return false;
                };
            }
            return this.show(opt);
        },

        // 错误对话框
        showRetry: function(msg) {
            // 删除残留的出错提示框
            $('.retry-dialog').remove();
            $('.tips').hide();
            // 隐藏业务提示框
            var modal = this.show({
                title: '错误提示',
                submit: '重试',
                isDisabled: false,
                retry: true,
                globalClass: 'retry-dialog',
                extraClass: 'btn-retry',
                content: msg || '呵呵...'
            });

            var self = this;

            $('.btn-retry', '.tips').on('click', function(e) {
                e.preventDefault();
                self.removeRetry();
            });

            return modal;
        },

        removeRetry: function() {
            $('.retry-dialog').remove();
            if ($('.tips').length) return $('.tips').show();
            $('.modal-bg').hide();
        },

        reshow: function() {
            if (!this.$tips) return;

            this.$tips.addClass('tips').show();
            if (!$('.modal-bg').length) $(document.body).append('<div class="modal-bg hide"></div>');
            $('.modal-bg').show();

            this.$tips = null;
        },

        updatePosition: function(){
            var $tips = $('.tips');
            $tips.css('marginTop', '-' + parseInt($tips.css('height'), 10) / 2 + 'px');
        }
    };

    // 关闭浮层
    $(document).delegate('.tips .modal-cancel, .tips .modal-close', 'click', function(e) {
        e.preventDefault();
        $.Dialog.remove();
        $.Dialog.reshow();
    });

    return $;
}));
