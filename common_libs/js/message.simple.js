define([
    'require',
    'jquery'
], function(require) {

    var $ = require('jquery');

    return function(msg, opts) {
        if (!msg) return;
        opts = opts || {};
        var $msg = $('<div class="message-box-simple">' + msg + '</div>').hide();
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