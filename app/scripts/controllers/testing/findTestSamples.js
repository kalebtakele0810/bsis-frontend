'use strict';

angular.module('bsis').controller('FindTestSamplesCtrl', function($scope, $location, $log, DonationsService, TestingService, DATEFORMAT, gettextCatalog) {

  $scope.dateFormat = DATEFORMAT;

  var master = {
    din: null,
    venueId: null,
    allVenues: true,
    packTypeId: null,
    allPackTypes: true,
    startDate: moment().subtract(7, 'days').startOf('day').toDate(),
    endDate: moment().endOf('day').toDate()
  };

  var columnDefs = [
    {
      name: 'DonationIdentificationNumber',
      displayName: gettextCatalog.getString('DIN'),
      field: 'donationIdentificationNumber',
      width: '**'
    },
    {
      name: 'Venue',
      displayName: gettextCatalog.getString('Venue'),
      field: 'venue.name',
      cellFilter: 'translate',
      width: '**'
    },
    {
      name: 'Donation Date',
      displayName: gettextCatalog.getString('Collection Date'),
      field: 'donationDate',
      cellFilter: 'bsisDate',
      width: '**'
    },
    {
      name: 'Pack Type',
      displayName: gettextCatalog.getString('Pack Type'),
      field: 'packType.packType',
      width: '**'
    },
    {
      name: 'TTI Status',
      displayName: gettextCatalog.getString('TTI Status'),
      field: 'ttistatus',
      width: '**'
    },
    {
      name: 'Blood Typing Match Status',
      displayName: gettextCatalog.getString('Blood Group Serology'),
      field: 'bloodTypingMatchStatus',
      width: '**'
    }
  ];

  $scope.searchParams = {};
  $scope.venues = [];
  $scope.packTypes = [];
  $scope.searching = false;
  $scope.submitted = false;

  $scope.gridOptions = {
    data: [],
    paginationPageSize: 5,
    paginationTemplate: 'views/template/pagination.html',
    minRowsToShow: 5,
    columnDefs: columnDefs,

    onRegisterApi: function(gridApi) {
      $scope.gridApi = gridApi;
    }
  };

  $scope.updateDinSearch = function() {
    var din = $scope.searchParams.din;
    if (din && din.length > 0) {
      $scope.dinSearch = true;
      $scope.searchParams.startDate = null;
      $scope.searchParams.endDate = null;
    } else {
      $scope.dinSearch = false;
      $scope.searchParams = angular.copy(master);
    }
  };

  $scope.updateAllVenues = function() {
    if ($scope.searchParams.venueId) {
      $scope.searchParams.allVenues = false;
    }
  };

  $scope.updateAllPackTypes = function() {
    if ($scope.searchParams.packTypeId) {
      $scope.searchParams.allPackTypes = false;
    }
  };

  $scope.clearVenue = function() {
    $scope.searchParams.venueId = null;
  };

  $scope.clearPackType = function() {
    $scope.searchParams.packTypeId = null;
  };

  $scope.findTestSamples = function() {
    if (!$scope.findTestSamplesForm.$valid) {
      return;
    }
    $scope.searching = true;
    $scope.submitted = true;

    if ($scope.searchParams.din) {
      $log.info($scope.searchParams.din);
      DonationsService.findByDin({din: $scope.searchParams.din}, function(response) {
        $scope.gridOptions.data = response.donations;
        $scope.searching = false;
        $scope.gridOptions.paginationCurrentPage = 1;
      }, function(error) {
        $scope.searching = false;
        $log.error(error);
      });

    } else {
      DonationsService.search($scope.searchParams, function(response) {
        $scope.gridOptions.data = response.donations;
        $scope.searching = false;
        $scope.gridOptions.paginationCurrentPage = 1;
      }, function(error) {
        $scope.searching = false;
        $log.error(error);
      });
    }
  };

  $scope.reset = function(form) {
    $scope.gridOptions.data = [];
    $scope.searchParams = angular.copy(master);
    $scope.submitted = false;
    $scope.searching = false;
    $scope.dinSearch = null;
    if (form) {
      form.$setPristine();
    }
  };

  $scope.init = function() {
    $scope.reset();
    TestingService.getTestResultsForm(function(response) {
      $scope.venues = response.venues;
      $scope.packTypes = response.packTypes;
    }, $log.error);
  };

  $scope.init();

});
