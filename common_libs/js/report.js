/**
 * @author herbertliu
 * @date 2014-02-25 version 0.2 last modified by herbertliu 2014-04-14
 * @description TDW数据上报
 * @example report.tdw(params[,args][,table]) //支持单条上报和多条上报
 *			params {Object} 上报字段集合，支持对象或者对象数组，例如：{'uin':'','ts':'','opername':'','module':'','action':'','obj1':'','obj2':'','obj3':'','action':'','ver1':'','ver2':'','ver3':'','ver4':''}，这里ts表示时间戳，不传使用服务器时间戳，objs表示用户ip，也不需要传
 *			args {Boolean} 可选，是否立即上报，默认false，不进行立即上报，可以调用report.toreport以及report不给后面参数来实现立即上报，以及设置10S内上报一次；当传true参数值的时候，表示立即上报
 *			table {String} 可选，上报数据表，默认群业务table=dc00141
 * @example report.config(params[,args][,table])//设置公共项目,参数同report.tdw
 * @example report.toreport() //立上报
 */
;(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD loading: define module named "badjs" with dependencies and build it
        define(['report'],factory);
    } else {
        // traditional browser loading: build badjs object with dependencies and inject it into window object
        root['report'] = factory(root['report']);
    }
})(this, function(report) {
	report = report || {};
	var _CONF = {
		TABLE : 'dc00149' ,//上报对应的数据表,群业务所有的默认dc00141,在线教育是dc00149
		TIMER : 300, //立即上报的时间,单位s，上报之后，500ms内自动上报
		DELAY_REPORT : false,//是否立即上报
		DATA : {}//存放公共数据

	}

	var _FIELDS = [];//全局FIELDS数组
	var _DATAS = [];//全局FIELDS数组

	if (typeof JSON !== 'object') {
		JSON = {};

	}
	if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {//依赖于json2.js
        };
	}


	var REPORT_URL = {
		TDW:'http://cgi.pub.qq.com/report/tdw/report?'//TDW上报
	}

	var _getImageFun = null;

	/**
	 * [控制台调试]
	 * @param  {[type]} arr [description]
	 * @return {[type]}     [description]
	 */
	function showConsole (keyArr, valArr) {
		if(!console.table) return;
		if(window.localStorage && window.localStorage["tdwFlag"] == 1){
			for(var i=0,len=valArr.length; i<len; i++){
				var obj = {};
				for(var j=0,len2=keyArr.length; j<len2; j++){
					if(valArr[i][j] != ""){
						obj[keyArr[j]] = valArr[i][j];
					}
				}
				console.table([obj]);
			}
		}
	}

	//生成iamge上报对象
	function _getImage(){
		if(_getImageFun){
			return _getImageFun;
		}else{
			var imageList = [],//保存上报所用的img对象
				imageLength = 10,//预存上报所需要的对象池子
				imageIndex = 0;//当前使用的上报对象索引

			return _getImageFun = function(){
				var _index = (imageIndex++)%imageLength;
				return imageList[_index] || (imageList[_index] = new Image());//生成对象
			}
		}
	}
	//上报方法
	function _report(url,params){
		//console.log(url,params);
		if(!url) return;
		var _params =[];
		if(params){
			for(var i in params){
				params[i] && (_params.push(i+ '=' + params[i]));
			}
		}
		var url = url + _params.join('&');
		//console.log(decodeURIComponent(url));
		//增加chrome插件支持
		var inputDom = document.getElementById("_CHROME_TDW");
		if(inputDom){
			inputDom.value = url;
		}else{
			var dom = document.createElement("input");
			dom.setAttribute("type","hidden");
			dom.value = url;
			dom.id = "_CHROME_TDW";
			document.getElementsByTagName("body")[0].appendChild(dom);
		}

		return (_getImage())().src = url;//上报
	}

	/**
	 * tdw上报，支持多记录上报
	 * @param table {string}	要上报的tdw表
	 * @param data {array}		要上报的数据，二维数组，数组的每一项即一个上报项，批量上报
	 * @param ipField {string}	要存放ip的字段名，如果不需要在数据表里记录ip，则该项放空或传空字符串
	 * @param ipField {string}	要存放时间戳字段名，如果不需要在数据表里记录时间戳，则该项放空或传空字符串
	 *
	 */
	var _tdw = function(table, fields, datas, ipField, timeField){
		if(!table || !fields || !datas) return;

		var _params = {
			table : table || _CONF.TABLE,
			fields : encodeURIComponent(JSON.stringify(fields)),
			datas :  encodeURIComponent(JSON.stringify(datas)),
			pr_ip : ipField || 'obj3',//ip字段，默认有服务器获取用户的时间
			pr_t : timeField || 'ts',//时间字段，默认用服务器时间戳
			t : (+new Date())
		};

		_report(REPORT_URL.TDW,_params);
	}

	//toString
	var _toString = Object.prototype.toString;


	/**
	 * tdw组合上报
	 * @param table {string}	要上报的tdw表
	 * @param params {array}	要上报的fireds字段对象数组
	 * @param args {boolean}	可选，是否立即上报，默认false，不进行立即上报，可以调用report.toreport以及report不给后面参数来实现立即上报，以及设置10S内上报一次；当传true参数值的时候，表示立即上报
	 *
	*/
	var reportFields = {},
		fields = [],
		datas = [],//保存延迟数据集合

		reportTable = _CONF.TABLE;

	var reportTimer = null;//上报timer
	var tdw = function(params , args , table){
		if(!params) throw 'params can not be null';
		args = args || _CONF.DELAY_REPORT;//立即上报属性
		reportTable = table || reportTable ;//赋值table
		var _params;

		switch(_toString.call(params)){
			case '[object Array]':
				_params = params;//对数组上报
				break;
			case '[object Object]':
				if(!args){
					_params = [params];//延迟上报
				}else{
					var __fields = [];
					var __datas = [];
					for(var i in params){
						if(i === 'obj3' || i === 'ts') continue;
						__fields.push(i);
						__datas.push(params[i]);
					}
					__fields = concatField(__fields ,_FIELDS);
					__datas = concatDatas([__datas] , _DATAS ,__fields , _FIELDS );
//					__fields = __fields.concat(_FIELDS);
//					__datas = __datas.concat(_DATAS);
					return _tdw(reportTable , __fields , __datas , params['obj3'] , params['ts']);//obj3表示ip字段，ts表示时间戳字段，这两个字段默认不填写
				}
				break;
		}

		//组装数据
		for(var i = 0,len = _params.length; i < len ;i ++){
			var __params = _params[i];
			var _datas = [];
			datas.push(_datas);
			for(var j in __params){
				var __index;
				if(j in reportFields){
					__index = 	reportFields[j];
					fields[__index]	 = j;
				}else{
					fields.push(j);
					reportFields[j] = __index = fields.length - 1;
				}
				_datas[__index]	 = __params[j] || '';
			}
		}

		//立即处理数据
		//console.log(args,'============');
		if(args){
			this.toreport();
		}else{
			//console.log(reportTimer, _CONF.TIMER,'============');
			var _this = this;
			if(!reportTimer && _CONF.TIMER){
				reportTimer = window.setTimeout(function(){
					_this.toreport();
				},_CONF.TIMER );	//延迟500ms上报
			}

		}
        // console.log(123123);
        // console.table(datas);
	}

	var evalFieldsData = (function (){
		//生成字符串
		_FIELDS = [];
		_DATAS = [];
		for(var i in _CONF.DATA){
			_FIELDS.push(i);//属性
			var _datai = _CONF.DATA[i];
			_DATAS.push(!_datai && _datai !== 0 ? '' : _datai);//属性值
		}
		return arguments.callee
	})();//初始化自执行一遍

    var concatField = function (newFields , oldField){
        var sholdConcat = [];
        for(var i = 0 ; i < oldField.length ; i ++){
            var hadIn = false;
            for(var j = 0 ; j < newFields.length ; j ++){
                if(newFields[j] === oldField[i]){
                    hadIn = true;
                }
            }

            if(!hadIn){
                sholdConcat.push(oldField[i])
            }
        }

        ;
        return newFields.concat(sholdConcat);
    }

    var concatDatas = function (newDatas , oldDatas  , newFields , oldFields  ){
        var oldMap = {};
        for(var i = 0 ; i < oldFields.length ; i ++){
            oldMap[oldFields[i]] = oldDatas [i];
        }

        for(var j = 0 ; j < newDatas.length ; j++){
            var datas = newDatas[j];
            for(var z = 0 ; z < newFields.length ; z++){
                if(!datas[z] && datas[z] !== 0){
                    datas[z] = oldMap[newFields[z]] || '';
                }
            }
        }
        return newDatas;
    }


	/**
	 * tdw立即执行上报
	 * @param null {string}	要上报的tdw表
	 * @param params {array}	要上报的fireds字段对象数组
	 * @param args {boolean}	可选，是否立即上报，默认false，不进行立即上报，可以调用report.toreport以及report不给后面参数来实现立即上报，以及设置10S内上报一次；当传true参数值的时候，表示立即上报
	 *
	*/
    var _repeatTimes = 0; // 循环定时器次数，防止无限循环
    var _repeatMaxTimes = 33; // 最大循环次数，33 * 300ms = 10s
	report.toreport = function(){
		var len = datas.length;
		if(!len) return ;
		//多于一条数据需要完善对齐数据
		var concatedField = concatField(fields , _FIELDS);//合并fields
        var concateDatas = concatDatas(datas , _DATAS ,concatedField , _FIELDS );
        // --start--
        // vienwu 2015/05/11
        // 没有初始化module字段，无限延迟上报，解决低网速上报异常bug。
        var _indexModule = concatedField.indexOf('module'); // 是否存在module字段
        var _isInit = true;
        if(!_indexModule){
            _isInit = false;
        }else{
            for(var i=0;i<concateDatas.length;i++){
                var dataModule = concateDatas[i][_indexModule];
                if(!dataModule){
                    _isInit = false;
                    break;
                }
            }
        }
        // 没有初始化，存在定时器延时上报，且循环次数小于最大次数
        if(_isInit===false && reportTimer && _CONF.TIMER && _repeatTimes<_repeatMaxTimes){
            // 无限定时器，直到存在module字段。
            var self = this;
            _repeatTimes++;
            window.clearTimeout(reportTimer);
            reportTimer = window.setTimeout(function(){
                // console.log('The speed is too slow,wait for init module..');
                self.toreport();
            },_CONF.TIMER);
            return;
        }
        // 超过最大次数，默认直接上报，防止其他不规范的页面没有设置module导致无限循环的问题。
        _repeatTimes = 0;
        // 没有初始化module字段，无限延迟上报。by vienwu 2015/05/11
        // --end--
        //
        showConsole(concatedField , concateDatas);
		_tdw(reportTable , concatedField , concateDatas);//obj3表示ip字段，ts表示时间戳字段，这两个字段默认不填写
		reportFields = {};
		fields.length = datas.length = 0;//重置数据
		reportTable = _CONF.TABLE;//重置数据

		window.clearTimeout(reportTimer);//清除timmer
		reportTimer = null;
	}
	/**
	 * tdw设置config属性值
	 *	params {Object} 上报字段集合，支持对象或者对象数组，例如：{'uin':'','ts':'','opername':'','module':'','action':'','obj1':'','obj2':'','obj3':'','action':'','ver1':'','ver2':'','ver3':'','ver4':''}，这里ts表示时间戳，不传使用服务器时间戳，objs表示用户ip，也不需要传
	 *	args {Boolean} 可选，是否立即上报，默认false，不进行立即上报，可以调用report.toreport以及report不给后面参数来实现立即上报，以及设置10S内上报一次；当传true参数值的时候，表示立即上报
	 *	table {String} 可选，上报数据表，默认群业务table=dc00141
	 *
	*/
	report.config = function(params , args , table){
		//取report.cookie里面的通用配置
		var cookieCfg = (((report.cookie && report.cookie.getConfig) ? report.cookie.getConfig : {}).DATA || {});
        var cookie_from = cookieCfg.from || {};

        //firstLand
        if(cookieCfg._BASE && cookieCfg._BASE.ver7){
        	params.ver7 = cookieCfg._BASE.ver7;
        }
        //firstJump
        if(cookieCfg._BASE && cookieCfg._BASE.ver8){
        	params.ver8 = cookieCfg._BASE.ver8;
        }
        //keyword
        if(cookieCfg._BASE && cookieCfg._BASE.ver5){
        	params.ver5 = cookieCfg._BASE.ver5;
        }

        //refer
        if(cookieCfg._BASE && cookieCfg._BASE.refer){
        	params.refer = cookieCfg._BASE.refer;
        }


        var _from_val = {};
        for(var _from in cookie_from) {
            _from_val = cookie_from[_from];
            break;
        }
        params.ver4 = _from_val.ver4 || params.ver4;
        params.ver6 = _from_val.ver6 || params.ver4;
		if(params){
			for(var i in params){
				_CONF.DATA[i] = params[i];
			}
		}


		_CONF.DELAY_REPORT =!!args;//设置是否需要延迟
		table && (_CONF.TABLE = table);//设置上报对象表

		evalFieldsData();
	}

	report.tdw = tdw;//tdw上报

	return report;
});
