// get qq client status after
;(function (root, factory) {
    
    if (typeof define === 'function' && define.amd) {
        define(['db'], factory);
    } else {
        root['DB'] = factory(root['DB']);
    }
} (this, function (DB) {

    DB.extend( {
        getClientStatus: DB.httpMethod({url: '/cgi-bin/tool/get_status', type:'GET'})// get QQ client status after
    });

    return DB;

}));