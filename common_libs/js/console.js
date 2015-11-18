(function() {// IE 67 无consoloe   IE8 只有控制台打开才有console  为避免产生badJS引入
	window.console = window.console || {
	    log : function(){},
	    debug : function(){},
	    info : function (){},
	    warn : function(){},
	    error : function () {}
	};
})();