/**
 * jquery插件：radio
 * @param {Object} options 配置项
 * @param {Boolean} options.disabled 是否激活，1：激活，0：不激活（默认勾选）
 * @param {Boolean} options.checked 是否勾选，1：勾选，0：不勾选（默认不勾选）
 * @param {Boolean} options.labelText 复选框后面的文字
 * @param {Boolean} options.name checkbox的name
 *
 * @example
 * $('div').radio({
 *      checked: 1,
 *      disabled: 0,
 *      labelText: 'hello'
 * });
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else {
        root['Checkbox'] = factory(root['jQuery']);
    }
}(this, function ($) {
    
    var config = {
        baseClass: 'f-radio',
        checkedClass: 'checked',
        disabledClass: 'disabled'
    };
    // var tmpl = '<div class="js-radio radio ${className}" name="${name}" uid="${uid}" ${checked}>
    //              <i></i>\
    //              <label class="js-label" for="${name}">${labelText}</label>\
    //              </div>';
    var tmpl = '<label class="${className}" name="${name}" uid="${uid}" ${checked}>'
                    + '<i class="icon-radio"></i>'
                    + '<span class="f-label-text js-label">${labelText}</span>'
                + '</label>';
    $.fn.extend({
        /**
         * @class  复选。。。
         * @param {Object} options 配置项
         * @param {Boolean} options.disabled 是否激活，1：激活，0：不激活（默认勾选）
         * @param {Boolean} options.checked 是否勾选，1：勾选，0：不勾选（默认不勾选）
         * @param {Boolean} options.labelText 复选框后面的文字
         * @param {Boolean} options.name 复选框后面的文字
         */
        radio: function(options){
            var opts = $.extend({}, $.fn.radio.defaults, options);
            var self = this;

            // 完全不能理解这段代码为什么要这样做
            // 并且这个代码貌似没有执行过
            // var getOpt;
            // if(typeof options == 'function'){
            //  getOpt = function(index){
            //      return $.extend({}, $.fn.radio.defaults, options(index));
            //  };
            // }else{
            //  getOpt = function(){
            //      return $.extend({}, $.fn.radio.defaults, options);
            //  };
            // }

            this.each(function(index, node){
                if($(this).data('radio')==1){
                    return;
                }

                var $this = $(this);
                var html = '';
                var labelText = '';
                var hideStyle = {'overflow':'hidden', 'height':'1px', 'width':'1px', 'clip':'rect(0 0 0 0)', 'border':0, 'margin':'-1px', 'padding':0, 'position':'absolute'};
                var $radio = $(this).find('input[type=radio]').css(hideStyle).prop('uid', uid);
                var $label = $(this).find('label').css(hideStyle);

                var uid = Math.random().toString().slice(2);
                var className = getClass(opts.checked || $radio.prop('checked'), $radio.prop('disabled'));

                var data = {
                    checked: $radio.prop('checked') || opts.checked,
                    className: className,
                    name: $radio.prop('name'),
                    labelText: $label.html(),
                    uid: uid
                };
                html += tmpl.replace(/\$\{([^\{\}]+)\}/g, function(matchword, key){
                    return data[key];
                });

                $(this).append($(html));

                $radio.change(opts.onchange || function(){});
                $this.data('radio', 1);

            }).on('click', '.js-radio', self, $.fn.radio.click);

            return this;
        }
    });

    $.extend($.fn.radio, {
        defaults: {
            name: '',   // 复选框的name
            checked: 0, // 是否选中，1：选中，0：不选中
            disabled: 0,    // 是否disabled，1：disabled，0：enabled
            labelText: ''  // 复选框后面的文字
        },
        click: function(evt, opt){
            var $this = $(this);
            var uid = $this.attr('uid');    // 当前点击的uid

            // var $radios = $this.siblings('input[type=radio]');
            // var $raido = $radios.filter('[uid='+uid+']');
            var $radios = evt.data.find('input[type=radio]');
            var $radio = $this.siblings('input[type=radio]');

            $radio.trigger('click');

            var $checkedRadio = $radios.filter(':checked');
            var value = $checkedRadio.val();
            // var uid = $checkedRadio.prop('uid');

            // $this.parent().children('.js-radio').each(function(index, node){
            //  var $node = $(node);

            // });

            // var $parent = $this.parent();
            $radios.each(function(index, node){
                var $node = $(node);
                // var uid = $node.prop('uid');

                var className = getClass($node.prop('checked'), $node.prop('disabled'));
                // $parent.find('.js-radio[uid='+uid+']').css('js-radio radio '+className);
                $node.siblings('.js-radio').prop('class', className);
            });
        },
        val: function(){

        },
        check: function(){

        },
        uncheck: function(){

        },
        disable: function(){

        },
        enable: function(){

        },
        reset: function(options){

        }
    });

    /**
     * 获取class
     * @param  {[type]} checked  [description]
     * @param  {[type]} disabled [description]
     * @return {[type]}          [description]
     */
    function getClass(checked, disabled){
        var ret = [config.baseClass, 'js-radio'];
        if(checked && disabled){ret.push(config.checkedClass, config.disabledClass);}
        if(checked && !disabled){ret.push(config.checkedClass);}
        if(!checked && disabled){ret.push(config.disabledClass);}
        if(!checked && !disabled){}
        return ret.join(' ');
    }

    return $.fn.radio;
}));
