'use strict';

angular.module('bsis').controller('ManageTransfusionReactionTypeCtrl', function($scope, $location, $log, $timeout, $routeParams, TransfusionReactionTypesService) {

  $scope.transfusionReactionType = {
    isDeleted: false,
    name: '',
    description: ''
  };

  $scope.cancel = function() {
    $location.path('/transfusionReactionTypes');
  };

  $scope.$watch('transfusionReactionType.name', function() {
    $timeout(function() {
      $scope.transfusionReactionTypeForm.name.$setValidity('duplicate', true);
    });
  });

  function onSaveError(err) {
    if (err.data && err.data.name) {
      $scope.transfusionReactionTypeForm.name.$setValidity('duplicate', false);
    }
    $scope.savingTransfusionReactionType = false;
  }

  $scope.saveTransfusionReactionType = function() {

    if ($scope.transfusionReactionTypeForm.$invalid) {
      return;
    }

    $scope.savingTransfusionReactionType = true;

    if ($routeParams.id) {
      TransfusionReactionTypesService.updateTransfusionReactionType($scope.transfusionReactionType, function() {
        $location.path('/transfusionReactionTypes');
      }, function(response) {
        onSaveError(response);
      });
    } else {
      TransfusionReactionTypesService.createTransfusionReactionType($scope.transfusionReactionType, function() {
        $location.path('/transfusionReactionTypes');
      }, function(response) {
        onSaveError(response);
      });
    }
  };

  function init() {
    if ($routeParams.id) {
      TransfusionReactionTypesService.getTransfusionReactionTypeById({id: $routeParams.id}, function(response) {
        $scope.transfusionReactionType = response.transfusionReactionType;
      }, $log.error);
    }
  }

  init();
});
