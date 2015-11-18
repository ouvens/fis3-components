/**
 * @author littenli
 * @date 2014-03-06 ver.0.1
 * @description 分享组件for jquery，现只支持分享到qq空间，qq，腾讯微博，新浪微博，人人。可自由拓展
 * @example $(".share").share({
                content:"页面内容",
                pic:"http://img1.gtimg.com/new_ak/83/12/8312128d0b4f38e68894acc2ff6edc83_90_60.jpg",
                url:window.location.href,
                title:window.document.title,
                summary: "页面简介",
            })

            对应html - 用属性data-to来标志分享的目标，可选：qzone,qq,qqWeibo,sinaWeibo,renren
            <div class="share">
                <a href="javascript:void(0);" data-to="qzone">QQ空间</a>
                <a href="javascript:void(0);" data-to="qq">QQ</a>
            </div>

 * @param content 页面内容
 * @param pic 图片
 * @param url 页面url
 * @param title 页面标题
 * @param summary 页面简介
 * @param appkey appkey 分享到微博可用到
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'qrcode'], factory);
    } else {
        factory(root['jQuery']);
    }
}(this, function ($, QRCode) {

    $.fn.share = function(options) {
        return this.each(function() {
            //基础设定，如果需要可拓展
            var defualts = {};
            //配置
            var config = {
                qzone: {
                    api: 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?',
                    paramName: {
                        url: 'url',
                        title: 'title',
                        content: 'desc',
                        pic: 'pics',
                        summary: 'summary',
                        appkey: ""
                    }
                },
                qq: {
                    api: 'http://connect.qq.com/widget/shareqq/index.html?',
                    paramName: {
                        url: 'url',
                        title: 'title',
                        content: 'desc',
                        pic: 'pics',
                        summary: 'summary',
                        appkey: ""
                    }
                },
                qqWeibo: {
                    api: 'http://share.v.t.qq.com/index.php?c=share&a=index',
                    paramName: {
                        url: 'url',
                        title: "",
                        content: 'title',
                        pic: 'pic',
                        summary: "",
                        appkey: 'appkey'
                    }
                },
                sinaWeibo: {
                    api: 'http://service.weibo.com/share/share.php?',
                    paramName: {
                        url: 'url',
                        title: "",
                        content: 'title',
                        pic: 'pic',
                        summary: "",
                        appkey: 'appkey'
                    }
                },
                renren: {
                    api: 'http://widget.renren.com/dialog/share?',
                    paramName: {
                        url: 'resourceUrl',
                        title: 'title',
                        content: "",
                        pic: 'pic',
                        summary: 'description',
                        appkey: ""
                    }
                }
            };

            var opts = $.extend({}, defualts, options);
            var obj = $(this);

            var param = {
                title: opts.title,
                url: opts.url,
                content: opts.content,
                pic: opts.pic,
                summary: opts.summary,
                appkey: opts.appkey
            }

            var elm = obj.find("*[data-to]");
            for(var i=0,len=elm.length;i<len;i++){
                $(elm[i]).click(function(){
                    var to = $(this).attr("data-to");
                    createLink(to);
                })
            }  

            function createLink(to){
                //modify by willliang 添加微信分享
                if (to === 'weixin') {
                    shareWeixin();
                } else {
                    var result = config[to].api;
                    var paramArr = [];
                    for (var key in config[to].paramName) {
                        var realName = config[to].paramName[key];
                        if (realName) {
                            //result += '&' + realName + '=' + encodeURIComponent(param[key]);
                            paramArr.push(realName + '=' + encodeURIComponent(param[key]));
                        }
                    }
                    result += paramArr.join("&");
                    window.open(result);
                }
                
            }

            function shareWeixin() {
                var qrcodeHTML = '<div class="mask"></div><div class="qrcode-container"><div class="qrcode-top"></div><div class="qrcode-center"><div class="qc-center"><div id="rqcode"></div><i class="icon-font i-logo"></i></div><div class="qc-bottom">打开微信，通过点击底部“发现”按钮，“扫一扫”二维码后，点击弹出页面右上角的分享按钮，就可以分享给朋友们啦！</div></div><div class="qrcode-bottom"></div></div>';
                var div = document.createElement("div");
                div.id = "qrcodeWrap";
                div.innerHTML = qrcodeHTML;
                document.body.appendChild(div);
                var href = window.location.href
                var _showQRCode = function(){
                    new QRCode('rqcode', {
//                        text: 'http://ke.qq.com/activity/mobile/guoqing/index.html?_wv=769&t=' + Math.random(),
                        text: href + (~href.indexOf('?') ? '&' : '?') + 'from=share_wexin_code_scan',
                        width: 190,
                        height: 190,
                        colorDark: '#000000',
                        colorLight: '#ffffff',
                        correctLevel: QRCode.CorrectLevel.H
                    });
                };

                div.onclick = function(){
                    document.body.removeChild(this);
                }

                _showQRCode();
            }
            
        }); 
    };
    
}));