define(['jquery', 'report', 'commonTemplate/common/side_operation'], function($, report, tmpl) {

    var $jumpContainer = null;
    var $window = $(window);
    var cPages = ['/agency/join/index.html', '/agency/personal/intro.html', '/agency/personal/index.html', '/agency/index/index.html', '/agency/publish/index.html'];
    function toggleHelpBar() {
        var scrollTop = $window.scrollTop();

        if (scrollTop !== 0) {
            $jumpContainer.clearQueue().fadeIn();
        } else {
            $jumpContainer.clearQueue().fadeOut();
        }
    }

    // 初始化：置顶、反馈
    function initHelpBar() {
        var $planeContainer = $('#js-side-operation');
        var $jumpToTop = $('#js-jump-to-top');
        var $jumpPlanContainer = $('#js-jump-plan-container');
        var $plane = $('#js-plane');
        //B侧独有入口在线客服与微信公众号二维码
        $.inArray(location.pathname, cPages) != -1 && $planeContainer.find('.js-c-special').css({display: 'block'});

        //管理后台的反馈链接需要修正
        cPages[3] === location.pathname && $planeContainer.find('.js-feedback-link').attr('href', 'http://support.ke.qq.com/forum.php?mod=forumdisplay&fid=46');

        var scrollTimer = 0;
        $(window).on('scroll', function(evt) {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(toggleHelpBar, 300);
        });

        $jumpContainer.on('mouseenter', function(evt) {
            $jumpToTop.addClass('mod-side-operation__jump-to-top-hover');
            $jumpPlanContainer.show().css({
                top: '-7px'
            });
            $plane.css('top', '56px').animate({
                'top': 0
            });
        }).on('mouseleave', function(evt) {
            $jumpToTop.removeClass('mod-side-operation__jump-to-top-hover');
            $plane.stop().css('top', '56px');
        });

        $plane.on('click', function(evt) {
            var $this = $(this),
                top = $planeContainer.offset().top;

            if ($this.prop('flying') == 1) {
                return;
            }

            $this.prop('flying', 1);
            $jumpPlanContainer.animate({
                top: -top - 500 + 'px'
            });

            setTimeout(function() {
                $('html, body').animate({
                    scrollTop: 0
                }, function() {
                    $this.prop('flying', 0);
                });

            }, 50);

            report.tdw({
                action: 'up'
            });

            evt.preventDefault();
        });
    }

    function init() {
        $(function(){
            $('body').append(tmpl);
            $jumpContainer = $('#js-jump-container');
            toggleHelpBar();
            initHelpBar();
        });
    }

    return {
        init: init
    };
});
