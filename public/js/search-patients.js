/*
 * @(#)search-patients.js
 */

/*
 * Author: Jianmin Liu
 * Created: 2015/05/27
 */

app.controller('SearchPatientsController', [
  '$injector', 
  '$scope', 
  '$http', 
  '$filter', 
  'NgTableParams', 
  'Registry',
  'PatientService',  
function($injector, $scope, $http, $filter, NgTableParams, Registry, PatientService) {
  // Use the $injector to pull in parent definitions.
  $injector.invoke(MyParentController, this, {
    $scope: $scope,
    $http: $http
  });

  $scope.registry = Registry;

  // This array keeps the search results
  $scope.patients = [];

  $scope.q = '';

  this.init = function() {
    //this.createTable();
  };

  this.createTable = function() {
    $scope.tableParams = new NgTableParams({
      page: 1, // show first page
      count: 10, // count per page
      sorting: {
        ssn: 'asc' // desc - initial sorting
      }
    }, {
      total: $scope.patients.length, // Defines the total number of items for the table
      getData: function($defer, params) {
        var orderedData = params.sorting() ? 
            $filter('orderBy')($scope.patients, $scope.tableParams.orderBy()) : $scope.patients;

        orderedData = params.filter() ? 
            $filter('filter')(orderedData, params.filter()) : orderedData;

        // Set total for recalc pagination
        params.total(orderedData.length);

        $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
      }
    });
  };

  $scope.search = function() {
    if ($scope.q) {
      var params = 'q=' + encodeURIComponent($scope.q);

      MarkCare.Util.showPageLoader();

      PatientService.search(params).then(function(response) {
        MarkCare.Util.hidePageLoader();

        $scope.patients.length = 0;

        if (response.data.success) {
          angular.extend($scope.patients, response.data.patients);
          $scope.$broadcast('SearchResults', response.data.patients);
        } else {
          MessageCenter.showMessage(response.data.message);
        }

        //$scope.tableParams.total($scope.patients.length);
        //$scope.tableParams.reload();
      });
    } else {
      jQuery('#q').focus();
      MessageCenter.showMessage('Please enter search keywords');
    }
  };

  $scope.setupSearchForm = function() {
  };

  $scope.$on('PatientUpdated', function(event, args) {
    $scope.search();
  });

  $scope.$on('PatientDeleted', function(event, args) {
    $scope.search();
  });

  // Kick off
  this.init();
}]);

/* end of search-patients.js */
