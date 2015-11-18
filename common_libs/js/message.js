define([
    'require',
    'jquery'
], function(require) {

    var $ = require('jquery');

    return function(msg, opts) {
        if (!msg) return;
        opts = opts || {};
        var output = [];
        output.push('<div class="message-box">');
        output.push('<div class="message-box-bd">');
        output.push('<i class="icon-font icon-msg-large i-' + (opts.icon || 'success') + '"></i>');
        output.push('<p class="msg-text">' + msg + '</p>');
        output.push('</div>');
        output.push('</div>');
        var $msg = $(output.join('')).hide();
        $(document.body).append($msg);
        $msg.fadeIn(opts.duration || 100, function() {
            setTimeout(function() {
                $msg.fadeOut(opts.duration || 100, function() {
                    $msg.remove();
                });
            }, opts.wait || 2000);
        });
    };
});