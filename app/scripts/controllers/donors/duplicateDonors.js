'use strict';

angular.module('bsis')
  .controller('DonorsDuplicateCtrl', function($scope, $location, DonorService, $filter, ngTableParams, $timeout) {
    $scope.hasDuplicates = false;

    $scope.findDonorDuplicates = function() {
      DonorService.findAllDonorDuplicates(function(response) {
        if (response !== false) {
          $scope.data = response.duplicates;
          $scope.duplicateDonorCount = response.duplicates.length;
          if ($scope.duplicateDonorCount > 0) {
            $scope.hasDuplicates = true;
          }
        }
      });
    };

    $scope.findDonorDuplicates();

    $scope.duplicateDonorTableParams = new ngTableParams({
      page: 1,            // show first page
      count: 12,          // count per page
      filter: {},
      sorting: {}
    },
      {
        defaultSort: 'asc',
        counts: [], // hide page counts control
        total: $scope.duplicateDonorCount, // length of data
        getData: function($defer, params) {
          var orderedData = params.sorting() ? $filter('orderBy')($scope.data, params.orderBy()) : $scope.data;
          params.total(orderedData.length); // set total for pagination
          $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
      });
    $scope.$watch('data', function() {
      $timeout(function() {
        $scope.duplicateDonorTableParams.reload();
      });
    });

    $scope.viewDuplicates = function(item) {
      $location.path('/manageDuplicateDonors').search({groupKey: item.groupKey});
    };
  });