
var localAjax = require('localAjax');
var testModTpl = require('./index.tpl');

module.exports = {
    init:  function() {
        // alert();
        $('body').append(testModTpl({word: 'MMMMM'}));
        console.log(+new Date());
    }
}
