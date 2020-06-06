'use strict';

angular.module('bsis')
  .controller('ComponentsProducedReportCtrl', function($scope, $log, $filter, ReportsService, gettextCatalog, ReportsLayoutService, DATEFORMAT) {

    // Initialize variables

    var mergedData = [];
    var master = {
      startDate: moment().subtract(7, 'days').startOf('day').toDate(),
      endDate: moment().endOf('day').toDate(),
      allSites: true,
      processingSite: null
    };
    var componentTypes = [];
    var summaryRows = [];
    $scope.search = angular.copy(master);
    $scope.dateFormat = DATEFORMAT;

    // Report methods

    $scope.clearSearch = function(form) {
      $scope.search = angular.copy(master);
      form.$setPristine();
      form.$setUntouched();
      $scope.gridOptions.data = [];
      $scope.submitted = false;
    };

    $scope.clearProcessingSite = function() {
      $scope.search.processingSite = null;
    };

    $scope.updateAllSites = function() {
      if ($scope.search.processingSite) {
        $scope.search.allSites = false;
      }
    };

    function initRowsForVenue(venue) {
      var rowsForVenue = [{}];

      angular.forEach(componentTypes, function(ct, index) {
        var row = {};
        if (index !== 0) {
          row.venue =  '';
        } else {
          row.venue = venue;
        }
        row.componentType = ct.componentTypeName;
        row['A+'] = 0;
        row['A-'] = 0;
        row['B+'] = 0;
        row['B-'] = 0;
        row['AB+'] = 0;
        row['AB-'] = 0;
        row['O+'] = 0;
        row['O-'] = 0;
        row.empty = 0;
        row.total = 0;

        rowsForVenue[index] = row;
      });

      var totalsRow = {};
      totalsRow.venue =  '';
      totalsRow.componentType = 'Total';
      totalsRow['A+'] = 0;
      totalsRow['A-'] = 0;
      totalsRow['B+'] = 0;
      totalsRow['B-'] = 0;
      totalsRow['AB+'] = 0;
      totalsRow['AB-'] = 0;
      totalsRow['O+'] = 0;
      totalsRow['O-'] = 0;
      totalsRow.empty = 0;
      totalsRow.total = 0;
      rowsForVenue[componentTypes.length + 1] = totalsRow;

      return rowsForVenue;
    }

    function pushRowsToGrid(rowsForVenue) {
      angular.forEach(rowsForVenue, function(row) {
        mergedData.push(row);
      });
    }

    function convertSummaryRows() {
      // Convert row objects to indexed arrays
      var newSummaryRows = [];
      angular.forEach(summaryRows, function(obj) {
        var result = [];
        for (var key in obj) {
          result.push('' + obj[key]);
        }
        newSummaryRows.push(result);
      });
      summaryRows = newSummaryRows;
    }

    function mergeData(dataValues) {

      var previousVenue = '';
      var rowsForVenue = [];

      mergedData = [];
      summaryRows = initRowsForVenue(gettextCatalog.getString('All Processing Sites'));
      $scope.sitesNumber = 0;

      angular.forEach(dataValues, function(newRow) {

        var cohorts = newRow.cohorts;
        var componentType = cohorts[0].option;
        var bloodType = cohorts[1].option;
        if (bloodType == 'nullnull' || !bloodType) {
          bloodType = 'empty';
        }
        newRow.cohorts = componentType;

        // New venue
        if (newRow.location.name !== previousVenue) {
          $scope.sitesNumber += 1;

          if (previousVenue != '') {
            pushRowsToGrid(rowsForVenue);
          }

          // Initialize rows for the new venue
          previousVenue = newRow.location.name;
          rowsForVenue = initRowsForVenue(previousVenue);
        }

        // Populate component type and total rows for each venue and for summary
        angular.forEach(componentTypes, function(ct, index) {
          if (componentType === ct.componentTypeName) {
            // Populate component type rows
            rowsForVenue[index][bloodType] += newRow.value;
            rowsForVenue[index].total += newRow.value;
            // Populate total row
            rowsForVenue[componentTypes.length + 1][bloodType] += newRow.value;
            rowsForVenue[componentTypes.length + 1].total += newRow.value;
            // Populate component type summary rows
            summaryRows[index][bloodType] += newRow.value;
            summaryRows[index].total += newRow.value;
            // Populate total summary row
            summaryRows[componentTypes.length + 1][bloodType] += newRow.value;
            summaryRows[componentTypes.length + 1].total += newRow.value;
          }
        });
      });

      // Run one last time for the last venue
      pushRowsToGrid(rowsForVenue);

      convertSummaryRows();

      $scope.gridOptions.data = mergedData;
    }

    $scope.getReport = function(searchForm) {
      if (!searchForm.$valid) {
        return;
      }
      $scope.searching = true;
      ReportsService.generateComponentProductionReport($scope.search, function(report) {
        $scope.searching = false;
        if (report.dataValues.length > 0) {
          mergeData(report.dataValues);
          $scope.gridOptions.paginationCurrentPage = 1;
        } else {
          $scope.gridOptions.data = [];
          $scope.sitesNumber = 0;
        }
        $scope.submitted = true;
      }, function(err) {
        $scope.searching = false;
        $log.log(err);
      });
    };

    // Grid ui variables and methods

    var columnDefs = [
      { name: 'Site', displayName: gettextCatalog.getString('Site'), field: 'venue' },
      { name: 'Component Type', displayName: gettextCatalog.getString('Component Type'), field: 'componentType'},
      { name: 'A+', field: 'A+', width: 55 },
      { name: 'A-', field: 'A-', width: 55 },
      { name: 'B+', field: 'B+', width: 55 },
      { name: 'B-', field: 'B-', width: 55 },
      { name: 'AB+', displayName: 'AB+', field: 'AB+', width: 65 },
      { name: 'AB-', displayName: 'AB-', field: 'AB-', width: 65 },
      { name: 'O+', field: 'O+', width: 55 },
      { name: 'O-', field: 'O-', width: 55 },
      { name: 'NTD', displayName: gettextCatalog.getString('NTD'), field: 'empty', width: 55 },
      { name: 'Total', displayName: gettextCatalog.getString('Total'), field: 'total', width: 55 }
    ];

    $scope.gridOptions = {
      data: [],
      paginationPageSize: 12,
      paginationTemplate: 'views/template/pagination.html',
      columnDefs: columnDefs,
      minRowsToShow: 12,

      exporterPdfOrientation: 'landscape',
      exporterPdfPageSize: 'A4',
      exporterPdfDefaultStyle: ReportsLayoutService.pdfDefaultStyle,
      exporterPdfTableHeaderStyle: ReportsLayoutService.pdfTableHeaderStyle,
      exporterPdfMaxGridWidth: ReportsLayoutService.pdfLandscapeMaxGridWidth,

      // Change formatting of PDF
      exporterPdfCustomFormatter: function(docDefinition) {
        if ($scope.sitesNumber > 1) {
          docDefinition = ReportsLayoutService.addSummaryContent(summaryRows, docDefinition);
        }
        docDefinition = ReportsLayoutService.highlightTotalRows(gettextCatalog.getString('Total'), 1, docDefinition);
        var rowsPerPage = Math.min(componentTypes.length + 1, 27);
        docDefinition = ReportsLayoutService.paginatePdf(rowsPerPage, docDefinition);
        return docDefinition;
      },

      // PDF header
      exporterPdfHeader: function() {
        var processingSitesNumberLine = gettextCatalog.getString('Number of processing sites: {{sitesNumber}}', {sitesNumber: $scope.sitesNumber});
        return ReportsLayoutService.generatePdfPageHeader($scope.gridOptions.exporterPdfOrientation,
          gettextCatalog.getString('Components Produced Summary Report'),
          gettextCatalog.getString('Date Period: {{fromDate}} to {{toDate}}', {fromDate: $filter('bsisDate')($scope.search.startDate), toDate: $filter('bsisDate')($scope.search.endDate)}),
          processingSitesNumberLine);
      },

      // PDF footer
      exporterPdfFooter: function(currentPage, pageCount) {
        return ReportsLayoutService.generatePdfPageFooter(
          gettextCatalog.getString('sites'), $scope.sitesNumber,
          currentPage, pageCount,
          $scope.gridOptions.exporterPdfOrientation);
      },

      onRegisterApi: function(gridApi) {
        $scope.gridApi = gridApi;
      }
    };

    $scope.export = function(format) {
      if (format === 'pdf') {
        $scope.gridApi.exporter.pdfExport('all', 'all');
      } else if (format === 'csv') {
        $scope.gridApi.exporter.csvExport('all', 'all');
      }
    };

    function init() {
      ReportsService.getComponentProductionReportForm(function(res) {
        $scope.processingSites = res.processingSites;
        componentTypes = res.componentTypes;
      }, function(err) {
        $log.error(err);
      });

    }

    init();

  });
