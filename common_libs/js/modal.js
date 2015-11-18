/*jshint -W085 */ // 允许使用with
/*jshint evil:true */ // 允许使用eval
/*jshint -W030 */ // 允许使用 无效的表达式，例如 a===1 && fn();x===1;
/**
 * 通用对话框模块
 * @author  vienwu 20150606
 * 1. 支持常用的alert,confirm,success,error,retry等
 * 2. 支持同步/异步回调，多个modal实例同时显示
 * 3. 支持两个按键事件,esc(关闭),enter(确定)，可拖动
 * 4. 兼容部分旧版dialog.js参数
 *
 * 依赖列表:
 * 1. 基础的css样式
 * 2. jQuery
 *
 * jQuery增加：
 * * $.template 简单的模版引擎
 * * $.modal 对话框
 * * $.fn.modal 对话框
 * * $.fn.drag 拖动
 * * $.Modal 对话框
 *
 * 用法:
 * ######
 * var modal = require('modal');modal();
 * $.modal();
 * $(selector).modal();
 *
 * ###### $.modal([options])  直接弹出一个对话框
 * options为配置对象。
 * 返回一个modal实例，该实例拥有一些基础方法。例如：
 *
 * $.modal(options).yes(callback).no(callback).onClose(callback)
 * yes()和no()为指定一个确定/关闭时触发的回调
 * onClose() 指定一个对话框移除时触发的回调，可和yes()和no()方法同时生效。
 * 先触发yes()和no()，最后触发onClose()
 *
 * 其他常用： （content为对话框正文）
 * $.modal.alert(content,options) 提示
 * $.modal.alert(content,options) 警告
 * $.modal.retry(content,options) 重试
 * $.modal.confirm(content,options) 确认
 * $.modal.success(content,options) 成功
 * $.modal.error(content,options) 错误
 * $.modal.help(content,options) 帮助
 *
 * ##### $(selector).modal([支持多个参数])
 * 为jQuery对象绑定一个对话框，当该元素被点击时弹出。
 *
 *
 * * 当参数为3个时(type,content,options)
 * type为"alert|alert|retry"等常用样式的类型，content为正文，options的位置。
 * * 参数为2个时 (content,options) 可在options配置中指定type
 * * 参数为1个时 (content|options)
 * 可传入字符串或者一个配置对象，当传入字符串时默认使用alert样式。
 *
 * 例如：
 * $('#id').modal('这是一个alert对话框');
 * $('#id').modal({
 *     type:'alert',
 *     content:'这是一个alert对话框'
 * });
 * $('#id').modal('测试confirm',{type:'confirm',title:'请确认'})
 * $('#id').modal('success','成功提示内容',{title:'成功'});
 *
 * ###### 示例
 * * 多个实例
    $.modal.alert('无论点击确定还是关闭按钮，均会弹出另一个提示框')
    .onClose(function(){
        $.modal.alert('另一个提示框。',{width:400,height:500});
        return false;// 不关闭
    });
 * * 同步方式
    $.modal.alert('测试',{
        title:'续签合同',
        content:'请签订合同'
    })
    .yes(function(event){
        if(...){
            return true; // 关闭对话框
        }else{
            return false; // 不关闭对话框
        }
    })
    .no(function(event)){
        return false; // 不允许直接关闭
    };


    $.modal.alert('测试')
    .width(500)
    .height(500)
    .title('续签合同')
    .content('请签订合同')
    .yes(function(event){
        if(...){
            console.log();
        }
        // 无任何返回值，默认为undefined，关闭对话框，或者return true 也可以关闭对话框
    });
 * * 异步方式，触发回调时，默认将所有按钮设置为不可用状态，直到cb被触发
    $.modal.alert('测试')
    .yes(function(event,cb){
        // 按钮、回车键 进入不可用状态
        $.ajax({
            ...
            success:function(){
                cb(); // 关闭对话框，也可以cb(true);
            },
            error:function(){
                cb(false); // 不关闭对话框，取消按钮不可用状态
            }
        });
        // 有cb参数时，return true/false不会生效。
    });
 *
 * ###### 配置对象options支持的参数列表及默认值
 *
 * title: '提示' // 标题
 * className:'' // 额外的样式，传入className会覆盖默认的''样式
 * padding: true // 是否为内容区域添加padding，默认添加
 * scroll:false // 是否为内容区域添加滚动条，默认否。
 * content: 'hello world.' // 弹框内容，支持html
 * txtYes: '确定' // 确定按钮的文字
 * txtNo: '取消' // 取消按钮的文字
 * icon: '' // 使用的icon图标，支持:alert,info,succ,help
 * nohead:false // 是否显示标题栏
 * body:'' // 传入一段html，单独定义 对话框body。
 *     如果传入body，则只显示body内容，icon和content参数失效，底部按钮也不显示。
 * hotkey:true // 开启热键支持。提供了esc关闭、enter点击确定两个热键。
 * isYes:true // 是否显示确定按钮
 * isNo:true // 是否显示取消按钮
 * enableYes:true // 确定按钮、enter键 是否可用
 * enableNo:true // 取消按钮、esc键 是否可用
 * enableBgClose: true // 点击背景层是否可以关闭
 * enableClose: true // 是否允许关闭
 * enableDrag: true // 是否允许拖拽
 * buttonsAlign:'right' // 按钮位置
 * width: 500 // 弹框宽度
 * height:'' // 弹框高度，默认自适应高度
 * yes: function() {} // 点击确定按钮或按下回车键的回调
 * no: function() {} // 点击取消按钮、右上角关闭按钮及按下Esc键的回调
 * onClose: function() {} // 对话框移除时的回调，无论是点击确定按钮或者关闭按钮均会触发。
 *
 * 兼容旧版dialog.js参数：
 * submit: 等同 'txtYes'
 * isDisabled: 等同 'enableYes'
 * globalClass:等同 'className'
 * onAccept: 等同 'yes'
 * onCancel:等同 'no'
 *
 * ###### modal实例拥有的属性和方法
 * var modal = $.modal.alert('hello, world.');
 * 属性列表：
 * * $ 对话框主体的jQuery引用
 * * $bg 透明背景层的jQuery引用（注：多个modal实例共存时，modal实例$bg属性引用的是同一个背景层）
 * * $btnYes 确定按钮的jQuery引用
 * * $btnNo 取消按钮的jQuery引用
 * 方法列表：
 * * width(val) 等同于jQuery的width方法，返回modal实例
 * * height(val) 等同于jQuery的height方法，返回modal实例
 * * remove() 不触发任何回调直接移除对话框（不会触发yes、on、onClose方法设置的回调）
 * * yes(callback) 设置一个回调函数，点击确定/重试/确认按钮、按下enter键时触发，返回modal实例
 *     回调函数支持 同步/异步 方式控制 是否关闭对话框，callback(event,setClose)
 *     a. 同步方式，callback(event)，返回一个布尔值，当返回true/undefined时关闭对话框，false不关闭
 *     b. 异步方式，callback(event,setClose)，此方式传入的回调函数必须指定一个cb参数。
 *     当异步过程结束后，调用setClose()方法关闭对话框。
 *     setClose()方法必须调用，否则按钮将一直处于不可用状态。
 *     c. callback执行的作用域为modal实例，故也可以使用this.remove()方法关闭对话框
 *
 * * no(callback) 设置一个回调函数，点击取消/关闭按钮、按下esc键时触发，返回modal实例
 *     回调函数用法同yes()方法
 * * onClose(callback) 设置一个回调函数，当对话框移除时触发，返回modal实例
 *     无论是点击确定/取消按钮均会触发。
 *     回调函数用法同yes()方法
 * * closeAsync(callback,event) 立即直接执行一个回调函数，可控制对话框是否关闭，返回modal实例
 *     回调函数用法同yes()方法
 * * enableYes(bool) 设置确定按钮、enter键是否可用，返回modal实例
 * * enableNo(bool) 设置取消按钮、esc键是否可用，返回modal实例
 * * enableClose(bool) 设置是否允许移除对话框，当设置为false时，无论点击确定/取消按钮均不会关闭对话框。
 *     ，返回modal实例
 * * title(val) 设置标题，返回modal实例
 * * content(val) 设置内容，返回modal实例
 * * update() 刷新对话框位置。目前只支持刷新marginTop和marginLeft，返回modal实例
 * * disableButtons() 禁用所有按键事件、所有按钮不可用，返回modal实例。异步操作时可用该方法防止用户多次提交。
 * * saveButtonsState() 保存当前按钮状态到缓存。
 * * recoverButtons() 从前一个缓存中恢复按钮状态。
 *       当使用yes/no等方法传入一个异步回调时，默认会调用saveButtonsState()保存当前按钮状态，然后调用disableButtons()方法使所有按钮不可用。当异步过程结束后，如果对话框不关闭，则recoverButtons()方法恢复按钮状态。
 */
(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else {
        factory(root.jQuery);
    }
}(this, function($) {
    var isDebug = true;
    var modalIndex = 0;
    // 简单的模版引擎，减少其他组件的依赖。
    // @author vienwu
    // 1. 支持表达式赋值，语法{$expression};
    // 2. 支持if, else if语句，语法{if expression}，{else if expression}，{/if};
    // 3. 支持if语句内嵌套;
    // 4. expression使用了eval语法，所以支持大多数js语法;
    // 5. 其他语法暂时不支持。
    // example: TODO!
    $.template = function(tmpl, data) {
        // 在指定的作用域执行一个表达式，返回表达式结果。
        var evalExp = function(exp, scope) {
            return (function() {
                var __res;
                try {
                    with(scope) {
                        __res = eval(exp);
                    }
                } catch (e) {
                    isDebug && console.info('expression:"' + exp + '" undefined.');
                }
                return (typeof __res === 'undefined') ? '' : __res;
            }).call(scope);
        };
        // 处理if语句
        var position = 0,
            stacks = [true], // 使用堆栈标记嵌套的if语句
            regexp = /\{if ([^\}]+)\}|\{\/if\}|\{else\}|\{else if ([^\}]+)\}/gi,
            res = '';
        // 每个if语句用两个元素标记
        // 第一个元素标记整个if语句是否true
        // 第二个元素标记前一个if条件是否true
        tmpl.replace(regexp, function(matchWord, expIf, expElseIf, index) {
            var isTrue = stacks.pop();
            // console.log(isTrue,'matchWord',matchWord,'expIf',expIf,'expElseIf',expElseIf,'index',index);
            if (isTrue) res += tmpl.substr(position, index - position);
            // console.log(stacks,isTrue,tmpl.substr(position,index-position));
            position = index + matchWord.length;
            // 当捕获的分组为空时，ie8返回的为''，chrome/ie9/10返回的为undefined.
            if (expIf) { // if
                stacks.push(isTrue);
                stacks.push(isTrue ? (evalExp(expIf, data) ? true : false) : false);
                stacks.push(stacks[stacks.length - 1]);
            } else if (expElseIf) { // else if
                stacks.push(stacks[stacks.length - 1] ? false : (evalExp(expElseIf, data) ? true : false));
            } else if (/\{else\}/i.test(matchWord)) { // else
                stacks.push(stacks[stacks.length - 1] ? false : true);
            } else { // if结束
                stacks.pop();
            }
            return '';
        });
        if (stacks.pop()) {
            res += tmpl.substr(position);
        }
        tmpl = res;
        // 处理表达式赋值
        tmpl = tmpl.replace(/\{\$([^\{\}]+)\}/g, function(matchWord, key) {
            return evalExp(key, data);
        });
        return tmpl;
    };



    // 对话框模版
    var templateBg = '<div tabindex="-1" class="overlay js-modal-bg"></div>';
    // 添加modal--scroll样式，可以为modal-bd添加滚动条。
    var templateModal = '<div class="js-modal modal  {$className} {if icon}modal--msg{/if} {if scroll}modal--scroll{/if}" style="{if width}width:{$width}px;{/if}{if style}{$style}{/if}" >';
    templateModal += '{if !nohead}';
    templateModal += '  <div class="modal-hd"><h3 class="hd-tt js-modal-title">{$title}</h3><a href="javascript:void(0);" class="js-modal-close btn-close" title="关闭">×</a></div>';
    templateModal += '{/if}';
    templateModal += '{if !body}';
    templateModal += '  <div class="modal-bd {if padding}modal-bd--padding{/if}" style="{if height}height:{$height}px;{/if}">';
    templateModal += '  {if icon}';
    templateModal += '      <div class="bd-msg"><i class="icon-font icon-msg-large i-{$icon}"></i>';
    templateModal += '      <p class="msg-text">{$content}</p></div>';
    templateModal += '  {else}';
    templateModal += '      {$content}';
    templateModal += '  {/if}';
    templateModal += '  </div>';
    templateModal += '  <div class="modal-ft">';
    templateModal += '  <a href="javascript:void(0);" title="{$txtYes}" class="js-modal-yes btn-default {if !enableYes} btn-disabled{/if}" {if !isYes}style="display:none;"{/if}>{$txtYes}</a>';
    templateModal += '  ';
    templateModal += '  <a href="javascript:void(0);" title="{$txtNo}" class="js-modal-no btn-weak {if !enableNo} btn-disabled{/if}" {if !isNo}style="display:none;"{/if}>{$txtNo}</a>';
    templateModal += '  </div>';
    templateModal += '{else}';
    templateModal += '  {$body}';
    templateModal += '{/if}';
    templateModal += '';
    templateModal += '</div>';


    // 给一个元素添加可拖拽特性。
    // 注：要求target元素拥有position样式，否则无法移动。
    // element: 触发的元素，默认为该元素添加mousedown事件
    // target: 要移动的元素，不设置则移动element
    // options: 配置对象，支持配置:
    //  opacity:0.6 透明度
    //  duration:0.3 动画时长
    var addDrag = function(element, target, options) {
        var isMove = false,
            startX = 0,
            startY = 0,
            $element = $(element),
            $target = $(target),
            opts = $.extend({
                opacity: 0.6,
                duration: 0.3
            }, options),
            drag = function(event) {
                if (!isMove) return;
                $target.css({
                    left: (event.pageX - startX) + 'px',
                    top: (event.pageY - startY) + 'px'
                });
            },
            mouseup = function() {
                isMove = false;
                $target[0].style.cssText += 'transition: none;opacity:1;';
                $(document.body).off('mousemove', drag);
            };
        $element.mousedown(function(event) {
            isMove = true;
            startX = event.pageX - parseInt($target.css('left'));
            startY = event.pageY - parseInt($target.css('top'));
            $target[0].style.cssText += 'transition: opacity ' + opts.duration + 's ease-in;opacity:' + opts.opacity + ';';
            $(document.body).mousemove(drag).one('mouseup', mouseup);
        });
    };
    // 添加一个jQuery对象的插件
    // 注：要求target元素css拥有position属性，否则无法移动。
    $.fn.drag = function(target, options) {
        if (!target) target = this;
        addDrag(this, target, options);
    };

    // 对话框类
    var Modal = function(options) {
        this._index = modalIndex++; // 引用序号
        // 支持的参数列表
        var self = this,
            opts = { // 其他可选参数
                title: '提示', // 标题
                className: '', // 额外的样式
                style: '',
                content: 'hello world.', // 弹框内容
                txtYes: '确定', // 确定按钮的文字
                txtNo: '取消', // 取消按钮的文字
                icon: '', // 使用的icon图标
                nohead: false, // 是否显示标题栏
                body: '', // 是否单独定义 对话框body
                hotkey: true, // 开启热键支持。提供了esc关闭、enter点击确定两个热键。
                isYes: true, // 是否显示确定按钮
                isNo: true, // 是否显示取消按钮
                enableYes: true, // 确定按钮是否可点
                enableNo: true, // 取消按钮是否可点
                enableClose: true, // 是否允许关闭
                buttonsAlign: 'right', // 按钮位置
                enableDrag: true, // 是否允许拖拽
                enableBgClose: false, // 点击背景层是否可以关闭
                width: 500, // 设置弹框宽度
                height: '', // 设置弹框高度，默认自适应高度
                padding: true,
                scroll: false,
                yes: function() {}, // 点击确定的回调
                no: function() {}, // 点击取消、关闭的回调
                onClose: function() {}, // 对话框移除时的回调
                onOpen: function() {} // 对话框加载时的回调
            };
        this.opts = $.extend(opts, options);
        this._buttonState = {};


        // 兼容旧版Dialog.js参数
        var oldOptionMaps = {
            submit: 'txtYes',
            isDisabled: 'enableYes',
            globalClass: 'className',
            // extraClass:'',
            onAccept: 'yes',
            onCancel: 'no'
        };
        $.each(oldOptionMaps, function(key, value) {
            if (typeof opts[key] !== 'undefined') {
                opts[value] = opts[key];
            }
        });
        this.onAccept = this.yes;
        this.onCancel = this.no;
        // 兼容结束

        this.async(this.opts.onOpen, this.$, function() {
            this._update().update();
        });
    };
    Modal.prototype = {
        $: null, // 对话框的jQuery引用
        $bg: null, // 背景框的jQuery引用
        $btnYes: null, // 确定按钮
        $btnNo: null, // 取消按钮
        _index: 0, // 引用序号
        _buttons: ['enableYes', 'enableNo', 'enableClose'], // 需要存储状态的按钮
        _buttonState: null, // 存储按钮状态
        opts: null, // 配置对象
        hotkeyCallback: function(event) { // 热键触发回调
            if (this.opts.enableBgClose && event.target === this.$bg[0]) {
                return this.closeAsync(this.opts.no, event);
            }
            if (!this.opts.hotkey) return;
            if (event.which === 27 && this.opts.enableNo) return this.closeAsync(this.opts.no, event);
            if (event.which === 13 && this.opts.enableYes) return this.closeAsync(this.opts.yes, event);
        },
        // 立即执行一个函数，根据函数参数个数同步/异步执行。
        // 根据函数执行结果，触发回调callback，并传入true/false。
        // 参数：要立即执行的函数，传给函数的数据，回调
        async: function(fn, data, callback) {
            var self = this;
            if (fn.length < 2) { // 同步方式，回调执行结果true/undefined均关闭对话框，false不关闭。
                var bool = fn.call(self, data);
                callback.call(self, (typeof bool === 'undefined' || !!bool) ? true : false);
            } else { // 异步方式，回调执行true/undefined均关闭，false不关闭。
                fn.call(self, data, function(bool) {
                    callback.call(self, (typeof bool === 'undefined' || !!bool) ? true : false);
                });
            }
        },
        // 异步函数关闭对话框。传入一个函数并立即执行，根据函数的参数个数及返回结果判断是否关闭对话框。
        closeAsync: function(fn, data) {
            var self = this;
            this.saveButtonsState();
            this.disableButtons();
            this.async(fn, data, function(bool) {
                if (!bool) return self.recoverButtons();
                self.opts.enableClose && self.async(self.opts.onClose, data, function(bool) {
                    if (!bool) return self.recoverButtons();
                    self.remove();
                });
            });
        },
        title: function(val) { // 设置标题
            this.$.find('.js-modal-title').html(val);
            return this;
        },
        content: function(val) { // 设置内容
            var _ele = this.$.find('.msg-text');
            if (_ele.length === 0) _ele = this.$.find('.modal-bg');
            _ele.html(val);
            return this;
        },
        remove: function() { // 移除对话框
            this.$.remove();
            removeHotkeyCallback(this._hotkeyCallback); //取消热键绑定
            var modals = $('.js-modal');
            if (modals.length === 0) return this.$bg.remove();
            this.$bg.after(modals.eq(modals.length - 1));
        },
        update: function() { // 更新位置
            this.$.css({ // 初始化样式
                'marginTop': '-' + parseInt(this.$.height() / 2) + 'px',
                'marginLeft': '-' + parseInt(this.$.width() / 2) + 'px'
            });
            this.$.show();
            return this;
        },
        recoverButtons: function() { // 恢复按钮上次保存的可用状态
            var self = this;
            $.each(self._buttons, function(i, key) {
                self[key](self._buttonState[key]);
            });
            return this;
        },
        saveButtonsState: function() { // 保存按钮可用状态
            var self = this;
            $.each(self._buttons, function(i, key) {
                self._buttonState[key] = self.opts[key];
            });
            return this;
        },
        disableButtons: function() { // 禁用所有按钮、事件
            var self = this;
            $.each(['enableYes', 'enableNo'], function(i, key) {
                self[key](false);
            });
            return this;
        },
        _update: function() {
            var self = this;
            if (this.$) return this.$.show();
            // 共用一个背景层
            this.$bg = $('.js-modal-bg');
            if (this.$bg.length === 0) {
                this.$bg = $(templateBg).appendTo($(document.body));
            }
            // 初始化对话框
            this.$ = $($.template(templateModal, this.opts));
            this.$.appendTo($(document.body)).before(this.$bg);
            // 快捷键
            this._hotkeyCallback = function() {
                self.hotkeyCallback.apply(self, arguments);
            };
            addHotkeyCallback(this._hotkeyCallback);
            // 拖拽
            this.opts.enableDrag && this.$.find('.modal-hd').drag(this.$);

            this.bindEvents();

            return this;
        },
        bindBtnYesEvent: function() {
            var self = this;
            this.$btnYes = this.$.find('.js-modal-yes').click(function(event) {
                if ($(this).hasClass('btn-disabled')) return;
                self.closeAsync(self.opts.yes, event);
            });
            return this;
        },
        bindBtnNoEvent: function() {
            var self = this;
            this.$btnNo = this.$.find('.js-modal-no').click(function(event) {
                if ($(this).hasClass('btn-disabled')) return;
                event = event || {};
                event.btnName = 'cancel';
                self.closeAsync(self.opts.no, event);
            });
            return this;
        },
        bindBtnCloseEvent: function() {
            var self = this;
            this.$.find('.js-modal-close').click(function(event) {
                if (self.$btnNo.hasClass('btn-disabled')) return;
                event = event || {};
                event.btnName = 'close';
                self.closeAsync(self.opts.no, event);
            });
            return this;
        },
        bindEvents: function() {
            return this.bindBtnYesEvent().bindBtnCloseEvent().bindBtnNoEvent();
        }
    };
    // 禁用按钮方法
    $.each(['enableYes', 'enableNo', 'enableClose'], function(i, key) {
        Modal.prototype[key] = function(val) {
            this.opts[key] = val;
            var fnName = val ? 'removeClass' : 'addClass';
            if (key === 'enableYes') this.$btnYes[fnName]('btn-disabled');
            if (key === 'enableNo') this.$btnNo[fnName]('btn-disabled');
            return this;
        };
    });
    // 添加回调
    $.each(['yes', 'no', 'onClose', 'onOpen'], function(i, key) {
        Modal.prototype[key] = function(val) {
            this.opts[key] = val;
            return this;
        };
    });
    // 复制常用的jQuery方法
    $.each(['width', 'height'], function(i, key) {
        Modal.prototype[key] = function(val) {
            if (typeof val === 'undefined') return this.opts[key];
            this.opts[key] = val;
            this.$[key](val);
            return this.update();
        };
    });

    // 单独处理快捷键
    // 添加热键事件
    $(document.body).keydown(function(event) {
        triggerHotkey(event);
    }).delegate('.js-modal-bg', 'click', function(event) {
        triggerHotkey(event);
    });
    // 所有的热键回调
    var hotKeyCallbacks = [];
    // 添加一个回调
    var addHotkeyCallback = function(fn) {
        hotKeyCallbacks.push(fn);
    };
    // 移除一个回调
    var removeHotkeyCallback = function(callback) {
        $.each(hotKeyCallbacks, function(i, fn) {
            if (fn === callback) {
                hotKeyCallbacks.splice(i, 1);
                return false;
            }
        });
    };
    var triggerHotkey = function(event) {
        if (hotKeyCallbacks.length < 1) return;
        hotKeyCallbacks[hotKeyCallbacks.length - 1](event);
    };
    // 处理快捷键结束



    // 封装几个常用的对话框样式
    var modalConfigs = {
        alert: {
            content: '提示信息。',
            icon: 'info',
            isNo: false,
            buttonsAlign: 'right',
            enableBgClose: true
        },
        alert: {
            title: '警告',
            content: '警告信息！',
            icon: 'alert',
            isNo: false,
            buttonsAlign: 'right',
            enableBgClose: false
        },
        retry: {
            txtYes: '重试',
            content: '是否重试？',
            icon: 'alert',
            enableBgClose: false
        },
        confirm: {
            title: '确认操作',
            icon: 'alert',
            txtYes: '确认',
            content: '请确认是否操作？',
            enableBgClose: false
        },
        success: {
            title: '成功提示',
            icon: 'success',
            content: '操作成功！',
            isNo: false
        },
        error: {
            title: '错误提示',
            icon: 'alert',
            isNo: false
        },
        help: {
            title: '帮助信息',
            icon: 'info',
            content: '这是一条帮助信息。',
            isNo: false
        }
    };
    var modal = function(options) {
        return new Modal(options);
    };
    $.fn.modal = function(type, content, options) {
        var len = arguments.length;
        return this.click(function() {
            if (len === 1) {
                if (typeof type === 'object') {
                    options = type;
                    content = '';
                    type = type.type || '';
                } else {
                    content = type;
                    type = 'alert';
                }
            } else if (len === 2) {
                options = content || {};
                content = type;
                type = options.type || 'alert';
            }
            if (type) {
                return modal[type](content, options);
            } else {
                return modal(options);
            }
        });
    };
    $.each(modalConfigs, function(key, config) {
        modal[key] = function(content, options) {
            return modal($.extend({}, config, {
                content: content || config.content
            }, options));
        };
    });
    $.modal = modal;
    $.Modal = Modal;

    $._alert = function(msg, cb, opt) {
        $('.js-modal-bg, .js-modal').remove();
        $.Dialog.remove();
        opt = $.extend({}, opt || {});
        if (typeof cb === 'function') {
            opt.title = '提示';
            opt.onAccept = opt.onCancel = cb;
        } else {
            opt.title = cb || '提示';
        }
        return $.modal.alert(msg, opt);
    };

    return modal;
}));