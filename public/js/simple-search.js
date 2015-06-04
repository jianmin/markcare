/*
 * @(#)simple-search.js
 */

/*
 * Author: Jianmin Liu
 * Created: 2015/05/29
 */

app.controller('SimpleSearchController', [
  '$injector', 
  '$scope', 
  '$http', 
  '$filter', 
  '$location',
  'AppConfig',
  'PageCache', 
  'Registry',
  'BlueButtonService',  
function($injector, $scope, $http, $filter, $location, AppConfig, PageCache, Registry, BlueButtonService) {
  $injector.invoke(MyParentController, this, {
    $scope: $scope,
    $http: $http
  });

  $scope.registry = Registry;
  $scope.q = '';
  $scope.cloned_persons = null;
  $scope.persons = [];

  this.init = function() {
    var q = PageCache.get('q');
    if (q) {
      $scope.q = q;
    }

    var persons = PageCache.get('persons');
    if (persons) {
      $scope.persons.length = 0;
      angular.extend($scope.persons, persons);

      $scope.cloned_persons = persons;
    }
  };

  // Add "current" class to a tab depending on current template or url.
  $scope.isCurrent = function(route) {
    route = "/" + route;
    return $location.path().indexOf(route) != -1;
  };

  $scope.setGenderFilter = function(gender) {
    if (gender) {
      var search = { gender: gender }; 
      $scope.persons = $filter('filter')($scope.cloned_persons, search, true);
    } else {
      $scope.persons = $scope.cloned_persons;
    }
  };

  $scope.performSearch = function() {
    PageCache.put('q', $scope.q);

    if ($scope.q) {
      var params = 'q=' + encodeURIComponent($scope.q);

      MarkCare.Util.showPageLoader();

      BlueButtonService.performSimpleSearch(params).then(function(response) {
        MarkCare.Util.hidePageLoader();

        if (response.data.success) {
          $scope.persons = response.data.persons;
          $scope.cloned_persons = response.data.persons;

          PageCache.put('persons', response.data.persons);
        } else {
          MessageCenter.showMessage(response.data.message);
        }
      });
    } else {
      $scope.persons = [];
      $scope.cloned_persons = [];
      PageCache.put('persons', []);

      jQuery('#q').focus();
      MessageCenter.showMessage('Please enter search keywords');
    }
  };

  this.init();
}]);

function filterSearchInput(event, node) {
  if (event.keyCode === 13) {
    var scope = angular.element(jQuery(node)).scope();

    scope.performSearch();

    // Apply the changes 
    scope.$apply();

    // Stops the event from bubbling up the event chain.
    event.stopPropagation();
    event.preventDefault();
  }
}

/* end of simple-search.js */
