'use strict';

angular.module('bsis').controller('ManageBloodTestCtrl', function($scope, $location, $log, $timeout, $routeParams, BloodTestsService) {

  var types = [];
  $scope.types = [];
  $scope.notSelectedResults = [];

  $scope.bloodTest = {
    isDeleted: false,
    isActive: true,
    testName: '',
    testNameShort: '',
    category: '',
    bloodTestType: '',
    flagComponentsForDiscard: false,
    flagComponentsContainingPlasmaForDiscard: false,
    validResults: [],
    negativeResults: [],
    positiveResults: []
  };

  $scope.cancel = function() {
    $location.path('/bloodTests');
  };

  $scope.$watch('bloodTest.category', function() {
    $timeout(function() {
      $scope.types = types[$scope.bloodTest.category];
    });
  });

  $scope.$watch('bloodTest.testName', function() {
    $timeout(function() {
      $scope.bloodTestForm.testName.$setValidity('duplicate', true);
    });
  });

  // Add outcome methods

  function addOutcome(outcome, outcomeFormField, outcomesListToAddTo) {
    $scope.addOutcomeClicked = true;

    if (!outcome || outcome.length > 10) {
      return false;
    }
    if (outcomesListToAddTo.indexOf(outcome) !== -1) {
      outcomeFormField.$setValidity('duplicate', false);
      return false;
    }
    outcomeFormField.$setValidity('duplicate', true);
    outcomesListToAddTo.push(outcome);
    return true;
  }

  $scope.addValidOutcome = function() {
    // Add to valid results list
    var success = addOutcome($scope.validOutcome, $scope.bloodTestForm.validOutcome, $scope.bloodTest.validResults);
    // Add to notSelectedResults
    if (success) {
      $scope.bloodTestForm.removedValidOutcomes.$setValidity('required', true);
      $scope.notSelectedResults.push($scope.validOutcome);
      $scope.validOutcome = null;
      $scope.addOutcomeClicked = false;
    }
  };

  $scope.addNegativeOutcome = function() {
    // Add to negative results list
    var success = addOutcome($scope.negativeOutcome, $scope.bloodTestForm.negativeOutcome, $scope.bloodTest.negativeResults);
    // Remove from notSelectedResults
    if (success) {
      var index = $scope.notSelectedResults.indexOf($scope.negativeOutcome);
      $scope.notSelectedResults.splice(index, 1);
    }
    $scope.negativeOutcome = null;
  };

  $scope.addPositiveOutcome = function() {
    // Add to positive results list
    var success = addOutcome($scope.positiveOutcome, $scope.bloodTestForm.positiveOutcome, $scope.bloodTest.positiveResults);
    // Remove from notSelectedResults
    if (success) {
      var index = $scope.notSelectedResults.indexOf($scope.positiveOutcome);
      $scope.notSelectedResults.splice(index, 1);
    }
    $scope.positiveOutcome = null;
  };

  // Remove outcome methods

  function removeOutcomes(removedOutcomes, outcomesListToRemoveFrom) {
    removedOutcomes.forEach(function(removedOutcome) {
      outcomesListToRemoveFrom.forEach(function(outcome, index) {
        if (outcome === removedOutcome) {
          outcomesListToRemoveFrom.splice(index, 1);
        }
      });
    });
  }

  $scope.removeValidOutcomes = function() {
    // Check if the outcomes have been added to the negative or positive list
    var canRemove = true;
    $scope.removedValidOutcomes.forEach(function(removedValidOutcome) {
      if ($scope.bloodTest.negativeResults.indexOf(removedValidOutcome) !== -1 || $scope.bloodTest.positiveResults.indexOf(removedValidOutcome) !== -1) {
        $scope.bloodTestForm.removedValidOutcomes.$setValidity('cantremove', false);
        canRemove = false;
        // Only display error message for 3 seconds
        $timeout(function() {
          $scope.bloodTestForm.removedValidOutcomes.$setValidity('cantremove', true);
        }, 3000);
      }
    });

    if (canRemove) {
      $scope.bloodTestForm.removedValidOutcomes.$setValidity('cantremove', true);
      // Remove from valid results list
      removeOutcomes($scope.removedValidOutcomes, $scope.bloodTest.validResults);
      // Remove from notSelectedResults
      $scope.removedValidOutcomes.forEach(function(outcome) {
        var index = $scope.notSelectedResults.indexOf(outcome);
        $scope.notSelectedResults.splice(index, 1);
      });
    }
  };

  $scope.removeNegativeOutcomes = function() {
    // Remove from negative results list
    removeOutcomes($scope.removedNegativeOutcomes, $scope.bloodTest.negativeResults);
    // Add to notSelectedResults
    $scope.removedNegativeOutcomes.forEach(function(outcome) {
      $scope.notSelectedResults.push(outcome);
    });
  };

  $scope.removePositiveOutcomes = function() {
    // Remove from positive results list
    removeOutcomes($scope.removedPositiveOutcomes, $scope.bloodTest.positiveResults);
    // Add to notSelectedResults
    $scope.removedPositiveOutcomes.forEach(function(outcome) {
      $scope.notSelectedResults.push(outcome);
    });
  };

  $scope.saveBloodTest = function() {
    if ($scope.bloodTest.validResults.length === 0) {
      $scope.bloodTestForm.removedValidOutcomes.$setValidity('required', false);
    }

    if ($scope.bloodTestForm.$invalid) {
      return;
    }

    $scope.savingBloodTest = true;
    if ($routeParams.id) {
      BloodTestsService.updateBloodTest($scope.bloodTest, function() {
        $location.path('/bloodTests');
      }, function(err) {
        if (err.data && err.data.testName) {
          $scope.bloodTestForm.testName.$setValidity('duplicate', false);
        }
        $scope.savingBloodTest = false;
      });
    } else {
      BloodTestsService.createBloodTest($scope.bloodTest, function() {
        $location.path('/bloodTests');
      }, function(err) {
        if (err.data && err.data.testName) {
          $scope.bloodTestForm.testName.$setValidity('duplicate', false);
        }
        $scope.savingBloodTest = false;
      });
    }
  };

  function initExistingBloodTest() {
    BloodTestsService.getBloodTestById({id: $routeParams.id}, function(response) {
      $scope.bloodTest = response.bloodTest;

      // Populate notSelectedResults with the valid results that are not in positive or negative results
      $scope.notSelectedResults = angular.copy($scope.bloodTest.validResults);
      removeOutcomes($scope.bloodTest.positiveResults, $scope.notSelectedResults);
      removeOutcomes($scope.bloodTest.negativeResults, $scope.notSelectedResults);

    });
  }

  function init() {
    BloodTestsService.getBloodTestsForm(function(response) {
      $scope.categories = response.categories;
      $scope.categories.forEach(function(category) {
        types[category] = response.types[category];
      });

      if ($routeParams.id) {
        initExistingBloodTest();
      }
    }, $log.error);
  }

  init();

});
