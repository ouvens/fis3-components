var views = require('co-views');

module.exports = views(__dirname + '/../pages', {
  map: {html: 'swig'}
});
