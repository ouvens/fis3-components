/**自定义下拉单**/
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else {
        factory(root['jQuery']);
    }
}(this, function ($) {

    var isKeyPress = false;

    function hasCheckBox($area) {
        return $area.hasClass("diy-select-checkbox");
    }

    function hideSelect($area) {
        $area.each(function() {
            var $temp = $(this);
            if ($temp.hasClass("diy-select-on")) {
                $temp.removeClass("diy-select-on");
                $temp.find(".diy-optgroud").hide();
                $temp.find(".diy-option-save").hide();
                var pattern = $temp.data("pattern");
                pattern && $temp.trigger("change:" + pattern);
            }
        });
    }

    function getOptionsVal($area, $option) {
        if (hasCheckBox($area)) {
            var data = [
                [],
                []
            ];
            var $all = $area.find(".diy-option-all");
            $area.find(".opt-checked").not(".diy-option-all").each(function() {
                var $this = $(this);
                data[0].push($this.data("value")); // key
                data[1].push($this.find("a,span").eq(0).text()); // value
            });
            return [data[0], $all.hasClass("opt-checked") ? $all.find("a,span").eq(0).text() : data[1].join("，")];
        } else {
            return [$option.data("value"), $option.find("a,span").eq(0).text()];
        }
    }

    $(document).on("keydown", function(event) {
        event.keyCode === 13 && (isKeyPress = true); // Enter
    }).on("click", function() {
        hideSelect($(".diy-select-area"));
    }).on("click", ".diy-select, .diy-select-toggle", function(event) {
        event.stopPropagation();
        event.preventDefault();
        var $this = $(this);
        if ($this.attr("disabled")) return; // 光有这一行，还需要排除小三角。。。。。。

        var $area = $this.closest(".diy-select-area");
        if ($area.attr("disabled")) return;

        var pattern = $area.data('pattern');

        // 遍历并隐藏其他select
        hideSelect($(".diy-select-on").not($area));
        var $optgroud = $area.find(".diy-optgroud");
        var $select = $area.find(".diy-select");
        var select;
        if ($optgroud.length > 0) {
            if ($area.hasClass("diy-select-on")){
                return hideSelect($area);
            }
            $area.addClass("diy-select-on");
            select = $select.data("select");
            select && $area.trigger("showopt:" + select);
            $optgroud.show();
            
            // 最长显示10个 超出显示滚动条
            var lis_show = 0;
            var $lis = $optgroud.find("li");
            $lis.each(function() {
                $(this).css("display") !== "none" && lis_show++;
            });
            lis_show > 10 ?
                $optgroud.css({
                    maxHeight: 10 * $lis.eq(0).height() + 9,
                    overflowY: "auto",
                    height: "auto"
                }) :
                $optgroud.css({
                    height: lis_show * ($lis.eq(0).height() + 1) - 1,
                    overflowY: "hidden"
                });
            !!window.ActiveXObject && !window.XMLHttpRequest && lis_show > 10 && $optgroud.css({
                height: 10 * $lis.eq(0).height() + 9,
                overflowY: "auto"
            });
            $lis.eq(-1).css("borderBottom", 0);
            hasCheckBox($area) && $area.find(".diy-option-save").css("top", $optgroud.height() + 39).show();
            $(document).trigger('open:'+pattern);
        } else {
            select = $this.data("select");
            select && $this.trigger("nooption:" + select);
        }
    }).on("click", ".diy-select-ipt, .diy-optgroud .diy-option a", function(event) {
        event.preventDefault();
    }).on("click init", ".diy-optgroud .diy-option", function(event) {
        event.stopPropagation();
        event.preventDefault();
        var $this = $(this);
        var $area = $this.parents(".diy-select-area");
        var $optgroud = $area.find(".diy-optgroud");
        var $select = $area.find(".diy-select");
        var $select_ipt = $area.find(".diy-select-ipt");
        var $select_text = $area.find(".text");
        var $select_it = $select_ipt.add($select_text).eq(0);

        var isCheckBoxSelect = hasCheckBox($area);
        if (isCheckBoxSelect) {
            $this.toggleClass("opt-checked");
            if ($this.hasClass("diy-option-all")) {
                if ($this.hasClass("opt-checked")) {
                    $this.siblings("li").addClass("opt-checked");
                } else {
                    $this.siblings("li").removeClass("opt-checked");
                }
            } else {
                if (!$this.hasClass("opt-checked")) {
                    $area.find(".diy-option-all").removeClass("opt-checked");
                }
                $area.find(".opt-checked").not(".diy-option-all").length ===
                $area.find(".diy-option").not(".diy-option-all").length &&
                $area.find(".diy-option-all").addClass("opt-checked");
            }
        } else {
            $area.removeClass("diy-select-on");
            $this.addClass("selected").siblings("li").removeClass("selected");
            $optgroud.hide();
            $area.find(".diy-option-save").hide();
        }

        var isChange = false;
        var prev_text = "";
        var prev_value = "";
        var text = "";
        var value = "";
        var optionData = [];
        var isInput = $select_ipt.length > 0;
        if ($select_it.length > 0) {
            prev_text = isInput ? $select_it.val() : $select_text.text();
            prev_value = $select_it.data("value");
            optionData = getOptionsVal($area, $this);
            value = optionData[0];
            text = optionData[1];
            isChange = text !== prev_text;
            if (isInput) {
                $select_ipt.data("value", value).val(text);
            } else {
                if (isCheckBoxSelect) {
                    if (value.length === 0) {
                        text = $select_text.data("tips");
                        $select_text.addClass("text-tip");
                    } else {
                        $select_text.removeClass("text-tip");
                    }
                } else {
                    if ($this.hasClass("diy-option-tips")) {
                        $select_text.addClass("text-tip");
                    } else {
                        $select_text.removeClass("text-tip");
                    }
                }
                $select_text.data("value", value).text(text);
            }
        } else {
            text = $this.text();
            isChange = text != $select.text();
            $select.html(text + "<span><b></b></span>");
        }

        event.type === "click" && isKeyPress && $select.focus();
        isKeyPress = false;

        // 触发事件
        var select = $select.data("select");
        select && isChange && $select.trigger("change:" + select, [text, value, prev_text, prev_value, event.type]);
    });

}));
