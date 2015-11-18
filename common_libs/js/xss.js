/**
 * User: herbertliu
 * Date: 13-11-13
 * Time
 * func: XSS过滤
 */
(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define( factory);
	} else {
		// Browser globals
		root['XSS'] = factory();
	}
}(this, function () {

	// 正则表达式
	var REGEXP_LT = /</g;
	var REGEXP_GT = />/g;
	var REGEXP_QUOTE = /"/g;
	var REGEXP_ATTR_TAG = /<(\/)*([a-zA-Z0-9_:\.\-]+)([^>a-zA-Z0-9_:\.\-\s,;]+[^>]*)*>/ig;
	var REGEXP_ATTR_NAME = /[^>a-zA-Z0-9_:\.\-]*([a-zA-Z0-9_:\.\-]+)=[\"\']?([^\"\'\s>]*)[\"\']?/ig;
	var REGEXP_ATTR_VALUE = /&#([a-zA-Z0-9]*);?/img;
	var REGEXP_ATTR_NO_NAME = /[^>a-zA-Z0-9_:\.\-]/ig;
	var REGEXP_DEFAULT_ON_TAG_ATTR_1 = /\/\*|\*\//mg;
	var REGEXP_DEFAULT_ON_TAG_ATTR_2 = /^[\s"'`]*((j\s*a\s*v\s*a|v\s*b|l\s*i\s*v\s*e)\s*s\s*c\s*r\s*i\s*p\s*t\s*|m\s*o\s*c\s*h\s*a):/ig;
	var REGEXP_DEFAULT_ON_TAG_ATTR_3 = /\/\*|\*\//mg;
	var REGEXP_DEFAULT_ON_TAG_ATTR_4 = /((j\s*a\s*v\s*a|v\s*b|l\s*i\s*v\s*e)\s*s\s*c\s*r\s*i\s*p\s*t\s*|m\s*o\s*c\s*h\s*a):/ig;
	var REGEXP_DEFAULT_ON_TAG_ATTR_5 = /e\s*x\s*p\s*r\s*e\s*s\s*s\s*i\s*o\s*n/ig;
	var REGEXP_URL = new RegExp("((news|telnet|nttp|file|http|ftp|https)://){1}(([-A-Za-z0-9]+(\\.[-A-Za-z0-9]+)*(\\.[-A-Za-z]{2,5}))|([0-9]{1,3}(\\.[0-9]{1,3}){3}))(:[0-9]*)?(/[-A-Za-z0-9_\\$\\.\\+\\!\\*\\(\\),;:@&=\\?/~\\#\\%]*)*","gi");

	//var IMG_EXP = /([^'"]+)[^>]*/ig
	var REGEXP_NONE_URL = new RegExp("(?:[^\\\'\\\"]|^|\s+)((((news|telnet|nttp|file|http|ftp|https)://)|(www\\.))(([-A-Za-z0-9]+(\\.[-A-Za-z0-9]+)*(\\.[-A-Za-z]{2,5}))|([0-9]{1,3}(\\.[0-9]{1,3}){3}))(:[0-9]*)?(/[-A-Za-z0-9_\\$\\.\\+\\!\\*\\(\\),;:@&=\\?/~\\#\\%]*)*)(?![^<]*</a>)","gi");

	var REGEXP_SPACE = /^\s|\s$/ig;

	/*
	 * 默认HTML标签白名单
	 * 标签名=>属性列表
	 */
	var defaultWhiteList = {
	  h1:     {},
	  h2:     {},
	  h3:     {},
	  h4:     {},
	  h5:     {},
	  h6:     {},
	  hr:     {},
	  span:   {},
	  strong: {},
	  b:      {},
	  i:      {},
	  br:     {},
	  p:      {},
	  pre:    {},
	  code:   {},
	  a:      {
				'target' : {
					'default':'_blank'
				}, 
				'href'   : true,
				'title'  :true 
			  },
	  img:    {
				'src'    : true, 
				'alt'    :true, 
				'title'  :true,
			  'rel'    :true
			  },
	  div:    {},
	  table:  {
				'border' :true
			  },
	  tr:     {'rowspan':true},
	  td:     {'colspan':true},
	  th:     {'colspan':true},
	  tbody:  {},
	  thead:  {},
	  ul:     {},
	  li:     {},
	  ol:     {},
	  dl:     {},
	  dt:     {},
	  em:     {},
	  cite:   {},
	  section:{},
	  header: {},
	  footer: {},
	  blockquote: {},
	  audio:  {'autoplay':true, 'controls':true, 'loop':true, 'preload':true, 'src':true},
	  video:  {'autoplay':true, 'controls':true, 'loop':true, 'preload':true, 'src':true}
	};

	var defaultWhiteAttrList = {
		'width' : true,
		'height' : true,
		'style' : true
	}

	/**
	 * 判断对象是否为空
	 *
	 * @param {String} obj 对象
	 * @return {String}返回true or false
	 */
	var isNUll = function(obj){
		if(!obj) return true;
		for(var i in obj){
			return false;
		}
		return true;
	}

	/**
	 * 过滤属性值
	 *
	 * @param {String} tag 标签名
	 * @param {String} attr 属性名
	 * @param {String} value 属性值
	 * @return {String} 若不需要修改属性值，不返回任何值
	 */
	function defaultOnTagAttr (tag, attr, value) {
		if(REGEXP_ATTR_NO_NAME.test(attr)){
			return '';
		}
		var _default = defaultWhiteList[tag][attr];
		var regexp = _default && _default['regexp'];
		var _dfvalue = _default && _default['default'];
		if (attr === 'href' || attr === 'src') {
			REGEXP_DEFAULT_ON_TAG_ATTR_1.lastIndex = 0;
			if (REGEXP_DEFAULT_ON_TAG_ATTR_1.test(value)) {
			  return _dfvalue || '#';
			}
			REGEXP_DEFAULT_ON_TAG_ATTR_2.lastIndex = 0;
			if (REGEXP_DEFAULT_ON_TAG_ATTR_2.test(value)) {
			  return _dfvalue || '#';
			}
			REGEXP_URL.lastIndex = 0;
			if (!REGEXP_URL.test(value)) {//合格URL
			  return _dfvalue || '#';
			}
			if(regexp){
				regexp.lastIndex = 0;
				if (!regexp.test(value)) {//合格URL
				  return _dfvalue || '#';
				}
			}
			return value;
		} else if (_default || defaultWhiteAttrList[attr]) {//白名单属性
			REGEXP_DEFAULT_ON_TAG_ATTR_3.lastIndex = 0;
			if (REGEXP_DEFAULT_ON_TAG_ATTR_3.test(value)) {
			  return _dfvalue || '';
			}
			REGEXP_DEFAULT_ON_TAG_ATTR_4.lastIndex = 0;
			if (REGEXP_DEFAULT_ON_TAG_ATTR_4.test(value)) {
			  return _dfvalue || '';
			}
			if(attr === 'style'){
				REGEXP_DEFAULT_ON_TAG_ATTR_5.lastIndex = 0;
				if (REGEXP_DEFAULT_ON_TAG_ATTR_5.test(value)) {
				  return _dfvalue || '';
				}
			}
			return value;
		}
		return '';
	}
	/**
	 * 过滤unicode字符（与REGEXP_ATTR_VALUE配合使用）
	 *
	 */
	function replaceUnicode (str, code) {
	  return String.fromCharCode(parseInt(code,10));
	}

	/**
	 * @param {String} html 需要过滤的字符串
	 * @param {String} args 保留原始字符串，不进行强制转义，在发表的时候需
	 *
	 */
	var filter = function(html,args){
		var DataObj = {},DataIndex = 0 , currReplace = {};

		REGEXP_ATTR_TAG.lastIndex = 0;
		html =  html.replace(REGEXP_ATTR_TAG,function(){
			var _targName = arguments[2] || '';
			_targName = _targName.toLowerCase(),
			_defaultWhiteList = defaultWhiteList[_targName];
			if(!_targName || !_defaultWhiteList) return arguments[0] || '';//没有标签名，过滤标签
			if(arguments[1]){//结束标记
				if(currReplace[_targName] && currReplace[_targName].length){
					currReplace[_targName].pop();
					if(!currReplace[_targName].length) delete currReplace[_targName];
					DataObj[DataIndex] = '</'+ arguments[2] +'>';
					return '{%DataIndex_'+ (DataIndex++) +'%}';
				}else{
					return '</'+ arguments[2] +'>';
				}
			}else{
				var _classStr = (arguments[3] || '').replace(REGEXP_SPACE,'');//获取属性值
				if((_classStr === '/' || !_classStr) && !isNUll(_defaultWhiteList))  arguments[0] || '';//需要有属性值
				if(_classStr){
					REGEXP_ATTR_NAME.lastIndex = 0;
					//console.log(_classStr , REGEXP_ATTR_NAME.test(_classStr), '++++++++++++++++++');
					if(REGEXP_ATTR_NAME.test(_classStr)){
						REGEXP_ATTR_NAME.lastIndex = 0;
						var _lastClassStr = [];
						_classStr.replace(REGEXP_ATTR_NAME,function(){//依次判断属性类型
							var _attrName = arguments[1].toLowerCase();
							var _attrValue = arguments[2];
							var value = defaultOnTagAttr(_targName,_attrName,_attrValue);
							_lastClassStr.push(value?' ' + _attrName + '="' + value + '"':'');
						});
						_classStr = _lastClassStr.join('');
					}else{
						_classStr = '';
					}
					//console.log(_classStr , '=============');
				}
				if((_classStr === '/' || !_classStr) && !isNUll(_defaultWhiteList)) return  arguments[0] || '';//需要有属性值
				if(!currReplace[_targName]) currReplace[_targName] = [];
				currReplace[_targName].push(_targName);
				DataObj[DataIndex] = '<'+ _targName + (_classStr?(' ' + _classStr):'') +'>';
				return '{%DataIndex_'+ (DataIndex++) +'%}';
			}
		});
		if(!args){
			html = html.replace(REGEXP_LT,'&lt;')
					   .replace(REGEXP_GT,'&gt;');
		}
		html = html.replace(/\{\%DataIndex_(\d+)\%\}/ig,function(){
			return DataObj[arguments[1]] || '';
		}).replace(REGEXP_NONE_URL,'<a href="$1" target="_blank">$1</a>');
		var _tags = [];
		for(var i in currReplace){
			if(i === 'img' || i === 'br' || i === 'p' || i === 'hr') continue;
			var _len;
			if(_len = currReplace[i].length){
				for(var j =0;j<_len;j++){
					_tags.push('</'+ i +'>');
				}
			}
		}
		if(_tags.length){
			html += _tags,join('');
		}
		//console.log(html);
		return html;
	}

	return {
		filter : filter
	}
}));