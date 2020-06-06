'use strict';

angular.module('bsis').controller('ManageDivisionCtrl', function($scope, $routeParams, $log, $location, $timeout, DivisionsService) {

  function init() {
    if ($routeParams.id) {
      DivisionsService.getDivision({id: $routeParams.id}, function(res) {
        $scope.division = res.division;
      }, function(err) {
        $log.error(err);
      });
    }
  }

  function onSaveSuccess(res) {
    // Redirect back to divisions page
    $location.path('/divisions').search({
      search: true,
      name: res.division.name
    });
    $scope.saving = false;
  }

  function onSaveError(err) {
    var data = err.data || {};
    var fieldErrors = data.fieldErrors || {};
    // Check errors on name field for duplicate error
    angular.forEach(fieldErrors.name || [], function(fieldError) {
      if (fieldError.code === 'duplicate') {
        $scope.divisionForm.name.$setValidity('duplicate', false);
      }
    });
    $log.error(err);
    $scope.saving = false;
  }

  // Form fields
  $scope.levels = [1, 2, 3];
  $scope.parentDivisions = null;

  $scope.division = {
    name: null,
    level: null,
    parent: null
  };

  $scope.saving = false;

  $scope.$watch('division.name', function() {
    $timeout(function() {
      $scope.divisionForm.name.$setValidity('duplicate', true);
    });
  });

  $scope.$watch('division.level', function(level) {

    if (level !== 2 && level !== 3) {
      // This division has no parent
      $scope.parentDivisions = null;
      return;
    }

    DivisionsService.findDivisions({level: level - 1}, function(res) {
      if (res.divisions != null) {
        $scope.parentDivisions = res.divisions.filter(function(parent) {
          return parent.id !== $scope.division.id;
        });
      }
    }, function(err) {
      $log.error(err);
    });
  });

  $scope.saveDivision = function() {

    if ($scope.divisionForm && $scope.divisionForm.$invalid) {
      // Invalid form - don't save the division
      return;
    }

    $scope.saving = true;

    if ($routeParams.id) {
      var division = angular.extend({id: +$routeParams.id}, $scope.division);
      DivisionsService.updateDivision(division, onSaveSuccess, onSaveError);
    } else {
      DivisionsService.createDivision($scope.division, onSaveSuccess, onSaveError);
    }
  };

  $scope.cancel = function() {
    $location.path('/divisions');
  };

  init();
});
