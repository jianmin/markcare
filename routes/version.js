/*
 * @(#)version.js
 */

/*
 * Author: Jianmin Liu
 * Created: 2015/05/25
 * Description: The version module
 */

var moment = require('moment');

module.exports = function(router) {

  var date = moment.utc();
  var version = {
    name: 'MarkCare',
    version: '1.0.0'
  };

  router.route('/version').get(function(req, res) {
    res.json(version);
  });
};

