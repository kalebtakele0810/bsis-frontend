'use strict';

angular.module('bsis')
  .controller('DonationTypesCtrl', function($scope, $location, DonationTypesService, ngTableParams, $timeout, $filter, ICONS) {

    $scope.icons = ICONS;

    var data = [{}];
    $scope.data = data;
    $scope.donationTypes = {};

    $scope.clear = function() {

    };

    $scope.clearForm = function(form) {
      form.$setPristine();
      $scope.submitted = '';
    };

    $scope.getDonationTypes = function() {
      DonationTypesService.getDonationTypes(function(response) {
        if (response !== false) {
          data = response;
          $scope.data = data;
          $scope.donationTypes = data;
          $scope.donationTypesCount = $scope.donationTypes.length;

        }
      });
    };

    $scope.donationTypesTableParams = new ngTableParams({
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
        $scope.donationTypesTableParams.reload();
      });
    });

    $scope.addNewDonationType = function() {
      DonationTypesService.setDonationType('');
      $location.path('/manageDonationType');
    };

    $scope.manageDonationType = function(donationType) {
      $scope.donationType = donationType;
      DonationTypesService.setDonationType(donationType);
      $location.path('/manageDonationType/' + donationType.id);
    };

    $scope.getDonationTypes();

  })

  .controller('ManageDonationTypesCtrl', function($scope, $location, DonationTypesService, ICONS, $routeParams) {
    $scope.icons = ICONS;
    $scope.selection = '/manageDonationType';

    $scope.getDonationType = function() {
      DonationTypesService.getDonationTypeById($routeParams.id, function(donationType) {
        $scope.donationType = donationType;
      }, function(err) {
        $scope.err = err;
      });
    };


    if (!$routeParams.id) {
      $scope.donationType = {
        isDeleted: false
      };
    } else {
      $scope.getDonationType();
      $scope.disableDonationTypename = true;
    }


    $scope.saveDonationType = function(donationType, donationTypeForm) {

      if (donationTypeForm.$valid) {
        if (angular.isDefined(donationType)) {
          if (angular.isDefined(donationType.id)) {
            $scope.updateDonationType(donationType, donationTypeForm);
          } else {
            $scope.addDonationType(donationType, donationTypeForm);
          }
        }
      } else {
        $scope.submitted = true;
      }
    };

    $scope.serverError = {};


    $scope.updateDonationType = function(donationType, donationTypeForm) {
      if (donationTypeForm.$valid) {

        $scope.savingDonationType = true;
        DonationTypesService.updateDonationType(donationType, function(response, err) {
          if (response !== false) {
            $scope.go('/donationTypes');
          } else {

            if (err.type) {
              $scope.typeInvalid = 'ng-invalid';
              $scope.serverError.type = err.type;
            }
          }
          $scope.savingDonationType = false;
        });
      } else {
        $scope.submitted = true;
      }
    };


    $scope.addDonationType = function(donationType, donationTypeForm) {

      if (donationTypeForm.$valid) {
        donationType.isDeleted = false;
        $scope.savingDonationType = true;
        DonationTypesService.addDonationType(donationType, function(response, err) {
          if (response !== false) {
            $scope.donationType = {
              donationType: '',
              isDeleted: false
            };
            donationTypeForm.$setPristine();
            $scope.submitted = '';
            $scope.go('/donationTypes');
          } else {
            if (err.type) {
              $scope.typeInvalid = 'ng-invalid';
              $scope.serverError.type = err.type;
            }
          }
          $scope.savingDonationType = false;
        });
      } else {
        $scope.submitted = true;
      }
    };

    $scope.clearForm = function(form) {
      form.$setPristine();
      $scope.submitted = '';
    };

    $scope.cancel = function(form) {
      $scope.clearForm(form);
      $location.path('/donationTypes');
    };


    $scope.go = function(path) {
      $location.path(path);
    };
  });
