/**
 *  @describe: A用户从客户端分享链接；B用户通过链接，打开页面，并打开客户端
 *  @author: littenli
 *  @date: 2014/6/16
 */
(function (root , factory){

    if(typeof define == 'function' && define.amd ){
        define(['jquery', 'db', 'login', 'check', 'util.bom', 'dialog', 'render', 'getClientVersion', 'commonTemplate/common'] , factory);
    }else{
        root['ClientShare' ] = factory(root['jQuery'], root['DB'], root['Login'], root['Bom'], root['Dialog'], root['Render'], root['GetClientVersion'], root['TmplInline_common']);
    }

}(window , function ($, DB, Login, Check, Bom, Dialog, Render, GetClientVersion, TmplInline_common){

    var cb;
    //倒计时
    var CountDown = (function(){

        var interval;

        //清除倒计时
        function clearCountDown () {
            if(interval){
                clearTimeout(interval);
            }
        }

        /**
         * [倒计时基于Dialog组件，此函数为简单调用]
         * @param  {[Object]} param [描述对话框，包括课程名称，点击跳转的链接]
         * @return {[null]}       [无返回]
         */
        function createDialog(param){
            $.Dialog.alert({
                title: "",
                isDisabled: false,
                confirmText: "取消",
                globalClass: '',
                content: TmplInline_common.clientShare(param),
                onAccept: clearCountDown,
                onCancel: clearCountDown,
                onClose: clearCountDown
            });

        }

        //倒计时处理
        function countInit(num){
            num = parseInt(num) || 5;
            var $count = $(".count-down-ctn .count-down-count");
            var $manual = $(".count-down-ctn .count-down-manual");
            var $closeBtn = $(".modal-close");

            interval = setInterval(function(){
                num --;
                $count.html(num);
                if(num == 0){
                    clearTimeout(interval);
                    $(".count-down-tips").html("已为您打开客户端");
                    $.render.url.liveForOpenRoom($manual[0], true);
                }
            }, 1000);
        }

        return {
            show: function(param){

                //客户端版本不低于5347，才有打开客户端窗口的能力。
                //version为-1是什么意思？从彭老师代码里拷的…实在不敢删。如果谁弄明白了，务必rtx：littenli告知我呀
                if(GetClientVersion() !== -1 && GetClientVersion() < 5347) {
                    return;
                }
                createDialog(param);
                countInit(5);
            }
        }
    })();

    var ClientShare =  (function (){

        //初始化公用设定
        var setting = {
            isOpen: Bom.query("open_room"),
            cid: Bom.query("course_id"),
            type: 0,
            roomUrl: "",
            price: 0,
            key: Bom.query("key"),
            term_id: Bom.query("term_id")
        }

        //展示提示弹窗
        function tips(str){
            $.Dialog.alert({
                title: "",
                isDisabled: false,
                confirmText: "确定",
                globalClass: '',
                content: str,
                onAccept: function(){
                },
                onCancel: function(){
                },
                onClose: function(){
                }
            });
        }

        /**
         * [收费课抢票逻辑]
         * @param  {[Object]} param [描述收费课程的信息，现仅有cid]
         * @return {[null]}       [无返回]
         */
        function check(param){

            if(setting.key){
                param.key = setting.key;
            }

            if(setting.term_id){
                param.term_id = setting.term_id
            }

            DB.extend( {
                check: DB.httpMethod({url: '/cgi-bin/agency_hall/check', type: 'POST'})
            });

            DB.check({
                param: param,
                succ: function(data){
                    if(data.result){
                        if(data.result.tencent_src){
                            setting.roomUrl = data.result.tencent_src;
                        }
                        if(data.result.type == 1){
                            //跳转客户端
                            cb();
                            CountDown.show({
                                url: setting.roomUrl
                            });
                        }else if(data.result.type == 2){
                            //停留在web
                            var outcome = data.result.result;

                            if(outcome == 1){
                                cb(true);
                                tips("很遗憾，免费名额已被抢完！下次记得早出手哟…");
                            }else if(outcome == 3){
                                cb();
                                //已抢过
                                //这里cgi返回的字段比较奇怪，因为一开始cgi同学没弄清需求要求
                                //以为outcome==3，已报名是停留在web，其实需求是需要跳转到客户端。故作特殊处理
                                CountDown.show({
                                    url: setting.roomUrl
                                });
                                $(".count-down-got").html("您已报名。");
                            }
                        }
                    }
                }
            })
        }

        /**
         * [初始化]
         * @param  {[Number]}   type     [1:机构; 2:课程]
         * @param  {[Object]}   opts     [包含属性room_url，即跳转客户端tencent串(必传); 属性price，即价格(非必传，不传为0)]
         * @param  {Function} callback [初始化回调函数]
         * @return {[null]}            [无返回]
         */
        function init(type, opts, callback){
            cb = callback || function () {};

            if(!setting.isOpen) return;

            //如果不是飞机票，且是微信用户，不执行
            if(!setting.key && Check.isWeixinUser()) return;

            //判断期id是否过期
            var termNotOutDate = true;
            if(setting.term_id && metaData && metaData.terms){
                termNotOutDate = false;
                for(var i=0,len=metaData.terms.length; i<len; i++){
                    if(setting.term_id == metaData.terms[i].term_id){
                        termNotOutDate = true;
                    }
                }
            }
            if(!termNotOutDate) return;

            setting.type = type;
            setting.roomUrl = opts.room_url;
            setting.price = opts.price || 0;

            if(type == 2){
                //课程详情页
                if(setting.price == 0){
                    //免费课程
                    CountDown.show({
                        url: setting.roomUrl
                    });
                    cb();
                }else{
                    //收费课程。由于不知道web侧与客户端侧是否用的同一个qq号，避免用户误操作，产品逻辑是再谈一次登录框确认
                    if ($.bom.query('client_uin') != $.cookie.uin()) {
                        Login.show({
                                succ: function () {
                                    //如果是微信用户切到qq用户，涉及删除cookie逻辑，延时处理
                                    setTimeout(function(){
                                        check({
                                            course_id: setting.cid
                                        })
                                    }, 200);
                                }}
                            //关闭登录框，则表示用户放弃飞机票，无需处理
                        );
                    } else {

                        check({
                            course_id: setting.cid
                        })

                    }
                }
            }else if(type == 1){
                //机构主页
                CountDown.show({
                    url: setting.roomUrl
                });
            }
        }

        return {
            init: init
        }
    })();

    return ClientShare;
}));
