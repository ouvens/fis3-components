var T = [new Date()-0];
(function(){
	/*var _location = window.LOCATION = {};
	for(var i in document.location){
		_location[i] = document.location[i];
	}
	document.domain = 'ke.qq.com';*/
	var isIE=!!window.ActiveXObject;
	var isIE6=isIE&&!window.XMLHttpRequest;
	var isIE8=isIE&&!!document.documentMode;
	var isIE7=isIE&&!isIE6&&!isIE8;
	window['__document_domain_is_set'] = false;
	if (isIE){
		if (isIE6){
			//暂时兼容ie6,TOTO:因为视频上传需要设置domain值，但是在ie6下如果设置了domain值，会导致window.location无权访问
			//参见jq的处理办法http://bugs.jquery.com/ticket/8138
			document.domain = 'qq.com';
            window['__document_domain_is_set'] = true;
		}else{
			// document.domain = 'ke.qq.com';
		}
	}
})();
