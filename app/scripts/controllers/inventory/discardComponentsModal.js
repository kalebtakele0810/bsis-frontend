'use strict';

angular.module('bsis').controller('DiscardComponentsModalCtrl', function($scope, $uibModalInstance, $log, componentIds, returnFormId, ComponentService) {

  $scope.discard = {};
  $scope.discardReasons = [];
  $scope.discardingComponent = false;
  var discardForm = {};

  function init() {
    ComponentService.getDiscardForm(function(response) {
      $scope.discardReasons = response.discardReasons;
      discardForm = response.discardComponentsForm;
    }, $log.error);
  }

  $scope.close = function() {
    // The form is set to valid because the modal doesn't handle the form errors correctly, and the page crashes if there's form errors.
    // We suspect it's a version issue. In the meantime we implemented this solution.
    $scope.discardComponentsForm.discardReason.$setValidity('required', true);
    $uibModalInstance.dismiss();
  };

  $scope.discardComponents = function() {
    if ($scope.discardComponentsForm.$invalid) {
      return;
    }
    $scope.discardingComponent = true;

    // Populate discardForm
    discardForm.componentIds = componentIds;
    discardForm.discardReason = $scope.discard.discardReason;
    discardForm.discardReasonText = $scope.discard.discardReasonText;

    ComponentService.discard({}, discardForm, function() {
      $scope.discardingComponent = false;
      $uibModalInstance.close();
    }, function(err) {
      $log.error(err);
      $scope.discardingComponent = false;
    });
  };

  init();

});