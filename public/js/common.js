/*
 * @(#)common.js
 */

/*
 * Author: Jianmin Liu
 * Created: 2015/05/27
 */

// Create the common module. This module is imported by all
// modules to access common services.
angular.module('common', []).service('PageService', ['$http', '$q', 'PageCache', function($http, $q, PageCache) {
  this.getTranslation = function() {
    return this.get('/api/translation');
  };

  this.getRegistry = function() {
    return this.get('/api/registry');
  };

  this.get = function(url) {
    return $http.get(url);
  };

  this.post = function(url, data) {
    return $http.post(url, data);
  };

  this.put = function(url, data) {
    return $http.put(url, data);
  };

  this.delete = function(url) {
    return $http.delete(url);
  };

}]).factory('PageCache', ['$cacheFactory', function($cacheFactory) { 
  return $cacheFactory('PageCache');
}]).factory('PageFactory', ['$http', '$q', function($http, $q) {
  var registry = {};
  var service = {};

  service.setRegistry = function(value) {
    registry = value;
  }

  service.getRegistry = function() {
    return registry;
  }

  return service;
}]).provider('PageProvider', function() {
  // Only the next two lines are available in the app.config()
  this.applicationName = '';
  this.applicationProvider = '';

  this.$get = function() {
    var that = this;
    return {
      getApplicationName: function() {
        return that.applicationName;
      },
      applicationProvider: that.applicationProvider
    }
  }
}).config(['PageProviderProvider', function(PageProviderProvider) {
  // Only providers and constants can be injected into 
  // configuration blocks.
  PageProviderProvider.applicationName = 'MarkCare';
  PageProviderProvider.applicationProvider = 'MarkLogic';
}]).run(function($rootScope, $location) {
  $(document.body).show();
});

/* end of common.js */
