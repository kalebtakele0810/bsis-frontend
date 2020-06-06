'use strict';

angular.module('bsis')
  .controller('MobileCtrl', function($scope, $filter, $location, $routeParams, MobileService, uiGridExporterConstants, gettextCatalog, DATEFORMAT) {

    $scope.dateFormat = DATEFORMAT;
    $scope.venues = [];
    $scope.error = {
      message: null
    };
    $scope.currentSearch = null;

    MobileService.getMobileClinicLookUpFormFields(function(res) {
      $scope.venues = res.venues;
    }, function(err) {
      $scope.error.message = err.userMessage;
    });

    var master = $scope.master = {
      venue: null,
      clinicDate: null
    };

    $scope.search = {
      venue: angular.isUndefined($routeParams.venueId) ? master.venue : $routeParams.venueId,
      clinicDate: angular.isUndefined($routeParams.clinicDate) ? master.clinicDate : new Date($routeParams.clinicDate)
    };

    var columnDefs = [
      {
        field: 'donorNumber',
        displayName: gettextCatalog.getString('Donor Number')
      },
      {
        field: 'firstName',
        displayName: gettextCatalog.getString('First Name')
      },
      {
        field: 'lastName',
        displayName: gettextCatalog.getString('Last Name')
      },
      {
        field: 'gender',
        displayName: gettextCatalog.getString('Gender'),
        cellFilter: 'titleCase | translate'
      },
      {
        name: 'Date of Birth',
        displayName: gettextCatalog.getString('Date of Birth'),
        field: 'birthDate',
        cellFilter: 'bsisDate'
      },
      {
        field: 'bloodType',
        displayName: gettextCatalog.getString('Blood Type')
      },
      {
        name: 'Eligibility',
        displayName: gettextCatalog.getString('Eligibility'),
        field: 'eligibility',
        cellFilter: 'eligibility | translate'
      }
    ];

    $scope.gridOptions = {
      enableSorting: false,
      data: [],
      paginationPageSize: 10,
      paginationPageSizes: [10],
      paginationTemplate: 'views/template/pagination.html',
      columnDefs: columnDefs,
      exporterPdfMaxGridWidth: 680,

      // Format values for exports
      exporterFieldCallback: function(grid, row, col, value) {
        if (col.field === 'birthDate') {
          return $filter('bsisDate')(value);
        } else if (col.field === 'eligibility') {
          return gettextCatalog.getString($filter('eligibility')(value));
        } else if (col.field === 'gender') {
          return gettextCatalog.getString($filter('titleCase')(value));
        } else {
          return value;
        }
      },

      // PDF header
      exporterPdfHeader: function() {

        var venueName;
        angular.forEach($scope.venues, function(venue) {
          if (venue.id === $scope.currentSearch.venue) {
            venueName = venue.name;
          }
        });

        var columns = [
          {text: gettextCatalog.getString('Venue') + ': ' + venueName, width: 'auto'}
        ];

        // Include Clinic Date
        if ($scope.currentSearch.clinicDate) {
          var clinicDate = $filter('bsisDate')($scope.currentSearch.clinicDate);
          columns.push({text: gettextCatalog.getString('Clinic Date') + ': ' + clinicDate, width: 'auto'});
        }

        // Include Number and Percentage Eligible Donors
        columns.push({text: gettextCatalog.getString('Eligible Donors: {{numberEligibleDonors}} out of {{totalDonors}} ({{percentage}}%)',
          { numberEligibleDonors: $scope.numberEligibleDonors, totalDonors: $scope.gridOptions.data.length, percentage: $scope.percentageEligibleDonor}),
          width: 'auto'});

        return [
          {
            text: gettextCatalog.getString('Mobile Clinic Look Up'),
            bold: true,
            margin: [30, 10, 30, 0]
          },
          {
            columns: columns,
            columnGap: 10,
            margin: [30, 0]
          }
        ];
      },

      // PDF footer
      exporterPdfFooter: function(currentPage, pageCount) {
        var columns = [
          {text: gettextCatalog.getString('Total donors: {{total}}', {total: $scope.gridOptions.data.length}), width: 'auto'},
          {text: gettextCatalog.getString('Date generated: {{date}}', {date: $filter('bsisDateTime')(new Date())}), width: 'auto'},
          {text: gettextCatalog.getString('Page {{currentPage}} of {{pageCount}}', {currentPage: currentPage, pageCount: pageCount}), style: {alignment: 'right'}}
        ];
        return {
          columns: columns,
          columnGap: 10,
          margin: [30, 0, 50, 0]
        };
      },

      onRegisterApi: function(gridApi) {
        $scope.gridApi = gridApi;
      }
    };

    var calculateNumberEligibleDonors = function(data) {
      var eligibleDonorCount = 0;

      data.forEach(function(donor) {
        if (donor.eligibility) {
          eligibleDonorCount++;
        }
      });

      return eligibleDonorCount;
    };

    var calculatePercentageEligibleDonors = function(numberEligibleDonors, totalNumberDonors) {
      if (totalNumberDonors > 0) {
        return Math.round(numberEligibleDonors / totalNumberDonors * 100);
      } else {
        return 0;
      }
    };

    $scope.onSearch = function(form) {

      if (form && form.$invalid) {
        return;
      }

      $scope.currentSearch = angular.copy($scope.search);

      var search = {
        venueId: $scope.currentSearch.venue,
        clinicDate: $filter('isoString')($scope.currentSearch.clinicDate)
      };

      $location.search(angular.extend({search: true}, search));

      $scope.searching = true;
      MobileService.mobileClinicLookUp(search, function(res) {
        $scope.gridOptions.data = res.donors;
        $scope.numberEligibleDonors = calculateNumberEligibleDonors($scope.gridOptions.data);
        $scope.percentageEligibleDonor = calculatePercentageEligibleDonors($scope.numberEligibleDonors, $scope.gridOptions.data.length);
        $scope.gridOptions.paginationCurrentPage = 1;
        $scope.searching = false;
      }, function(err) {
        $scope.error.message = err.data.userMessage;
        $scope.searching = false;
      });
    };

    $scope.onClear = function(form) {
      $scope.currentSearch = null;
      $scope.error.message = null;
      $scope.search = angular.copy(master);
      $location.search({});
      form.$setPristine();
    };

    if ($routeParams.search) {
      $scope.onSearch();
    }

    $scope.export = function(format) {
      if (format === 'pdf') {
        $scope.gridApi.exporter.pdfExport(uiGridExporterConstants.ALL, uiGridExporterConstants.ALL);
      }
    };

  });
