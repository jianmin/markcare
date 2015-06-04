/*
 * @(#)main.js
 */

/*
 * Author: Jianmin Liu
 * Created: 2015/05/26
 */

// This is the root controller.
app.controller('MainController', [
  '$injector', 
  '$scope', 
  '$http', 
  '$filter',
  'AppConfig',
  'PageCache', 
  'PageService', 
  'PatientService',
  'UserService', 
function($injector, $scope, $http, $filter, AppConfig, PageCache, PageService, PatientService, UserService) {
  // Use the $injector to pull in parent definitions.
  $injector.invoke(MyParentController, this, {
    $scope: $scope,
    $http: $http
  });

  $scope.page = {};
  $scope.registry = {};
  $scope.user = {};
  $scope.user.id = getUsername();

  // The project selected for update or delete.
  $scope.patient = {};

  $scope.documents = []; 

  var editPatientDialogId = '#edit-patient-dialog';
  var editPatientFormId = '#edit-patient-form';
  var deletePatientDialogId = '#delete-patient-dialog';

  this.init = function() {
    MarkCare.Util.showPageLoader();

    PageService.getTranslation().then(function(response) {
      if (response.data.success) {
        $scope.page.success = response.data.success;
        $scope.ui = response.data.ui;

        PageService.getRegistry().then(function(response) {
          MarkCare.Util.hidePageLoader();

          if (response.data.success) {
            PageCache.put('registry', response.data.registry);
            angular.extend($scope.registry, response.data.registry);

            UserService.get($scope.user.id).then(function(response) {
              if (response.data.success) {
                angular.extend($scope.user, response.data.user);
              } else {
                MarkCare.Util.gotoErrorPage();
              }
            });
          } else {
            MarkCare.Util.gotoErrorPage();
          }
        });
      } else {
        MarkCare.Util.gotoErrorPage();
      }
    });
  };

  $scope.setPatient = function(patient) {
    angular.extend($scope.patient, patient);

    for (var i = 0; i < $scope.registry.genders.length; i++) {
      var gender = $scope.registry.genders[i];
      if (gender.id === $scope.patient.gender) {
        $scope.patient.gender_model = gender;
        break;
      }
    }

    $scope.preparePatientDocuments();
  };

  $scope.updatePatient = function() {
    jQuery(editPatientFormId).parsley().validate();

    if (true === jQuery(editPatientFormId).parsley().isValid()) {
      var params = jQuery(editPatientFormId).serialize();
      //var documents = $scope.serializePatientDocuments();
      //params += '&documents=' + encodeURIComponent(documents);

      PatientService.update(params).then(function(response) {
        MessageCenter.showMessage(response.data.message);

        if (response.data.success) {
          $scope.hideModal(editPatientDialogId);
          // Notify the child controllers
          $scope.$broadcast('PatientUpdated', response.data.patient);
        }
      });
    }
  };

  $scope.deletePatient = function() {
    PatientService.delete($scope.patient.ssn).then(function(response) {
      $scope.hideModal(deletePatientDialogId);
      MessageCenter.showMessage(response.data.message);

      if (response.data.success) {
        // Notify the child controllers
        $scope.$broadcast('PatientDeleted', $scope.patient.ssn);
      }
    });
  };

  $scope.setupPatientEditor = function() {
    jQuery('.modal-wide').on('show.bs.modal', function() {
      var height = jQuery(window).height() - 200;
      jQuery(this).find('.modal-body').css('max-height', height);
    });

    jQuery(editPatientFormId).parsley();
  };

  $scope.showPatientEditor = function(patient) {
    if (patient) {
      $scope.patient.ssn = patient.ssn;
    }

    PatientService.get($scope.patient.ssn).then(function(response) {
      if (response.data.success) {
        $scope.setPatient(response.data.patient);

        $scope.showModal(editPatientDialogId);
      } else {
        MessageCenter.showMessage(response.data.message);
      }
    });
  };

  $scope.showPatientRemover = function(patient) {
    if (patient) {
      $scope.patient.ssn = patient.ssn;
    }

    $scope.showModal(deletePatientDialogId);
  };

  $scope.gotoUploadView = function(ssn) {
    var $state = $injector.get('$state');
    $state.go('upload', {ssn: ssn});
  };

  $scope.accordion = function(nodeId) {
    toggleAccordion(nodeId);
  };

  $scope.setupSidebar = function() {
    resizeSidebar();
    jQuery('#projects-menu').metisMenu({toggle: false});
  };

  $scope.preparePatientDocuments = function() {
    $scope.documents.length = 0;

    if ($scope.patient.documents) {
      $scope.documents = angular.fromJson($scope.patient.documents);
    }
  };

  $scope.serializePatientDocuments = function() {
    if ($scope.documents.length > 0) {
      var values = [];
      $scope.documents.forEach(function(value) {
        if (value.name != '' && value.description != '') {
          values.push(value);
        }
      });

      if (values.length > 0) {
        return angular.toJson(values);
      }
    }
    return '';
  };

  $scope.validatePatientDocumentName = function(data) {
    // This value is undefined when it is empty
    if (!data) {
      return 'Name cannot be empty.';
    }
  };

  $scope.validatePatientDocumentDescription = function(data) {
    // This value is undefined when it is empty
    if (!data) {
      return 'Description cannot be empty.';
    }
  };

  $scope.savePatientDocument = function(data) {
    // nothing to do
  };

  // Delete patient document
  $scope.deletePatientDocument = function(index) {
    $scope.documents.splice(index, 1);
  };

  // Add patient document
  $scope.addPatientDocument = function() {
    $scope.inserted = {
      name: '',
      description: ''
    };
    $scope.documents.push($scope.inserted);
  };

  $scope.onDatetimeSet = function(newDate) {
    //console.log($filter('date')(newDate, 'yyyy-MM-dd HH:mm a Z'));
  };

  $scope.getDatetime = function(d) {
    if (d)
      return $filter('date')(d, AppConfig.DateFormat);
    else 
      return '';
  };

  $scope.formatDatetime = function(s) {
    // 1975-05-01T00:00:00.000Z
    return MarkCare.Util.formatDatetime(s, 'YYYY-MM-DD HH:mm A Z');
  };

  // Kick off
  this.init();
}]);

app.controller('ProjectDatepickerController', ['$scope', 'AppConfig', function($scope, AppConfig) {
  $scope.open = function($event) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope.opened = true;
  };

  $scope.dateOptions = {
    formatYear: 'yyyy',
    startingDay: 0
  };

  $scope.dateFormat = AppConfig.DateFormat;
}]);

/* end of main.js */
