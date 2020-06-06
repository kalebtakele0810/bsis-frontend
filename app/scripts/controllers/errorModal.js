'use strict';

angular.module('bsis')
  .controller('ErrorModalCtrl', function($scope, $uibModalInstance, $sce, errorObject) {

    $scope.errorObject = errorObject;

    $scope.close = function() {
      $uibModalInstance.close();
    };

    //No user input data should be shown using this function as this is unsafe
    $scope.renderHtml = function(htmlCode) {
      return $sce.trustAsHtml(htmlCode);
    };

  });