'use strict';

angular.module('bsis')
  .controller('UnitsDiscardedReportCtrl', function($scope, $log, $filter, ReportsService, ReportsLayoutService, DATEFORMAT, gettextCatalog) {

    // Initialize variables

    var mergedData = [];
    var master = {
      startDate: moment().subtract(7, 'days').startOf('day').toDate(),
      endDate: moment().endOf('day').toDate(),
      allSites: true,
      processingSite: null
    };
    var discardReasons = [];
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

    function initRow(componentType) {
      var row = {};
      row.venue = '';
      row.componentType = componentType;
      angular.forEach(discardReasons, function(discardReason) {
        row[discardReason.reason] = 0;
      });
      row.total = 0;
      return row;
    }

    function pushRowsToGrid(rowsForVenue) {
      // Move Total row to end
      var totalRow = angular.copy(rowsForVenue[0]);
      rowsForVenue.splice(0, 1);
      rowsForVenue.push(totalRow);
      // Push rows to grid
      angular.forEach(rowsForVenue, function(row) {
        mergedData.push(row);
      });
    }

    function populateRows(rows, newRow, componentTypeIndex) {
      var cohorts = newRow.cohorts;
      var componentType = cohorts[0].option;
      var discardReason = cohorts[1].option;

      if (!rows[componentTypeIndex]) {
        // Initialize component type row for new venue
        rows[componentTypeIndex] = initRow(componentType);
      }

      // Show processing site name on first component type row only
      if (componentTypeIndex === 1) {
        rows[componentTypeIndex].venue = newRow.location.name;
      }

      // Populate component type row
      rows[componentTypeIndex][discardReason] += newRow.value;
      rows[componentTypeIndex].total += newRow.value;
      // Populate total row
      rows[0][discardReason] += newRow.value;
      rows[0].total += newRow.value;

      return rows;
    }

    function convertSummaryRows() {
      // Move Total row to end for summary
      var totalRow = angular.copy(summaryRows[0]);
      summaryRows.splice(0, 1);
      summaryRows.push(totalRow);

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
      var previousComponentType = '';
      var rowsForVenue = [];
      var componentTypeIndex = 0;
      var componentTypeSummaryIndex = 0;
      var summaryComponentTypeMap = {};

      mergedData = [];
      $scope.venuesNumber = 0;

      // Initialize total row for summary
      summaryRows[0] = initRow(gettextCatalog.getString('Total'));

      angular.forEach(dataValues, function(newRow) {
        // New venue
        if (newRow.location.name !== previousVenue) {
          $scope.venuesNumber += 1;

          if (previousVenue != '') {
            pushRowsToGrid(rowsForVenue);
          }

          // Initialize total row for new venue
          previousVenue = newRow.location.name;
          rowsForVenue = [];
          rowsForVenue[0] = initRow(gettextCatalog.getString('Total'));
          componentTypeIndex = 0;
          previousComponentType = '';
        }

        if (previousComponentType !== newRow.cohorts[0].option) {
          componentTypeIndex += 1;
          previousComponentType = newRow.cohorts[0].option;
        }

        // Generate summary index for each component type
        var componentType = newRow.cohorts[0].option;
        if (!summaryComponentTypeMap[componentType]) {
          componentTypeSummaryIndex += 1;
          summaryComponentTypeMap[componentType] = componentTypeSummaryIndex;
        }

        populateRows(rowsForVenue, newRow, componentTypeIndex);
        // Update venue for summary
        newRow.location.name = gettextCatalog.getString('All Processing Sites');
        populateRows(summaryRows, newRow, summaryComponentTypeMap[componentType]);
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

      summaryRows = [];
      $scope.searching = true;
      ReportsService.generateUnitsDiscardedReport($scope.search, function(report) {
        $scope.searching = false;
        if (report.dataValues.length > 0) {
          mergeData(report.dataValues);
          $scope.gridOptions.paginationCurrentPage = 1;
        } else {
          $scope.gridOptions.data = [];
          $scope.venuesNumber = 0;
        }
        $scope.submitted = true;
      }, function(err) {
        $scope.searching = false;
        $log.log(err);
      });
    };

    // Grid ui variables and methods

    var columnDefs = [
      { name: 'Site', displayName: gettextCatalog.getString('Site'), field: 'venue', width: '**', minWidth: 150 },
      { name: 'Component Type', displayName: gettextCatalog.getString('Component Type'), field: 'componentType', width: '**', minWidth: 150 },
      { name: 'Total', displayName: gettextCatalog.getString('Total'), field: 'total', width: 55 }
    ];

    $scope.gridOptions = {
      data: [],
      paginationPageSize: 8,
      paginationTemplate: 'views/template/pagination.html',
      columnDefs: columnDefs,
      minRowsToShow: 8,

      exporterPdfOrientation: 'landscape',
      exporterPdfPageSize: 'A4',
      exporterPdfDefaultStyle: ReportsLayoutService.pdfDefaultStyle,
      exporterPdfTableHeaderStyle: ReportsLayoutService.pdfTableHeaderStyle,
      exporterPdfMaxGridWidth: ReportsLayoutService.pdfLandscapeMaxGridWidth,

      // Change formatting of PDF
      exporterPdfCustomFormatter: function(docDefinition) {
        if ($scope.venuesNumber > 1) {
          docDefinition = ReportsLayoutService.addSummaryContent(summaryRows, docDefinition);
        }
        docDefinition = ReportsLayoutService.highlightTotalRows('Total', 1, docDefinition);
        docDefinition = ReportsLayoutService.paginatePdf(26, docDefinition);
        return docDefinition;
      },

      // PDF header
      exporterPdfHeader: function() {
        var processingSitesNumberLine = gettextCatalog.getString('Number of processing sites: {{sitesNumber}}', {sitesNumber: $scope.venuesNumber});
        return ReportsLayoutService.generatePdfPageHeader($scope.gridOptions.exporterPdfOrientation,
          gettextCatalog.getString('Discards Summary Report'),

          gettextCatalog.getString('Date Period: {{fromDate}} to {{toDate}}', {fromDate: $filter('bsisDate')($scope.search.startDate), toDate: $filter('bsisDate')($scope.search.endDate)}),
          processingSitesNumberLine);
      },

      // PDF footer
      exporterPdfFooter: function(currentPage, pageCount) {
        return ReportsLayoutService.generatePdfPageFooter(gettextCatalog.getString('sites'), $scope.venuesNumber, currentPage, pageCount, $scope.gridOptions.exporterPdfOrientation);
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
      ReportsService.getUnitsDiscardedReportForm(function(response) {
        $scope.processingSites = response.processingSites;
        discardReasons = response.discardReasons;
        angular.forEach(discardReasons, function(discardReason) {
          // Add new column before the total column
          columnDefs.splice(-1, 0, {displayName: discardReason.reason, field: discardReason.reason, width: '**', minWidth: 80, maxWidth: 100});
        });
      }, $log.error);
    }

    init();

  });
