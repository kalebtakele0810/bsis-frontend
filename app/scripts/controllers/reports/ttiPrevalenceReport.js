'use strict';

angular.module('bsis')
  .controller('TTIPrevalenceReportCtrl', function($scope, $log, $filter, ReportsService, ReportGeneratorService, ReportsLayoutService, DATEFORMAT, gettextCatalog) {

    // Initialize variables
    var master = {
      startDate: moment().subtract(7, 'days').startOf('day').toDate(),
      endDate: moment().endOf('day').toDate()
    };

    var ttiBloodTests = null;
    var dataValues = null;

    $scope.dateFormat = DATEFORMAT;
    $scope.search = angular.copy(master);

    // Report methods
    function initRow(dataValue, newLocation) {
      var row = {};
      var venue = '';
      if (newLocation) {
        venue = dataValue.location.name;
      }

      row.venue = venue;
      row.gender = '';

      angular.forEach(ttiBloodTests, function(ttiBloodTest) {
        row[ttiBloodTest.testName] = 0;
      });
      row.totalPos = 0;
      row.total = 0;
      row.ttiRate = '0%';
      angular.forEach(ttiBloodTests, function(ttiBloodTest) {
        row[ttiBloodTest.testName + 'Rate'] = '0%';
      });

      return row;
    }

    // Grid ui variables and methods
    function initColumns() {
      /// Positive, abbreviation (symbol)
      var pos = gettextCatalog.getString('+');
      /// Percentage, abbreviation (symbol)
      var percentage = gettextCatalog.getString('%');
      var columns = [
        {name: 'Venue', displayName: gettextCatalog.getString('Venue'), field: 'venue', width: '**', minWidth: '200'},
        {name: 'Gender', displayName: gettextCatalog.getString('Gender'), field: 'gender', width:'**', maxWidth: '130'}
      ];

      angular.forEach(ttiBloodTests, function(ttiBloodTest) {
        columns.push(
          {name: ttiBloodTest.testName, displayName: ttiBloodTest.testName + ' ' + pos, field: ttiBloodTest.testName, width: '**', maxWidth: '80'}
        );
      });

      columns = columns.concat([
        {name: 'TotalPos', displayName: gettextCatalog.getString('Total') + ' ' + pos, field: 'totalPos', width: '**', maxWidth: '80'},
        {name: 'Total', displayName: gettextCatalog.getString('Total'), field: 'total', width: '**', maxWidth: '80'},
        {name: 'TTIRate', displayName: gettextCatalog.getString('TTI') + ' ' + percentage, field: 'ttiRate', width: '**', maxWidth: '80'}
      ]);

      angular.forEach(ttiBloodTests, function(ttiBloodTest) {
        columns.push(
          {name: ttiBloodTest.testName  + 'Rate', displayName: ttiBloodTest.testName + ' ' + percentage, field: ttiBloodTest.testName + 'Rate', width: '**', maxWidth: '80'}
        );
      });
      return columns;
    }

    function getPercentage(num1, num2) {
      return $filter('number')(num1 / num2 * 100, 2) + '%';
    }

    function populateRow(row, dataValue) {
      var gender = ReportGeneratorService.getCohort(dataValue, 'Gender').option;
      row.gender = gettextCatalog.getString($filter('titleCase')(gender));

      if (dataValue.id === 'totalUnitsTested') {
        row.total += dataValue.value;

      } else if (dataValue.id === 'totalUnsafeUnitsTested') {
        row.totalPos += dataValue.value;
        row.ttiRate = getPercentage(row.totalPos, row.total);
      } else {
        var ttiBloodTest = ReportGeneratorService.getCohort(dataValue, 'Blood Test').option;
        var result = ReportGeneratorService.getCohort(dataValue, 'Blood Test Result').option;

        if (result === 'POS') {
          row[ttiBloodTest] += dataValue.value;
          row[ttiBloodTest + 'Rate'] = getPercentage(row[ttiBloodTest], row.total);
        }
      }
    }

    function addAllGendersRow(rows) {
      var allGendersRow = initRow();
      allGendersRow.gender = gettextCatalog.getString('All');
      angular.forEach(rows, function(row) {
        allGendersRow.total += row.total;
        allGendersRow.totalPos += row.totalPos;
        angular.forEach(ttiBloodTests, function(ttiBloodTest) {
          allGendersRow[ttiBloodTest.testName] += row[ttiBloodTest.testName];
        });
      });

      // Calculate percentages
      allGendersRow.ttiRate = getPercentage(allGendersRow.totalPos, allGendersRow.total);
      angular.forEach(ttiBloodTests, function(ttiBloodTest) {
        allGendersRow[ttiBloodTest.testName + 'Rate'] = getPercentage(allGendersRow[ttiBloodTest.testName], allGendersRow.total);
      });

      return allGendersRow;
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

      ReportsService.generateTTIPrevalenceReport(period, function(report) {
        $scope.searching = false;
        $scope.venuesNumber = 0;
        if (report.dataValues.length > 0) {
          dataValues = report.dataValues;
          var data = ReportGeneratorService.generateDataRowsGroupingByLocationAndCohort(dataValues, 'Gender', initRow, populateRow, addAllGendersRow);
          $scope.gridOptions.data = data[0];
          $scope.venuesNumber = data[1];
          $scope.gridOptions.paginationCurrentPage = 1;
        } else {
          $scope.gridOptions.data = [];
        }
        $scope.submitted = true;
      }, function(err) {
        $scope.searching = false;
        $log.log(err);
      });
    };

    $scope.gridOptions = {
      data: [],
      paginationPageSize: 9,
      paginationTemplate: 'views/template/pagination.html',
      minRowsToShow: 9,

      exporterPdfOrientation: 'landscape',
      exporterPdfPageSize: 'A4',
      exporterPdfDefaultStyle: ReportsLayoutService.pdfDefaultStyle,
      exporterPdfTableHeaderStyle: ReportsLayoutService.pdfTableHeaderStyle,
      exporterPdfMaxGridWidth: ReportsLayoutService.pdfLandscapeMaxGridWidth,

      // PDF header
      exporterPdfHeader: function() {
        var header =  ReportsLayoutService.generatePdfPageHeader($scope.gridOptions.exporterPdfOrientation,
          gettextCatalog.getString('TTI Prevalence Report'),
          gettextCatalog.getString('Date Period: {{fromDate}} to {{toDate}}', {fromDate: $filter('bsisDate')($scope.search.startDate), toDate: $filter('bsisDate')($scope.search.endDate)}));
        return header;
      },

      // Change formatting of PDF
      exporterPdfCustomFormatter: function(docDefinition) {
        if ($scope.venuesNumber > 1) {
          var summaryRows = ReportGeneratorService.generateSummaryRowsGroupingByCohort(dataValues, 'Gender', initRow, populateRow, addAllGendersRow);
          summaryRows[0][0] = gettextCatalog.getString('All venues');
          docDefinition = ReportsLayoutService.addSummaryContent(summaryRows, docDefinition);
        }
        docDefinition = ReportsLayoutService.highlightTotalRows(gettextCatalog.getString('All'), 1, docDefinition);
        docDefinition = ReportsLayoutService.paginatePdf(27, docDefinition);
        return docDefinition;
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

    $scope.export = function(format) {
      if (format === 'pdf') {
        $scope.gridApi.exporter.pdfExport('all', 'all');
      } else if (format === 'csv') {
        $scope.gridApi.exporter.csvExport('all', 'all');
      }
    };

    function init() {
      ReportsService.getTTIPrevalenceReportForm(function(response) {
        ttiBloodTests = response.ttiBloodTests;
        $scope.gridOptions.columnDefs = initColumns();
      }, $log.error);
    }

    init();
  });
