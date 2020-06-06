'use strict';

angular.module('bsis')
  .controller('BloodUnitsIssuedReportCtrl', function($scope, $log, $filter, DATEFORMAT, ReportsService, ReportGeneratorService, ReportsLayoutService, gettextCatalog) {

    // Initialize variables
    var master = {
      startDate: moment().subtract(7, 'days').startOf('day').toDate(),
      endDate: moment().endOf('day').toDate()
    };

    $scope.dateFormat = DATEFORMAT;
    $scope.search = angular.copy(master);
    var dataValues = null;

    // Report methods

    function initRow(dataValue, newLocation) {
      var row = {};
      var distributionSite = '';
      if (newLocation) {
        distributionSite = dataValue.location.name;
      }
      row.distributionSite = distributionSite;
      row.componentType = '';
      row.bulkOrder = 0;
      row.bulkIssue = 0;
      row.bulkGap = 0;
      row.bulkRate = $filter('number')(0, 2);
      row.patientOrder = 0;
      row.patientIssue = 0;
      row.patientGap = 0;
      row.patientRate = $filter('number')(0, 2);
      return row;
    }

    function populateRow(row, dataValue) {
      
      var componentType = ReportGeneratorService.getCohort(dataValue, 'Component Type').option;
      var orderType = ReportGeneratorService.getCohort(dataValue, 'Order Type').option;

      row.componentType = componentType;

      if (dataValue.id === 'unitsOrdered') {
        if (orderType === 'PATIENT_REQUEST') {
          row.patientOrder = row.patientOrder + dataValue.value;
        } else {
          row.bulkOrder = row.bulkOrder + dataValue.value;
        }
      } else if (dataValue.id === 'unitsIssued') {
        if (orderType === 'PATIENT_REQUEST') {
          row.patientIssue = row.patientIssue + dataValue.value;
        } else {
          row.bulkIssue = row.bulkIssue + dataValue.value;
        }
      }

      row.bulkGap = row.bulkOrder - row.bulkIssue;
      row.bulkRate = $filter('number')(row.bulkIssue / row.bulkOrder * 100, 2);
      row.patientGap = row.patientOrder - row.patientIssue;
      row.patientRate = $filter('number')(row.patientIssue / row.patientOrder * 100, 2);
    }

    function addSubtotalsRow(rows) {
      var subtotalsRow = initRow();
      subtotalsRow.componentType = gettextCatalog.getString('Total Blood Units');
      angular.forEach(rows, function(row, key) {
        subtotalsRow.bulkOrder += rows[key].bulkOrder;
        subtotalsRow.bulkIssue += rows[key].bulkIssue;
        subtotalsRow.patientOrder += rows[key].patientOrder;
        subtotalsRow.patientIssue += rows[key].patientIssue;
      });

      subtotalsRow.bulkGap = subtotalsRow.bulkOrder - subtotalsRow.bulkIssue;
      subtotalsRow.bulkRate = $filter('number')(subtotalsRow.bulkIssue / subtotalsRow.bulkOrder * 100, 2);
      subtotalsRow.patientGap = subtotalsRow.patientOrder - subtotalsRow.patientIssue;
      subtotalsRow.patientRate = $filter('number')(subtotalsRow.patientIssue / subtotalsRow.patientOrder * 100, 2);
      return subtotalsRow;
    }

    $scope.clearSearch = function(form) {
      $scope.search = angular.copy(master);
      form.$setPristine();
      form.$setUntouched();
      $scope.gridOptions.data = [];
      $scope.submitted = false;
    };

    $scope.getReport = function(selectPeriodForm) {

      if (!selectPeriodForm.$valid) {
        return;
      }

      var period = {};
      if ($scope.search.startDate) {
        var startDate = moment($scope.search.startDate).startOf('day').toDate();
        period.startDate = startDate;
      }
      if ($scope.search.endDate) {
        var endDate = moment($scope.search.endDate).endOf('day').toDate();
        period.endDate = endDate;
      }

      $scope.searching = true;
      ReportsService.generateBloodUnitsIssuedReport(period, function(report) {
        $scope.searching = false;
        if (report.dataValues.length > 0) {
          dataValues = report.dataValues;
          var data = ReportGeneratorService.generateDataRowsGroupingByLocationAndCohort(dataValues, 'Component Type', initRow, populateRow, addSubtotalsRow);
          $scope.gridOptions.data = data[0];
          $scope.sitesNumber = data[1];
          $scope.gridOptions.paginationCurrentPage = 1;
        } else {
          $scope.gridOptions.data = [];
          $scope.sitesNumber = 0;
          dataValues = null;
        }
        $scope.submitted = true;
      }, function(err) {
        $scope.searching = false;
        $log.error(err);
      });
    };

    // Grid ui variables and methods
    var columnDefs = [
      { displayName: gettextCatalog.getString('Distribution Site'), field: 'distributionSite', width: '**', minWidth: 200},
      { displayName: gettextCatalog.getString('Component Type'), field: 'componentType', width: '**', minWidth: 200},
      { displayName: gettextCatalog.getString('Ordered'), field: 'bulkOrder', width: 100 },
      { displayName: gettextCatalog.getString('Issued'), field: 'bulkIssue', width: 100 },
      { displayName: gettextCatalog.getString('Gap'), field: 'bulkGap', width: 100 },
      { displayName: gettextCatalog.getString('% Issued vs Ordered'), field: 'bulkRate', width: 100 },
      { displayName: gettextCatalog.getString('Patient Requests'), field: 'patientOrder', width: 100 },
      { displayName: gettextCatalog.getString('Issued'), field: 'patientIssue', width: 100 },
      { displayName: gettextCatalog.getString('Gap'), field: 'patientGap', width: 100 },
      { displayName: gettextCatalog.getString('% Issued vs Requests'), field: 'patientRate', width: 100 }
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
          var summaryRows = ReportGeneratorService.generateSummaryRowsGroupingByCohort(dataValues, 'Component Type', initRow, populateRow, addSubtotalsRow);
          summaryRows[0][0] = gettextCatalog.getString('All Sites');
          docDefinition = ReportsLayoutService.addSummaryContent(summaryRows, docDefinition);
        }
        docDefinition = ReportsLayoutService.highlightTotalRows(gettextCatalog.getString('Total Blood Units'), 1, docDefinition);
        docDefinition = ReportsLayoutService.paginatePdf(33, docDefinition);
        return docDefinition;
      },

      // Reformat column data
      exporterFieldCallback: function(grid, row, col, value) {
        value = ReportsLayoutService.addPercentages(col, value);
        return value;
      },

      // PDF header
      exporterPdfHeader: function() {
        var sitesNumberLine = gettextCatalog.getString('Distribution Sites') + ': ' + $scope.sitesNumber;
        var header =  ReportsLayoutService.generatePdfPageHeader($scope.gridOptions.exporterPdfOrientation,
          gettextCatalog.getString('Blood Units Issued Summary Report'),
          [gettextCatalog.getString('Date Period: {{fromDate}} to {{toDate}}', {fromDate: $filter('bsisDate')($scope.search.startDate), toDate: $filter('bsisDate')($scope.search.endDate)})],
          sitesNumberLine);
        return header;
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

  });
