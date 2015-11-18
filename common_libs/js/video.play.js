/* global tvp */
/*
    .video-preview-dialog{
        width: 490px;
        .tips-bd{
            padding: 0;
            height: 400px;
            overflow: hidden;
        }

        .tips-tool{
            display: none;
        }
    }
 */
define([
    'require',
    'jquery',
    'dialog',
    'player.config',
    'http://imgcache.gtimg.cn/tencentvideo_v1/tvp/js/tvp.player_v2.js'
], function(require) {

    var $ = require('jquery');
    var Dialog = require('dialog');

    var PLAYERCONFIG = $.extend({}, require('player.config') || {}, {
        width: 490,
        height: 400,
    });

    // 打开视频预览
    var preview = function(vid, aid, options) {
        var config = $.extend(true, {}, PLAYERCONFIG, options || {});

        config.vodFlashExtVars = config.vodFlashExtVars || {}
        config.vodFlashExtVars.eduext = '0_0_' + aid + '_3';

        var modId = config.modId = 'video-preview-container-' +
            (Math.random() + (+new Date)).toString().replace(/\D+/g, '');

        $.Dialog.confirm('<div id="' + modId + '"></div>', {
            title: '视频预览',
            globalClass: 'video-preview-dialog'
        });

        var video = config.video = new tvp.VideoInfo();

        video.setVid(vid);

        (new tvp.Player()).create(config);
    };

    return preview;
});