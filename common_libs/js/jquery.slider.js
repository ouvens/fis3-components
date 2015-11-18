/**
 * @author littenli
 * @date 2014-03-05 ver.0.1
 * @description 图片滚动插件for jquery
 * @example js - $("#container").slider({
                    nb:$("#prev-btn"), //下一个按钮
                    pb:$("#next-btn"), //上一个按钮
                    sliderbox: $("#sliderbox"), //ul节点
                    slidernav: $(".slidernav"), //nav小点
                    sliderNum:5, //每次滑动块数,默认为1
                    isAuto:true, //是否自己滚动，默认为false
                    sliderCb:function(cur, pre){} //切换回调，cur为当前页，pre为切换前页
                });
            html -  <button id="prev-btn">
                    <div id="container">
                        <ul id="sliderbox">
                            <li><li>
                            <li><li>
                        </ul>
                    </div>
                    <button id="next-btn">
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else {
        factory(root['jQuery']);
    }
}(this, function ($) {

    $.fn.slider = function(options) {
        return this.each(function() {
            var defualts = {
                // 切换方式
                type: 'slide',
                //滚动方式，其实现在只有一种，后续可拓展right,top
                handle: "left",
                //动画速度
                speed: 600,
                //每次滑过的块数
                sliderNum: 1,
                //动画速度
                delayTime: 5000
            };
            //handle 为图片滚动方式
            var opts = $.extend({}, defualts, options),
                obj = $(this),
                index = 0,
                sliderBox = opts.sliderbox,
                sliderLi = sliderBox.find("li"),
                sliderLiWidth = $(".sliderbox li:eq(0)").outerWidth(),
                liNum = sliderLi.length,
                len = (sliderLi.length) / (opts.sliderNum),
                len = Math.ceil(len),
                prev = opts.pb,
                next = opts.nb,
                sliderTimer, navHtml = '',
                sliderNav = opts.slidernav || $(".slidernav", obj),
                isAuto = opts.isAuto || false,
                slideCb = opts.slideCb || function(){};


            //在动画还没有开始之前预定义的内容  
            for(var i = 0; i < len; i++) {
                navHtml += '<li><a href="javascript:void(0);">' + (i + 1) + '</a></li>';
            }
            //当定义一屏的动画数目大于1时，内容为向左浮动
            if(opts.sliderNum > 1) {
                sliderLi.css("float", "left");
            }
            var sliderA = sliderNav.find("li");
            //默认第一张添加了一个类名current
            sliderA.eq(0).addClass("current"), sliderLi.eq(0).addClass("current");

            //重新绑定
            function reBind(){
                prev.unbind("click").bind("click",function() {
                    var i = index;
                    index -= 1;
                    if(index == -1) {
                        if(isAuto){
                            index = len - 1;
                        }else{
                            index = 0;
                        }
                    };
                    if(!isAuto){
                        checkDis();
                    }
                    showImg(i, index ,"prev");
                });
                //next 事件
                next.unbind("click").bind("click",function() {
                    auto();
                });
            }

            //记录上一次的页面序号
            var tempIndex = 0;
            //滚动的主要函数，i的初始值是0，index是随i而变
            function showImg(i, index ,direction) {
                var sliderHeight = obj.height(),
                    sliderWidth = obj.width();

                sliderLi.removeClass("current").eq(index).addClass("current");
                sliderA.removeClass("current").eq(index).addClass("current");

                if(opts.handle == 'left') {
                    sliderLi.css("float", "left");

                    var diff;
                    var sliderW;
                    var fn;
                    var curNode;

                    if(index == 0 && direction == "next"){
                        //后补
                        
                        curNode = obj.find("li").eq(0).clone().addClass("li-temp").appendTo(sliderBox);
                        sliderW = (len+1) * sliderWidth;
                        diff = -sliderWidth * len;
                        fn = function(){
                            sliderBox.css({"left":0});
                            obj.find(".li-temp").remove();
                            reBind();
                        }
                    }else if(index == len-1 && direction == "prev"){
                        //前补
                        
                        curNode = obj.find("li").eq(len-1).clone().addClass("li-temp").insertBefore(obj.find("li").eq(0));
                        sliderBox.css({"left": -sliderWidth});
                        sliderW = (len+1) * sliderWidth;
                        diff = 0;
                        fn = function(){
                            sliderBox.css({"left":-sliderWidth * index});
                            obj.find(".li-temp").remove();
                            reBind();
                        }
                    }else{
                        curNode = obj.find("li").eq(index);
                        sliderW = len * sliderWidth;
                        sliderBox.css("width", sliderW);
                        diff = -sliderWidth * index;
                        fn = function(){
                            reBind();
                        };
                    }

                    prev.unbind("click");
                    next.unbind("click");

                    if(opts.type=='fade'){
                        sliderBox.css("width", sliderW).filter(":not(':animated')").css({
                            "left": diff
                        });
                        curNode.css('opacity', 0).animate({
                            opacity: 1
                        }, opts.speed, fn);
                    }else{
                        sliderBox.css("width", sliderW).filter(":not(':animated')").animate({
                            "left": diff
                        }, opts.speed,fn);                        
                    }

                    //回调
                    slideCb(index, tempIndex);
                    tempIndex = index;
                } else if(opts.handle == 'right') {
                    //如果需要…我还没写
                }
            }

            function checkDis(){
                if(index < 1){
                    prev.addClass("dis-btn");
                }else{
                    prev.removeClass("dis-btn");
                }

                if(index >= len-1){
                    next.addClass("dis-btn");
                }else{
                    next.removeClass("dis-btn");
                }
            }

            var changeEvent = opts.type=='fade' ? 'mouseenter' : 'click';
            sliderA.bind(changeEvent,function(){
                index = $(this).index();
                var i = sliderA.index($(".slidernav .current:eq(0)"));
                if(index != i) {
                    showImg(i, index);
                }
            }).eq(0).trigger(changeEvent);

            if(len <= 1) {
                prev.hide();
                next.hide();
            } else {
                //prev 事件
                reBind();
            }
            //auto fn
            function auto() {
                var i = index;
                if(!isAuto){
                    if(index == len - 1){
                        return;
                    }
                }
                index = (index + 1) % len;
                if(!isAuto){
                    checkDis();
                }
                showImg(i, index ,"next");
            }
            //set time
            if(isAuto){
                var settime;
                obj.hover(function(){
                    clearInterval(settime);

                    if(len>0){
                        prev.show();
                        next.show();
                    }

                },function(){

                    if(len>0){
                        prev.hide();
                        next.hide();
                    }

                    settime = setInterval(function(){
                        auto();
                    },opts.delayTime);
                }).trigger("mouseleave");   // @todo 确认这段代码是干嘛的
            }
            
        }); 
    };
}));
