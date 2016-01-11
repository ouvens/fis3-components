// 计算课时安排
(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([
            'jquery',
            'db',
            'base'
        ], factory);
    } else {
        root['Syllabus'] = factory(
            root['jQuery'],
            root['DB']
        );
    }
}(this, function($, DB) {

    // 拉取节假日安排
    DB.extend({
        get_holiday_info: DB.httpMethod({
            url: '/cgi-bin/get_holiday_info',
            type: 'GET'
        })
    });

    var toInt = function(val, def) {
        return parseInt(val, 10) || def || 0;
    };

    var TIME_REG = /^(?:[01]?\d|2[0-3])[:：][0-5]?\d$/;

    var holiday_info = [
        [],
        []
    ];
    var holiday_info_begin = false;
    var holiday_info_end = false;
    var holiday_info_cb = [];
    var init = function(cb) {
        if (holiday_info_end) {
            return cb && cb(holiday_info);
        }
        if (holiday_info_begin) {
            return cb && holiday_info_cb.push(cb);
        }
        holiday_info_begin = true;
        holiday_info_cb = [cb];
        DB.get_holiday_info({
            succ: function(data) {
                data = data || {};
                var rs = data.result;
                var _holiday = [];
                var i, l;
                for (i = 0, l = rs.holiday.length; i < l; i++) {
                    _holiday.push(rs.holiday[i] * 1000);
                }
                var _weekend_work = [];
                for (i = 0, l = rs.weekend_work.length; i < l; i++) {
                    _weekend_work.push(rs.weekend_work[i] * 1000);
                }
                holiday_info = [_holiday, _weekend_work];
                holiday_info_end = true;
                while (holiday_info_cb.length) {
                    var cb = holiday_info_cb.shift();
                    cb && cb(holiday_info);
                }
            },
            err: function() {
                cb && cb(holiday_info);
            }
        });
    };

    var isHoliday = function(date) {
        var week = (new Date(date).getDay()) || 7;
        return week > 5 ? holiday_info[1].indexOf(date) === -1 : holiday_info[0].indexOf(date) !== -1;
    };

    var getDateTimeWithOutHms = function(date) {
        date = new Date(date);
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date;
    };

    var parseTimeWithBeginEndStr = function(date, begin, end) {
        begin = +new Date(date + " " + begin);
        end = +new Date(date + " " + end);
        end < begin && (end += 86400000);
        return {
            bgtime: $.render.time.fixTimezone(begin / 1000),
            endtime: $.render.time.fixTimezone(end / 1000)
        };
    };

    var getSyllabas = function(info, cb, isNeedDetails) {
        var dates = []; // 要返回的计算结果
        var lesson = 0; // 课时
        var lessons = info.lessons; // 总课时
        var bgDate = getDateTimeWithOutHms(new Date(info.begindate || info.bgtime)); // 开始日期

        var maxDate = new Date(+bgDate + 86400000 * 365); // 单期课程跨度不超过1年
        var _cycle_type = info.cycle_type; // 循环方式
        if (_cycle_type !== 0) {
            var _cycle_info = info.cycle_info; // 与循环方式相对应的循环信息
            var _filter_holiday = info.filter_holiday; // 是否节假日除外
            var _times = Math.max(info.times || (info.timeinfo_str || []).length, 1); // 一天上几节课
            while (lesson < lessons && bgDate < maxDate) {
                var match = false;
                switch (_cycle_type) {
                    case 1: // 每日重复
                        match = true;
                        break;
                    case 2: // 每周重复
                        match = _cycle_info.indexOf(bgDate.getDay() || 7) !== -1;
                        break;
                    case 3: // 每月重复
                        match = _cycle_info.indexOf(bgDate.getDate()) !== -1;
                        break;
                    default: // 不重复
                        match = true;
                        _cycle_type = 0; // 设置为不重复
                        lessons = 1; // 修正参数, 避免课时数和重复方式不匹配问题
                        break;
                }
                // 判断是否是节假日, 不重复课程忽略此选项
                if (_filter_holiday && _cycle_type !== 0 && isHoliday(+bgDate)) {
                    match = false;
                }
                if (match) {
                    dates.push(+bgDate);
                    lesson += _times;
                }
                bgDate = new Date(+bgDate + 86400000);
            }
        } else {
            dates = info.repeat_dates.slice(0);
        }
        cb && cb(dates);
        return dates;
    };

    var getSyllabasDetails = function(info) {
        var details = [];
        var dates = getSyllabas(info);
        var timeinfo_str = info.timeinfo_str || [];
        for (var i = 0, l = dates.length; i < l; i++) {
            var date_str = $.render.time.formatDate("Y/M/D", dates[i]);
            for (var t = 0, tl = timeinfo_str.length; t < tl; t++) {
                details.push(parseTimeWithBeginEndStr(date_str,
                    timeinfo_str[t][0], timeinfo_str[t][1]));
            }
        }

        details.sort(function(x, y) {
            return x.bgtime - y.bgtime;
        });
        return details;
    };

    // 关于时间展示问题, 这里增加一个字段 show_id 表示展示方式
    // 1. 若日期与原始填写循环方式一致，时刻固定则与现网展示方式一致：
    //      x月x日起，循环方式 + 时刻 上课
    // 2. 若日期与原始填写循环方式一致，时刻不固定则展示方式如下：
    //      x月x日起，循环方式，x月x日结束
    // 3. 若日期与原始填写循环方式不一致。展示方式为：
    //      x月x日起，x月x日，x月x日...x月x日结束。（展示起始的三个日期）
    var getSyllabasStr = function(info, cb) {
        var text = [];
        var isRepeat = info.cycle_type === 1 ||
            info.cycle_type === 2 ||
            info.cycle_type === 3;

        var begin_date = "";
        var show_id = parseInt(info.show_id, 10) || 1;

        if (info.bgtime) {
            begin_date = $.render.time.formatDate('M月D日', new Date(info.bgtime * 1000));
            begin_date && text.push(begin_date);
        } else if (info.begindate) {
            begin_date = info.begindate.match(/(\d+)[-\/\\\.](\d+)$/);
            begin_date && text.push(begin_date[1] + "月" + begin_date[2] + "日");
        }
        text.length > 0 && text.push("起，");

        var dateStr = [];
        // sub_course 为课程管理页返回的每一节课的上课时间安排 和 timeplan_all 略显冗余
        if (info.sub_course) {
            var _dateStr = {};
            var sc = info.sub_course;
            for (var si = 0, sl = sc.length; si < sl; si++) {
                var sc_bg = sc[si].cs_bgtime * 1000;
                _dateStr[$.render.time.formatDate("M月D日",
                    new Date(sc_bg))] = sc_bg;
            }
            for (var str in _dateStr) {
                str !== begin_date && dateStr.push(str);
            }
            dateStr.sort(function(x, y) {
                return _dateStr[x] - _dateStr[y];
            });
        }

        // 循环方式
        if (show_id !== 3) {
            if (isRepeat) {
                text.push($.render.courseTime(info.cycle_type, info.cycle_info));
            } else if (info.repeat_dates) { // 不重复
                var _repeat_dates = [];
                var repeat_dates = info.repeat_dates;
                var repeat_dates_key = {};
                for (var ri = 0, rl = repeat_dates.length; ri < rl; ri++) {
                    repeat_dates_key[$.render.time.formatDate("M月D日", new Date(repeat_dates[ri]))] = repeat_dates[ri];
                }
                for (var rdk in repeat_dates_key) {
                    rdk !== begin_date && _repeat_dates.push(rdk);
                }
                _repeat_dates.sort(function(x, y) {
                    return repeat_dates_key[x] - repeat_dates_key[y];
                });
                text.push(_repeat_dates.join("、"));
            } else {
                text.push(dateStr.join("、"));
            }
        }

        // 时刻
        if (show_id === 1) {
            var tp = [];
            var timeinfo_data = info.timeinfo_str || info.timeplan || [];
            timeinfo_data && $.each(timeinfo_data, function(i, val) {
                var suffix = "";
                var v = [];
                if ($.isArray(val)) {
                    v = val;
                } else {
                    v = [$.render.time.formatDate('h:mm', new Date(val.bgtime * 1000)),
                        $.render.time.formatDate('h:mm', new Date(val.endtime * 1000))
                    ];
                }
                if (TIME_REG.test(v[0]) && TIME_REG.test(v[1])) {
                    var begin = v[0].split(/[:：]/);
                    var end = v[1].split(/[:：]/);
                    suffix = (toInt(begin[0] * 60) + toInt(begin[1])) >= (toInt(end[0] * 60) + toInt(end[1])) ? "(第二天)" : "";
                }
                tp.push(v.join("-") + suffix);
            });
            text.push(" " + (tp.join("、") || "").replace(/、([^、]+)$/, " 和 $1"));
            text.push("上课");
        }

        // 结束
        if (show_id === 2) {
            text.push("上课");
            info.endtime && text.push($.render.time.formatDate('，M月D日结束', new Date(info.endtime * 1000)));
        }

        if (show_id === 3) {
            dateStr[0] && dateStr[1] && text.push(dateStr[0]);
            dateStr[1] && dateStr[2] && text.push("、", dateStr[1]);
            dateStr[4] ? text.push($.render.time.formatDate('...M月D日结束', new Date(info.endtime * 1000))) : text.push($.render.time.formatDate('，M月D日结束', new Date(info.endtime * 1000)));
        }

        info.filter_holiday && text.push("（节假日除外）");

        return text.join("");
    };

    var getSyllabasByTimePlan = function(data) {
        var output = [];
        if (data && data.timeplan_all) {
            var timeplan_all = data.timeplan_all;
            var output_key = {};
            var key;
            for (var i = 0, l = timeplan_all.length; i < l; i++) {
                key = getDateTimeWithOutHms(new Date(timeplan_all[i].bgtime * 1000)).valueOf();
                output_key[key] = 1;
            }
            for (key in output_key) {
                output.push(parseInt(key));
            }
        }
        return output;
    };

    return {
        init: init,
        isHoliday: isHoliday,
        getSyllabas: getSyllabas,
        getSyllabasStr: getSyllabasStr,
        getSyllabasDetails: getSyllabasDetails,
        getSyllabasByTimePlan: getSyllabasByTimePlan,
        getDateTimeWithOutHms: getDateTimeWithOutHms,
        parseTimeWithBeginEndStr: parseTimeWithBeginEndStr
    };

}));
