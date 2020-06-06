'use strict';

angular.module('bsis')
  .controller('PackTypesCtrl', function($scope, $rootScope, $location, $log, PackTypesService, ICONS, $filter, ngTableParams, $timeout) {

    $scope.icons = ICONS;

    $scope.isCurrent = function(path) {
      if (path.length > 1 && $location.path().substr(0, path.length) === path) {
        $location.path(path);
        $scope.selection = path;
        return true;
      } else if ($location.path() === path) {
        return true;
      } else {
        return !!($location.path() === '/settings' && path === '/packTypes');
      }
    };

    var data = [];
    $scope.data = data;
    $scope.packTypes = {};


    $scope.clear = function() {

    };

    $scope.managePackType = function(packType) {
      $scope.packType = packType;
      PackTypesService.setPackType(packType);
      $location.path('/managePackType/' + packType.id);
    };

    $scope.clearForm = function(form) {
      form.$setPristine();
      $scope.submitted = '';
    };

    $scope.getPackTypes = function() {
      PackTypesService.getPackTypes(function(response) {
        if (response !== false) {
          data = response;
          $scope.data = data;
          $scope.packTypes = data;
          $scope.packTypesCount = $scope.data.length;
        } else {
          $log.error('failed to get pack types');
        }
      });
    };

    $scope.getPackTypes();

    $scope.addNewPackType = function() {
      PackTypesService.setPackType('');
      $location.path('/managePackType');
    };

    $scope.packTypesTableParams = new ngTableParams({
      page: 1,            // show first page
      count: 6,          // count per page
      filter: {},
      sorting: {}
    },
      {
        defaultSort: 'asc',
        counts: [], // hide page counts control
        total: data.length, // length of data
        getData: function($defer, params) {
          var filteredData = params.filter() ?
            $filter('filter')(data, params.filter()) : data;
          var orderedData = params.sorting() ?
            $filter('orderBy')(filteredData, params.orderBy()) : data;
          params.total(orderedData.length); // set total for pagination
          $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
      });

    $scope.$watch('data', function() {
      $timeout(function() {
        $scope.packTypesTableParams.reload();
      });
    });

  })

  .controller('ManagePackTypesCtrl', function($scope, $location, $log, PackTypesService, ICONS, ComponentTypesService, $routeParams, $timeout) {
    $scope.icons = ICONS;
    $scope.selection = '/managePackType';
    $scope.packType = PackTypesService.getPackType();
    $scope.serverError = null;

    if ($scope.packType   === '') {
      $scope.packType = {
        countAsDonation: false
      };
    }

    ComponentTypesService.getComponentTypes({}, function(response) {
      $scope.componentTypes = response.componentTypes;
    }, function(err) {
      $log.error(err);
    });

    $scope.$watch('packType.packType', function() {
      $timeout(function() {
        if ($scope.packTypeForm) {
          $scope.packTypeForm.packType.$setValidity('duplicate', true);
        }
      });
    });

    $scope.$watch('packType.countAsDonation', function() {
      $timeout(function() {
        if ($scope.packTypeForm) {
          $scope.packTypeForm.countAsDonation.$setValidity('invalid', true);
        }
      });
    });

    $scope.savePackType = function(packType, packTypeForm) {

      if (packTypeForm.$valid) {
        if (angular.isDefined(packType.id)) {
          $scope.updatePackType(packType, packTypeForm);
        } else {
          $scope.addPackType(packType, packTypeForm);
        }
      } else {
        $scope.submitted = true;
      }
    };

    $scope.addPackType = function(packType) {

      packType.canPool = null;
      packType.canSplit = null;

      if (!packType.countAsDonation) {
        delete packType.componentType;
      }

      $scope.savingPackType = true;
      PackTypesService.addPackType(packType, function() {
        $scope.go('/packTypes');
      }, function(err) {
        if (err) {
          if (err.fieldErrors.packType && err.fieldErrors.packType[0].code === 'name.exists') {
            $scope.packTypeForm.packType.$setValidity('duplicate', false);
          }
        }
        $scope.savingPackType = false;
      });
    };

    $scope.switchCountAsDonation = function() {
      if (!$scope.packType.countAsDonation) {
        $scope.tempComponentType = $scope.packType.componentType;
        $scope.packType.componentType = '';
      } else {
        $scope.packType.componentType = $scope.tempComponentType;
        $scope.tempComponentType = '';
      }
    };

    $scope.handleTestSampleProducedToggle = function() {
      if (!$scope.packType.testSampleProduced) {
        $scope.packType.countAsDonation = false;
        $scope.switchCountAsDonation();
      }
    };

    $scope.updatePackType = function(packType) {

      if (!packType.countAsDonation) {
        delete packType.componentType;
      }

      $scope.savingPackType = true;
      PackTypesService.updatePackType(packType, function() {
        $scope.go('/packTypes');
      }, function(err) {
        if (err) {
          if (err.fieldErrors.packType && err.fieldErrors.packType[0].code === 'name.exists') {
            $scope.packTypeForm.packType.$setValidity('duplicate', false);
          }
        }
        $scope.savingPackType = false;
      });
    };

    $scope.clear = function() {

    };

    $scope.go = function(path) {
      $location.path(path);
    };

    $scope.clearForm = function(form) {
      form.$setPristine();
      $scope.submitted = '';
    };

    $scope.getPackType = function() {
      PackTypesService.getPackTypeById($routeParams.id, function(packType) {
        $scope.packType = packType;
      }, function(err) {
        $scope.serverError = err;
      });
    };

    // managing addition of new pack type
    if (!$routeParams.id) {
      $scope.managePackType = 'addPackType';
      $scope.packType = {
        testSampleProduced: true,
        countAsDonation: true,
        isDeleted: false

      };
    } else {
      // managing update of existing pack type
      $scope.getPackType();
      $scope.managePackType = 'updatePackType';
    }

  })

;
