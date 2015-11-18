/**
 * @description 根据proj_cfg初始化业务的badjs,并提供更易用的LOG方法
 * @example @todo @casper 作者！组建君呼唤你回来写文档注释
 */

(function (root, factory) {

    if (typeof define === 'function' && define.amd) {
        define(['badjs', 'proj_cfg'], factory);
    } else {
        root['LOG'] = factory(root['Badjs'], root['proj_cfg']);
    }

}(this, function (Badjs, proj_cfg) {

    //=======  AMD module inner code ========

    //==== module code begin ====
    var badjsCfg = proj_cfg.badjsCfg;

    var _logOn = 1; //这个开关由开发者自己手动控制,用来控制下面的手动LOG方法是否上报badjs

    Badjs.init(badjsCfg.bid, badjsCfg.mid, 0, badjsCfg.close);

    //封装给项目用的badjs上报接口
    //TODO：完善注释，添加sample
    var LOG = function(opt){
        var level,msg,type,mid,url;

        if(typeof opt =='string'){
            level = 1;
            type = 'debug';
            mid = badjsCfg.log_mid[type];
            msg = opt;
            url = '';

        }
        else if(typeof opt=='object'){

            type = opt.type || 'debug';
            level = badjsCfg.log_mid[type] || 1;
            mid = opt.mid || badjsCfg.log_mid[type];

            msg = [];
            if (opt.msg) msg.push('[msg]'+opt.msg);
            msg = msg.join(',');

            url = opt.url || "";
        }

        msg = 'LOG('+type+')[' + msg + ']';

        if (_logOn){
            Badjs(msg,url,0,mid,level);
        }
        else{
            // console.info('[LOG@console]['+type+']msg='+msg+',url='+url+',mid='+mid);
        }
    }

    return LOG;
    //==== module code end ====

    //=======  AMD module inner code ========
}));
