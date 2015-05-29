/*
 * @(#)add-patient.js
 */

/*
 * Author: Jianmin Liu
 * Created: 2015/05/27
 */

window.ParsleyConfig = {
  errorsWrapper: '<div></div>',
  errorTemplate: '<span class="help-inline"></span>'
};

app.controller('AddPatientController', [
  '$injector', 
  '$scope', 
  '$http', 
  '$filter', 
  'Registry',
  'PatientService', 
function($injector, $scope, $http, $filter, Registry, PatientService) {
  // Use the $injector to pull in parent definitions.
  $injector.invoke(MyParentController, this, {
    $scope: $scope,
    $http: $http
  });

  $scope.registry = Registry;

  // The new patient to be added
  $scope.patient = {};

  $scope.patient.first_name = 'Jianmin';
  $scope.patient.last_name = 'Liu';
  $scope.patient.ssn = '123456789';

  $scope.patient.created_by = $scope.user.user_name;

  var newPatientFormId = '#new-patient-form';

  this.init = function() {
    $scope.patient.gender_model = $scope.registry.genders[0];
    $scope.documents.length = 0;
  };

  $scope.addPatient = function() {
    jQuery(newPatientFormId).parsley().validate();
    if (true === jQuery(newPatientFormId).parsley().isValid()) {
      var params = jQuery(newPatientFormId).serialize();
      //var documents = $scope.serializePatientDocuments();
      //params += '&documents=' + encodeURIComponent(documents);

      MarkCare.Util.showPageLoader();

      PatientService.add(params).then(function(response) {
        MarkCare.Util.hidePageLoader();

        if (response.data.success) {
          $scope.gotoUploadView($scope.patient.ssn);
        } else {
          MessageCenter.showMessage(response.data.message);
        }
      });
    }
  };

  $scope.setupPatientForm = function() {
    jQuery(newPatientFormId).parsley();
  };

  $scope.displaySSNDialog = function() {
    $scope.showModal('#ssn-dialog');
  };

  // Kick off
  this.init();
}]);

/* end of add-patient.js */
