'use strict';

angular.module('bsis').controller('ManageComponentTypeCombinationCtrl', function($scope, $location, $log, $timeout, $routeParams, ComponentTypeCombinationsService) {
  $scope.componentTypeCombination = {
    combinationName: '',
    sourceComponentTypes: [],
    componentTypes: [],
    isDeleted: false
  };

  $scope.userSelection = {
    selectedSourceComponentIndex: null,
    selectedSourceComponentList: [],
    selectedProducedComponentIndex: null,
    selectedProducedComponentList: []
  };

  $scope.componentCombinationForm = {};

  $scope.$watch('componentTypeCombination.combinationName', function() {
    $timeout(function() {
      $scope.componentCombinationForm.componentCombinationName.$setValidity('duplicate', true);
    });
  });

  function onSaveError(err) {
    if (err.data && err.data.combinationName) {
      $scope.componentCombinationForm.componentCombinationName.$setValidity('duplicate', false);
    }
    $scope.savingComponentCombination = false;
  }

  var validateComponentLists = function() {
    // Validate source component list
    if ($scope.componentTypeCombination.sourceComponentTypes.length == 0) {
      $scope.componentCombinationForm.sourceComponentList.$setValidity('required', false);
    } else {
      $scope.componentCombinationForm.sourceComponentList.$setValidity('required', true);
    }

    // Validate produced component list
    if ($scope.componentTypeCombination.componentTypes.length == 0) {
      $scope.componentCombinationForm.producedComponentList.$setValidity('required', false);
    } else {
      $scope.componentCombinationForm.producedComponentList.$setValidity('required', true);
    }
  };

  $scope.cancel = function() {
    $location.path('/componentTypeCombinations');
  };

  $scope.addSourceComponent = function() {
    $scope.componentTypeCombination.sourceComponentTypes.push(
      $scope.sourceComponentTypesDropDown[$scope.userSelection.selectedSourceComponentIndex]
    );
    $scope.sourceComponentTypesDropDown[$scope.userSelection.selectedSourceComponentIndex].disabled = true;
    $scope.userSelection.selectedSourceComponentIndex = null;
    validateComponentLists();
  };

  $scope.addUnit = function() {
    $scope.componentTypeCombination.componentTypes.push(
      $scope.producedComponentTypesDropDown[$scope.userSelection.selectedProducedComponentIndex]
    );
    $scope.userSelection.selectedProducedComponentIndex = null;
    validateComponentLists();
  };

  $scope.removeSourceComponent = function() {
    $scope.userSelection.selectedSourceComponentList.reverse();

    var toRemove = $scope.componentTypeCombination.sourceComponentTypes.filter(function(componentType, index) {
      return $scope.userSelection.selectedSourceComponentList.indexOf(String(index)) > -1;
    });

    toRemove.forEach(function(componentType) {
      // Remove the component type from the list of source components
      $scope.componentTypeCombination.sourceComponentTypes.splice(
        $scope.componentTypeCombination.sourceComponentTypes.indexOf(componentType),
        1);

      // Re-enable the component in the list of selectable source components
      componentType.disabled = false;
    });

    // Reset selection
    $scope.userSelection.selectedSourceComponentList = [];
    validateComponentLists();
  };

  $scope.removeProducedComponent = function() {
    $scope.userSelection.selectedProducedComponentList.reverse();

    $scope.userSelection.selectedProducedComponentList.forEach(function(indexToRemove) {
      $scope.componentTypeCombination.componentTypes.splice(indexToRemove, 1);
    });

    $scope.userSelection.selectedProducedComponentList = [];
    validateComponentLists();
  };

  $scope.saveComponentCombination = function() {
    validateComponentLists();

    if ($scope.componentCombinationForm.$invalid) {
      return;
    }
    $scope.savingComponentCombination = true;
    // Remove disabled element out of source and produced componentType lists as it is not part of the request
    angular.forEach($scope.componentTypeCombination.sourceComponentTypes, function(sourceType) {
      delete sourceType.disabled;
    });
    angular.forEach($scope.componentTypeCombination.componentTypes, function(producedType) {
      delete producedType.disabled;
    });

    if ($routeParams.id) {
      ComponentTypeCombinationsService.updateComponentTypeCombinations($scope.componentTypeCombination, function() {
        $location.path('/componentTypeCombinations');
      }, function(response) {
        $scope.savingComponentCombination = false;
        onSaveError(response);
      });
    } else {
      ComponentTypeCombinationsService.createComponentTypeCombinations($scope.componentTypeCombination, function() {
        $location.path('/componentTypeCombinations');
      }, function(response) {
        $scope.savingComponentCombination = false;
        onSaveError(response);
      });
    }
  };

  function initSourceComponentTypes() {
    ComponentTypeCombinationsService.getComponentTypeCombinationById({id: $routeParams.id}, function(response) {
      $scope.componentTypeCombination = response.componentTypeCombination;

      // Clear sourceComponentTypes so that they can be referenced from the drop down objects
      var existingSourceComponentTypes = angular.copy($scope.componentTypeCombination.sourceComponentTypes);
      $scope.componentTypeCombination.sourceComponentTypes = [];

      // Mark existing sourceComponentTypes as disabled and add the dropDown objects to the combination array
      // This needs to be done because there can't be sourceComponentType duplicates
      angular.forEach($scope.sourceComponentTypesDropDown, function(dropDownType, index) {
        angular.forEach(existingSourceComponentTypes, function(type) {
          if (type.id === dropDownType.id) {
            $scope.componentTypeCombination.sourceComponentTypes.push(
              $scope.sourceComponentTypesDropDown[index]
            );
            $scope.sourceComponentTypesDropDown[index].disabled = true;
          }
        });
      });
    }, $log.error);
  }

  function initForm() {
    ComponentTypeCombinationsService.getComponentTypeCombinationsForm(function(response) {
      $scope.sourceComponentTypesDropDown = response.sourceComponentTypes;
      $scope.producedComponentTypesDropDown = response.producedComponentTypes;

      if ($routeParams.id) {
        initSourceComponentTypes();
      }
    }, $log.error);
  }

  initForm();

});
