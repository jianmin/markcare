/*
 * @(#)controllers.js
 */

/*
 * Author: Jianmin Liu
 * Created: 2015/05/27
 */

app.controller('HeaderController', ['$injector', '$scope', '$http', 'PageCache', 
function($injector, $scope, $http, PageCache) {
  // Use the $injector to pull in parent definitions.
  $injector.invoke(MyParentController, this, {
    $scope: $scope,
    $http: $http
  });

  $scope.server = {};

  this.init = function() {
  };

  $scope.showProfile = function() {
    $scope.showModal('#profile-dialog');
  };

  $scope.showSettings = function() {
    var registry = PageCache.get('registry');
    angular.extend($scope.server, registry.server);
    $scope.showModal('#settings-dialog');
  };

  // Kick off
  this.init();
}]);

/* end of controllers.js */
