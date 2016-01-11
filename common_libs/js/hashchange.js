define(function() {
    return function(callback) {
        if (('onhashchange' in window) && window.addEventListener) {
            window.addEventListener('hashchange', callback, false);
        } else {
            var history_hash = '';
            var loopCheckHash = function() {
                setTimeout(function() {
                    if (history_hash !== location.hash) {
                        history_hash = location.hash;
                        callback();
                    }
                    loopCheckHash();
                }, 50);
            };
            loopCheckHash();
        }
    };
});