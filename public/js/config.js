/*
 * @(#)config.js
 */

/*
 * Author: Jianmin Liu
 * Created: 2015/05/27
 */

'use strict';

var app = angular.module('MarkCareApp', ['ui.router', 'ui.bootstrap', 'ngTable', 'xeditable', 'common']);

app.constant('AppConfig', { 
  'urls': {
    'upload': '/api/attachment/upload',
    'download': '/api/attachment/download'
  },
  'DateFormat': 'yyyy-MM-dd',
  'TimeFormat': 'HH:mm'
});

app.config(function($stateProvider, $urlRouterProvider, $provide, $httpProvider) {
  $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
  $httpProvider.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';

  $urlRouterProvider.otherwise(function($injector, $location) {
    var url = $location.$$url;
    var $state = $injector.get('$state');
    if (url ==='' || url ==='/') {
      $state.go('search');
    } else {
      $state.go('error', {
        title: 'Page not found',
        message: 'Could not find a state associated with url "' + url + '"'
      });
    }
  });

  var addPatientState = {
    name: 'add',
    url: '/add',
    templateUrl: 'views/add-patient.html', 
    controller: 'AddPatientController',
    resolve: {
      Registry: function(PageCache, PageService) {
        var registry = PageCache.get('registry');
        if (registry)
          return registry;
        return PageService.getRegistry().then(function(response) {
          console.log(response);
          return response.data.registry;
        });
      }
    }
  };

  var searchPatientsState = {
    name: 'search',
    url: '/search',
    templateUrl: 'views/search-patients.html', 
    controller: 'SearchPatientsController',
    resolve: {
      Registry: function(PageCache, PageService) {
        var registry = PageCache.get('registry');
        if (registry)
          return registry;
        return PageService.getRegistry().then(function(response) {
          console.log(response);
          return response.data.registry;
        });
      }
    }
  };

  var uploadFileState = {
    name: 'upload',
    url: '/upload/:ssn',
    templateUrl: 'views/upload-file.html', 
    controller: 'UploadFileController',
    resolve: {
      Registry: function(PageCache, PageService) {
        var registry = PageCache.get('registry');
        if (registry)
          return registry;
        return PageService.getRegistry().then(function(response) {
          console.log(response);
          return response.data.registry;
        });
      },
      Patient: function($stateParams, PatientService) {
        return PatientService.attachments($stateParams.ssn).then(function(response) {
          console.log(response);
          return response.data.patient;
        });
      }
    }
  };

  var aboutState = {
    name: 'about',
    url: '/about',
    templateUrl: 'views/about.html', 
  };

  var errorState = {
    name: 'error',
    params: {
      title: 'Page not found',
      message: null
    },
    template: function($stateParams) {
      return '<header><p><b>{{title}}</b> - {{message}}</p></header>';
    },
    controller: function($scope, $stateParams) {
      $scope.title = $stateParams.title;
      $scope.message = $stateParams.message;
    }
  };

  $stateProvider
    .state(addPatientState)
    .state(searchPatientsState)
    .state(uploadFileState)
    .state(aboutState)
    .state(errorState);
});

app.filter('to_trusted', ['$sce', function($sce) {
  return function(text) {
    return $sce.trustAsHtml(text);
  };
}]);

// This directive is used to setup the sidebar. 
// The attribute is sidebar-setup.
app.directive('sidebarSetup', ['$timeout', function($timeout) {
  return { 
    link: function(scope, elm, attrs) {
      $timeout(scope.setupSidebar, 0);
    }
  }
}]);

// This directive is used to setup the patient form. 
// The attribute is patient-form-setup.
app.directive('patientFormSetup', ['$timeout', function($timeout) {
  return { 
    link: function(scope, elm, attrs) {
      $timeout(scope.setupPatientForm, 0);
    }
  }
}]);

// This directive is used to setup the patient editor. 
// The attribute is patient-editor-setup.
app.directive('patientEditorSetup', ['$timeout', function($timeout) {
  return { 
    link: function(scope, elm, attrs) {
      $timeout(scope.setupPatientEditor, 0);
    }
  }
}]);

// This directive is used to setup the search form. 
// The attribute is search-form-setup.
app.directive('searchFormSetup', ['$timeout', function($timeout) {
  return { 
    link: function(scope, elm, attrs) {
      $timeout(scope.setupSearchForm, 0);
    }
  }
}]);

// <patient-grid patients="patients"></patient-grid>
app.directive('patientGrid', ['$compile', '$filter', 'NgTableParams', function($compile, $filter, NgTableParams) {
  return {
    restrict: 'E',
    scope: {
      patients: '=',
      editor: '&',
      remover: '&',
      uploader: '&'
    },
    controller: function($scope) {
      $scope.contentUrl = 'templates/patient.html';

      $scope.$on('PatientUpdated', function(event, args) {
        // nothing to do
      });

      $scope.$on('PatientDeleted', function(event, ssn) {
        for (var index = 0; index < $scope.patients.length; index++)  {
          if (ssn === $scope.patients[index].ssn) {
            $scope.patients.splice(index, 1);
            break;
          }
        }
        $scope.tableParams.total($scope.patients.length);
        $scope.tableParams.reload();
      });

      $scope.tableParams = new NgTableParams({
        page: 1, // show first page
        count: 10, // count per page
        sorting: {
          ssn: 'asc' // desc - initial sorting
        }
      },{
        total: $scope.patients.length, // length of data
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

      $scope.showEditor = function(patient) {
        $scope.editor()(patient);
      };

      $scope.showRemover = function(patient) {
        $scope.remover()(patient);
      };

      $scope.gotoUploadView = function(ssn) {
        $scope.uploader()(ssn);
      };
    },
    template: '<div ng-include="contentUrl"></div>'
  };
}]);

/* end of config.js */
