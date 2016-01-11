(function(root , factory){

    if (typeof define === 'function' && define.amd) {

        define(['jquery', 'db','report', 'commonTemplate/courseOperation'], factory);
    } else {

        root['Remind'] = factory(root['jQuery'], root['DB'], root['report'], root['TmplInline_myCourse']);
    }
} (this, function ($, DB, report, TmplInline_courseOperation) {



    DB.extend( {
        setRemindTerm: DB.httpMethod({url: '/cgi-bin/course/set_remind_term', type: 'POST'}),
        getRemindTerm: DB.httpMethod({url: '/cgi-bin/course/get_remind_term'})
    });


    var param = {},
        _data = {},
        _paramList = ['tips', 'email', 'sms', 'public_account'],
        _opt = {},
        $_dialog;

    function initConfig(opt) {
        $_dialog = null;
        _opt = opt;
    }

    function init(opt){
        initConfig(opt);

        DB.getRemindTerm({
            param: {cid: opt.cid, passcard: opt.passcard, tid: opt.tid},
            succ: function (res) {
                _data = res.result;

                _data.uin = $.cookie.uin();
                _data.course = opt.cName;
                _data.passcard = opt.passcard;
                _data.cid = opt.cid;
                _data.tid = opt.tid;
                _data.terms = opt.terms;

                renderTpl();
            },
            err: function (res) {
                if(res.retcode == 101404) {
                    $.Dialog.alert('该课程已经下架！', {
                        onAccept: function() {
                            location.reload();
                        },
                        onClose: function() {
                            location.reload();
                        }
                    });
                }
            }
        });
    }

    function renderTpl() {
        var html = '';

        _data.notifyNum = 0;

        for(var i = 0, len = _paramList.length; i < len; i++) {
            if(_data[_paramList[i]] === 1) {
                _data.notifyNum++;
            }
        }




        if(!$_dialog) {
            // $_dialog.find('.tips-bd').html(html);
        /*    $_dialog.find('.mycourse-remind-info').html(TmplInline_courseOperation.remindBoxInfo(_data));
        } else {*/
            var dialogCont,
                classStr = 'mycourse-remind';

            if(_data.passcard) {
                if(_data.terms.length === 1) {
                    classStr += ' mycourse-remind-p1';
                } else if(_data.terms.length === 2) {
                    classStr += ' mycourse-remind-p2';
                } else if(_data.terms.length >= 3) {
                    classStr += ' mycourse-remind-p3';
                }
            }

            $.Dialog.confirm(TmplInline_courseOperation.remindBox(_data), {
                title: "设置提醒",
                globalClass: classStr,
                onAccept: function () {
                    var items = $_dialog.find('.mod-choose-time__li_current'),
                        sTerms = [],
                        succBack = 0;

                    for (var i = 0, len = items.length; i < len; i++) {
                        sTerms.push($(items[i]).data('termid'));
                    }
                    // return false;
                    DB.setRemindTerm({
                        param: {
                            cid: _data.cid,
                            shake: _data.shake,
                            passcard: _data.passcard,
                            tid: _data.tid,
                            tips: _data.tips,
                            email: _data.email,
                            sms: _data.sms,
                            public_account: _data.public_account
                        },
                        succ: function (res) {
                            // _data[property] = obj[property];
                            // renderTpl();
                            succBack++;
                            if(succBack === 2) {
                                $.Dialog.remove();
                            }
                        },
                        err: function (res) {}
                    });

                    if(_opt.passcard === 1) {
                        DB.remindTime({
                            param: {
                                tids: JSON.stringify(sTerms),
                                cid: _data.cid
                            },
                            succ: function(res) {
                                succBack++;
                                if(succBack === 2) {
                                    $.Dialog.remove();
                                }
                            },
                            err: function(res) {
                                return true;
                            }
                        });
                    }

                    
                }
            });

            $_dialog = $('.mycourse-remind');
            // $_dialog.find('.tips-bd').html();
            bindEvent();
        }

         $_dialog.find('.mycourse-remind-info').html(TmplInline_courseOperation.remindBoxInfo(_data));

        if(_data.passcard) {
            var content = TmplInline_courseOperation.remindTime({
                terms: _data.terms
            }, {
                getTermTimeString: $.render.courseTime,
                noheader: true
            });

            $_dialog.find('.mycourse-remind-passcard-selector').html(content);


        }
    }

    function selectRemindTime(terms, cid) {

        var content = TmplInline_courseOperation.remindTime({
            terms: terms
        }, {
            getTermTimeString: $.render.courseTime,
            noheader: true
        });

        $.Dialog.confirm(content, {
            title: '上课提醒',
            globalClass: 'remindt',
            onAccept: function() {
                var items = dialog.find('.mod-choose-time__li_current'),
                    sTerms = [];

                for (var i = 0, len = items.length; i < len; i++) {
                    sTerms.push($(items[i]).data('termid'));
                }

                DB.remindTime({
                    param: {
                        tids: JSON.stringify(sTerms),
                        cid: cid
                    },
                    succ: function(res) {
                        //更新 _planData 提醒状态
                        for (var i = 0, len = terms.length; i < len; i++) {
                            var selected = false;
                            for (var j = 0, l = sTerms.length; j < l; j++) {
                                if (terms[i]['term_id'] === sTerms[j]) {
                                    terms[i].isRemind = true;
                                    selected = true;
                                    break;
                                }
                            }
                            if (!selected) {
                                terms[i].isRemind = false;
                            }
                        }

                        renderData('succ', _planData);
                    },
                    err: function(res) {
                        return true;
                    }
                });
            },
            onCancel: function() {},
            onClose: function() {}
        });

        var dialog = $('.remindt');

        dialog.on('click', '.mod-choose-time__li', function() {
            var $this = $(this);

            $this.toggleClass('mod-choose-time__li_current');
        });
    }


    function bindEvent() {
        $_dialog.on('click', 'a.mycourse-remind-dt-rol3', function () {
            var property = $(this).closest('.mycourse-remind-dt').data('propety'),
                obj = {};

            for(var i = 0, len = _paramList.length; i < len; i++) {
                if(property === _paramList[i]) {
                    if(_data[property] === 1) {
                        _data[property] = 2;
                    } else {
                        _data[property] = 1;
                    }
                }/* else {
                    _data[_paramList[i]] = _data[_paramList[i]];
                }*/
            }

            if((property === 'email' && !_data['email_string']) || (property === 'sms' && !_data['mobile_number'])) {
                //设置提醒
                $('#js_con_live .live-clock').trigger('click', [{'remind': true, opt: _opt}]);
            } else {
                /*_data[property] = obj[property];
                _data.param = obj;*/
                renderTpl();
            }
        });

        $_dialog.on('click', '.mod-choose-time__li', function() {
            var $this = $(this),
                index = $this.data('index');

            if($this.hasClass('mod-choose-time__li_current')) {
                _data.terms[index].isRemind = false;
            } else {
                _data.terms[index].isRemind = true;
            }

            $this.toggleClass('mod-choose-time__li_current');
        });
    }



    return {
        init : init
    };

}));
