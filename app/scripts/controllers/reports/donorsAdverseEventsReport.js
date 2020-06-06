'use strict';

angular.module('bsis')
  .controller('DonorsAdverseEventsReportCtrl', function($scope, $log, $filter, ReportsService, gettextCatalog, ReportsLayoutService, DATEFORMAT) {

    var mergedData = [];
    var master = {
      startDate: moment().subtract(7, 'days').startOf('day').toDate(),
      endDate: moment().endOf('day').toDate(),
      allVenues: true,
      venue: null
    };
    var adverseEventTypes = [];
    $scope.search = angular.copy(master);
    $scope.dateFormat = DATEFORMAT;

    $scope.clearSearch = function(form) {
      $scope.search = angular.copy(master);
      form.$setPristine();
      form.$setUntouched();
      $scope.gridOptions.data = [];
      $scope.submitted = false;
    };

    $scope.clearVenue = function() {
      $scope.search.venue = null;
    };

    $scope.updateAllVenues = function() {
      if ($scope.search.venue) {
        $scope.search.allVenues = false;
      }
    };

    // Report methods

    function initRow() {
      var row = {};
      row.venue = '';
      angular.forEach(adverseEventTypes, function(adverseEventType) {
        row[adverseEventType.name] = 0;
      });
      row.total = 0;
      return row;
    }

    function populateRow(row, rowForTotal, newRow) {
      var cohorts = newRow.cohorts;
      var adverseEventType = cohorts[0].option;

      row.venue = newRow.location.name;
      row[adverseEventType] += newRow.value;
      row.total += newRow.value;

      rowForTotal[adverseEventType] += newRow.value;
      rowForTotal.total += newRow.value;
    }

    function pushRowsToGrid(rowsForVenue) {
      angular.forEach(rowsForVenue, function(row) {
        mergedData.push(row);
      });
    }

    function mergeData(dataValues) {
      var rowsForVenue = {};
      var rowForTotal = initRow();

      mergedData = [];
      $scope.venuesNumber = 0;

      angular.forEach(dataValues, function(newRow) {
        var rowForVenue = rowsForVenue[newRow.location.name];
        if (!rowForVenue) { // new venue
          $scope.venuesNumber += 1;
          rowForVenue = initRow();
          rowsForVenue[newRow.location.name] = rowForVenue;
        }
        populateRow(rowForVenue, rowForTotal, newRow);
      });

      pushRowsToGrid(rowsForVenue);

      if ($scope.venuesNumber > 1) {
        // add total row to table
        rowForTotal.venue = gettextCatalog.getString('Total All Venues');
        mergedData.push(rowForTotal);
      }

      $scope.gridOptions.data = mergedData;
    }

    $scope.getReport = function(searchForm) {

      if (!searchForm.$valid) {
        return;
      }

      $scope.searching = true;
      ReportsService.generateDonorsAdverseEventsReport($scope.search, function(report) {
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
      { displayName: gettextCatalog.getString('Venue'),
        field: 'venue',
        width: '**',
        minWidth: 150
      },
      { displayName: gettextCatalog.getString('Total Adverse Events'),
        field: 'total',
        width: 55
      }
    ];

    function initGridOptionsConfig() {
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
          docDefinition = ReportsLayoutService.highlightTotalRows(gettextCatalog.getString('Total All Venues'), 0, docDefinition);
          docDefinition = ReportsLayoutService.paginatePdf(27, docDefinition);
          return docDefinition;
        },

        // PDF header
        exporterPdfHeader: function() {
          var venuesNumberLine = gettextCatalog.getString('Number of venues: {{venuesNumber}}', {venuesNumber: $scope.venuesNumber});
          return ReportsLayoutService.generatePdfPageHeader($scope.gridOptions.exporterPdfOrientation,
          gettextCatalog.getString('Donors Adverse Events Summary Report'),
          gettextCatalog.getString('Date Period: {{fromDate}} to {{toDate}}', {fromDate: $filter('bsisDate')($scope.search.startDate), toDate: $filter('bsisDate')($scope.search.endDate)}),
          venuesNumberLine);
        },

        // PDF footer
        exporterPdfFooter: function(currentPage, pageCount) {
          return ReportsLayoutService.generatePdfPageFooter(
            gettextCatalog.getString('venues'), $scope.venuesNumber,
            currentPage, pageCount,
            $scope.gridOptions.exporterPdfOrientation);
        },

        onRegisterApi: function(gridApi) {
          $scope.gridApi = gridApi;
        }
      };
    }

    $scope.export = function(format) {
      if (format === 'pdf') {
        $scope.gridApi.exporter.pdfExport('all', 'all');
      } else if (format === 'csv') {
        $scope.gridApi.exporter.csvExport('all', 'all');
      }
    };

    function init() {
      ReportsService.getDonorsAdverseEventsReportForm(function(response) {
        $scope.venues = response.venues;
        adverseEventTypes = response.adverseEventTypes;
        angular.forEach(adverseEventTypes, function(adverseEventType) {
          // Add new column before the total column
          var displayName = ReportsLayoutService.hyphenateLongWords(adverseEventType.name, 11);
          columnDefs.splice(-1, 0, {displayName: displayName, field: adverseEventType.name, width: '**', minWidth: 80, maxWidth: 100});
        });
        initGridOptionsConfig();
      }, $log.error);
    }

    init();

  });
