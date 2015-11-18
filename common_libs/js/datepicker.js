/**
 * http://www.eyecon.ro/bootstrap-datepicker
 * @description datepicker 依赖于jQuery的一个日期选择组件
 * @author knightli
 */
define(['jquery'], function($) {

    var Datepicker = function(element, options) {
        this.options = options;
        this.element = $(element);
        this.format = DPGlobal.parseFormat(options.format || this.element.data('date-format') || 'yyyy-mm-dd');
        this.picker = $(DPGlobal.template(options).replace(/{{dpCls}}/, options._dpCls || ''))
            .appendTo(this.options._body || 'body')
            .on({
                click: $.proxy(this.click, this)
            });
        this.picker.data("toggle", this.element);
        this.isInput = this.element.is('input');
        this.component = this.element.is('.date') ? this.element.find('.add-on') : false;

        if (this.isInput) {
            this.element.on({
                focus: $.proxy(this.show, this),
                keyup: $.proxy(this.update, this),
                click: $.proxy(this.show, this)
            });
        } else {
            if (this.component) {
                this.component.on('click', $.proxy(this.show, this));
            } else {
                this.element.on('click', $.proxy(this.show, this));
            }
        }

        this.minViewMode = options.minViewMode || this.element.data('date-minviewmode') || 0;
        if (typeof this.minViewMode === 'string') {
            switch (this.minViewMode) {
                case 'months':
                    this.minViewMode = 1;
                    break;
                case 'years':
                    this.minViewMode = 2;
                    break;
                default:
                    this.minViewMode = 0;
                    break;
            }
        }
        this.viewMode = options.viewMode || this.element.data('date-viewmode') || 0;
        if (typeof this.viewMode === 'string') {
            switch (this.viewMode) {
                case 'months':
                    this.viewMode = 1;
                    break;
                case 'years':
                    this.viewMode = 2;
                    break;
                default:
                    this.viewMode = 0;
                    break;
            }
        }
        this.startViewMode = this.viewMode;
        this.weekStart = options.weekStart || this.element.data('date-weekstart') || 0;
        this.weekEnd = this.weekStart === 0 ? 6 : this.weekStart - 1;
        this.onRender = options.onRender;
        this.isUp = options.isUp;
        this.fillDow();
        this.fillMonths();
        this.update();
        this.showMode();
    };

    Datepicker.prototype = {
        constructor: Datepicker,

        show: function(e) {
            this.picker.show();
            this.options._show && this.options._show(this.element);
            this.height = this.component ? this.component.outerHeight() : this.element.outerHeight();
            this.place();
            $(window).on('resize', $.proxy(this.place, this));
            if (e && !this.options._isStopProp) {
                e.stopPropagation();
                e.preventDefault();
            }
            if (!this.isInput) {}
            var that = this;
            $(document).on('mousedown', function(ev) {
                if ($(ev.target).closest('.datepicker').length === 0) {
                    that.hide();
                }
            }).on('navchange', function() {
                that.hide();
            });
            this.element.trigger({
                type: 'show',
                date: this.date
            });
        },

        hide: function() {
            !this.options._not_hide && this.picker.hide();
            this.options._hide && this.options._hide();
            $(window).off('resize', this.place);
            this.viewMode = this.startViewMode;
            this.showMode();
            if (!this.isInput) {
                $(document).off('mousedown', this.hide);
            }
            this.element.trigger({
                type: 'hide',
                date: this.date
            });
        },

        set: function() {
            var formated = DPGlobal.formatDate(this.date, this.format);
            this.options._click && this.options._click(this.date, this.element);
            if (!this.isInput) {
                if (this.component) {
                    this.element.find('input').prop('value', formated);
                }
                this.element.data('date', formated);
            } else {
                this.element.prop('value', formated);
            }
            this.options._set && this.options._set(this.date, this.element);
        },

        setValue: function(newDate) {
            if (typeof newDate === 'string') {
                this.date = DPGlobal.parseDate(newDate, this.format);
            } else {
                this.date = new Date(newDate);
            }
            this.set();
            this.viewDate = new Date(this.date.getFullYear(), this.date.getMonth(), 1, 0, 0, 0, 0);
            this.fill();
        },

        place: function() {
            if (this.options._body) {
                this.picker.css({
                    top: 0,
                    left: 0
                });
            } else {
                var offset = this.component ? this.component.offset() : this.element.offset();
                var adjustH = this.height;
                if (this.isUp) {
                    adjustH = (-1) * (this.picker.outerHeight() + 5);
                }
                this.picker.css({
                    top: offset.top + adjustH,
                    left: offset.left
                });
            }
        },

        update: function(newDate) {
            if (this.options._isMuitPicker) {
                var _defaultVal = (typeof this.options._defaultVal === "function") ? this.options._defaultVal() : false;
                this.date = _defaultVal ? (new Date(_defaultVal)) : DPGlobal.today;
            } else {
                this.date = DPGlobal.parseDate(
                    typeof newDate === 'string' ? newDate : (this.isInput ? this.element.prop('value') : this.element.data('date')),
                    this.format
                );
            }
            isNaN(this.date.valueOf()) && (this.date = DPGlobal.today);
            this.viewDate = new Date(this.date.getFullYear(), this.date.getMonth(), 1, 0, 0, 0, 0);
            this.viewDate.setFullYear(this.date.getFullYear());
            this.fill();
        },

        fillDow: function() {
            var dowCnt = this.weekStart;
            var html = '<tr>';
            while (dowCnt < this.weekStart + 7) {
                html += '<th class="dow dow' + dowCnt + '">' + DPGlobal.dates.daysMin[(dowCnt++) % 7] + '</th>';
            }
            html += '</tr>';
            this.picker.find('.datepicker-days thead').append(html);
        },

        fillMonths: function() {
            var html = '';
            var i = 0;
            while (i < 12) {
                html += '<span class="month">' + DPGlobal.dates.monthsShort[i++] + '</span>';
            }
            this.picker.find('.datepicker-months td').append(html);
        },
        switchClk: function() {
            this.options.switchClk && this.options.switchClk();
        },
        fill: function() {
            this.options._begin = this.options._begin ? DPGlobal.toDateWithOutHMS(this.options._begin) : 0;
            this.options._end = this.options._end ? DPGlobal.toDateWithOutHMS(this.options._end) : 0;

            var tempYear = this.viewDate.getFullYear();
            if (tempYear <= 1900) {
                this.viewDate.setFullYear(1900);
                this.picker.find('.lastYear').addClass('disabled');
                tempYear < 1900 && this.viewDate.setMonth(0);
                if (this.viewDate.getMonth() === 0) {
                    this.picker.find('.prev').addClass('disabled');
                } else {
                    this.picker.find('.prev').removeClass('disabled');
                }
            } else {
                this.picker.find('.lastYear').removeClass('disabled');
                this.picker.find('.prev').removeClass('disabled');
            }
            var d = new Date(this.viewDate),
                year = d.getFullYear(),
                month = d.getMonth(),
                currentDate = this.date.valueOf();
            this.picker.find('.datepicker-days th.switch')
                .text(year + DPGlobal.dates.yearSuffix + DPGlobal.dates.monthsShort[month]);
            this.picker.find('.datepicker-days-bg').text(month + 1);
            var prevMonth = new Date(year, month - 1, 28, 0, 0, 0, 0);
            var day = DPGlobal.getDaysInMonth(prevMonth.getFullYear(), prevMonth.getMonth());
            prevMonth.setDate(day);
            prevMonth.setDate(day - (prevMonth.getDay() - this.weekStart + 7) % 7);
            var nextMonth = new Date(prevMonth);
            nextMonth.setDate(nextMonth.getDate() + 42);
            nextMonth = nextMonth.valueOf();
            var html = [];
            var clsName,
                prevY,
                prevM;
            // 连续
            var isOnePlusOne = 0;
            var isPrevOrNextM = false;
            var countOld = 0;
            var _dates = (typeof this.options._dates === "function") ? this.options._dates() : this.options._dates;
            var _defaultVal = (typeof this.options._defaultVal === "function") ? this.options._defaultVal() : false;
            if (_defaultVal) {
                this.options._begin = new Date(_defaultVal);
                this.options._end = new Date(_defaultVal + 86400000 * 365);
            }
            while (prevMonth.valueOf() < nextMonth) {

                if (prevMonth.getDay() === this.weekStart) {
                    html.push('<tr' + (this.options._isView ? ' class="tr-view"' : '') + '>');
                    isOnePlusOne = 0;
                }
                clsName = this.onRender(prevMonth);
                prevY = prevMonth.getFullYear();
                prevM = prevMonth.getMonth();
                isPrevOrNextM = false;
                if ((prevM < month && prevY === year) || prevY < year) {
                    clsName += ' old';
                    countOld++;
                    isPrevOrNextM = true;
                } else if ((prevM > month && prevY === year) || prevY > year) {
                    clsName += ' new';
                    isPrevOrNextM = true;
                }
                if (prevMonth.valueOf() === currentDate) {
                    clsName += ' active';
                }
                if (_defaultVal && prevMonth.valueOf() === _defaultVal) {
                    clsName += ' defaultDay current';
                }
                var currentCls = "";
                var disabledCls = "";
                this.options._begin && (prevMonth < this.options._begin) && (disabledCls = " disabled before_begin");
                this.options._end && (prevMonth > this.options._end) && (disabledCls = " disabled after_end");
                disabledCls === "" && this.options._filter && (this.options._filter(prevMonth, this.element)) && (disabledCls = " disabled");
                if (this.options._isView) {
                    disabledCls += (disabledCls.indexOf("disabled") !== -1 ? "" : " disabled") +
                        (prevMonth < DPGlobal.today ? " pass" : "") + (/(before_begin|after_end)/.test(disabledCls) ? " not_allow" : "");

                    if (!isPrevOrNextM && _dates && _dates.indexOf(prevMonth.getTime()) !== -1) {
                        currentCls = "current";
                        isOnePlusOne++;
                    } else {
                        isOnePlusOne = 0;
                    }
                    if (!this.options._isMuitPicker) {
                        if (isOnePlusOne === 0) {
                            html.push(html.pop().replace(/{{opob}}/ig, "").replace(/{{opom}}/ig, "{{opoe}}"));
                        } else if (isOnePlusOne === 1) {
                            disabledCls += " date-view {{opob}}";
                        } else if (isOnePlusOne > 1) {
                            disabledCls += " date-view {{opom}}";
                        }
                    }
                }
                var dateStr = [prevMonth.getFullYear(), prevMonth.getMonth() + 1, prevMonth.getDate()].join("/");
                if (this.options._isView) {
                    var __map = [
                        ["", prevMonth.getDate()],
                        ["day-today", "今天"],
                        ["day-holiday", "假日"]
                    ];
                    var __index = 0;
                    (typeof this.options._isHoliday === "function") && this.options._isHoliday(+prevMonth) && (__index = 2);
                    prevMonth.getTime() === DPGlobal.today.getTime() && (__index = 1);
                    html.push(('<td class="day' + clsName + disabledCls + ' {{viewCls}}" data-date="' + dateStr + '"><div><i>{{viewText}}</i><b></b><u></u></div></td>')
                        .replace(/{{viewCls}}/ig, this.options._isMuitPicker ?
                            currentCls : __map[__index][0])
                        .replace(/{{viewText}}/ig, __map[__index][1]));
                } else {
                    html.push('<td class="day' + clsName + disabledCls + '" data-date="' + dateStr + '">' + prevMonth.getDate() + '</td>');
                }
                if (prevMonth.getDay() === this.weekEnd) {
                    html.push(html.pop().replace(/{{opob}}/ig, "").replace(/{{opom}}/ig, "{{opoe}}"));
                    html.push('</tr>');
                }
                prevMonth.setDate(prevMonth.getDate() + 1);
            }
            var days_tbody = this.picker.find('.datepicker-days tbody');
            days_tbody.empty().append(html.join('').replace(/{{opo([bem])}}/ig, "view-day-$1"));
            if (countOld >= 7) {
                days_tbody.find("tr:eq(0)").hide();
            }
            var currentYear = this.date.getFullYear();

            var months = this.picker.find('.datepicker-months')
                .find('th.switch')
                .text(year + DPGlobal.dates.yearSuffix)
                .end()
                .find('span').removeClass('active');
            if (currentYear === year) {
                months.eq(this.date.getMonth()).addClass('active');
            }

            html = '';
            year = parseInt(year / 10, 10) * 10;
            var yearCont = this.picker.find('.datepicker-years')
                .find('th.switch')
                .text(year + '-' + (year + 9))
                .end()
                .find('td');
            year -= 1;
            for (var i = -1; i < 11; i++) {
                html += '<span class="year' + (i === -1 || i === 10 ? ' old' : '') + (currentYear === year ? ' active' : '') + '">' + year + '</span>';
                year += 1;
            }
            yearCont.html(html);
        },
        click: function(e) {
            !this.options._isMuitPicker && e.stopPropagation();
            e.preventDefault();
            var target = $(e.target).closest('span, td, th');
            if (target.length === 1) {
                var year, month;
                switch (target[0].nodeName.toLowerCase()) {
                    case 'th':
                        switch (target[0].className) {
                            case 'switch':
                                // this.showMode(1);
                                break;
                            case 'prev':
                            case 'next':
                                this.viewDate['set' + DPGlobal.modes[this.viewMode].navFnc].call(
                                    this.viewDate,
                                    this.viewDate['get' + DPGlobal.modes[this.viewMode].navFnc].call(this.viewDate) +
                                    DPGlobal.modes[this.viewMode].navStep * (target[0].className === 'prev' ? -1 : 1)
                                );
                                this.switchClk();
                                this.fill();
                                // this.set();
                                break;
                            case 'lastYear':
                            case 'nextYear':
                                this.viewDate['setFullYear'].call(
                                    this.viewDate,
                                    this.viewDate['getFullYear'].call(this.viewDate) + (target[0].className === 'lastYear' ? -1 : 1)
                                );
                                this.switchClk();
                                this.fill();
                                // this.set();
                                break;
                        }
                        break;
                    case 'span':
                        if (target.is('.month')) {
                            month = target.parent().find('span').index(target);
                            this.viewDate.setMonth(month);
                        } else {
                            year = parseInt(target.text(), 10) || 0;
                            this.viewDate.setFullYear(year);
                        }
                        if (this.viewMode !== 0) {
                            this.date = new Date(this.viewDate);
                            this.element.trigger({
                                type: 'changeDate',
                                date: this.date,
                                viewMode: DPGlobal.modes[this.viewMode].clsName
                            });
                        }
                        this.showMode(-1);
                        this.fill();
                        this.set();
                        break;
                    case 'td':
                        if (target.is('.day') && !target.is('.disabled')) {
                            var day = parseInt(target.text(), 10) || 1;
                            month = this.viewDate.getMonth();
                            if (target.is('.old')) {
                                month -= 1;
                            } else if (target.is('.new')) {
                                month += 1;
                            }
                            year = this.viewDate.getFullYear();
                            this.date = new Date(year, month, day, 0, 0, 0, 0);
                            this.viewDate = new Date(year, month, Math.min(28, day), 0, 0, 0, 0);
                            this.fill();
                            this.set();
                            this.element.trigger({
                                type: 'changeDate',
                                date: this.date,
                                viewMode: DPGlobal.modes[this.viewMode].clsName
                            });
                        }
                        break;
                }
            }
        },
        select: function(options) {
            var day = options.day;
            var month = options.month;
            var year = options.year;

            this.date = new Date(year, month, day, 0, 0, 0, 0);
            this.viewDate = new Date(year, month, Math.min(28, day), 0, 0, 0, 0);

            this.fill();
            this.set();
            this.element.trigger({
                type: 'changeDate',
                date: this.date,
                viewMode: DPGlobal.modes[this.viewMode].clsName
            });
        },
        getDate: function() {
            return this.date;
        },
        mousedown: function(e) {
            !this.options._isMuitPicker && e.stopPropagation();
            e.preventDefault();
        },

        showMode: function(dir) {
            if (dir) {
                this.viewMode = Math.max(this.minViewMode, Math.min(2, this.viewMode + dir));
            }
            this.picker.find('>div').hide().filter('.datepicker-' + DPGlobal.modes[this.viewMode].clsName).show();
        }
    };

    $.fn.datepicker = function(option, val) {
        return this.each(function() {
            var $this = $(this),
                data = $this.data('datepicker'),
                options = typeof option === 'object' && option;
            if (!data) {
                $this.data('datepicker', (data = new Datepicker(this, $.extend({}, $.fn.datepicker.defaults, options))));
            }
            if (typeof option === 'string') data[option](val);
        });
    };

    $.fn.datepicker.defaults = {
        onRender: function(date) {
            return '';
        }
    };
    $.fn.datepicker.Constructor = Datepicker;

    var _today = new Date();
    _today.setHours(0, 0, 0, 0);
    var DPGlobal = {
        today: _today,
        modes: [{
            clsName: 'days',
            navFnc: 'Month',
            navStep: 1
        }, {
            clsName: 'months',
            navFnc: 'FullYear',
            navStep: 1
        }, {
            clsName: 'years',
            navFnc: 'FullYear',
            navStep: 10
        }],
        dates: {
            days: ["周日", "周一", "周二", "周三", "周四", "周五", "周六", "周日"],
            daysShort: ["日", "一", "二", "三", "四", "五", "六", "日"],
            daysMin: ["日", "一", "二", "三", "四", "五", "六", "日"],
            months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
            monthsShort: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
            yearSuffix: '年'
        },
        isLeapYear: function(year) {
            return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
        },
        getDaysInMonth: function(year, month) {
            return [31, (DPGlobal.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
        },
        toDateWithOutHMS: function(date) {
            typeof date === "string" && (date = date.replace(/-/g, "/"));
            date = isNaN(Date.parse(new Date(date))) ? new Date : new Date(date);
            date.setHours(0, 0, 0, 0);
            return date;
        },
        parseFormat: function(format) {
            var separator = format.match(/[.\/\-\s].*?/),
                parts = format.split(/\W+/);
            if (!separator || !parts || parts.length === 0) {
                throw new Error("Invalid date format.");
            }
            return {
                separator: separator,
                parts: parts
            };
        },
        parseDate: function(date, format) {
            if (!date) {
                return DPGlobal.today;
            }
            var parts = date.split(format.separator),
                val;
            date = new Date();
            date.setHours(0, 0, 0, 0);
            if (parts.length === format.parts.length) {
                var year = date.getFullYear(),
                    day = date.getDate(),
                    month = date.getMonth();
                for (var i = 0, cnt = format.parts.length; i < cnt; i++) {
                    val = parseInt(parts[i], 10) || 1;
                    switch (format.parts[i]) {
                        case 'dd':
                        case 'd':
                            day = val;
                            if (day > 31) return DPGlobal.today;
                            date.setDate(val);
                            break;
                        case 'mm':
                        case 'm':
                            month = val - 1;
                            if (month > 11) return DPGlobal.today;
                            date.setMonth(month);
                            break;
                        case 'yy':
                            year = 2000 + val;
                            if (year < 1900 || year > 2099) return DPGlobal.today;
                            date.setFullYear(year);
                            break;
                        case 'yyyy':
                            year = val;
                            if (year < 1900 || year > 2099) return DPGlobal.today;
                            date.setFullYear(year);
                            break;
                    }
                }
                // date = new Date(year, month, day, 0, 0, 0);
            }
            return date;
        },
        formatDate: function(date, format) {
            var val = {
                d: date.getDate(),
                m: date.getMonth() + 1,
                yy: date.getFullYear().toString().substring(2),
                yyyy: date.getFullYear()
            };
            // 整站统一不补零--bleanycao,2014.4.8
            // val.dd = (val.d < 10 ? '0' : '') + val.d;
            // val.mm = (val.m < 10 ? '0' : '') + val.m;
            val.dd = val.d;
            val.mm = val.m;
            date = [];
            for (var i = 0, cnt = format.parts.length; i < cnt; i++) {
                date.push(val[format.parts[i]]);
            }
            return date.join(format.separator);
        },
        headTemplate: function(options) {
            return '<thead>' +
                '<tr>' +
                (options._showYearBtn ? '<th class="lastYear"><b><i>&lsaquo;&lsaquo;</i></b></th>' : '') +
                '<th class="prev"><b><i>&lsaquo;</i></b></th>' +
                '<th colspan="' + (options._showYearBtn ? '3' : '5') + '" class="switch"></th>' +
                '<th class="next"><b><i>&rsaquo;</i></b></th>' +
                (options._showYearBtn ? '<th class="nextYear"><b><i>&rsaquo;&rsaquo;</i></b></th>' : '') +
                '</tr>' +
                '</thead>';
        },
        contTemplate: '<tbody><tr><td colspan="7"></td></tr></tbody>'
    };
    DPGlobal.template = function(options) {
        return '<div class="datepicker dropdown-menu {{dpCls}}">' +
            '<div class="datepicker-days">' +
            '<table class=" table-condensed">' +
            DPGlobal.headTemplate(options) +
            '<tbody></tbody>' +
            '</table>' +
            '<div class="datepicker-days-bg"></div>' +
            '</div>' +
            '</div>';
    };

    return DPGlobal;
});