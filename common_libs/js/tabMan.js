define(['jquery'], function ($) {

    /**
     * Tab
     * @class
     * @param {DOM} container
     */
    function Tab(container, opts) {
        opts = opts || {};
        container = $(container);
        if (container.data('Tab')) return container.data('Tab');
        if (!(this instanceof Tab)) return new Tab(container, opts);
        this.container = container;
        this.container.data('Tab', this);
        // tab内容容器
        this.tabContent = opts.tabContent || 'mod-tab__content';
        // tab导航容器
        this.tabNav = opts.tabNav || 'mod-tab__ul';
        // tab导航按钮
        this.tabNavItem = opts.tabNavItem || 'mod-tab__li';
        // tab按钮当前样式
        this.tabCurItem = opts.tabCurItem || 'mod-tab__li_current';
        this.pos = 0;
        this.content = this.container.find('.' + this.tabContent).eq(this.pos);
        this.nav = this.container.find('.' + this.tabNav);
        this.curNav = this.nav.find('.' + this.tabNavItem).eq(this.pos);
        this.hasInitForcast = false;
        this.init();
    }
    Tab.prototype = {
        constructor: Tab,
        init: function () {
            var self = this;
            this.nav.on('click', 'a', function (e) {
                e.preventDefault();
                var that = $(this),
                    href = that.attr('href').match(/\#.+?$/)[0],
                    next = that.closest('.' + self.tabNavItem);
                if (href && (next[0] !== self.curNav[0])) {
                    self.content.hide();
                    self.curNav.removeClass(self.tabCurItem);
                    self.content = self.container.find(href);
                    self.curNav = that.closest('.' + self.tabNavItem);
                    self.content.show();
                    self.curNav.addClass(self.tabCurItem);
                    self.container.trigger('changeTab', href);
                }
            });
            return this;
        },
        /**
         * on
         * @param {String} event
         * @param {Function} cb
         */
        on: function (event, cb) {
            if (event === 'forecast') this._initForcast();
            this.container.on(event, cb);
            return this;
        },
        _initForcast: function () {
            var self = this;
            if (!this.hasInitForcast) {
                this.nav.on('mouseenter', 'a', function (e) {
                    var that = $(this),
                        href = that.attr('href').match(/\#.+?$/)[0];
                    self.container.trigger('forecast', href);
                });
                this.hasInitForcast = true;
            }
            return this;
        }
    };

    /**
     * all
     * @param {DOM} selector
     */
    Tab.all = function (selector) {
        $(selector).find('.mod-tab').each(function (i, ele) {
            new Tab(ele);
        });
    };

    return Tab;

});
