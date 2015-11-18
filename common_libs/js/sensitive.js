/**
 * User: litten
 * Date: 2014-08-28
 * des: 敏感词判断组件
 */
define(['jquery', 'db'], function($, DB) {

    var _dom;
    var _cb;
    var _allcb;
    var _checkCount = 0;
    var _succCount = 0;

    var checkWord = function($target, cb, count) {
        var word = $target.val().replace(/\s/g, "");
        if (word.length === 0 || $target.closest(".mod-form__line").hasClass("g-err")) {
            _checkCount++;
            _succCount++;
            return;
        }

        $target.data("sensitive", "ing");

        DB.check_word({
            param: {
                word: JSON.stringify([word])
            },
            succ: function(data) {
                $target.data("sensitive", "succ");
                cb && cb("succ", $target);

                if (count) {
                    _checkCount++;
                    _succCount++;
                    console.log(_checkCount + "-" + _dom.length);
                    if (_checkCount == _dom.length) {
                        if (_checkCount == _succCount) {
                            _allcb(true);
                        } else {
                            _allcb(false);
                        }

                    }
                }
            },
            err: function(data) {
                $target.data("sensitive", "err");
                cb && cb("err", $target);
                if (count) {
                    _checkCount++;
                    if (_checkCount == _dom.length) {
                        if (_checkCount == _succCount) {
                            _allcb(true);
                        } else {
                            _allcb(false);
                        }
                    }
                }
                return true;
            }
        });
    };

    function manualCheck(cb) {
        _checkCount = 0;
        _succCount = 0;
        _allcb = cb;
        for (var i = 0, len = _dom.length; i < len; i++) {
            checkWord(_dom.eq(i), _cb, true);
        }
    }

    function addDom($dom, cb) {
        _dom = $dom;
        _cb = cb;

        $dom.bind("blur", function(e) {
            checkWord($(e.target), cb);
        });
    }

    var _checked_ = {};

    function check(word, cb) {
        word = word.toString();
        if (!word.length) return cb && cb(false);
        var hit = _checked_[word];
        if (hit !== undefined) return cb && cb(hit);
        DB.check_word({
            param: {
                word: JSON.stringify([word])
            },
            succ: function() {
                _checked_[word] = true;
                cb && cb(true);
            },
            err: function() {
                _checked_[word] = false;
                cb && cb(false);
                return true;
            }
        });
    }

    return {
        check: check,
        addDom: addDom,
        manualCheck: manualCheck
    };
});