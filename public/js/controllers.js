/*
 * @(#)controllers.js
 */

/*
 * Author: Jianmin Liu
 * Created: 2015/05/27
 */

app.controller('HeaderController', ['$injector', '$scope', '$http', 'PageCache', 
function($injector, $scope, $http, PageCache) {
  $injector.invoke(MyParentController, this, {
    $scope: $scope,
    $http: $http
  });

  $scope.connection = {};

  $scope.showProfile = function() {
    $scope.showModal('#profile-dialog');
  };

  $scope.showSettings = function() {
    var registry = PageCache.get('registry');
    angular.extend($scope.connection, registry.connection);
    $scope.showModal('#settings-dialog');
  };
}]);

app.controller('PersonController', ['$injector', '$scope', '$http', '$stateParams', 
'AppConfig', 'BlueButtonService', 
function($injector, $scope, $http, $stateParams, AppConfig, BlueButtonService) {
  $injector.invoke(MyParentController, this, {
    $scope: $scope,
    $http: $http
  });

  $scope.id = $stateParams.id;

  MarkCare.Util.showPageLoader();

  // Load the person.
  BlueButtonService.getPerson($scope.id).then(function(response) {
    $scope.setupJsonViewer();

    MarkCare.Util.hidePageLoader();

    if (response.data.success) {
      $scope.person = response.data.person;
    } else {
      MessageCenter.showMessage(response.data.message);
    }
  });

  $scope.setupJsonViewer = function() {
    jQuery('#json-dialog').on('show.bs.modal', function() {
      var height = jQuery(window).height() - 200;
      jQuery(this).find('.modal-body').css('max-height', height);
    });
  };

  $scope.showRecords = function() {
    $scope.showModal('#json-dialog');

    var container = document.getElementById('json-viewer');
    var value = JSON.stringify($scope.person, null, 2); 
    var codeMirrorEditor = CodeMirror(container, {
      value: value,
      indentUnit: 4,
      lineNumbers: true,
      matchBrackets: true,
      readOnly: true,
      mode: 'text/javascript'
    });
  };

  $scope.downloadRecords = function() {
    var url = AppConfig.urls.download + '/' + $scope.person.id;
    window.location = url;
  };
}]);

app.controller('HL7DataController', ['$injector', '$scope', '$http', 'BlueButtonService', 
function($injector, $scope, $http, BlueButtonService) {
  $injector.invoke(MyParentController, this, {
    $scope: $scope,
    $http: $http
  });

  var loadHL7DialogId = '#load-hl7-dialog';
  var removeHL7DialogId = '#remove-hl7-dialog';

  $scope.showLoadHL7 = function() {
    $scope.showModal(loadHL7DialogId);
  };

  $scope.showRemoveHL7 = function() {
    $scope.showModal(removeHL7DialogId);
  };

  $scope.loadHL7 = function() {
    $scope.hideModal(loadHL7DialogId);

    MarkCare.Util.showPageLoader();

    BlueButtonService.loadHL7().then(function(response) {
      MarkCare.Util.hidePageLoader();
      MessageCenter.showMessage(response.data.message);
    });
  };

  $scope.removeHL7 = function() {
    $scope.hideModal(removeHL7DialogId);

    MarkCare.Util.showPageLoader();

    BlueButtonService.removeHL7().then(function(response) {
      MarkCare.Util.hidePageLoader();
      MessageCenter.showMessage(response.data.message);
    });
  };
}]);

function showTestAttachment(node, event) {
  var link = $(node);
  var content = link.attr('data-featherlight');
  $.featherlight($(content));

  // Stops the event from bubbling up the event chain.
  event.stopPropagation();
  event.preventDefault();
}

/* end of controllers.js */
