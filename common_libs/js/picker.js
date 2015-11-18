/**
 * 通用的选择器模块，改自littenli新实现的课程选择器，继承了modal.js的一些方法。
 * 更新数据 支持 同步/异步 回调
 * 返回数据 支持 同步/异步 回调
 * 基于异步更新数据接口实现分页
 *
 *
 * TODO:
 * 时间不足，留坑几个，来日再战。
 ** 更多参数的支持
 ** 错误处理
 ** 完善文档
 */

define(['jquery',
    'modal'
], function ($, modal) {
    // 继承原型
    var inheritPrototype = function (fn) {
        function F() {}
        F.prototype = fn.prototype;
        return new F();
    };

    // 延迟指定的时间执行一个函数，并且在该指定时间内只执行一次函数。如重复触发则重新计时。
    var lazyFunc = function (func, wait) {
        var timer, content, args, result;
        var later = function () {
            timer = null;
            result = func.apply(content, args);
        };
        return function () {
            if (timer) {
                clearTimeout(timer);
            }
            content = this;
            args = arguments;
            timer = setTimeout(later, wait);
        };
    };


    var templateBody = '<div class="mod-picker__data-options">';
    templateBody += '       <h3 class="mod-picker__list-title">选择{$name}：<span class="js-picker-leftnum"></span></h3>';
    templateBody += '       <div class="mod-picker__cont">';
    templateBody += '           <input type="text" placeholder="输入关键字或拼音进行筛选" class="mod-picker__input" />';
    templateBody += '           <ul class="mod-picker__options-ul js-options" onselectstart="return false;">';
    templateBody += '              <li class="select-li-loading js-select-loading">数据加载中…</li>';
    templateBody += '           </ul>';
    templateBody += '       </div>';
    templateBody += '   </div>';
    templateBody += '   <div class="mod-picker__action-btns">';
    templateBody += '       <a href="javascript:;" class="js-picker-add btn-add btn-weak disabled">添加</a>';
    templateBody += '       <a href="javascript:;" class="js-picker-del btn-del btn-weak disabled">删除</a>';
    templateBody += '       <span class="mod-picker__tips">支持选择<i class="mod-picker__max"></i>{$max}{$unit}{$name}</span>';
    templateBody += '   </div>';
    templateBody += '   <div class="mod-picker__data-selected">';
    templateBody += '       <h3 class="mod-picker__list-title">已选择{$name}：<span class="js-picker-rightnum"></span></h3>';
    templateBody += '       <div class="mod-picker__cont">';
    templateBody += '           <ul class="mod-picker__selected-ul js-selected" onselectstart="return false;"></ul>';
    templateBody += '       </div>';
    templateBody += '   </div>';



    // 简单的观察者
    var __obID = 0;
    var Ob = function () {
        this._id = ++__obID;
        this.eventName = 'custom_ob_' + this._id;
    };
    Ob.prototype = {
        eventName: null,
        watch: function (fn, scope) {
            scope = scope || {};
            $(document.body).on(this.eventName, function (event, data) {
                fn.apply(scope, data.data);
            });
            return this;
        },
        fire: function () {
            $(document.body).trigger(this.eventName, {
                data: arguments
            });
            return this;
        }
    };
    // 获取object对象长度
    var getObjLen = function (obj) {
        var i = 0;
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                i++;
            }
        }
        return i;
    };

    // 数据模型
    var DataModel = function (opts) {
        this.data = {};
        $.extend(this, opts);
        this.leftData = {};
        this.rightData = {};

        this.leftSelected = {};
        this.rightSelected = {};
        this.obDataAdd = new Ob();
        this.obLeftAdd = new Ob();
        this.obLeftDel = new Ob();
        this.obLeftRemove = new Ob();
        this.obRightAdd = new Ob();
        this.obRightDel = new Ob();
        this.obSelectedAdd = new Ob();
        this.obSelectedDel = new Ob();

    };
    DataModel.prototype = {
        keyField: 'id', // 主键字段名称
        // titleField: '', // 标题字段名称
        // valueField: '', // 返回数组的字段名称，默认为主键字段的值
        max: 4, // 最大可选数量
        min: 0, // 最小可选数量
        data: null, // 数据对象
        obDataAdd: null, // 新增数据
        leftData: null, // 左侧所有数据
        rightData: null, // 右侧所有数据

        leftSelected: null, // 左侧被选中的数据
        rightSelected: null, // 右侧被选中的数据
        obData: null, // 所有缓存的数据
        obLeftAdd: null, // 被选中
        obLeftDel: null, // 移除被选中
        obLeftRemove: null, // 节点被删除
        obRightAdd: null, // 右侧被选中
        obRightDel: null, // 右侧移除被选中
        obSelectedAdd: null, // 添加到右侧
        obSelectedDel: null, // 从右侧移除
        // 增加数据，参数：数据数组，返回成功的数据
        insertData: function (list) {
            list = list || [];
            var len = list.length;
            var added = [];
            for (var i = 0; i < len; i++) {
                var item = list[i];
                var id = item[this.keyField];
                if (!this.data[id]) {
                    this.data[id] = item;
                    this.leftData[id] = item;
                    this.obDataAdd.fire(item);
                    added.push(item);
                }
            }
            return added;
        },
        // 强制指定已选择的课程
        insertSelected: function (list) {
            list = list || [];
            this.insertData(list);
            var len = list.length;
            for (var i = 0; i < len; i++) {
                this.selectedAdd(list[i][this.keyField]);
            }
        },
        // 将id数组转换为包含原始数据的array
        idsToArray: function (ids) {
            var res = [];
            for (var i = 0; i < ids.length; i++) {
                res.push(this.data[ids[i]]);
            }
            return res;
        },

        // 左侧切换选中状态
        leftToggle: function (id) {
            if (this.leftSelected[id]) {
                this.leftDel(id);
            } else {
                this.leftAdd(id);
            }
        },
        // 右侧切换选中状态
        rightToggle: function (id) {
            if (this.rightSelected[id]) {
                this.rightDel(id);
            } else {
                this.rightAdd(id);
            }
        },
        // 添加左侧选中
        leftAdd: function (id) {
            if (getObjLen(this.leftSelected) + getObjLen(this.rightData) >= this.max) {
                return false;
            }
            this.leftSelected[id] = this.data[id];
            this.obLeftAdd.fire(id);
            return this;
        },
        // 左侧删除
        leftDel: function (id) {
            delete this.leftSelected[id];
            this.obLeftDel.fire(id);
            return this;
        },
        // 双击左侧，直接添加到右侧
        leftToRight: function (id) {
            if (getObjLen(this.rightData) >= this.max) return false;
            delete this.leftData[id];
            this.obLeftDel.fire(id);
            this.rightData[id] = this.data[id];
            this.obSelectedAdd.fire(id);
        },
        // 双击右侧，直接删除，移动到左侧
        rightToLeft: function (id) {
            this.selectedDel(id);
        },
        // 右侧选中
        rightAdd: function (id) {
            this.rightSelected[id] = this.data[id];
            this.obRightAdd.fire(id);
            return this;
        },
        // 右侧删除
        rightDel: function (id) {
            delete this.rightSelected[id];
            this.obRightDel.fire(id);
            return this;
        },
        // 添加到右边
        selectedAdd: function (id) {
            this.rightData[id] = this.leftData[id];
            delete this.leftData[id];
            this.leftDel(id);
            this.obSelectedAdd.fire(id);
        },
        // 从右边删除
        selectedDel: function (id) {
            this.leftData[id] = this.rightData[id];
            delete this.rightData[id];
            this.rightDel(id);
            this.obSelectedDel.fire(id);
        },
        // 左边所有选中的添加到右边
        allSelectedAdd: function () {
            for (var key in this.leftSelected) {
                this.selectedAdd(key);
            }
        },
        // 移除所有已选择
        allSelectedDel: function () {
            for (var key in this.rightSelected) {
                this.selectedDel(key);
            }
        },
        // 清空所有数据，关键词搜索时触发
        reset: function () {
            this.leftSelected = {};
            for (var key in this.leftData) {
                delete this.leftData[key];
                delete this.data[key];
                this.obLeftRemove.fire(key);
            }
        },
        // 获取已选择数据的ids数组
        getSelectedIDs: function () {
            var ids = [];
            for (var key in this.rightData) {
                // 此处不使用key，而是使用this.rightData[this.keyField]
                // 否则可能导致ids数组元素的类型和原始数据不符
                ids.push(this.rightData[key][this.keyField]);
            }
            return ids;
        }
    };

    // picker类，单独处理options
    var picker = function (options) {
        var self = this;
        options = $.extend({
            title: '选择' + (options.name || '名称'),
            name: options.name || '名称',
            mode:'auto', // single 单选模式
            className: 'mod-picker mod-picker_qq',
            style: 'padding-bottom:0px;', // 由css控制
            width: '', // 宽度由css控制
            content: '', // 内容由js控制
            max: 1, // 最大可选择数量，默认1
            min: 0, // 最小可选数量
            unit: '个', // 单位
            page: 1, // 当前页数
            pageNum: 10, // 每页条数
            padding: false, // 去掉内边距
            totalPage: 1, // 最大页数
            keyField: 'id', // 主键字段名称
            titleField: 'name', // 标题字段名称
            listField: 'items', // 异步加载数据
            totalField: 'total', // 总数字段名称
            onPageChange: function () {}, // 页面变化时触发
            onInit: function () {}, // 初始化
            isOpenChild: false, // 是否展开文件夹
            list: [], // 缓存的数据
            selectedList: [], // 已被选择的数据
            lazytime: 300, // 输入框变化触发事件
            enableYes: false
        }, options);
        // 调用Modal类构造函数，初始化this.opts参数和基础的UI
        $.Modal.call(this, options);
        this.$.find('.modal-bd')
            .html($.template(templateBody, this.opts))
            .addClass('mod-picker__bd');

        // 绑定数据模型
        this.model = new DataModel({
            max: this.opts.mode === 'single' ? this.opts.max+1 : this.opts.max ,
            min: this.opts.min,
            keyField: this.opts.keyField
        });

        // 选择器新增数据
        this.model.obDataAdd.watch(function (item) {
            self.$.find('.js-options .js-select-loading').before(self.getTemplateLi(item));
            checkLeftSpanChange();
            checkRightSpanChange();
        });
        // 侦听左侧列表变化
        this.model.obLeftAdd.watch(function (id) { // 新增
            self.$.find('.js-options .js-select-li[data-cid="' + id + '"]').addClass('selecting');
            checkBtnAddStatus();
            checkLeftSpanChange();
        });
        this.model.obLeftDel.watch(function (id) { // 移除
            self.$.find('.js-options .js-select-li[data-cid="' + id + '"]').removeClass('selecting');
            checkBtnAddStatus();
            checkLeftSpanChange();
        });
        this.model.obLeftRemove.watch(function (id) { // 删除节点，搜索时触发
            self.$.find('.js-options .js-select-li[data-cid="' + id + '"]').remove();
            checkBtnAddStatus();
            checkLeftSpanChange();
        });
        // 侦听右侧列表变化
        this.model.obRightAdd.watch(function (id) { // 新增
            self.$.find('.js-selected .js-select-li[data-cid="' + id + '"]').addClass('selecting');
            checkBtnDelStatus();
            checkRightSpanChange();
        });
        this.model.obRightDel.watch(function (id) { // 移除
            self.$.find('.js-selected .js-select-li[data-cid="' + id + '"]').removeClass('selecting');
            checkBtnDelStatus();
            checkRightSpanChange();
        });
        // 添加选择课程
        this.model.obSelectedAdd.watch(function (id) { // 新增
            var selector = ' .js-select-li[data-cid="' + id + '"]';
            self.$.find('.js-options' + selector)
                .removeClass('selecting').addClass('selected')
                .clone().appendTo(self.$.find('.js-selected')).removeClass('selected');
            checkLeftSpanChange();
            checkRightSpanChange();
            self.checkPage();
        });
        this.model.obSelectedDel.watch(function (id) { // 移除
            var selector = ' .js-select-li[data-cid="' + id + '"]';
            self.$.find('.js-options' + selector).removeClass('selected');
            self.$.find('.js-selected' + selector).remove();
            checkLeftSpanChange();
            checkRightSpanChange();
        });
        // 绑定添加按钮事件，侦听按钮状态变化
        this.$btnAdd = this.$.find('.js-picker-add').click(function (e) {
            if (self.$btnAdd.hasClass('disabled')) return;
            if(self.opts.mode === 'single'){
                // 单选模式
                self.getSelectedIDs = function(){
                    var arr = [];
                    for(var key in self.model.leftSelected){
                        arr.push(key);
                    }
                    return arr;
                };
                self.closeAsync(self.opts.yes,e);
                return;
            }
            self.model.allSelectedAdd();
        });

        function checkBtnAddStatus() { // 侦听添加按钮状态变化
            self.$btnAdd.toggleClass('disabled', getObjLen(self.model.leftSelected) === 0);
        }
        // 绑定删除按钮事件，侦听状态变化
        this.$btnDel = this.$.find('.js-picker-del').click(function () {
            if (self.$btnDel.hasClass('disabled')) return;
            self.model.allSelectedDel();
        });

        function checkBtnDelStatus() { // 检测删除按钮状态变化
            self.$btnDel.toggleClass('disabled', getObjLen(self.model.rightSelected) === 0);
        }

        // 数量文字
        function checkLeftSpanChange() {
            return;
            var leftNums = getObjLen(self.model.leftData);
            var leftSelectedNums = getObjLen(self.model.leftSelected);
            var leftSpan = '(' + leftSelectedNums + '/' + leftNums + ')';
            self.$.find('.js-picker-leftnum').html(leftSpan);
        }

        function checkRightSpanChange() {

            var rightNums = getObjLen(self.model.rightData);
            // var rightSelectedNums = getObjLen(self.model.rightSelected);
            // var rightSpan = '(' + rightSelectedNums + '/' + rightNums + ')';
            // self.$.find('.js-picker-rightnum').html(rightSpan);
            if (rightNums < self.opts.min) {
                self.enableYes(false);
            } else {
                self.enableYes(true);
            }
        }

        // 滚动条
        this.$.find('.js-options').scroll(function () {
            self.checkPage();
        });
        // 元素被点击
        this.$.on('click', '.js-select-li', function () {
            var $this = $(this);
            if ($this.parent().hasClass('js-options')) {
                self.model.leftToggle($this.data('cid'));
            } else {
                self.model.rightToggle($this.data('cid'));
            }
        }).on('dblclick', '.js-select-li', function (e) {
            var $this = $(this),
                cid = $this.data('cid');
            if ($this.parent().hasClass('js-options')) {
                if(self.opts.mode === 'single'){
                    // 单选模式
                    self.getSelectedIDs = function(){
                        return [cid];
                    };
                    self.closeAsync(self.opts.yes,e);
                    return;
                }
                // 左侧到右侧
                self.model.leftToRight(cid);
            } else {
                self.model.rightToLeft(cid);
            }
        });
        // 输入框内容变化
        this.$.find('.mod-picker__input').on('keyup paste', lazyFunc(function () {
            self.opts.keyword = $(this).val();
            self.opts.page = 1;
            self.opts.totalPage = 1;
            self.model.reset();
            self.loadAsyncData();
        }, this.opts.lazytime));

        this.insertData(this.opts.list);
        setTimeout(function () {
            // 先调用初始化回调，等待完成后，再异步加载分页数据
            self.async(self.opts.onInit, self, function () {
                self.loadAsyncData();
                self.insertSelected(self.opts.selectedList);
            });
        }, 0);
    };
    picker.prototype = inheritPrototype($.Modal);
    picker.prototype.constructor = picker;
    // 扩展一些方法
    $.extend(picker.prototype, {
        // 指定一个回调，当页面变化时触发
        onPageChange: function (fn) {
            this.opts.onPageChange = fn;
            return this;
        },
        // 初始化加载数据
        onInit: function (fn) {
            this.opts.onInit = fn;
            return this;
        },
        // 获取一行记录的html
        getTemplateLi: function (data) {
            var str = '';
            if (this.opts.isOpenChild) {
                str += '<li class="select-li js-select-li" data-cid="' + data[this.opts.keyField] + '" title="' + data[this.opts.titleField] + '">' + data.view + '</li>';
                if (data.child) {
                    for (var i = 0, len = data.child.length; i < len; i++) {
                        var item = data.child[i];
                        str += '<li class="select-li js-select-li" data-cid="' + item[this.opts.keyField] + '" title="' + item[this.opts.titleField] + '">' + item.view + '</li>';
                    }
                }
            } else {
                str += '<li class="select-li js-select-li" data-cid="' + data[this.opts.keyField] + '" title="' + data[this.opts.titleField] + '"><span class="select-li-name">' + data[this.opts.titleField] + '</span></li>';
            }
            return str;
        },
        // 默认回调返回的是id数组，此方法将id数组转换为原始数据数组
        idsToArray: function (ids) {
            return this.model.idsToArray(ids);
        },
        // 加载下一页的异步数据
        loadAsyncData: function (cb) {
            var self = this;
            // console.log('page',this.opts.page,this.opts.totalPage);
            // 已经是最大页数 则不会翻页
            // 没有定义最大页数，则只有1页，也不会翻页
            if (typeof this.opts.totalPage === 'undefined' || this.opts.page > this.opts.totalPage) {
                this.$.find('.js-options .js-select-loading').hide();
                return false;
            } else {
                this.$.find('.js-options .js-select-loading').show();
            }
            if (this._lock) {
                return;
            }
            this._lock = true;
            this.opts.onPageChange.call(this, {
                page: this.opts.page,
                pageNum: this.opts.pageNum,
                keyword: this.opts.keyword || ''
            }, function (err, list) {
                if (typeof cb === 'function') cb(err, list);
                if (err) {
                    // TODO:错误处理
                } else {
                    self.insertData(list);
                    self.opts.page++;
                }
                self._lock = false;
                // 再加载一次，防止第一页数据无法铺满表格
                self.checkPage();
            });
        },
        getSelectedIDs: function () {
            var ids = [],
                self = this;
            this.$.find('.js-selected .js-select-li').each(function () {
                var cid = $(this).data('cid');
                // 此处不直接使用cid,而是使用列表中的cid
                // 否则可能导致ids数组元素的类型和原始数据不符
                // and:
                // 此方法和self.model.getSelectedIDs()方法区别是：
                // 此方法是根据添加的先后顺序排序，
                // model中的方法是根据object的key的字典序排序。
                ids.push(self.model.rightData[cid][self.model.keyField]);
            });
            return ids;
        },
        // 插入数据
        insertData: function (list) { // 将新拉取的数据写入列表
            this.model.insertData(list);
        },
        // 清空数据
        reset: function () {
            this.model.reset();
        },
        // 指定初始已选择课程
        insertSelected: function (list) {
            this.model.insertSelected(list);
        },
        // 设置页码
        setMaxPage: function (totalPage) {
            this.opts.totalPage = totalPage;
            return this;
        },
        // 检测是否需要加载下一页数据
        checkPage: function () { // 检测是否需要翻页
            if (this._lock) return;
            var container = this.$.find(".js-options");
            if (container.is(':hidden')) {
                return;
            }
            var target = container.find(".js-select-loading");
            var contHeight = container.outerHeight();
            var contop = container.offset().top;
            var post = target.offset().top - contop;
            post = post + target.outerHeight();
            if (post >= 0 && post - 10 < contHeight) {
                this.loadAsyncData();
            }
        }
    });
    $.picker = picker;

    $.each(['yes', 'no', 'onClose'], function (i, key) {
        picker.prototype[key] = function (fn) {
            var self = this,
                callback;
            if (fn.length < 2) {
                callback = function () {
                    return fn.call(this, self.getSelectedIDs());
                };
            } else {
                callback = function (event, cb) {
                    return fn.call(this, self.getSelectedIDs(), cb);
                };
            }
            this.opts[key] = callback;
        };
    });
    $.each(['enableAdd', 'enableDel'], function (i, key) {
        picker.prototype[key] = function (val) {
            this.opts[key] = val;
            var fnName = val ? 'removeClass' : 'addClass';
            if (key === 'enableAdd') this.$btnAdd[fnName]('disabled');
            if (key === 'enableDel') this.$btnDel[fnName]('disabled');
            return this;
        };
    });


    return picker;
});