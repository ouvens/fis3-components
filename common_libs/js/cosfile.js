// cos存储系统，下载及预览接口

define(['jquery'], function ($) {
    function encryptSkey(str) {
        if (!str) {

            return "";
        }
        var hash = 5381;
        for (var i = 0, len = str.length; i < len; ++i) {
            hash += (hash << 5) + str.charAt(i).charCodeAt(); // jshint ignore:line
        }
        return hash & 0x7fffffff; // jshint ignore:line
    }


    // 预览需要机构的身份鉴权
    function previewFile(aid, fid) {
        // 下载
        var url = '/cgi-bin/tools/resource4html ';
        var _form = $('.js-preview-download-form');
        var skey = $.cookie.get('skey'),
            bkn = encryptSkey(skey);

        if (_form.length === 0) {
            _form = $('<form method="get" target="_blank" class="js-upload-download-form" style="display:none;"><input type="hidden" name="aid" value="' + aid + '"><input type="hidden" name="res_id" value="' + fid + '"><input type="hidden" name="bkn" value="' + bkn + '"></form>').appendTo($(document.body));
        } else {
            _form.find('input[name="res_id"]').val(fid);
            _form.find('input[name="aid"]').val(aid);
            _form.find('input[name="bkn"]').val(bkn);
        }
        _form.attr('action', url);
        _form.submit();
    }


    // 下载需要验证学生身份
    function downloadFile(aid, fid) {
        // 下载
        var url = '/cgi-bin/file/download';

        var _form = $('.js-upload-download-form');
        if (_form.length === 0) {
            _form = $('<form method="get" target="_blank" class="js-upload-download-form" style="display:none;"><input type="hidden" name="cw_id" value="' + fid + '"><input type="hidden" name="cid" value=""><input type="hidden" name="a_id" value="' + aid + '"><input type="hidden" name="uin" value="' + $.cookie.uin() + '"></form>').appendTo($(document.body));
        } else {
            _form.find('input[name="cw_id"]').val(fid);
            _form.find('input[name="a_id"]').val(aid);
            _form.find('input[name="uin"]').val($.cookie.uin());
        }
        _form.attr('action', url);
        _form.submit();
    }

    return {
        // 预览文件
        preview: previewFile,
        // 下载文件
        download: downloadFile
    };
});