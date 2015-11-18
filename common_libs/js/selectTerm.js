/**
 * @author herbertliu
 * @date 2014/7/25
 * @description 页面所有的时间选择组件
 * @example new SelectTerm(opt)
 *          data {Object} CGI返回的数据
 *          container {Boolean} 容器
 *          currentIndex {Number} 当前初始化展示的索引
 *          isReplace {Boolean} 可选，是否要替换以前节点，默认为false
 *          onSelect {Function} 可选，列表选中回调函数
 */

;(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery','commonTemplate/common'], factory);
    } else {
        root['SelectTerm'] = factory(root['jQuery'],root['TmplInline_common']);
    }
}(this, function ($,TmplInline_common) {

    var container = null;

    function SelectTerm(opt){
        opt = opt || {};
        if(!opt.data || !opt.container) return;
        this.content = null;
        this._initialize(opt);
        this.init();
    }

    var currentView = null;
    var _className = 'mod-course-banner__other-time_open';
    function clickContent(e){
        var $this = $(this);
        if($this.hasClass(_className)){
            clickBody();
        }else{
            clickBody();
            $this.addClass(_className);
            currentView = $this;
        }
        e.stopPropagation();
    }

    function clickBody(){
        if(currentView){
            currentView.removeClass(_className);
            currentView = null;
        }
    }

    $(document).on('click',clickBody);//绑定body事件


    SelectTerm.prototype = {
        _initialize : function(opt){
            this.opt = opt = opt || {};
            this.container = opt.container || null;
            this.data = opt.data || {};
            this.isReplace = opt.isReplace || false;
            this.currentIndex = opt.currentIndex || 0;//当前选中的字段
        },
        init : function(opt){
            if(opt){
                this._initialize(opt);
            }
            this.render();
        },
        render : function(){
            var _this = this;
            //console.log(_this.data);
            for(var i =0,len = _this.data.terms.length ; i< len ; i++){
                var _term = _this.data.terms[i];
                _term.parse_time = $.render.courseTime(_term);//设置时间展示字段
            }
            var html = TmplInline_common.selectTerm({data:_this.data,currentIdx:_this.currentIndex}).toString();
            this.content = $(html);
            if(this.isReplace){
                _this.container.replaceWith(this.content);
            }else{
                var span = $('<span>').appendTo(_this.container);
                span.replaceWith(this.content);
            }
            this.bind();
        },
        current : function(){
            //获取当前选中子课时的
        },
        bind : function(){
            var _this = this;
            if(this.content){
                this.content.on('click',clickContent);
                this.content.on('click','.mod-choose-time__li',function(){
                    var $this = $(this);
                    $this.parent().find('.mod-choose-time__li:nth('+ _this.currentIndex +')').toggleClass('mod-choose-time__li_current');
                    $this.toggleClass('mod-choose-time__li_current');
                    _this.currentIndex = +$this.attr('data-idx');
                    var _opt = {
                        data : _this.data,
                        index : _this.currentIndex
                    }
                    _this.opt.onSelect && _this.opt.onSelect(_opt);
                });
            }
        },
        unbind : function(){
            var _this = this;
            if(this.content){
                this.content.off('click',clickContent);
                this.content.off('click','.mod-choose-time__li');
            }
        },
        destroy : function(){
            this.unbind();
            this.content = null;
            currentView = null;
        }
    }

    return SelectTerm;
}));
