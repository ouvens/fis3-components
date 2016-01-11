;(function(root, factory){
    if(typeof define === 'function' && define.amd){
        define(['qrcode','html'], factory);
    }else{
        root["share"] = factory(root['QRCode']);
    }
})(this, function(QRCode){
		var W = window;
		return {
			x: W.screen.width,
            y: W.screen.height,
            twb: function(title, pic, url, summary, desc) {
                var siteUrl = "http://share.v.t.qq.com/index.php",
                appkey = encodeURI("3eef3dc2a3254c5cb5b2506bc8f9765f"),
                site = siteUrl + "?c=share&a=index&f=q2&url=" + encodeURIComponent(url) + "&appkey=" + appkey + "&title=" + title + "&pic=" + encodeURIComponent(pic);
                W.open(site, "twb", "height=600,width=708,top=100,left=200,toolbar=no,menubar=no,resizable=yes,location=yes,status=no");
            },
            weibo: function(title, pic, url, summary, desc) {
	            title = desc;
	            title = title.replace(/#/g, '%23');
                var siteUrl = "http://service.weibo.com/share/share.php",
                appkey = "",
                site = siteUrl + "?url=" + encodeURIComponent(url) + "&appkey=" + appkey + "&title=" + html.decode(title) + "&pic=" + encodeURIComponent(pic);
                W.open(site, "sina", "height=600,width=708,top=100,left=200,toolbar=no,menubar=no,resizable=yes,location=yes,status=no");
            },
            qzone: function(title, pic, url, summary, desc) {
                var siteUrl = "http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey",
                summary = summary || "";
                site = siteUrl + "?to=qzone&url=" + encodeURIComponent(url) + "&title=" + encodeURIComponent(title) + "&desc=" + encodeURIComponent(desc) + "&pics=" + encodeURIComponent(pic) + "&summary=" + encodeURIComponent(summary);
                W.open(site, "qzone", "height=540, width=580, top="+(this.y-540)/2 + ", left=" + (this.x-580)/2 + ", toolbar=no, menubar=no, resizable=yes, location=yes,status=no" );
            },
            qq: function(title, pic, url, summary, desc){
                var siteUrl = "http://connect.qq.com/widget/shareqq/index.html";
                site = siteUrl + "?title=" + encodeURIComponent(title) +"&summary=" + encodeURIComponent(summary) +"&url=" + encodeURIComponent(url) + "&width=32&height=32&desc=" + encodeURIComponent(desc) +"&pics=" + encodeURIComponent(pic);
                W.open(site, "qq", "height=600, width=780, top="+(this.y-600)/2 + ", left=" + (this.x-780)/2 + ", toolbar=no, menubar=no, resizable=yes, location=yes,status=no" );
            }
            ,
            weixin: function(){
                var qrcodeHTML = '<div class="mask"></div><div class="qrcode-container"><div class="qrcode-top"></div><div class="qrcode-center"><div class="qc-center"><div id="rqcode"></div><i class="icon-font i-logo"></i></div><div class="qc-bottom">打开微信，通过点击底部“发现”按钮，“扫一扫”二维码即可将网页分享给朋友。</div></div><div class="qrcode-bottom"></div></div>';
                var div = document.createElement("div");
                div.id = "qrcodeWrap";
                div.innerHTML = qrcodeHTML;
                document.body.appendChild(div);
                var _showQRCode = function(){
                    new QRCode('rqcode', {
//                        text: 'http://ke.qq.com/activity/mobile/guoqing/index.html?_wv=769&t=' + Math.random(),
                        text: window.location.href,
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
		};
})