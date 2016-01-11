
window.TRecord = (function(){
    var cfg = {url: ''}, speedPoints = {};
    return {
        cfg: cfg,
        push: function (point, time) {
            speedPoints[point] = time || (new Date -0);
        },
        getCachedData: function () {
            return {
                cfg: cfg,
                speedPoints: speedPoints
            }
        }
    }
})();
TRecord.push("page_css_ready");//顺序执行 css加载完才会执行此处脚本
