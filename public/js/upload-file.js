/*
 * @(#)upload-file.js
 */

/*
 * Author: Jianmin Liu
 * Created: 2015/05/28
 */

app.controller('UploadFileController', [
  '$injector', 
  '$scope', 
  '$http', 
  '$stateParams',
  'AppConfig',
  'Registry', 
  'Patient', 
  'PatientService',
function($injector, $scope, $http, $stateParams, AppConfig, Registry, Patient, PatientService) {
  // Use the $injector to pull in parent definitions.
  $injector.invoke(MyParentController, this, {
    $scope: $scope,
    $http: $http
  });

  MessageCenter.clearMessage();

  var ssn = $stateParams.ssn;

  $scope.registry = Registry;
  $scope.patient = Patient;

  $scope.logo = {};
  $scope.logo.pathname = '';
  $scope.logo.filename = $scope.ui.no_file_chosen;
  $scope.logo.show_upload_button = false;

  $scope.upload_action = AppConfig.urls.upload;

  $scope.onFileSelected = function(pathname) {
    MessageCenter.clearMessage();

    $scope.logo.pathname = pathname;
    $scope.logo.filename = getInputFilename(pathname);
    $scope.logo.show_upload_button = true;
  };

  $scope.uploadFile = function() {
    jQuery('#file-form').ajaxForm({
      beforeSerialize: function($form, options) {
        if ($scope.logo.filename == '') {
          MessageCenter.showMessage($scope.ui.please_select_file);
          return false; // cancel submit
        }
      },
      dataType: 'json',
      uploadProgress: function(event, position, total, percentComplete) {
        var percentVal = 'Upload in progress ' + percentComplete + '%';
        MessageCenter.showMessage(percentVal);
      },
      success: function(data) {
        MessageCenter.showMessage(data.message);
        if (data.success) {
          $scope.patient.attachments.push(data.attachment);

          $scope.logo.pathname = '';
          $scope.logo.filename = $scope.ui.no_file_chosen;
          $scope.logo.show_upload_button = false;

          $scope.$apply();
        }
      },
      error: function(xhr, textStatus, errorThrown) {
        MessageCenter.showMessage(textStatus + ': ' + errorThrown);
      }
    });
  };

  $scope.downloadFile = function(filename) {
    var url = AppConfig.urls.download + '/' + $scope.patient.ssn + '/' + encodeURIComponent(filename);

    // You can't download file through Ajax.
    window.location = url;
  };

  $scope.deleteFile = function(filename) {
    PatientService.deleteAttachment($scope.patient.ssn, filename).then(function(response) {
      MessageCenter.showMessage(response.data.message);

      if (response.data.success) {
        var attachments = $scope.patient.attachments;
        for (var index = 0; index < attachments.length; index++) {
          if (response.data.attachment.name === attachments[index].name) {
            attachments.splice(index, 1);
            break;
          }
        }
      }
    });
  };

  $scope.formatFileSize = function(size) {
    return bytesToSize(size);
  };

}]);

function onFileSelected(node, pathname) {
  // Here is a way to call controller's function
  var scope = angular.element(jQuery(node)).scope();

  scope.onFileSelected(pathname);

  // Apply the changes 
  scope.$apply();
}

/* end of upload-file.js */
