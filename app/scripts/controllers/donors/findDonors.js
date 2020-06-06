'use strict';

angular.module('bsis')

.controller('FindDonorsCtrl', function($scope, $location, $routeParams, ngTableParams, $filter, $timeout, DonorService, DATEFORMAT, Alerting) {

  $scope.donorSearch = $routeParams;

  var data = [{}];
  $scope.data = data;
  $scope.canAddDonors = false;

  // Show Similar Results checked by default
  $scope.donorSearch.usePhraseMatch  = true;

  // Check that at least one search field is entered
  $scope.isDonorSearchValid = function() {
    var search = $scope.donorSearch;
    return search.firstName || search.middleName|| search.lastName || search.donorNumber || search.donationIdentificationNumber || search.phoneNumber;
  };

  $scope.findDonor = function(form) {
    if (form && !form.$valid) {
      return;
    }
    $scope.donorSearch.search = true;
    Alerting.setPersistErrors(false);
    $location.search($scope.donorSearch);
    $scope.searching = true;
    DonorService.findDonor($scope.donorSearch, function(response) {
      data = response.donors;
      $scope.searchResults = true;
      $scope.data = response.donors;
      $scope.canAddDonors = response.canAddDonors;
      $scope.searching = false;
      $scope.tableParams.$params.page = 1;
    }, function() {
      $scope.searchResults = false;
      $scope.searching = false;
    });
  };

  $scope.viewDonor = function(item) {

    $scope.donor = item;
    DonorService.setDonor(item);

    $scope.format = DATEFORMAT;
    $scope.initDate = item.birthDate;
    $scope.calIcon = 'fa-calendar';

    $scope.donorBirthDateOpen = false;

    $location.path('/viewDonor/' + item.id).search({});
  };

  if ($routeParams.search) {
    $scope.findDonor();
  }

  $scope.$watch('data', function() {
    $timeout(function() {
      $scope.tableParams.reload();
    });
  });

  $scope.clear = function(form) {
    if (form) {
      form.$setPristine();
    }
    $scope.donorSearch = {};
    $scope.donorSearch.usePhraseMatch  = true;    // Return to default
  };

  $scope.tableParams = new ngTableParams({
    page: 1,            // show first page
    count: 8,          // count per page
    sorting: {}
  }, {
    defaultSort: 'asc',
    counts: [], // hide page counts control
    total: data.length, // length of data
    getData: function($defer, params) {
      var orderedData = params.sorting() ?
        $filter('orderBy')(data, params.orderBy()) : data;
      params.total(orderedData.length); // set total for pagination
      $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
    }
  });
});