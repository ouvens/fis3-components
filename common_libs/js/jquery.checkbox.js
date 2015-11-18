/**
 * jquery插件：checkbox
 * @param {Object} options 配置项
 * @param {Boolean} options.disabled 是否激活，1：激活，0：不激活（默认勾选）
 * @param {Boolean} options.checked 是否勾选，1：勾选，0：不勾选（默认不勾选）
 * @param {Boolean} options.labelText 复选框后面的文字
 * @param {Boolean} options.name checkbox的name
 *
 * @example
 * $('div').checkbox({
 * 		checked: 1,
 * 		disabled: 0,
 * 		labelText: 'hello'
 * });
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else {
        root['Checkbox'] = factory(root['jQuery']);
    }
}(this, function ($) {
	
	// var tmpl = '<div style="margin:10px 0px;" class="checkbox ${className}" name=${name} uid="${uid}">'
	// 				+ '<i class="js-i-checkbox"></i>'
	// 				+ '<label class="js-i-label">${labelText}</label>'
	// 			+ '</div>'
	var config = {
		baseClass: 'f-checkbox',
		checkedClass: 'checked',
		disabledClass: 'disabled'
	};
	var tmpl = '<label class="'+ config.baseClass +' ${className} js-ctn" name=${name} uid="${uid}">'
					+ '<i class="icon-checkbox js-i-checkbox"></i>'
					+ '<span class="f-label-text js-i-label">${labelText}</span>'
				+ '</label>';

	$.fn.extend({
		/**
		 * @class  复选。。。
		 * @param {Object} options 配置项
		 * @param {Boolean} options.disabled 是否激活，1：激活，0：不激活（默认勾选）
		 * @param {Boolean} options.checked 是否勾选，1：勾选，0：不勾选（默认不勾选）
		 * @param {Boolean} options.labelText 复选框后面的文字
		 */
		checkbox: function(options){
			// var opts = $.extend({}, $.fn.checkbox.defaults, options);

			if(typeof options === 'string' && /^(val|check|uncheck|toggle|disable|enable|isDisabled|update|destroy)$/i.test(options)){
				return $.proxy($.fn.checkbox[options], this)();
			}

			options = options || {};

			return this.each(function(index, node){
				var hideStyle = {'overflow':'hidden', 'height':'1px', 'width':'1px', 'clip':'rect(0 0 0 0)', 'border':0, 'margin':'-1px', 'padding':0, 'position':'absolute'};				
				
				var $checkbox = $(this).find('input[type=checkbox]').css(hideStyle);
				var $label = $(this).find('label').css(hideStyle);
				
				var className = getClass($checkbox.prop('checked'), $checkbox.prop('disabled'));
				var labelText = $label.html();
				var checked = $checkbox.prop('checked');
				var uid = Math.random().toString().slice(2);
				var html = '';

				var data = {
					checked: checked,
					className: className,
					name: $checkbox.prop('name'),
					labelText: labelText,
					uid: uid
				};
				html = tmpl.replace(/\$\{([^\{\}]+)\}/g, function(matchword, key){
					return data[key];
				});
				$(this).on('click', '.js-ctn', function(){
					var $parent = $(this).parent();
					if($parent.checkbox('isDisabled')) return;

					if($parent.checkbox('val')){
						$parent.checkbox('uncheck');
					}else{
						$parent.checkbox('check');
					}
				});
				$checkbox.change(options.onchange || function(){});
				$(this).append($(html));
			});

		}
	});

	$.extend($.fn.checkbox, {
		defaults: {
			name: '',	// 复选框的name
			checked: 0,	// 是否选中，1：选中，0：不选中
			disabled: 0,	// 是否disabled，1：disabled，0：enabled
			labelText: ''  // 复选框后面的文字
		},
		click: function(){
			var $this = $(this);
			
			if($this.hasClass(config.disabledClass)){
				return;
			}
		},
		val: function(){
			// return ($(this).find('input[type=checkbox]').prop('class').indexOf('checkbox-check')!==-1) - 0;
			return $(this).find('input[type=checkbox]').prop('checked') ? 1 : 0;
		},
		check: function(){
			this.each(function(index, node){
				var $this = $(this);
				var className = getClass(true, false);
				// $this.find('.js-ctn').prop('class', config.baseClass + ' ' + className);
				$this.find('.js-ctn').prop('class', className);
				$this.find('input[type=checkbox]').prop('checked', 1).change();
			});
		},
		uncheck: function(){
			this.each(function(index, node){
				var $this = $(this);
				var className = getClass(false, false);
				// $this.find('.js-ctn').prop('class', config.baseClass + ' ' + className);
				$this.find('.js-ctn').prop('class', className);
				$this.find('input[type=checkbox]').prop('checked', 0).change();
			});
		},
		toggle: function(){

		},
		isDisabled: function(){
			var $this = this.eq(0).find('.js-ctn');
			return $this.hasClass(config.disabledClass);
		},
		disable: function(){
			return this.each(function(index, node){
				var $this = $(this);
				var isChecked = $this.checkbox('val');
				var className = getClass(isChecked, true);
				// $this.find('.js-ctn').prop('class', config.baseClass + ' ' + className);
				$this.find('.js-ctn').prop('class', className);
				$this.find('input[type=checkbox]').removeProp('disabled');
			});
		},
		enable: function(){
			return this.each(function(index, node){
				var $this = $(this);
				var isChecked = $this.checkbox('val');
				var className = getClass(isChecked, false);
				// $this.find('.js-ctn').prop('class', config.baseClass + ' ' + className);
				$this.find('.js-ctn').prop('class', className);
				$this.find('input[type=checkbox]').prop('disabled', 1);
			});
		},
		reset: function(options){
			
		}
	});

	/**
	 * 获取对应的class名
	 * @param  {Number|Boolean} checked  是否勾选，如为1、true，则勾选；否则，不勾选
	 * @param  {Number|Boolean} disabled 是否disable，如为1、true，则disable；否则，enable
	 * @return {String}          对应的class名
	 */
	function getClass(checked, disabled){
		var ret = '';
		if(checked){
			if(disabled){
				ret = 'checked disabled';
			}else{
				ret = 'checked';
			}
		}else{
			if(disabled){
				ret = 'disabled';
			}else{
				ret = '';
			}
		}
		return config.baseClass + ' ' + ret + ' js-ctn';
	}

	return $.fn.checkbox;
}));