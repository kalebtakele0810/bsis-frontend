'use strict';

angular.module('bsis').controller('ManageComponentTypeCtrl', function($scope, $location, $log, $timeout, $routeParams, ComponentTypesService) {

  $scope.componentType = {
    isDeleted: false,
    canBeIssued: false,
    containsPlasma: false
  };

  $scope.componentTypeForm = {};

  $scope.$watch('componentType.componentTypeCode', function() {
    $timeout(function() {
      $scope.componentTypeForm.componentTypeCode.$setValidity('duplicate', true);
    });
  });

  $scope.$watch('componentType.componentTypeName', function() {
    $timeout(function() {
      $scope.componentTypeForm.componentTypeName.$setValidity('duplicate', true);
    });
  });

  function onSaveError(err) {
    if (err.data && err.data.componentTypeCode) {
      $scope.componentTypeForm.componentTypeCode.$setValidity('duplicate', false);
    }
    if (err.data && err.data.componentTypeName) {
      $scope.componentTypeForm.componentTypeName.$setValidity('duplicate', false);
    }
    $scope.savingComponentType = false;
  }

  $scope.cancel = function() {
    $location.path('/componentTypes');
  };

  $scope.saveComponentType = function() {
    if ($scope.componentTypeForm.$invalid) {
      return;
    }

    $scope.savingComponentType = true;

    if ($routeParams.id) {
      ComponentTypesService.updateComponentType($scope.componentType, function() {
        $location.path('/componentTypes');
      }, function(response) {
        onSaveError(response);
      });
    } else {
      ComponentTypesService.createComponentType($scope.componentType, function() {
        $location.path('/componentTypes');
      }, function(response) {
        onSaveError(response);
      });
    }
  };

  function init() {
    if ($routeParams.id) {
      ComponentTypesService.getComponentTypeById({id: $routeParams.id}, function(response) {
        $scope.componentType = response.componentType;
      }, $log.error);
    }
  }

  init();

});
