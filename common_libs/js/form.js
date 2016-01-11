/* global html */
// 公共表单处理组件
// 绑定的className基于ycxu新修改的表单样式
// 包括两部分功能：
// * 表单组件的统一接口，例如checkbox/radio/select组件是用divcss实现的，统一绑定事件，返回统一接口
// * 统一的校验/数据处理操作。（内部使用了validator.js的验证模块）

/**
Simple example:
var form = new Form($container); // 实例化一个表单
// 或者 var form = $container.form();
$btnSubmit.on('click',function(){
    if(form.valid()){ // 检测表单的校验规则
        console.log(form.val();) // 打印表单所有字段的数据
        console.log(form.valFilter(':visiable')); // 打印表单所有非隐藏字段的数据
    }
});

流程：

* 查找$container内所有匹配表单样式的元素，并根据指定的data-name，映射到一个表单对象的属性对象Field。
* 包含data-name属性的元素和className组合为对应的字段类型。如f-select对应select组件，f-radio对应radio。不同的组件拥有不同的行为。

### api说明

#### Form类

##### 属性
* $ 当前表单所在dom的jquery引用。
* fields 数组，所有的字段名。例如：['title','content']
* 其他所有字段名 Field对象。例如可这样使用：form.title.val() form.content.tips()
##### 方法
* valid() 是否通过所有的表单验证规则
* get(name) 获取指定字段的值
* set(name,value) 设置指定字段的值
* val(name,value) 类似jquery的val方法，传入2个参数时等同set方法，1个参数并为string时等同get方法。
1个参数为object时，遍历执行set方法。无参数时，返回所有字段的值。
* valFilter(expr|fn) 获取符合规则的字段的值，参数参考jquery的is方法。

#### Field类

##### 属性

* $clean bool 字段是否修改过
* $valid bool 是否通过验证
* name 字段名
* form 表单对象的引用
* $form 表单所在dom的jquery引用
* $ 当前字段所在dom的jquery引用

##### 方法
* $ele() 返回当前字段所在dom的jquery引用。属性$是缓存的dom，该方法实时返回。
* get() 返回字段当前的值
* set(value) 设置字段的值
* val(value) 类似jquery方法val
* on(type,fn) 绑定事件，其实就是jquery.on方法，只是fn的作用域为当前字段，fn内部可this访问字段的方法。
* onChange(fn) 等同on('change',fn)方法
* changed() 触发一次change事件，并触发表单校验
* valid() 检测表单是否通过校验
* getWrap() 获取当前字段所在dom容器，固定为样式包括'.f-item'的元素
* getMsgElement() 获取当前字段提示信息所在的dom容器，如不存在则在'.f-field'元素内部插入一个'.f-msg'结构。
* info(msg) 显示一个提示信息，如不传入msg，则自动查找字段dom的data-tips属性，如不存在则只切换样式，不会操作f-msg内部文本
* err(msg) 显示一个错误信息，如不传入msg，则自动查找字段dom的data-msg属性，如不存在则只切换样式，不会操作f-msg内部文本
* succ(msg) 显示一个成功信息，如不传入msg，则自动查找字段dom的data-succ属性，如不存在则只显示icon-font，清空f-msg内部文本。
* clean() 设置表单为全新状态
* pattern(fn) 添加一个预处理校验规则的方法。字段可添加多个预处理规则。

字段校验时，会先遍历该预处理规则，当该预处理规则全部为true时，字段才会继续校验data-pattern中指定的规则。
fn可返回3种值true/false/String，对应succ/err/info状态。
当返回true时·，继续使用validator.js中的规则校验data-pattern
当返回false时，设置字段为error状态。
当返回字符串时，设置字段为error状态，并将错误提示信息设置为该字符串。


#### 目前支持的表单类型

* .f-rc--checkbox  checkbox
* .f-select select
* .f-text input
* .f-date 日期选择
* .f-textarea 文本区域
* .f-popup-lines-select 列表（带删除）
* .f-popup-select


#### 使用示例

var form = $container.form();

form.name.valid() // 有效
form.name.clean() // 没有修改过
form.name.val() // 获取表单的值
form.name.pattern(function(val){
    if(!val) return '名称不能为空';
    if(val.length<10) return '名称长度不能小于10';
    return true;
}) // 设置表单验证

form.name.tips('提示')
form.name.err('提示')
form.name.pass('提示')

form.name.onChange(function(){
    var value = this.val(); // 获取字段的值
    if(this.clean()) return this.tips('名称是好东东'); // 初始化表单
    value.length<10 && this.valid('名称长度不能小于10'); // 校验长度
    if(value === '测试'){
        form.content.valid('。。。。。'); // 操作其他字段
    }
});

form.name.pattern(function(str){
    return str.length !== 0;
});

form.valid()
form.clean()
form.val() // 返回表单的值

 */

define([
    'jquery',
    'base',
    'datepicker',
    'validator',
    'html'
], function (
    $,
    base,
    Datepicker,
    validator,
    html
) {
    // 事件预处理
    var clsDisabled = 'disabled',
        clsChecked = 'checked',
        clsSelected = 'selected',
        clsSelecting = 'selecting',
        clsError = 'f-item--error',
        clsSuccess = 'f-item--success',
        clsInfo = 'f-item--info',
        tplMsg = '<div class="f-msg"><i class="icon-msg"></i><p class="f-msg-text"></p></div>',
        Field = function (name, form, config) {
            config = config || {};
            this.$clean = true; // 是否修改过，true有，false没有
            // this.$pristine = true; // 是否没有修改过，true没有修改，false修改过
            this.$valid = true; //
            // this.$invalid = false; // 是否没有通过验证
            // this.$pattern = ''; // 验证规则
            this.name = name;
            this.form = form;
            this.$form = form.$;
            this.$ = this.$ele();
            for (var key in config) {
                this[key] = config[key];
            }
            this._patterns = [];
            this.init();
        };
    Field.prototype = {
        // 字段初始化方法，供扩展时覆盖。
        init: function () {

        },
        // 返回当前字段的引用
        $ele: function () {
            return this.$form.find('[data-name="' + this.name + '"]');
        },
        // 设置初始值，不会触发change事件
        default: function (value) {
            var isInput = ['input', 'textarea'].indexOf(this.$[0].nodeName.toLowerCase()) > -1;
            isInput ? this.$.val(value) : this.$.data('value', value);
            return this;
        },
        // 返回字段的值
        get: function () {
            var isInput = ['input', 'textarea'].indexOf(this.$[0].nodeName.toLowerCase()) > -1;
            var val = isInput ? this.$.val() : this.$.data('value');
            // 防止undefined
            return typeof val === 'undefined' ? '' : val;
        },
        // 设置字段的值
        set: function (value) {
            this.default(value);
            return this.changed();
        },
        val: function (value) {
            return (typeof value === 'undefined') ? this.get() : this.set(value);
        },
        on: function (type, fn) {
            var self = this;
            return this.$.on(type, function (e) {
                e.preventDefault();
                e.stopPropagation();
                fn.apply(self, arguments);
            });
        },
        // 指定一个回调，当字段内容变化时触发
        onChange: function (fn) {
            return this.on('change', fn);
            // TODO:此处应返回序号，同时提供接口清除回调。
            // return this;
        },
        // 触发字段内容变化
        changed: function () {
            this.$clean = false;
            this.valid();
            this.$.triggerHandler('change', this.get());
            return this;
        },
        // 检测字段是否通过验证
        valid: function (bool) {
            if (typeof bool !== 'undefined') {
                this.$valid = bool;
                return this;
            }
            var val = this.val(),
                i, len;
            if (this._patterns.length > 0) {
                this.$valid = true;
                for (i = 0, len = this._patterns.length; i < len; i++) {
                    var fn = this._patterns[i],
                        result = fn.call(this, val),
                        errMsg;
                    if (result === true) continue;
                    errMsg = result === false ? errMsg : result;
                    this.err(errMsg);
                    this.$valid = false;
                    return this.$valid;
                }
            }

            // 不存在校验规则时，直接返回$valid状态，如果为校验失败则设置err信息
            if (!this.$.data('pattern')) {
                if (!this.$valid) this.err();
                return this.$valid;
            }
            var patterns = (this.$.data('pattern') || '').toString().split('|'),
                msgs = (this.$.data('msg') || '').toString().split('|');
            for (i = 0, len = patterns.length; i < len; i++) {
                var pattern = patterns[i];
                this.$valid = validator.checkOne(this.$, val, pattern);
                if (this.$valid === true) continue;
                // 默认使用validator生成的提示信息
                if (validator.msg) {
                    this.err(validator.msg);
                } else {
                    // validator没有生成，则使用data-msg设置的提示信息
                    this.err(msgs[i] ? msgs[i] : (msgs[0] ? msgs[0] : void(0)));
                }
                return this.$valid = false;
            }
            this.succ();
            return this.$valid;
        },
        // 获取当前字段所在容器
        getWrap: function () {
            return this.$.parents('.f-item');
        },
        getMsgElement: function ($wrap) {
            var $msg = $wrap.find('.f-msg .f-msg-text');
            if ($msg.length === 0) {
                $wrap.find('.f-field').append(tplMsg);
                $msg = $wrap.find('.f-msg .f-msg-text');
            }
            return $msg;
        },
        // 显示表单提示信息
        info: function (msg) {
            var $wrap = this.getWrap(); // 获取容器
            msg = msg || this.$.data('tips');
            typeof msg !== 'undefined' && this.getMsgElement($wrap).html(msg); // 写入提示信息内容
            // 修改css
            $wrap.removeClass([clsError, clsSuccess].join(' ')).addClass(clsInfo);
        },
        // 显示表单出错信息
        err: function (msg) {
            this.$valid = false;
            var $wrap = this.getWrap(); // 获取容器
            msg = msg || this.$.data('msg');
            typeof msg !== 'undefined' && this.getMsgElement($wrap).html(msg); // 写入提示信息内容
            // 修改css
            $wrap.removeClass([clsInfo, clsSuccess].join(' ')).addClass(clsError);
        },
        // 显示表单成功信息
        succ: function (msg) {
            this.$valid = true;
            var $wrap = this.getWrap(); // 获取容器
            msg = msg || this.$.data('succ') || '';
            this.getMsgElement($wrap).html(msg); // 写入提示信息内容
            // 修改css
            $wrap.removeClass([clsInfo, clsError].join(' ')).addClass(clsSuccess);
        },
        // 清除字段的状态，设置为全新
        clean: function () {
            this.$valid = true;
            this.$clean = true;
            var $wrap = this.getWrap(); // 获取容器
            // 修改css
            $wrap.removeClass([clsInfo, clsError, clsSuccess].join(' '));
            return this;
        },
        pattern: function (fn) {
            this._patterns.push(fn);
            return this;
        }
    };

    var FormTypes = {},
        Form = function ($container) {
            this.$ = $container || $(document.body);
            this.fields = []; // 存储字段的数组
            this.update(true);
        };
    Form.prototype = {
        // 公开接口
        // 是否校验通过
        valid: function () {
            var isPass = true;
            this._loopFields(function (name) {
                if (!this.valid()) {
                    isPass = false;
                }
            });
            return isPass;
        },
        // 重新初始化字段
        update:function(isInit){
            var self = this;
            this.fields.forEach(function(name){
                console.log(name,1);
                delete self[name];
            });
            this.fields = [];
            this._tabIndex = 0;
            this._init(isInit);
            return this;
        },
        // 获取指定字段的值
        get: function (name) {
            return this[name].get();
        },
        // 设置指定字段的值
        set: function (name, value) {
            return this[name].set(value);
        },
        // 获取所有字段的值
        val: function (name, value) {
            if (arguments.length === 2) {
                this[name].set(value);
            } else if (arguments.length === 1) {
                if (typeof name === 'string') {
                    return this[name].get();
                } else {
                    for (var key in name) {
                        this[key].set(name[key]);
                    }
                }
            } else {
                var o = {};
                this._loopFields(function (name) {
                    o[name] = this.get();
                });
                return o;
            }
        },
        // 过滤字段
        valFilter: function (expr) {
            var o = {};
            this._loopFields(function (name) {
                if (this.$.is(expr)) o[name] = this.get();
            });
            return o;
        },
        // 非隐藏的字段的值
        valNoHidden: function () {
            var o = {};
            this._loopFields(function (name) {
                if (this.$.is(':visible')) o[name] = this.get();
            });
            return o;
        },
        // 私有方法
        // 初始化表单
        _init: function (isInit) {
            this._initFields(isInit);
        },
        // 初始化所有字段
        _initFields: function (isInit) {
            var self = this;
            var iNoName = 1; // 没有指定名称的字段
            for (var type in FormTypes) {
                var config = FormTypes[type],
                    isFirst = true,
                    $eles = this.$.find(config.selector);
                $eles.each(function () {
                    self._tabIndex++;
                    // 创建字段
                    var $this = $(this),
                        name = $this.data('name');
                    if (!name) {
                        console.warn('表单没有指定name.');
                        name = type + iNoName;
                        iNoName++;
                        $this.attr('data-name', name);
                    }
                    // 初始化事件
                    isFirst && isInit && config.handler && config.handler.call(config, self, $eles, self._tabIndex);
                    isFirst = false;

                    self._createField(name, config);
                });
            }
        },
        // 根据配置创建一个字段
        _createField: function (name, config) {
            if (this[name]) return this[name];
            this[name] = new Field(name, this, $.extend({}, config));
            this.fields.push(name);
            return this[name];
        },
        // 遍历所有字段，执行指定函数
        _loopFields: function (fn) {
            var arr = [];
            for (var i = 0, len = this.fields.length; i < len; i++) {
                var name = this.fields[i];
                arr.push(fn.call(this[name], name));
            }
            return arr;
        }
    };
    Form.extend = function (obj) {
        FormTypes[obj.type] = obj;
        return this;
    };

    // 扩展表单类型
    Form.extend({
            type: 'radio',
            selector: '.f-radio',
            handler: function (form, $elements, tabIndex) {
                form.$.on('click', this.selector, function (e) {
                    e.preventDefault();
                    var $this = $(this),
                        name = $this.data('name');
                    if ($this.hasClass(clsDisabled)) return; // 禁用
                    if ($this.hasClass(clsChecked)) return; // 已选
                    $this.addClass(clsChecked);
                    form.$.find('.f-rc--radio[data-name="' + name + '"]')
                        .not($this)
                        .removeClass(clsChecked);
                    form[$this.data('name')].changed();
                });
            },
            get: function () {
                return this.$.filter('.' + clsChecked).data('value');
            },
            set: function (value) {
                this.$.each(function () {
                    $(this).toggleClass(clsChecked, $(this).data('value') == value);
                });
                return this.changed();
            },
            init: function (options) {
                return this;
            }
        })
        .extend({
            type: 'checkbox',
            selector: '.f-checkbox',
            handler: function (form) {
                form.$.on('click', this.selector, function (e) {
                    e.preventDefault();
                    var $this = $(this);
                    if ($this.hasClass(clsDisabled)) return;
                    $this.toggleClass(clsChecked);
                    form[$this.data('name')].changed();
                });
            },
            get: function () {
                var arr = [];
                this.$.filter('.' + clsChecked).each(function () {
                    arr.push($(this).data('value'));
                });
                return arr;
            },
            set: function (values) {
                values = $.isArray(values) ? values : [values];
                this.$.each(function () {
                    var $this = $(this);
                    $this.toggleClass(clsChecked, values.indexOf($this.data('value')) > -1);
                });
                return this.changed();
            }
        })
        .extend({
            type: 'select',
            selector: '.f-select',
            handler: function (form, $elements, tabIndex) {
                // 为所有的select元素添加tabIndex，之后即可使用blur事件切换显示。
                // TODO:应为所有表单元素添加tabIndex，否则tab顺序混乱。
                $elements.each(function () {
                    var $this = $(this);
                    if (typeof $this.attr('tabIndex') === 'undefined') {
                        $this.attr('tabIndex', tabIndex);
                        tabIndex++;
                    }
                });
                form.$.on('click', this.selector, function (e) {
                    e.preventDefault();
                    var $this = $(this);
                    if ($this.hasClass(clsDisabled)) return;
                    if ($this.hasClass(clsSelecting)) return $this.removeClass(clsSelecting);
                    $this.addClass(clsSelecting)
                        .one('blur', function () {
                            $this.removeClass(clsSelecting);
                        })
                        .one('click', '.f-value-list li', function () {
                            var self = $(this);
                            $this.addClass(clsSelected)
                                .data('value', self.data('value'))
                                .find('.f-value')
                                .html(self.html());
                            form[$this.data('name')].changed();
                        });
                });
            },
            set: function (value) {
                var selector = '.f-value-list li[data-value="' + value + '"]',
                    $li = this.$.find(selector),
                    isMatch = $li.length > 0;
                this.$.toggleClass(clsSelected, isMatch)
                    .data('value', value)
                    .find('.f-value')
                    .html(isMatch ? $li.html() : '');
                return this.changed();
            },
            // 初始化所有的选项，并检查默认值是否匹配，不匹配则显示placeholder
            options: function (options, keyField, valueField, isHTML) {
                var $ele = this.$,
                    str = '',
                    isSameValue = false,
                    value = this.val();
                options = options || [];
                keyField = keyField || 'key';
                valueField = valueField || 'value';
                for (var i = 0, len = options.length; i < len; i++) {
                    var item = options[i] || {};
                    str += '<li data-value="' + html.encode(item[valueField]) + '">';
                    str += isHTML ? item[keyField] : html.encode(item[keyField]);
                    str += '</li>';
                    if (value !== '' && item[valueField] == this.val()) {
                        isSameValue = true;
                    }
                }
                $ele.find('.f-value-list').html(str);
                !isSameValue && this.set() && this.clean();
            }
        })
        .extend({
            type: 'input',
            selector: '.f-text',
            init: function () {
                var self = this;
                this.$.on('keyup paste', function () {
                    self.$.data('noinput') || self.valid();
                }).blur(function () {
                    self.$.data('noblur') || self.valid();
                }).focus(function () {
                    self.$.data('nofocus') || self.info();
                });
            }
        })
        .extend({
            type: 'date',
            selector: '.f-date',
            handler: function (form) {
                form.$.find(this.selector).each(function () {
                    var $this = $(this);
                    var begin = $this.data('begin'),
                        end = $this.data('end');
                    $this.siblings('.i-calendar').click(function () {
                        $this.trigger('click');
                    });
                    $this.on('keyup',function(){
                        form[$(this).data('name')].changed();
                    });
                    $this.datepicker({
                        _set: function (val, $ele) {
                            $ele.data('datepicker').hide();
                            form[$ele.data('name')].changed();
                        },
                        _begin: new Date(begin),
                        _end: new Date(end)
                    });
                });
            },
            default: function (value) {
                this.$.val(value).data('datepicker').update();
            }
        })
        .extend({
            type: 'textarea',
            selector: '.f-textarea',
            init: function () {
                var self = this;
                this.$.on('keyup paste', function () {
                    self.$.data('noinput') || self.valid();
                }).blur(function () {
                    self.$.data('noblur') || self.valid();
                }).focus(function () {
                    self.$.data('nofocus') || self.info();
                });
            }
        })
        .extend({
            type: 'popupSelectLines',
            selector: '.f-popup-lines-select',
            handler: function (form, $elements) {
                var self = this;
                form.$.find(this.selector).on('click', '.item-del', function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    var $this = $(this),
                        field = form[$this.parents(self.selector).data('name')],
                        keyField = field.$.data('key'),
                        titleField = field.$.data('title'),
                        value = $this.data('value'),
                        values = field.val(),
                        arr = [];
                    for (var i = 0, len = values.length; i < len; i++) {
                        if (values[i][keyField] != value) arr.push(values[i]);
                    }
                    field.val(arr).changed();

                });
            },
            set: function (values) {
                values = values || [];
                var str = '',
                    keyField = this.$.data('key'),
                    titleField = this.$.data('title'),
                    key, title;

                for (var i = 0, len = values.length; i < len; i++) {
                    var item = values[i];
                    if (keyField) {
                        key = item[keyField];
                        title = item[titleField];
                    } else {
                        key = title = item;
                    }
                    str += '<li class="f-value-item">' + html.encode(title) + ' <span class="item-del" data-value="' + key + '">删除</span></li>';
                }
                str += values.length > 0 ? '<li class="f-value-add">' + this.$.data('more') + '</li>' : '';
                this.$.toggleClass('selected', values.length > 0)
                    .data('value', values)
                    .find('.f-value-list').html(str);
                return this.changed();
            }
        })
        .extend({
            type: 'popupSelect',
            selector: '.f-popup-select',
            set: function (values) {
                values = values || [];
                var arrTitle = [],
                    arrKey = [],
                    keyField = this.$.data('key'),
                    titleField = this.$.data('title');
                values.forEach(function (o) {
                    arrTitle.push(o[titleField]);
                    arrKey.push(o[keyField]);
                });
                this.$.toggleClass('selected', values.length > 0).data('value', arrKey).find('.f-value').text(html.decode(arrTitle.join(',')));
                return this.changed();
            },
            get: function () {
                return this.$.data('value') || [];
            }
        })
        .extend({
            type: 'video',
            selector: '.f-upload'
        });

    $.fn.form = function (params) {
        var forms = [];
        this.each(function () {
            var $this = $(this),
                data = $this.data('__form');
            if (!data) {
                data = new Form($this, params);
                $this.data('__form', data);
            }
            forms.push(data);
        });
        return forms.length === 1 ? forms[0] : forms;
    };
    return Form;
});