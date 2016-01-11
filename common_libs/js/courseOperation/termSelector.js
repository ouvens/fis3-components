define([
    'jquery',
    'db',
    'report',
    'check',
    'commonTemplate/courseOperation',
    'base'
], function($, DB, report, Check, TmplInline_courseDetail) {
    var rawData = {},
        firstRender = false,
        curClassName = 'active';

    var isTabClk = false; //如果还没主动点击tab，点击tab下面部分也可以选择班级

    function getBtnText(curTermId) {
        if (rawData.isReserveMode) {
            return '免费预约';
        } else {
            return rawData.source === 2 ? '接受赠送' : (rawData.payid === 1 ? '去报名' : '去付款');
        }
    }

    function updatePriceInfo(dialog) {

        var val = dialog.find('.js-coupon-list .selected').data('value');
        var curNode = dialog.find('.' + curClassName),
            termid = curNode.length > 0 ? curNode.data('termid') : rawData.terms[0].term_id;

        dialog.find('.mod-course-banner__price').html($.render.formatCouponPrice({
            passcard_price: rawData.passcard_price || rawData.passcard_price_source,
            price: rawData.terms[0].price,
            cur_term_id: termid,
            coupon_price: rawData.couponList && rawData.couponList.length > 0 && val != -1 ? rawData.couponList[val].price : 0,
            passcard: rawData.passcard
        }));
    }

    //赠送课程增加法务确认按钮
    function checkPrivilege() {
        var $checkBtn = $(".js-privilege-check");
        if ($checkBtn.length === 0) {
            return true;
        } else {
            if ($checkBtn.hasClass("checkbox-check")) {
                return true;
            } else {
                return false;
            }
        }
    }

    //按钮状态改变逻辑
    function changeBtn($termTime) {
        var btn = $(".tips-buy-course .modal-accept");

        if (($termTime.data('acceptable') || rawData.terms.length === 1) && checkPrivilege()) {
            btn.removeClass('btn-disabled');
        } else {
            btn.addClass('btn-disabled');
        }
    }

    function bindEvent(dialog) {

        dialog.on('click', '.js-privilege-check', function(e) {
            if ($(this).hasClass("checkbox-check")) {
                $(this).removeClass("checkbox-check");
            } else {
                $(this).addClass("checkbox-check");
            }
            var $curTab = $(".js-privilege-check").closest(".tips-bd").find(".active");
            if ($curTab.length !== 0 || rawData.terms.length === 1) {
                changeBtn($curTab);
            }
        });

        dialog.on('click', '.mod-choose-time__content', function(e) {
            if (!isTabClk) {
                $(this).closest(".mod-choose-time_v2").find(".js-term-item").eq(0).trigger("click");
            }
        });

        dialog.on('click', '.js-term-item', function(e) {
            isTabClk = true;
            var $termTime = $(this);
            dialog.find('.' + curClassName).removeClass(curClassName);
            $termTime.addClass(curClassName);

            var termIdx = $termTime.data('idx'),
                curTermId = $termTime.data('termid'),
                btn = dialog.find('.modal-accept');

            // dialog.find('[data-termid=' + termIdx + ']').addClass('actve');
            //dialog.find('.js-not-chose-tips').addClass('hide');
            //dialog.find('.js-term-item').removeClass('js-term-item_default');
            //dialog.find('.js-term-item').addClass('active');
            //dialog.find('.mod-choose-time__time').addClass('hide').eq(termIdx).removeClass('hide');
            dialog.find('.js-not-chose-tips').addClass('hide');

            if (curTermId === 0) {
                //班级通价格
                //dialog.find('.mod-course-banner__price').html('&yen;<span class="fontsize-22">' + $.render.price(rawData.passcard_price, true) + '</span>');



                //班级通浮层点击上报
                report.tdw({
                    module: 'banjitong',
                    action: 'fuceng_tabclk',
                    ver1: rawData.cid
                });
            }

            if (rawData.source === 2 && rawData.couponList && rawData.couponList.length > 0) {
                if (curTermId === 0) {
                    //赠送课程，切换到班级通，显示优惠券
                    dialog.find('.js-coupon-menulist').show();
                } else {
                    dialog.find('.js-coupon-menulist').hide();
                }
            }

            !rawData.isReserveMode && updatePriceInfo(dialog);

            changeBtn($termTime);

            btn.text(getBtnText(curTermId));
            btn.attr('title', btn.text());
        });

        dialog.on('click', '.js-coupon-list .diy-option', function(e) {
            var self = $(this);
            var couponList = dialog.find('.js-coupon-list');
            couponList.hide();

            couponList.find('.selected').removeClass('selected');
            self.addClass('selected');

            dialog.find('.js-coupon-tag .text').text(self.text());
            dialog.find('.js-coupon-tag').toggleClass('diy-select-on');
            updatePriceInfo(dialog);

        });

        dialog.on('click', '.js-coupon-tag', function() {

            var self = $(this),
                dropOn = self.hasClass('diy-select-on');
            if (dropOn) {
                $('.js-coupon-list').hide();
            } else {
                $('.js-coupon-list').show();
            }
            self.toggleClass('diy-select-on');

            report.tdw({
                module: 'youhuiquan',
                action: 'coursepage_choose',
                ver1: rawData.cid
            });
        });

        dialog.find('.tt-title').trigger('click');

        if (firstRender) {
            $(document).on('click', function(e) {
                var node = $(e.target);

                if (node.hasClass('js-coupon-tag') || node.parents().hasClass('js-coupon-tag')) {
                    return;
                }
                dialog.find('.js-coupon-list').hide();
                dialog.find('.js-coupon-tag').removeClass('diy-select-on');
            });
        }
    }



    function init(data, callback) {
        var dialog,
            hasCoupon;

        isTabClk = false;

        if (!firstRender) {
            firstRender = true;
        }

        rawData = data || {};
        hasCoupon = rawData.couponList && rawData.couponList.length > 0;

        /*if (!hasCoupon && rawData.type === 2) {
            var termid = ((rawData.terms || [])[0] || {}).term_id;
            var couId = '';

            var val = $('.js-coupon-list .selected').data('value');
            if (val !== -1 && val !== null) {
                couId = (rawData.couponList[val] || {}).cou_id;
            }
            return callback && callback({
                curTermId: termid,
                curTermIndex: 0,
                couId: couId
            });
        }*/

        var dialogTitle = rawData.price > 0 && (rawData.source != 2 || rawData.source == 2 && rawData.pay_status != 1) ? '购买课程' : '报名课程';
        if (rawData.isReserveMode) {
            dialogTitle = '免费试听';
        }

        if(Check.isWeixinUser() && (!rawData.isReserveMode) && rawData.price > 0){
            $._alert("很抱歉，微信用户暂时仅支持手机支付");
        }else {
            $.Dialog.confirm(TmplInline_courseDetail.applyBox(rawData), {
                title: dialogTitle,
                submit: getBtnText(rawData.cur_term_id),
                globalClass: 'tips-buy-course',
                isDisabled: true,
                onAccept: function () {
                    if (dialog.find('.modal-accept').hasClass('btn-disabled')) {
                        return true;
                    }
                    var curNode = dialog.find('.' + curClassName),
                        termid = curNode.length > 0 ? curNode.data('termid') : rawData.terms[0].term_id,
                        couId = '';

                    var val = $('.js-coupon-list .selected').data('value');
                    if (val !== -1 && val !== null) {
                        couId = rawData.couponList[val].cou_id;
                    }

                    callback && callback({
                        curTermId: termid,
                        curTermIndex: curNode.data('idx') || 0,
                        couId: couId
                    });

                    if (hasCoupon) {
                        report.tdw({
                            action: 'coursepage_pay',
                            module: 'youhuiquan',
                            ver1: rawData.cid
                        });
                    }
                }
            });
        }
        dialog = $('.tips-buy-course');

        bindEvent(dialog);

        console.log('pay_status ', rawData.terms[0].pay_status);

        if (rawData.terms.length === 1 && rawData.terms[0].pay_status !== 8 && rawData.terms[0].pay_status !== 9 && checkPrivilege()) {
            dialog.find('.modal-accept').removeClass('btn-disabled');
        }

        if(rawData.cur_term_id || rawData.cur_term_id===0){
            changeBtn(dialog.find('[data-termid=' + rawData.cur_term_id + ']'));
        }


        if (rawData.cur_term_id === null && rawData.terms.length !== 1) {
            dialog.find('.modal-accept').attr('title', '请先勾选您要的班级');
            dialog.find('.js-not-chose-tips').removeClass('hide');
        }


        if (rawData.passcard === 1) {
            //班级通浮层曝光上报
            report.tdw({
                module: 'banjitong',
                action: 'fuceng_view',
                ver1: rawData.cid
            });
        }

        if (hasCoupon) {
            report.tdw({
                module: 'youhuiquan',
                action: 'coursepage_chooseview',
                ver1: rawData.cid
            });
        }
    }

    return {
        init: init
    };
});