//当前的DB
(function (root, factory) {

    if (typeof define === 'function' && define.amd) {
        define(['db'], factory);
    } else {
        root['DB'] = factory(root['DB']);
    }
} (this, function (DB) {
    DB.extend( {
        checkPayState: DB.httpMethod({url: '/cgi-bin/paycheck', noNeedLogin: true}),
        getPayToken: DB.httpMethod({url: '/cgi-bin/paytoken', noNeedLogin: true}),
        getPayTokenWeixin: DB.httpMethod({url: '/cgi-bin/paytoken_m', noNeedLogin: true}),
        getApplyInfo: DB.httpMethod({url: '/cgi-bin/tool/get_user_apply_info'}),
        setApplyInfo: DB.httpMethod({url: '/cgi-bin/tool/set_user_apply_info', type: 'POST'}),
        applyFree: DB.httpMethod({url: '/cgi-bin/apply_course_sect', type: 'POST', noNeedLogin: true}),
        payConfirm: DB.httpMethod({url: '/cgi-bin/payConfirm', type: 'POST'}),
        checkTimeConflict: DB.httpMethod({url: '/cgi-bin/tool/check_apply_time_conflict', type: 'POST', noNeedLogin: true}),
        notifyStatus: DB.httpMethod({ url: '/cgi-bin/tool/user_notify_status', type: 'POST'}),
        remindTime: DB.httpMethod({ url: '/cgi-bin/passcard/remind', type: 'POST'}),
        receiveSend: DB.httpMethod({ url: '/cgi-bin/user/accept_course', type: 'POST'}),
        reserve: DB.httpMethod({url: '/cgi-bin/reserve_course_sect', type: 'POST'})
    });

    return DB;
}));