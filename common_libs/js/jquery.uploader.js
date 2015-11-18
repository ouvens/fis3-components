/**
 * file uploader
 * @description file upload use jquery.form
 */
define([
    "jquery",
    "db",
    "dialog",
    "jquery.form"
], function($, DB) {

    var wrap = function($input) {
        $input.wrap("<form method='post' enctype='multipart/form-data'></form>");
        return $input.parent();
    };

    var unwrap = function($input) {
        $input.unwrap();
    };

    var getInputHTML = function($input) {
        var $form = wrap($input);
        var html = $form.html();
        unwrap($input);
        return html;
    };

    var reset_input = function($input, opt) {
        var $form = wrap($input);
        $input.replaceWith(opt.__html__);
        $input = $form.find("input");
        typeof opt.resetInput === "function" && opt.resetInput($input);
        unwrap($input);
        input_change($input, opt);
    };

    var show_retcode = function(retcode) {
        switch (retcode) {
            case 110405:
                $._alert("没有管理权限，请重新刷新页面", function() {
                    location.reload();
                });
                break;
            case 106425:
                $._alert("不能上传空文件", "上传失败");
                break;
            case 106439:
                $._alert("上传的文件类型不对", "上传失败");
                break;
            case 106444:
                $._alert("上传的文件过大，请上传2M以内的文件", "上传失败");
                break;
            case 106465:
                $._alert("请先选择要上传的文件", "上传失败");
                break;
            case 106467:
            case 106468:
                $._alert("Excel文件出错，请重新上传", "上传失败"); // 文件格式不正确，请检查后重试
                break;
            case 106627:
                $._alert("图片过大，请上传分辨率不超过96dip，尺寸不超过3500*2500大小的图片", "上传失败");
                break;
            default:
                $._alert("服务器繁忙，请稍后再试(" + (retcode || -1) + ")", "上传失败");
                break;
        }
    };

    var input_change = function($input, opt, isNotBind) {

        var complete = function(data) {
            unwrap($input);
            reset_input($input, opt);
            data = data || {};
            var retcode = data.retcode;
            if (retcode === 0) {
                typeof opt.success === "function" && opt.success(data);
            } else {
                if (typeof opt.error === "function") {
                    var isIgnore = opt.error(data);
                    if (isIgnore === true) {
                        return;
                    }
                }
                return show_retcode(retcode);
            }
        };

        var doChange = function() {

            var filepath = $.trim($input.val());
            if (!filepath) {
                return;
            }

            if(this.files && this.files[0] && this.files[0].size < 1) {
                $._alert('不能上传空文件！');
                reset_input($input, opt);
                return;
            }

            if (typeof opt.beforeSend === "function") {
                var isOK = opt.beforeSend.call(this);
                if (isOK === false) {
                    reset_input($input, opt);
                    return;
                }
            }

            var data = {
                r: Math.random(),
                bkn: DB.encryptSkey(DB.getCookie("skey"))
            };

            var param = opt.data;
            if (typeof param === "object") {
                for (var key in param) {
                    data[key] = param[key];
                }
            }

            wrap($input).ajaxSubmit({
                data: data,
                url: opt.url,
                dataType: opt.dataType || "json",
                success: function(data) {
                    complete(data);
                },
                error: function() {
                    complete();
                }
            });
        };

        isNotBind ? doChange() : $input.change(doChange);
    };

    var upload = function($input, opt, isNotBind) {
        if (!opt.url) {
            return;
        }

        // 该属性可以自己传(不建议自己传)
        opt.__html__ = opt.__html__ || getInputHTML($input);

        input_change($input, opt, isNotBind);
    };

    return {
        upload: upload,
        show_retcode: show_retcode
    };

});
