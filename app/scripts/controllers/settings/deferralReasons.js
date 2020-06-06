'use strict';

angular.module('bsis')
  .controller('DeferralReasonsCtrl', function($scope, $location, DeferralReasonsService, ngTableParams, $timeout, $filter, ICONS) {

    $scope.icons = ICONS;

    var data = [{}];
    $scope.data = data;
    $scope.deferralReasons = {};

    $scope.clear = function() {

    };

    $scope.clearForm = function(form) {
      form.$setPristine();
      $scope.submitted = '';
    };

    $scope.getDeferrals = function() {
      DeferralReasonsService.getDeferrals(function(response) {
        if (response !== false) {
          data = response;
          $scope.data = data;
          $scope.deferralReasons = data;
          $scope.deferralReasonsCount = $scope.deferralReasons.length;

        }
      });
    };

    $scope.deferralsTableParams = new ngTableParams({
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
        $scope.deferralsTableParams.reload();
      });
    });

    $scope.addNewDeferralReason = function() {
      DeferralReasonsService.setDeferralReason('');
      $location.path('/manageDeferralReason');
    };

    $scope.manageDeferralReason = function(deferral) {
      $scope.deferral = deferral;
      DeferralReasonsService.setDeferralReason(deferral);
      $location.path('/manageDeferralReason/' + deferral.id);
    };

    $scope.getDeferrals();

  })

  .controller('ManageDeferralReasonsCtrl', function($scope, $location, DeferralReasonsService, ICONS, DATATYPES, $routeParams) {
    $scope.icons = ICONS;
    $scope.selection = '/manageDeferralReason';

    $scope.getDeferralReason = function() {
      DeferralReasonsService.getDeferralReasonById($routeParams.id, function(deferralReason) {
        $scope.deferral = deferralReason;
      }, function(err) {
        $scope.err = err;
      });
    };

    if (!$routeParams.id) {
      $scope.deferral = {
        isDeleted: false
      };
    } else {
      $scope.getDeferralReason();
      $scope.disableDeferralname = true;
    }

    $scope.dataTypes = DATATYPES.options;

    $scope.saveDeferralReason = function(deferral, deferralForm) {

      if (deferralForm.$valid) {
        if (angular.isDefined(deferral)) {
          if (angular.isDefined(deferral.id)) {
            $scope.updateDeferralReason(deferral, deferralForm);
          } else {
            $scope.addDeferralReason(deferral, deferralForm);
          }
        }
      } else {
        $scope.submitted = true;
      }
    };

    $scope.serverError = {};


    $scope.updateDeferralReason = function(deferral, deferralForm) {
      if (deferralForm.$valid) {

        DeferralReasonsService.updateDeferralReason(deferral, function(response, err) {
          if (response !== false) {
            $scope.go('/deferralReasons');
          } else {

            if (err.reason) {
              $scope.deferralReasonInvalid = 'ng-invalid';
              $scope.serverError.reason = err.reason;
            }
          }
        });
      } else {
        $scope.submitted = true;
      }
    };


    $scope.addDeferralReason = function(deferral, deferralForm) {

      if (deferralForm.$valid) {
        deferral.isDeleted = false;
        DeferralReasonsService.addDeferralReason(deferral, function(response, err) {
          if (response !== false) {
            $scope.deferral = {
              reason: '',
              isDeleted: false
            };
            deferralForm.$setPristine();
            $scope.submitted = '';
            $scope.go('/deferralReasons');
          } else {
            if (err.reason) {
              $scope.deferralReasonInvalid = 'ng-invalid';
              $scope.serverError.reason = err.reason;
            }
          }
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
      $location.path('/deferralReasons');
    };

    $scope.handleDurationTypeChange = function() {
      $scope.deferral.defaultDuration = $scope.deferral.durationType === 'PERMANENT' ? null : 0;
    };

    $scope.go = function(path) {
      $location.path(path);
    };
  });
