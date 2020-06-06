'use strict';

angular.module('bsis')
  .controller('MobileClinicExportCtrl', function($scope, $filter, $location, $routeParams, $log, gettextCatalog, MobileService, uiGridExporterConstants, DATEFORMAT) {

    $scope.dateFormat = DATEFORMAT;

    $scope.venues = [];
    $scope.search = {};
    $scope.searching = false;
    $scope.submitted = false;
    $scope.error = {};

    var master = {
      venues: [],
      allVenues: true,
      clinicDate: null
    };

    var columnDefs = [
      {
        field: 'venue.name',
        name: 'venue',
        displayName: gettextCatalog.getString('Venue'),
        width: '**'
      },
      {
        field: 'donorNumber',
        name: 'donorNumber',
        displayName: gettextCatalog.getString('Donor Number'),
        width: '**',
        maxWidth: '125'
      },
      {
        field: 'firstName',
        name: 'firstName',
        displayName: gettextCatalog.getString('First Name'),
        width: '**'
      },
      {
        field: 'lastName',
        name: 'lastName',
        displayName: gettextCatalog.getString('Last Name'),
        width: '**'
      },
      {
        field: 'gender',
        name: 'gender',
        displayName: gettextCatalog.getString('Gender'),
        cellFilter: 'titleCase | translate',
        width: '**',
        maxWidth: '80'
      },
      {
        field: 'birthDate',
        name: 'birthDate',
        displayName: gettextCatalog.getString('Date of Birth'),
        cellFilter: 'bsisDate',
        maxWidth: '150'
      },
      {
        field: 'bloodType',
        name: 'bloodType',
        displayName: gettextCatalog.getString('Blood Type'),
        maxWidth: '100'
      },
      {
        field: 'eligibility',
        name: 'eligibility',
        displayName: gettextCatalog.getString('Eligibility'),
        cellFilter: 'eligibility | translate',
        maxWidth: '150'
      }
    ];

    $scope.gridOptions = {
      data: [],
      enableSorting: false,
      paginationPageSize: 10,
      paginationTemplate: 'views/template/pagination.html',
      columnDefs: columnDefs,

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

      onRegisterApi: function(gridApi) {
        $scope.gridApi = gridApi;
      }
    };

    $scope.exportMobileClinics = function() {
      if ($scope.mobileClinicExportForm && $scope.mobileClinicExportForm.$invalid) {
        return;
      }

      $location.search(angular.extend({search: true}, $scope.search));

      var search = {
        venueIds: $scope.search.venues,
        clinicDate: $filter('isoString')($scope.search.clinicDate)
      };

      $scope.searching = true;
      MobileService.mobileClinicExport(search, function(res) {
        $scope.gridOptions.paginationCurrentPage = 1;
        $scope.gridOptions.data = res.donors;
        $scope.searching = false;
        $scope.submitted = true;
      }, function(err) {
        $scope.error.message = err.data.userMessage;
        $scope.searching = false;
      });
    };

    $scope.clear = function() {
      $scope.gridOptions.data = null;
      $scope.gridOptions.enableSorting = false;
      $scope.error = {};
      $scope.search = angular.copy(master);
      $scope.searching = false;
      $scope.submitted = false;
      $location.search({});
      $scope.mobileClinicExportForm.$setPristine();
    };

    $scope.toggleAllVenues = function() {
      if ($scope.search.venues && $scope.search.venues.length !== 0) {
        $scope.search.allVenues = false;
      } else {
        $scope.search.allVenues = true;
      }
    };

    $scope.clearVenues = function() {
      $scope.search.venues = [];
    };


    $scope.export = function(format) {
      if (format === 'csv') {
        $scope.gridApi.exporter.csvExport(uiGridExporterConstants.ALL, uiGridExporterConstants.ALL);
      }
    };

    function init() {
      MobileService.getMobileClinicLookUpFormFields(function(response) {
        $scope.venues = response.venues;

        // select clinicDate from route params (if available)
        $scope.search.clinicDate = angular.isUndefined($routeParams.clinicDate) ? master.clinicDate : new Date($routeParams.clinicDate);

        // Select venues from route params
        if ($routeParams.venues) {
          var venues = angular.isArray($routeParams.venues) ? $routeParams.venues : [$routeParams.venues];
          $scope.search.venues = venues.map(function(venueId) {
            return venueId;
          });
        } else {
          $scope.search.venues = master.venues;
        }

        $scope.toggleAllVenues();

      }, function(err) {
        $log.error(err);
        if (err && err.userMessage) {
          $scope.error.message = err.userMessage;
        } else {
          $scope.error.message = gettextCatalog.getString('An error occurred.');
        }
      });
    }

    init();

  });
