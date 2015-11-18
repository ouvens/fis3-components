
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else {
        factory(root['jQuery']);
    }
}(this, function ($) {

    $.keyboard = function () {

        function limitNumber () {
            return limit('0123456789');
        }

        function limit (allowedChars) {
            var e = event || window.event;
            var code = e.keyCode || e.charCode;
            // FF
            if (e.charCode == 0) {
                return true;
            }
            // Ctrl+C、Ctrl+V
            if (e.ctrlKey && (code == 99 || code == 118)) {
                return true;
            }
            // ASCII control character
            if (code < 32) {
                return true;
            }

            allowedChars = typeof allowedChars == 'string' ? allowedChars.split('') : [];
            var allowedCodes = [];

            for (var i = 0, len = allowedChars.length; i < len; i++) {
                var c = allowedChars[i].charCodeAt();
                allowedCodes.push(c);
            }
            return $.inArray(code, allowedCodes) > -1;
        }
        
        return {
            limitNumber: limitNumber,
            limit : limit
        };
    }();
    
}));