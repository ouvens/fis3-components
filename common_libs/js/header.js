/*
 Header.getInfo(function (data) {
 成功拉到信息(是否登录看is_login)：data = {retcode: 0, "nick_name":"fredwu","learning_sum":1000,"role_type":3,"is_login":1}
 其他错误码:  data = {retcode: 其他;}
 });
 */
(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([
            'jquery',
            './login',
            'db',
            'html',
            'index/nightly',
            'report',
            'check',
            'observer',
            'jquery.placeholder',
            'local.data',
            'util.cookie'
        ], factory);
    } else {
        root['Header'] = factory(root['jQuery'], root['Login'], root['DB'], root['html'], root['report']);
    }
}(this, function($, Login, DB, html, nightly, report, Check, Observer) {

    var status = {};
    var mainNav = $("#js_main_nav");
    var fromMe = false;
    var loading;
    var _isLoginReload = true; //登录完之后是刷新整个页面，还是只刷新头部；默认为整个页面

    Observer.get('login').listen('weixinDone', function(info) {
        if(_isLoginReload){
            location.reload();
        }else{
            Login.hide();
            refreshHeader();
        }
    });

    var opSet = {
        login: function() {
            fromMe = true;
            Login.show({
                succ: function() {
                    if(_isLoginReload){
                        location.reload();
                    }else{
                        Login.hide();
                        refreshHeader();
                    }
                },
                close: function() {
                    fromMe = false;
                }
            });
        },
        logout: function() {
            fromMe = true;
            Login.logout();
        }
    };

    var userInfo;

    var _searchGuideWord = {
        'course': {
            'guide_word': '搜索课程',
            'search_word': null
        },
        'agency': {
            'guide_word': '搜索机构',
            'search_word': null
        }
    };

    function setLoginInfo(logined, nick) {
        var style = ['none', ''];

        $('#js_login')[0].style.display = style[1 - logined];

        $('#js_logout_outer,#js_logout_outer_agency').hide();

        if (logined) {
            $('#js-mod-header-login').addClass('mod-header__wrap-logined');
            // 普通用户(或者机构被清退)
            if (!status.plat_role || !/[1245]/.test(status.role) || status.agency_step_flag==7) {
                setNormalLogin(logined, nick);
            } else {
                setAgencyLogin(logined, nick);
            }

        } else {
            $('#js-mod-header-login').removeClass('mod-header__wrap-logined');
        }
    }

    // 普通用户
    function setNormalLogin(logined, nick) {
        var style = ['none', 'block'];
        $('#js_logout_outer')[0].style.display = style[+logined];
        if(logined && !Check.isWeixinUser()){
            $('#js_logout_outer .js-avatar').prop('src', 'http://q.qlogo.cn/g?b=qq&nk=' + $.cookie.uin() + '&s=40');
        }
    }

    // 机构
    function setAgencyLogin(logined, nick) {
        var style = ['none', 'block'];
        $('#js_logout_outer_agency')[0].style.display = style[+logined];
        if(logined && !Check.isWeixinUser()){
            $('#js_logout_outer_agency .js-avatar').prop('src', 'http://q.qlogo.cn/g?b=qq&nk=' + $.cookie.uin() + '&s=40');
        }
        status.role === 5 && $('.mod-header__user-operation span,.mod-header__user-operation b').each(function(){
            var $this = $(this);
            $.trim($this.text()) === '机构管理' && $this.text('老师管理');
        });
    }

    function addParam(url, key, value){
        var ret = '';
        if(url.indexOf('?')===-1){
            ret = url + '?' + key + '=' + encodeURIComponent(value);
        }else{
            ret = url + '&' + key + '=' + encodeURIComponent(value);
        }
        return ret;
    }

    function bindEvent() {
        var $searchBox = $('#js-searchbox');

        $('.js-login-op').click(function(e) {
            var op = $(e.target).attr('data-hook');
            if (op) {
                report.tdw({
                    action: op
                });
                setTimeout(function() {
                    opSet[op]();
                }, 500);
            }
        });
        var btnSearch = $('#js_search');
        btnSearch.click(function(e) {
            var keyword = $.trim($('#js_keyword').val()),
                type = $searchBox.find('.mod-search-dropdown-item-selected').data('type');

            if (keyword) {
                keyword = '?word=' + encodeURIComponent(keyword);
            } else {
                if (type === 'course') {
                    var searchWord = _searchGuideWord[type]['search_word'];
                    if (searchWord) {
                        keyword = '?word=' + encodeURIComponent(searchWord);
                    } else {
                        keyword = '';
                    }
                } else if (type === 'agency') {
                    return;
                }
            }

            e.preventDefault();

            // 上报：搜索点击
            report.tdw({
                action: 'seach_click'
            });

            $(this).attr("jump-through", $('#js_keyword').val());

            if (type === 'course') {
                setTimeout(function() {
                    location.href = addParam('http://ke.qq.com/cgi-bin/courseList' + keyword, 'enable_activity_label', 0);
                }, 400);
            } else if (type === 'agency') {
                // 上报：搜索点击
                report.tdw({
                    action: 'search_orgsearch'
                });

                setTimeout(function() {
                    location.href = 'http://ke.qq.com/searchAgency.html' + keyword;
                }, 400);
            }

        });

        $searchBox.on('keydown', '.mod-search__input', function(event) {
            if (event.keyCode == 13) {
                btnSearch.click();
            }
        });

        $searchBox.on('focus', '.mod-search__input', function(evt) {
            report.tdw({
                action: 'seachshine_click'
            });
        });

        var $dropList = $searchBox.find('.mod-search-dropdown-item'),
            $searchInput = $searchBox.find('.mod-search__input'),
            $dropdown = $searchBox.find('.mod-search-dropdown');

        $searchBox.find('.mod-search-dropdown').on('mouseenter', function() {
            // $dropList.show();
        }).on('mouseleave', function() {
            // $dropList.hide();
            // $searchBox.find('.mod-search-dropdown-item-selected').show();
        });

        /*     $searchBox.find('.mod-search-dropdown').on('click', function () {
         if($dropList.is(':visible')) {
         $dropList.hide();
         } else {
         $dropList.hide();
         }
         $dropList.toggle();
         });*/

        $searchBox.find('.mod-search-dropdown-item').on('click', function() {
            if (!$(this).hasClass('mod-search-dropdown-item-selected')) {
                $searchBox.find('.mod-search-dropdown-item').removeClass('mod-search-dropdown-item-hover');
            }

            if($dropList.eq(0).is(':visible') && $dropList.eq(1).is(':visible')) {
                $dropList.hide();
                $dropdown.removeClass('mod-search-dropdown-hover');
            } else {
                $dropList.show();
                $dropdown.addClass('mod-search-dropdown-hover');
            }

            $dropList.removeClass('mod-search-dropdown-item-selected');

            $(this).addClass('mod-search-dropdown-item-selected');

            // $dropList.hide();

            var $selectedItem = $searchBox.find('.mod-search-dropdown-item-selected'),
                type = $selectedItem.data('type'),
                inputBox = $searchBox.find('#js_keyword'),
                inputValue = (inputBox.val() === '搜索机构' || inputBox.val() === '搜索课程') ? '' : inputBox.val(),
                inputHTML = '<input class="mod-search__input" id="js_keyword" type="text" maxLength="38" value="' + inputValue + '"" placeholder=' + _searchGuideWord[type]['guide_word'] + '>';

            $selectedItem.show();
            $selectedItem.prependTo($('.mod-search-dropdown'));



            inputBox.attr('placeholder', _searchGuideWord[type]['guide_word']);
            if ((inputBox.val() === '搜索机构' || inputBox.val() === '搜索课程' || inputBox.val() === '')) {
                inputBox.val(' ');
                inputBox.val('');
            }
            // $(inputBox.prop('outerHTML')).replaceAll($searchBox.find('#js_keyword'));
            // $(inputHTML).replaceAll($searchBox.find('#js_keyword'));
            setPlaceholder();

            if (type === 'agency') {
                report.tdw({
                    action: 'search_orgclk'
                });
            }
        }).on('mouseenter', function() {
            $(this).addClass('mod-search-dropdown-item-hover');
        }).on('mouseleave', function() {
            $(this).removeClass('mod-search-dropdown-item-hover');
        });

        $(document).on('click', function (e) {
            if($(e.target).hasClass('.mod-search-dropdown') || $(e.target).closest('.mod-search-dropdown').length !== 0) {return;}

            // $dropdown.find('.mod-search-dropdown-item-selected').trigger('click');
            $dropdown.removeClass('mod-search-dropdown-hover');
            $dropdown.find('.mod-search-dropdown-item').eq(1).hide();
        });

        $('#js-help').on('click', function(evt) {
            $.proxy(reportAndJump, this)(evt, 'help');
        });

        /*$('#js_logout_outer').on('click', function(evt) {
         report.tdw({
         action: 'Redpoint-clk'
         });
         $.proxy(reportAndJump, this)(evt, 'myclass');
         });*/

        // 机构管理
        $('.js-agency-manage').on('click', function(evt) {
            $.proxy(reportAndJump, this)(evt, 'organization_manage');
        });

        var navCont = $('#js-mod-header-nav'),
            moreItem = navCont.find('.mod-header__nav-item-more');

        moreItem.on('mouseenter', function() {
            $(this).addClass('mod-header__nav-item-selected');
            report.tdw({
                action: 'channel-hover'
            });
        });
        moreItem.on('mouseleave', function() {
            $(this).removeClass('mod-header__nav-item-selected');
        });
    }
    var reportAndJump = function(evt, action) {
        evt.preventDefault();

        var href = $(this).prop('href');
        report.tdw({
            action: action
        });
        setTimeout(function() {
            location.href = href;
        }, 500);
    };
    var navConfig = {
        '/': 1,
        '/index.html': 1,
        '/cgi-bin/courseList': 1,
        '/myCourse/index.html': 1,
        '/agencyManage/index.html': 1,
        '/applyLecture.html': 1,
        '/faq.html': 1
    };

    function setNavState() {
        // 我的课表、帮助、机构管理
        var pageName = location.pathname;
        if (navConfig[pageName] && location.hostname === 'ke.qq.com') {
            pageName === '/' && (pageName = '/index.html');
            mainNav.find('[href="http://ke.qq.com' + pageName + '"]').parent('.mod-header__nav-item').addClass('mod-header__nav-item_current');
        }
    }

    function convertToQueryString(obj) {
        //obj.timestamp = Date.now();
        var arr = [];
        for (var i in obj) {
            arr.push(i + "=" + encodeURIComponent(obj[i]));
        }
        return arr.join('&');
    }

    function saveState(stateObj) {
        window.name = convertToQueryString(stateObj);
    }

    //刷新头部
    function refreshHeader(){
        setTimeout(function(){
            getRichInfo();
        }, 200);
    }

    function getRichInfo() {
        loading = true;
        DB.cgiHttp({
            url: '/cgi-bin/login/userinfo',
            type: 'POST',
            noNeedLogin: true,
            succ: function(data) {
                loading = false;
                data = data.result || {};
                if (mainNav.length) {
                    var stateObj;
                    if (data.is_login) {
                        var roleType = parseInt(data.role_type) || 0,
                            nick = data.nick_name,
                            uin = $.cookie.uin();
                        // roleType = 1;
                        // 角色 1=机构，2=老师，3普通用户，4 机构管理员 5 个人机构
                        // 打开机构管理
                        // window.name = 'role=' + roleType;
                        // plat_role = 0 拥有平台权限
                        stateObj = status = {
                            agency_step_flag: data.agency_step_flag,
                            role: roleType,
                            nick: nick,
                            uin: uin,
                            plat_role: data.agency_role_perm_info && data.agency_role_perm_info[0] && data.agency_role_perm_info[0].plat_role
                        };

                        Login.setUin(uin); // 设置当前cookie，作用：判断登陆态变化

                        setLoginInfo(1, nick);

                    } else {
                        stateObj = status = {
                            role: 0
                        };
                        //打开机构入驻
                        mainNav.addClass('js-unknown-role');
                        setLoginInfo(0);

                    }
                    saveState(stateObj);
                }
                data.retcode = 0;

                userInfo = data;
                //cleanData(userInfo);
                refreshRedPoint();
                doTask();

                //微信头像
                if(Check.isWeixinUser()){
                    $('#js_logout_outer .js-avatar').prop('src', userInfo.face_url);
                }

            },
            err: function(data) {
                loading = false;
                userInfo = data;
                doTask();
                if (!Login.isLogin()) {
                    saveState({
                        role: 0
                    });
                    setLoginInfo(0);
                }
                return true;
            }
        });
    }

    function getRedPointKey() {
        var uin = $.cookie.uin();
        return uin ? 'redpoint-' + uin : '';


    }

    function cleanData(userInfo) {

        var redPointKey = getRedPointKey(), pointList;

        if (redPointKey) {

            pointList = $.localStorage.get(redPointKey) || "[]";
            pointList = JSON.parse(pointList);
            $(pointList).each(function (i, e) {

                userInfo[e] = 0;

            });

        }


    }

    function refreshRedPoint(){

        if (!userInfo) return;

        //小红点展示的条件
        //1.
        //2.
        //3. 含有即将过期的优惠券

        cleanData(userInfo);
        //live-course, coupon, fav


        var redItems = ['.js-live-course', '.js-fav', '.js-coupon', '.js-course-plan', '.js-signup'];
        var hitItems = [];
        if (userInfo.replay_red_flag === 1) {

            hitItems.push(redItems[0]);

        }

        if (userInfo.total_num > 0) {

            hitItems.push(redItems[1]);

        }

        if (userInfo.coupon_red_flag === 1) {

            hitItems.push(redItems[2]);

        }

        if (userInfo.present_vedio_red_flag === 1) {

            hitItems.push(redItems[4]);

        }

        $(redItems.join(',')).removeClass('indicate-remind');

        if (hitItems.length > 0) {
            hitItems.push(redItems[3]);


            $('#js_logout_outer_agency, #js_logout_outer').find('.icon-red-circle').show();

            $(hitItems.join(',')).addClass('indicate-remind');

            if (!refreshRedPoint.hasRender) {
                report.tdw({
                    action: 'Redpoint-Exposure'
                });
                refreshRedPoint.hasRender = true;

            }

        } else {

            $('#js_logout_outer_agency, #js_logout_outer').find('.icon-red-circle').hide();

        }

    }

    function getActivityInfo() {
        DB.cgiHttp({
            url: '/cgi-bin/get_navigation_info',
            type: 'POST',
            noNeedLogin: false,
            succ: function(res) {
                var i, len, item;
                var navList = res.result.list,
                    mod = $('#js_main_nav').data('mod'),
                    navCont = $('#js-mod-header-nav'),
                    html = '';

                for (i = 0; i < navList.length; i++) {
                    if (navList[i].m_visvible != 1) {
                        navList.splice(i, 1);
                        i--;
                    }
                }

                if (navList.length === 0) return;

                if (mod === 960) {
                    //头部导航宽度为960，目前仅发现课程详情页符合
                    for (i = 0, len = navList.length; i < len; i++) {
                        item = navList[i];

                        html += '<li class="mod-header__activity-item"><a href="' +
                        item.m_link + '" class="mod-header__activity-item-content" target="_blank" report-tdw="action=channel-clk&ver1=' +
                        item.m_banner_text + '&ver2=' + (i + 1) + '&ver3=' + item.m_symbol +
                        '"><span class="mod-header__activity-item-text' +
                        (item.m_symbol == 1 ? ' mod-header__activity-item-hot' : '') +
                        (item.m_symbol == 2 ? ' mod-header__activity-item-new' : '') +
                        '">' + item.m_banner_text + '</span></a></li>';
                    }
                    navCont.find('.mod-header__activity-list').html(html);
                    navCont.find('.mod-header__nav-item-more').show();
                } else {
                    //默认头部导航宽度为1200
                    var fontLength = 16, //单个字符最大长度
                        maxWidth = 364, //最大宽度
                        remianWidth = 282, //出去“更多”之后的长度
                        totalWidth = 0;

                    for (i = 0, len = navList.length; i < len; i++) {
                        // var item = navList[i];

                        totalWidth += navList[i].m_banner_text.length * 16 + 40;
                    }


                    if (totalWidth <= maxWidth) {
                        //未超出最大宽度
                        for (i = 0, len = navList.length; i < len; i++) {
                            item = navList[i];

                            html += '<li class="mod-header__nav-item"><a href="' +
                            item.m_link +
                            '" class="mod-header__link-nav' +
                            (item.m_symbol == 1 ? ' mod-header__link-nav-hot' : '') +
                            (item.m_symbol == 2 ? ' mod-header__link-nav-new' : '') +
                            '" target="_blank" report-tdw="action=channel-clk&ver1=' +
                            item.m_banner_text + '&ver2=' + (i + 1) + '&ver3=' + item.m_symbol + '">' +
                            item.m_banner_text + '</a></li>';

                        }
                        navCont.find('.mod-header__nav-item-more').before(html);
                    } else {
                        //超出最大宽度，需要加上“更多”
                        var html1 = '',
                            html2 = '',
                            tempWidth = 0;

                        for (i = 0, len = navList.length; i < len; i++) {
                            item = navList[i];

                            tempWidth += navList[i].m_banner_text.length * 16 + 40;


                            if (tempWidth <= remianWidth) {
                                html1 += '<li class="mod-header__nav-item"><a href="' +
                                item.m_link +
                                '" class="mod-header__link-nav' +
                                (item.m_symbol == 1 ? ' mod-header__link-nav-hot' : '') +
                                (item.m_symbol == 2 ? ' mod-header__link-nav-new' : '') +
                                '" target="_blank" report-tdw="action=channel-clk&ver1=' +
                                item.m_banner_text + '&ver2=' + (i + 1) + '&ver3=' + item.m_symbol + '">' +
                                item.m_banner_text + '</a></li>';
                            } else {
                                html2 += '<li class="mod-header__activity-item"><a href="' +
                                item.m_link + '" class="mod-header__activity-item-content" target="_blank" report-tdw="action=channel-clk&ver1=' +
                                item.m_banner_text + '&ver2=' + (i + 1) + '&ver3=' + item.m_symbol +
                                '"><span class="mod-header__activity-item-text' +
                                (item.m_symbol == 1 ? ' mod-header__activity-item-hot' : '') +
                                (item.m_symbol == 2 ? ' mod-header__activity-item-new' : '') +
                                '">' + item.m_banner_text + '</span></a></li>';
                            }
                        }
                        navCont.find('.mod-header__nav-item-more').before(html1);
                        navCont.find('.mod-header__activity-list').html(html2);
                        navCont.find('.mod-header__nav-item-more').show();
                    }
                }
            },
            err: function(res) {
                return true;
            }
        });
    }

    function setPlaceholder() {
        if (!$.fn.placeholder) {
            var isOperaMini = Object.prototype.toString.call(window.operamini) == '[object OperaMini]',
                isInputSupported = 'placeholder' in document.createElement('input') && !isOperaMini;

            !isInputSupported &&
            $.loadScript('http://7.url.cn/edu/js/1.2.0/jquery.placeholder.js', function() {
                $.fn.placeholder && $('#js_keyword').placeholder();
            });
        } else {
            $('#js_keyword').placeholder();
        }
    }

    function getSearchWord() {
        DB.cgiHttp({
            url: '/cgi-bin/search_bar/get_guide_word',
            type: 'POST',
            noNeedLogin: false,
            succ: function(res) {
                res.result.list && res.result.list.length > 0 && (_searchGuideWord['course'] = res.result.list[0]);

                var $selectedBox = $('#js-searchbox');

                if ($selectedBox.find('.mod-search-dropdown-item-selected').data('type') === 'course') {
                    $selectedBox.find('.mod-search__input').attr('placeholder', _searchGuideWord['course']['guide_word']);
                }
                setPlaceholder();
                //根据页面地址及角色展示导航栏
            },
            err: function(res) {
                return true;
            }
        });
    }

    function handleSearchWordsURL() {
        var $searchBox = $('#js-searchbox'),
            wordsNode = $searchBox.find('.mod-search-word');

        for (var i = 0, len = wordsNode.length; i < len; i++) {
            var $item = $(wordsNode[i]);

            if ($item.data('nolink') === 1) {
                $item.attr('href', 'http://ke.qq.com/cgi-bin/courseList?word=' + encodeURIComponent($item.html()));
            }
        }
    }

    function setConfig(param){
        param = param || {};
        if(param.isLoginReload == undefined){
            _isLoginReload = true;
        }else{
            _isLoginReload = param.isLoginReload;
        }
    }

    function init() {
        Login.init({
            onStatusChanged: function() {
                var logined = Login.isLogin();
                if (!logined) {
                    saveState({
                        role: 0
                    });
                } else {

                    var redPointKey = getRedPointKey();

                    if (redPointKey) {

                        $.localStorage.remove(redPointKey);

                    }
                }
                if (fromMe || !logined) return;
                getRichInfo();
            }
        });

        handleSearchWordsURL();

        getRichInfo();

        if (location.href !== 'http://ke.qq.com/index.html') {
            getActivityInfo();
            setPlaceholder();
        } else {
            getSearchWord();
        }

        if (!mainNav.length) return;

        setNavState();
        bindEvent();

        if (location.href.indexOf('/searchAgency') !== -1) {
            $($('#js-searchbox').find('.mod-search-dropdown-item')[1]).trigger('click');
            $($('#js-searchbox').find('.mod-search-dropdown-item')[0]).trigger('click');
        }

        var keyword = $.bom.query('word');

        keyword = keyword.replace(/\+/g, ' ');
        if (keyword) $('#js_keyword').val(keyword);



        nightly && nightly.init(); //挑灯夜读 入口
    }



    var queue = [];

    function doTask() {
        var bk = queue;
        queue = [];
        $(bk).each(function(i, e) {
            typeof e === 'function' && e(userInfo);
        });
    }

    return {
        getInfo: function(cb) {
            setTimeout(function() {
                if (loading) {
                    queue.push(cb);
                } else {
                    cb(userInfo);
                }
            }, 0);
        },
        refreshRedPoint: refreshRedPoint,
        setInfoVal: function (key, val) {
            if (!userInfo) return;

            userInfo[key] = val;

            if ($.inArray(key, ['replay_red_flag', 'total_num', 'coupon_red_flag', 'present_vedio_red_flag']) !== -1) {


                /* var uin = $.cookie.uin();
                 if (uin) {
                 var pointList = $.localStorage.get('redpoint-' + uin) || "[]";
                 pointList.push(key);
                 $.localStorage.set('redpoint-' + uin, JSON.stringify(pointList));

                 }*/

                var redPointKey = getRedPointKey(), pointList;

                if (redPointKey) {

                    pointList = $.localStorage.get(redPointKey) || "[]";
                    pointList = JSON.parse(pointList);
                    if ($.inArray(key, pointList) === -1){

                        pointList.push(key);
                        $.localStorage.set(redPointKey, JSON.stringify(pointList));
                    }

                }
            }
        },
        init: init,
        setConfig: setConfig,
        refreshHeader: refreshHeader //用最新的userinfo刷新头部
    };
}));