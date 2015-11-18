/**
 *  自定义数据选择器
 *
 *
 * 暴露事件:
 *  暴露方法：
 *    update
 *
 *  暴露事件：
 *      onOpen
 *      onSave
 *      onClose
 *
 *
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else {
        factory(root['jQuery']);
    }
}(this, function ($) {

    var MAX_COUNT = 100000;

    var template = [];
    template.push('<div class="mod-picker mod-picker_qq {{pickerCls}}" id={{id}}>');
    template.push('<div class="mod-picker__hd">');
    template.push('<h2 class="mod-picker__hd-title">选择{{title}}</h2>');
    template.push('<a auto-test="picker-atx-{{id}}" href="javascript:;" class="mod-picker__close" title="关闭">×</a>');
    template.push('</div>');
    template.push('<div class="mod-picker__bd">');
    template.push('<div class="mod-picker__data-options">');
    template.push('<h3 class="mod-picker__list-title">选择{{title1}}：</h3>');
    template.push('<div class="mod-picker__cont">');
    template.push('<input auto-test="picker-ati-{{id}}" type="text" placeholder="输入关键字或拼音进行筛选" class="mod-picker__input" />');
    template.push('<ul class="mod-picker__options-ul"></ul>');
    template.push('</div>');
    template.push('</div>');
    template.push('<div class="mod-picker__action-btns">');
    template.push('<a auto-test="picker-ata-{{id}}" href="javascript:;" class="btn-add btn-weak disabled">添加</a>');
    template.push('<a auto-test="picker-atd-{{id}}" href="javascript:;" class="btn-del btn-weak disabled">删除</a>');
    template.push('<span class="mod-picker__tips">支持选择<i class="mod-picker__max"></i>{{unit}}{{title}}</span>');
    template.push('<span class="mod-picker__warning">{{warning}}</span>');
    template.push('</div>');
    template.push('<div class="mod-picker__data-selected">');
    template.push('<h3 class="mod-picker__list-title">已选择{{title2}}：</h3>');
    template.push('<div class="mod-picker__cont">');
    template.push('<ul class="mod-picker__selected-ul"></ul>');
    template.push('</div>');
    template.push('</div>');
    template.push('</div>');
    template.push('<div class="mod-picker__ft">');
    template.push('<span class="picker-help"></span>');
    template.push('<a auto-test="picker-ats-{{id}}" href="javascript:;" class="btn-default btn-save" title="确定">确定</a>');
    template.push('</div>');
    template.push('</div>');
    template = template.join("");

    /* http://twitter.github.io/typeahead.js/releases/latest/typeahead.bundle.js */
    var throttle = function(func, wait) {
        var context, args, timeout, result, previous, later;
        previous = 0;
        later = function() {
            previous = new Date();
            timeout = null;
            result = func.apply(context, args);
        };
        return function() {
            var now = new Date(),
                remaining = wait - (now - previous);
            context = this;
            args = arguments;
            if (remaining <= 0) {
                clearTimeout(timeout);
                timeout = null;
                previous = now;
                result = func.apply(context, args);
            } else if (!timeout) {
                timeout = setTimeout(later, remaining);
            }
            return result;
        };
    };

    // set select none
    var setSelectNone = function($item) {
        var item = $item[0];
        item.onselectstart = item.ondrag = function() {
            return false;
        };
    };

    var buildItem = function(data, index, id) {
        return '<li auto-test="picker-ato-' + id + '" class="' + (index > 100 ? 'mod-picker__options-item-hide ' : '') + 'opt-' + data.key + ' ' + (data.cls || '') + '" data-key="' + data.key + '" title="' + data.value + '" data-value="' + data.value + '">' + data.view + '</li>';
    };

    var buildData = function(data, options, id) {
        var html = [];
        for (var i = 0, l = data.length; i < l; i++) {
            var _data = data[i];
            var child = _data.child;
            if (child) {
                _data.cls = "mod-picker__with-sub";
                html.push(buildItem(_data, html.length, id));
                if (options.isOpenChild) {
                    var parent = "opt-parent-" + _data.key + " opt-hidden";
                    var length = child.length;
                    var index = 0;
                    while (index < length) {
                        _data = child[index];
                        _data.cls = "mod-picker__sub-li " + parent;
                        html.push(buildItem(_data, html.length, id));
                        index++;
                    }
                }
            } else {
                html.push(buildItem(_data, html.length, id));
            }

        }
        return html.join("");
    };

    var removeData = function(arr, val) {
        var result = [];
        for (var i = 0, l = arr.length; i < l; i++) {
            arr[i] !== val && result.push(arr[i]);
        }
        return result;
    };

    $.fn.picker = function(options) {
        if ($(this).data('__cache__')) {
            if (typeof options === 'string') {
                var args = arguments.length <= 1 ? [] : ([].slice.apply(arguments));
                var pm = $(this).data('__cache__');
                pm[options].apply(pm, args.slice(1));
            }
            return;
        }

        options = $.extend({
            unit: "个",
            mode: "auto", // 选择模式, auto(默认) single(单选模式)
            isOpenChild: false, // 是否展开子元素
            getData: function() {
                return [];
            },
            onOpen: function($picker, data) {},
            onSave: function(data) {},
            onClose: function(data) {},
            autoSaveByOne: true, // 只能选择一个元素时是否自动关闭
            lazytime: 300
        }, options);

        return this.each(function() {
            var $this = $(this);
            // 生成唯一id
            var id = ("picker_" + (+new Date()) + Math.random()).replace(/\W/g, "");
            $this.data("id", id);
            $("body").append(template.replace(/{{title1}}/ig, options.title1 || "{{title}}")
                .replace(/{{title2}}/ig, options.title2 || "{{title}}")
                .replace(/{{title}}/ig, options.title || "")
                .replace(/{{unit}}/ig, options.unit)
                .replace(/{{warning}}/ig, options.warning || "")
                .replace(/{{id}}/ig, id)
                .replace(/{{pickerCls}}/ig, options.pickerCls || "")
            );
            var $picker = $("#" + id);
            $this.data("picker-box", $picker);

            var data = options.getData();
            var selected = [];
            $picker.find(".mod-picker__options-ul").html(buildData(data, options, id));
            setSelectNone($picker);

            var target = $this.hasClass('diy-picker-toggle') ? $this : $this.parent().find(".diy-picker-toggle");
            target = target.length ? target : $this;
            // toggle
            target.click(function(event) {
                event.preventDefault();
                if (!$('.modal-bg').length) $(document.body).append('<div class="modal-bg hide"></div>');
                $('.modal-bg').removeClass("hide").show();

                if (getMaxValue() < MAX_COUNT) {
                    $picker.find(".mod-picker__max").text(getMaxValue());
                    $picker.find('.mod-picker__tips').show();
                } else {
                    $picker.find('.mod-picker__tips').hide();
                }

                $picker.show();
                selected = ($this.data("value") || []).slice(0);
                var $picker_opts = $picker.find(".mod-picker__options-ul");
                var $picker_sels = $picker.find(".mod-picker__selected-ul");
                $picker_opts.find("li").removeClass("selected");
                $picker_sels.empty();

                for (var i = 0, l = selected.length; i < l; i++) {
                    var _item = $picker_opts.find(".opt-" + selected[i]).addClass("selected");
                    $picker_sels.append(_item.clone().removeClass("selected"));
                }


                options.onOpen($picker, selected.slice(0));
                setTimeout(function() {
                    $picker.addClass('mod-picker__options-item-optimize');
                }, 0);
            });

            var $ipt = $picker.find("input");
            var $add = $picker.find(".btn-add");
            var $del = $picker.find(".btn-del");

            var updateData = function(newData) {
                data = newData;
            };

            // search
            $ipt.on("keyup paste", throttle(function() {
                var val = $ipt.val().replace(/\s+/g, "").toLowerCase(); // 忽略空白符
                var not_match = [];
                var i;
                var l;
                if (val.length > 0) {
                    for (i = 0, l = data.length; i < l; i++) {
                        if (data[i].search.indexOf(val) === -1) { // 不匹配
                            not_match.push(data[i]);
                        }
                    }
                }
                $picker.find(".mod-picker__data-options .not-match").removeClass("not-match");
                for (i = 0, l = not_match.length; i < l; i++) {
                    $picker.find(".opt-" + not_match[i].key).addClass("not-match");
                }
            }, options.lazytime));

            var getMaxValue = function() {
                var max = parseInt($this.data("max"), 10) || 5;
                if (max <= 0) {
                    max = MAX_COUNT;
                }
                return max;
            };

            var getMinValue = function() {
                var min = parseInt($this.data("min"), 10) || -1;
                return min;
            };


            var resetBtnByMinValue = function() {
                var selected_counts = $picker.find(".mod-picker__data-options li.selected").length;

                var min = getMinValue();
                var $saveBtn = $picker.find(".mod-picker__ft .btn-save");
                if (min <= selected_counts) {
                    $saveBtn.removeClass('disabled');
                } else {
                    $saveBtn.addClass('disabled');
                }
            };

            // add
            var selectedAdd = function($item) {
                var max = getMaxValue(); // max为可变值, 使用时每次从data取
                var key = $item.data("key");

                if (max === 1) {
                    selected = [];
                    $item.siblings("li").removeClass("selecting selected");
                    $picker.find(".mod-picker__selected-ul").empty();
                }
                if (selected.length < max) {
                    $item.removeClass("selecting").addClass("selected");
                    selected.push(key);
                    $picker.find(".mod-picker__selected-ul").append($item.clone().removeClass("selected"));
                    if (max === 1 && options.autoSaveByOne) {
                        return $picker.find(".mod-picker__ft .btn-save").trigger("click");
                    }
                }
            };

            $picker.on("click", ".mod-picker__data-options li", function(event) {
                event.preventDefault();
                var $li = $(this);
                if (options.mode === "single") { // 单选模式 合集不可选
                    if ($li.hasClass("mod-picker__with-sub")) { // 合集有子元素, 控制其子元素展开和关闭
                        $li.toggleClass("mod-picker__sub-open");
                        return $li.nextAll(".opt-parent-" + $li.data("key")).toggleClass("opt-hidden");
                    }
                }
                var max = getMaxValue(); // max为可变值, 使用时每次从data取
                max === 1 && $picker.find(".mod-picker__data-options li.selecting").removeClass('selecting');
                $li.toggleClass("selecting");
                var selecting_counts = $picker.find(".mod-picker__data-options li.selecting").length;
                var selected_counts = selected.length; // $picker.find(".mod-picker__data-options li.selected").length;

                var counts = max > 1 ? (selecting_counts + selected_counts) : selecting_counts;
                if (selecting_counts > 0 && counts <= max) {
                    $add.removeClass("disabled");
                } else {
                    $add.addClass("disabled");
                }
            });

            $picker.on("dblclick", ".mod-picker__data-options li", function(event) {
                event.preventDefault();
                var $li = $(this);
                if (options.mode === "single") { // 单选模式 合集不可选
                    if ($li.hasClass("mod-picker__with-sub")) { // 合集有子元素, 控制其子元素展开和关闭
                        $li.toggleClass("mod-picker__sub-open");
                        return $li.nextAll(".opt-parent-" + $li.data("key")).toggleClass("opt-hidden");
                    }
                }
                var max = getMaxValue(); // max为可变值, 使用时每次从data取
                var selected_counts = $picker.find(".mod-picker__data-options li.selected").length;
                (max === 1 || selected_counts < max) && selectedAdd($li);

                resetBtnByMinValue();
            });

            $add.click(function(event) {
                event.preventDefault();
                if ($add.hasClass("disabled")) return;
                var $selecting = $picker.find(".mod-picker__data-options li.selecting");
                $selecting.removeClass("selecting").addClass("selected").each(function() {
                    selectedAdd($(this));
                });
                $add.addClass("disabled");

                resetBtnByMinValue();
            });

            // delete
            var selectedRemove = function($item) {
                var key = $item.data("key");
                selected = removeData(selected, key);
                $item.remove();
                $(".opt-" + key).removeClass("selected");
            };

            $picker.on("click", ".mod-picker__data-selected li", function(event) {
                event.preventDefault();
                var $li = $(this);
                if ($li.hasClass("disabled")) return;
                $li.toggleClass("selecting");
                if ($picker.find(".mod-picker__data-selected li.selecting").length > 0) {
                    $del.removeClass("disabled");
                } else {
                    $del.addClass("disabled");
                }

            });

            $picker.on("dblclick", ".mod-picker__data-selected li", function(event) {
                event.preventDefault();
                var $li = $(this);
                if ($li.hasClass("disabled")) return;
                selectedRemove($li);
                resetBtnByMinValue();
            });

            $del.click(function(event) {
                event.preventDefault();
                if ($del.hasClass("disabled")) return;
                var $selecting = $picker.find(".mod-picker__data-selected li.selecting");
                $selecting.each(function() {
                    selectedRemove($(this));
                });
                $del.addClass("disabled");

                resetBtnByMinValue();
            });

            var pickerHide = function() {
                $picker.hide();
                $('.modal-bg').addClass("hide").hide();
                options.onClose($picker);
            };

            // close
            $picker.find(".mod-picker__close").click(function(event) {
                event.preventDefault();
                pickerHide();
            });

            // save
            $picker.find(".mod-picker__ft .btn-save").click(function(event) {
                event.preventDefault();
                pickerHide();
                $this.data("value", selected);
                options.onSave && options.onSave($this, selected);
            });

            $this.data('__cache__', {
                update: function(data) {
                    var a = $picker.find(".mod-picker__options-ul");
                    $picker.find(".mod-picker__options-ul").html(buildData(data.data, options, id));
                    updateData(data.data);
                },
                setSelected: function(data) {
                    $this.data('value', data);
                }
            });

        });
    };

}));
