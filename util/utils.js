/*
 * @(#)utils.js
 */

/*
 * Author: Jianmin Liu
 * Created: 2015/05/25
 * Description: The utils module
 */

var crypto = require('crypto');
var path = require('path');
var moment = require('moment');

var utils = {

  formatDatetime: function(s) {
    // For consistent results parsing anything other
    // than ISO 8601 strings, use String + Format.
    // Unless you specify a timezone offset, parsing 
    // a string will create a date in the current 
    // timezone.
    var m = moment(s, 'YYYY-MM-DD HH:mm'); // YYYY-MM-DD HH:mm a Z

    // Returns a Date object
    return m.toDate();
  },

  hashPassword: function(pwd) {
    return crypto.createHash('sha256').update(pwd).digest('base64').toString();
  },

  getContentType: function(fileName) {
    var ext = path.extname(fileName);
    var contentType = 'text/plain';

    if (ext === '.png') {
      contentType = 'image/png';
    } else if (ext === '.gif') {
      contentType = 'image/gif';
    } else {
      contentType = 'image/jpeg';
    }

    return contentType;
  }
}

module.exports = utils;
