/*
 * @(#)registry.js
 */

/*
 * Author: Jianmin Liu
 * Created: 2015/05/25
 * Description: The registry module
 */

var fs = require('fs');

exports.init = function(router, root_directory, dbconfig) {

  var file = root_directory + '/config/registry.json';
  var registry = null;

  fs.readFile(file, 'utf8', function(err, data) {
    if (err) {
      console.log('Error: ' + err);
    } else {
      registry = JSON.parse(data);
      registry.server = {
        host: dbconfig.server.host,
        port: dbconfig.server.port,
        user: dbconfig.server.user
      };
    }
  });

  router.route('/registry').get(function(req, res){
    res.json({
      success: true,
      message: res.__('OK'),
      registry: registry
    });
  });

};
