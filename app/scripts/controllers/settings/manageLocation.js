'use strict';

angular.module('bsis').controller('ManageLocationCtrl', function($scope, $location, $log, LocationsService, DivisionsService, $timeout, $routeParams) {

  $scope.location = {
    isDeleted: false,
    divisionLevel1: null,
    divisionLevel2: null,
    divisionLevel3: null
  };
  $scope.locationForm = {};
  $scope.level2Divisions = [];
  $scope.level3Divisions = [];

  $scope.$watch('location.name', function() {
    $timeout(function() {
      $scope.locationForm.name.$setValidity('duplicate', true);
    });
  });

  $scope.cancel = function() {
    $location.path('/locations');
  };

  $scope.$watch('location.divisionLevel1.id', function(parentLevel1IdNew, parentLevel1IdOld) {
    if (parentLevel1IdNew) {
      DivisionsService.findDivisions({parentId: parentLevel1IdNew}, function(res) {
        $scope.level2Divisions = res.divisions;
      }, function(err) {
        $log.error(err);
      });
    }

    // If level 1 has been updated from an existing one clear level 2
    if (parentLevel1IdOld) {
      $scope.location.divisionLevel2 = null;
      $scope.location.divisionLevel3 = null;
      $scope.level3Divisions = [];
    }
  });

  $scope.$watch('location.divisionLevel2.id', function(parentLevel2IdNew, parentLevel2IdOld) {
    if (parentLevel2IdNew) {
      DivisionsService.findDivisions({parentId: parentLevel2IdNew}, function(res) {
        $scope.level3Divisions = res.divisions;
      }, function(err) {
        $log.error(err);
      });
    }

    // If level 2 has been updated from an existing one clear level 3
    if (parentLevel2IdOld) {
      $scope.location.divisionLevel3 = null;
    }
  });

  $scope.saveLocation = function() {
    if ($scope.locationForm.$invalid) {
      return;
    }

    $scope.savingLocation = true;

    // Assign parent level 1 to division level 3
    $scope.location.divisionLevel3.parent.parent = $scope.location.divisionLevel1;

    if ($routeParams.id) {
      LocationsService.updateLocation($scope.location, function(res) {
        $location.path('/locations').search({
          search: true,
          name: res.location.name
        });
      }, function(response) {
        if (response.data && response.data.name) {
          $scope.locationForm.name.$setValidity('duplicate', false);
        }
        $scope.savingLocation = false;
      });
    } else {
      LocationsService.addLocation($scope.location, function(res) {
        $location.path('/locations').search({
          search: true,
          name: res.name
        });
      }, function(response) {
        if (response.data && response.data.name) {
          $scope.locationForm.name.$setValidity('duplicate', false);
        }
        $scope.savingLocation = false;
      });
    }
  };

  $scope.validateLocationType = function() {
    return $scope.location.isVenue || $scope.location.isUsageSite || $scope.location.isProcessingSite || $scope.location.isDistributionSite || $scope.location.isTestingSite || $scope.location.isReferralSite;
  };

  function init() {

    // Get list of level 1 divisions
    LocationsService.getForm(function(response) {
      $scope.level1Divisions = response.level1Divisions;
    }, $log.error);

    // Check if there's query parameters
    if ($routeParams.id) {
      LocationsService.getLocationById({id: $routeParams.id}, function(response) {
        $scope.location = response.location;
      }, $log.error);
    }
  }

  init();

});
