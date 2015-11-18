(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define([], factory);
    } else {
        // Browser globals
        root['proj_cfg'] = factory();
    }
}(this, function () {

	//=======  AMD module inner code begin ========
	var cfg = {

		/*
        //report使用TDW以后, 这里暂时注掉不用 @TODO: 重构TDW和这里整合
        reportCfg:{
			'bId': 209, //TODO:确认这里的bid
			'aId': function (mId){ return '0';} //这是业务老代码，原因待查
			//'ctype': 2	//上报cgi类型，默认是需要登录态，type=2，是不需要登录态
		},
        */

		badjsCfg:{
			'bid': 255,//业务id //TODO:确认这里的bid
			'mid': 390672,//onerror mid  //TODO:申请mid
			'log_mid':{
				'debug':0,		//level=1,业务自行配置,若配置则上报monitor
				'info':0,		//level=2,业务自行配置,若配置则上报monitor
				'error':0,		//level=4,必须配置,业务负责人申请后配置
				'fail':0		//level=8,必须配置,业务负责人申请后配置
			},
			'close':window.__DIST_MODE__=='dev' //调试阶段可设置此值为1
		},

        DBCfg:{
            'loginErr': 403855, //当db 返回无登陆态时上报的mid
            'basekeyErr': 403856,   //当db 返回BASEKEY错误时上报的mid
            'internalErr': 403857, //db返回系统内部错误
            'inputParamErr': 403858, //db返回输入参数错误
            'unkownErr': 403859,    //当db 返回未知错误时上报的mid
            'reloginFailed': 403860, //当db 返回登陆态失效触发登陆逻辑后,仍然登陆失败以后上报的mid //TODO:申请mid
            'basekeyRetryToMuch': 403861 //本项目暂时没有对basekey的重试了
        },

        businessCfg:{
            'page_404': 403934
        }
	};


	return cfg;
	//=======  AMD module inner code end ========

}));

