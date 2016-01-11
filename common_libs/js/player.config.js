/**
 * @fileoverview video：video 配置模块
 * @author donaldyang
 */
define(function() {
    return {
        width: 727,
        height: 527,
        vodFlashUrl: 'http://imgcache.qq.com/tencentvideo_v1/player/TPout.swf?playertype=11', // 播放器地址
        autoplay: true,
        loadingswf: 'http://imgcache.qq.com/minivideo_v1/vd/res/skins/ke_loading.swf',
        flashWmode: 'opaque',
        vodFlashExtVars: {
            showend: 0, // 功能同上面的isVodFlashShowEnd，强制指定是否显示播放结束界面 0为不显示 1为显示，默认为显示
            searchbar: 0, // 是否显示顶部搜索框；1显示，0不显示，默认为1
            searchpanel: 0 // 是否显示包含搜索、分享等的浮层。0：不显示，1：显示，默认为显示。建议设置搜索框不显示时，结束推荐（showend）也设置不显示
        }
    };
});