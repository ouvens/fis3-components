(function () {
    function isMobile() {
        return /Android|iPhone|iPod/i.test(navigator.userAgent);
    }


    var searchString = location.search || '';
    if (isMobile()) {
        var pathname = location.pathname || '';
        var mobileUrl = 'http://ke.qq.com/mobile/course.list.html?_wv=1027&_bid=167';
        if (pathname.indexOf('courseDetail') != -1) {
            var queryIndex = searchString.indexOf('?');//.match(/[&|\?]course_id=(\d+)/);
            if (queryIndex != -1) {

                mobileUrl = 'http://ke.qq.com/mobile/course.detail.html?_wv=1921&_bid=167#' + searchString.slice(queryIndex + 1);
            }
        } else if (pathname.indexOf('courseList') != -1 ) {
            var mt = searchString.match(/[&|\?]mt=(\d+)/);
            if (mt) {
                mobileUrl = mobileUrl + '#mt=' + mt[1];
            }
        }
        location = mobileUrl;
    }
}());
