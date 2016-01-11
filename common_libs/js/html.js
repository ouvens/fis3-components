/**
 * @fileoverview @todo @casper 作者！！大家呼唤你回来写文档注释
 * @example @todo
 */
(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        root['html'] = factory();
    }
}(this, function() {
    var html = function() {
        var rdecodeEntity = /&quot;|&lt;|&gt;|&amp;|&nbsp;|&apos;|&#(\d+);|&#(\d+)/g;
        var rencodeEntity = /['<> "&]/g;
        var decodeEntities = {
            '&quot;': '"',
            '&lt;': '<',
            '&gt;': '>',
            '&amp;': '&',
            '&nbsp;': ' '
        };
        var rhtmlSpace = /\u00a0/g;
        var rbr = /<br\s*\/?>/ig;
        var rlf = /\r?\n/g;
        var rspace = /\s/g;

        var encodeEntities = {};
        for (var i in decodeEntities) {
            encodeEntities[decodeEntities[i]] = i;
        }

        decodeEntities['&apos;'] = '\'';
        encodeEntities['\''] = '&#39;'; // &apos; (IE不支持)

        function fdecodeEntity(matched, charCode, lastCharCode) {
            if (!charCode && !lastCharCode) {
                return decodeEntities[matched] || matched;
            }
            return String.fromCharCode(charCode || lastCharCode);
        }

        function fencodeEntity(matched) {
            return encodeEntities[matched];
        }

        return {
            encode: function(text) {
                return text ? ('' + text).replace(rencodeEntity, fencodeEntity).replace(rlf, '<br/>').replace(rspace, '&nbsp;') : '';
            },
            decode: function(text) {
                return text ? ('' + text).replace(rbr, '\n').replace(rdecodeEntity, fdecodeEntity).replace(rhtmlSpace, ' ') : '';
            },
            //encodeBase16
            encodeBase16: function(str) {
                if (!str) return str;
                str = str + '';
                var _en = [];
                for (var i = 0, len = str.length; i < len; i++) {
                    _en.push(str.charCodeAt(i).toString(16).toUpperCase());
                }
                return _en.join('');
            },
            encodeBase16forJSON: function(str) {
                if (!str) return str;
                str = str.replace(/[\u4E00-\u9FBF]/ig, function(i) {
                    return escape(i).replace('%u', '\\u');
                });
                var _en = [];
                for (var i = 0, len = str.length; i < len; i++) {
                    _en.push(str.charCodeAt(i).toString(16).toUpperCase());
                }
                return _en.join('');
            },
            //decodeBase16
            decodeBase16: function(str) {
                if (!str) return str;
                str = str + '';
                var out = [];
                for (var i = 0, len = str.length; i < len; i = i + 2) {
                    out.push(String.fromCharCode('0x' + str.slice(i, i + 2)));
                }
                return out.join('');
            },
            encodeObject: function(obj) {
                if (obj instanceof Array) {
                    for (var i = 0, len = obj.length; i < len; i++) {
                        obj[i] = html.encodeObject(obj[i]);
                    }
                } else if (typeof obj === 'object') {
                    for (var e in obj) {
                        obj[e] = html.encodeObject(obj[e]);
                    }

                } else if (typeof obj === 'string') {
                    return html.encode(obj);
                }
                return obj;

            }
        };
    }();
    return html;
}));