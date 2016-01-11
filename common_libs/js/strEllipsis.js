/**
 * strEllipsis.substring
 * @param {String} string 需要做截断省略的字符
 * @param {Number} width 截断区域的宽度
 * @param {Number} line 截断的行数
 */
(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        // @TODO 去掉对simple的依赖
        define(['jquery', './localstorage', 'html'], factory); //TODO: simple from template
        //define(['jquery','./log', './login','./proj_cfg'], factory);//TODO: simple from template
    } else {
        // Browser globals
        root['strEllipsis'] = factory(root['$'], root['localData'], root['html']);
    }
}(this, function($, localData, html) {

    var chars = [];

    var SUFFIX = '...';

    var key = 'CHAR_VALUE_DICTIONARY';

    function _prepare() {
        // read localstorage
        try {
            var local = JSON.parse(localData.get(key));
            if (local) {
                chars = local;
            }
        } catch (e) {}

        if (chars.length) {
            return;
        }

        var span = $('<span style="display:none"></span>').appendTo(document.body);
        for (var i = 0, l = 256; i < l; i++) {
            chars.push(
                span.html('&#' + i)
                .width()
            );
        }

        // write localstorage
        try {
            localData.set(key, JSON.stringify(chars));
        } catch (e) {}
    }

    var flag = false;

    function subline(string, width, line) {
        if (!chars.length) _prepare();
        var l = string.length,
            arr = string.split(''),
            i = 0,
            w = chars[46] * 3, // .对应charcode 46
            s;
        while (line >= 1 && i < l) {
            for (; i < l; i++) {
                s = arr[i];
                if (!s) {
                    return l;
                }
                if (s === '\n') {
                    line--;
                    w = 0;
                    i += 1;
                    break;
                }
                w += _wordLen(s);
                if (w > width) {
                    line--;
                    w = 0;
                    break;
                }
            }
        }
        return i;
    }

    function _wordLen(w) {
        return chars[w.charCodeAt(0)] || 12;
    }

    var _cache_value = {};
    var _get_word_len = function(word, fontSize) {
        var unicode = (word || '').charCodeAt(0);
        if (isNaN(unicode)) return 0;
        if (unicode >= 19968 && unicode <= 40869) {
            return fontSize;
        }
        if (unicode === 32) {
            return parseInt(fontSize / 3, 10);
        }

        var _span = $('<span style="display:none;font-size:' + fontSize + 'px;"></span>').appendTo(document.body);
        var _key = ['u', unicode, 's', fontSize].join("");
        var _value = _cache_value[_key];
        if (_value === undefined) {
            _value = _span.html('&#' + unicode).width();
            _cache_value[_key] = _value;
        }
        return _value;
    };

    function subline_plus(string, width, line, fontSize, fallback) {
        var str = string.toString();
        var length = str.length;
        var index = 0;
        var line_len = 0;
        while (length--) {
            var word = str.charAt(index);
            var word_len = _get_word_len(word, fontSize);
            if ((line_len + word_len + (line === 1 ? fallback : 0) > width) || word === '\n') {
                if (--line === 0) return index;
                line_len = 0;
            }
            line_len += word_len;
            index++;
        }
        return index;
    }

    function substring(string, width, line) {
        line = Math.max(parseInt(line, 10) || 1, 1);
        width = parseInt(width, 10) || 0;
        string = html.decode(string);
        var i = subline(string, width, line);
        if (i === string.length || width < 1) {
            return html.encode(string);
        } else {
            return html.encode(string.substr(0, i)) + '...';
        }
    }

    function substring_plus(string, width, line, fontSize, fallback) {
        line = Math.max(parseInt(line, 10) || 1, 1);
        fontSize = parseInt(fontSize, 10) || 12;
        fallback = typeof fallback === "number" ? parseInt(fallback, 10) : 30;
        width = parseInt(width, 10) || 0;
        string = html.decode(string);
        var i = subline_plus(string, width, line, fontSize, fallback);
        if (i === string.length || width < 1) {
            return html.encode(string);
        } else {
            return html.encode(string.substr(0, i)) + '...';
        }
    }

    return {
        substring: substring,
        substring_plus: substring_plus
    };

}));
