'use strict';

angular.module('bsis')
  .controller('ConfirmModalCtrl', function($scope, $uibModalInstance, $sce, confirmObject) {

    $scope.confirmObject = confirmObject;

    $scope.confirmed = function() {
      $uibModalInstance.close();
    };

    $scope.cancelled = function() {
      $uibModalInstance.dismiss('cancel');
    };

    //No user input data should be shown using this function as this is unsafe
    $scope.renderHtml = function(htmlCode) {
      return $sce.trustAsHtml(htmlCode);
    };

  });