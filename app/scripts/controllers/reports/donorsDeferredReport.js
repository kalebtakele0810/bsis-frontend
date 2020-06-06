'use strict';

angular.module('bsis').controller('DonorsDeferredReportCtrl', function($scope, $log, $filter, ReportsService, gettextCatalog, ReportsLayoutService, DATEFORMAT, uiGridConstants) {

  // Initialize variables

  var master = {
    startDate: moment().subtract(7, 'days').startOf('day').toDate(),
    endDate: moment().endOf('day').toDate()
  };

  $scope.deferralReasons = [];
  $scope.venuesNumber = 0;

  // UI grid initial columns
  var columnDefs = [
    {displayName: gettextCatalog.getString('Venue'), field: 'venue', width: '**', minWidth: '250'},
    {displayName: gettextCatalog.getString('Gender'), field: 'gender', width: '**', maxWidth: '150'},
    {displayName: gettextCatalog.getString('Total'), field: 'total', width: '**', maxWidth: '125'}
  ];

  function createZeroValuesRow(venue, gender) {
    var row = {
      venue: venue,
      gender: gender
    };

    // Initialise columns
    angular.forEach($scope.deferralReasons, function(column) {
      row[column] = 0;
    });

    // Must come after deferral reasons to maintain the column order
    row.total = 0;

    return row;
  }

  function createAllGendersRow(femaleRow, maleRow) {
    var row = {
      venue: '',
      gender: gettextCatalog.getString('All'),
      total: femaleRow.total + maleRow.total
    };

    // Sum columns
    angular.forEach($scope.deferralReasons, function(column) {
      row[column] = femaleRow[column] + maleRow[column];
    });

    return row;
  }

  function textValues(obj) {
    var result = [];
    for (var key in obj) {
      result.push('' + obj[key]);
    }
    return result;
  }

  function mergeData(dataValues) {

    var rows = [];
    var previousVenue = null;
    var mergedFemaleRow = null;
    var mergedMaleRow = null;
    var femaleSummaryRow = createZeroValuesRow(gettextCatalog.getString('All Venues'), gettextCatalog.getString('Female'));
    var maleSummaryRow = createZeroValuesRow('', gettextCatalog.getString('Female'));
    var allSummaryRow = createZeroValuesRow('', gettextCatalog.getString('All'));

    angular.forEach(dataValues, function(dataValue) {

      var gender = dataValue.cohorts[0].option;
      var deferralReason = dataValue.cohorts[1].option;

      // New venue
      if (dataValue.location.name !== previousVenue) {
        $scope.venuesNumber += 1;

        if (previousVenue !== null) {
          // Add female, male and all rows for previous venue
          rows.push(mergedFemaleRow);
          rows.push(mergedMaleRow);
          rows.push(createAllGendersRow(mergedFemaleRow, mergedMaleRow));
        }

        // Initialize values for the new venue
        mergedFemaleRow = createZeroValuesRow(dataValue.location.name, gettextCatalog.getString('Female'));
        mergedMaleRow = createZeroValuesRow('', gettextCatalog.getString('Male'));

        // Store the previous venue name
        previousVenue = dataValue.location.name;
      }

      if (gender === 'female') {
        // Add the value to the current 'female' row
        mergedFemaleRow[deferralReason] = dataValue.value;
        mergedFemaleRow.total += dataValue.value;
        // Add the value to the 'female' summary row
        femaleSummaryRow[deferralReason] += dataValue.value;
        femaleSummaryRow.total += dataValue.value;
      } else if (gender === 'male') {
        // Add the value to the current 'male' row
        mergedMaleRow[deferralReason] = dataValue.value;
        mergedMaleRow.total += dataValue.value;
        // Add the value to the 'male' summary row
        maleSummaryRow[deferralReason] += dataValue.value;
        maleSummaryRow.total += dataValue.value;
      }
      // Add the value to the 'All' summary row
      allSummaryRow[deferralReason] += dataValue.value;
      allSummaryRow.total += dataValue.value;
    });

    // Add female, male and all rows for previous venue
    rows.push(mergedFemaleRow);
    rows.push(mergedMaleRow);
    rows.push(createAllGendersRow(mergedFemaleRow, mergedMaleRow));

    // Update the data
    $scope.gridOptions.data = rows;

    // Add the summary data to the grid for use in the export
    $scope.gridOptions.summaryData = [
      textValues(femaleSummaryRow),
      textValues(maleSummaryRow),
      textValues(allSummaryRow)
    ];
  }

  $scope.dateFormat = DATEFORMAT;
  $scope.search = angular.copy(master);

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
    $scope.venuesNumber = 0;
    $scope.gridOptions.data = [];

    ReportsService.generateDonorsDeferredReport(period, function(report) {
      $scope.searching = false;
      if (report.dataValues.length > 0) {
        mergeData(report.dataValues);
        $scope.gridOptions.paginationCurrentPage = 1;
      }
      $scope.submitted = true;
    }, function(err) {
      $scope.searching = false;
      $log.log(err);
    });
  };

  function initGridOptionsConfig() {
    $scope.gridOptions = {
      data: [],
      paginationPageSize: 9,
      paginationTemplate: 'views/template/pagination.html',
      columnDefs: columnDefs,
      minRowsToShow: 9,

      exporterPdfOrientation: 'landscape',
      exporterPdfPageSize: 'A4',
      exporterPdfDefaultStyle: ReportsLayoutService.pdfDefaultStyle,
      exporterPdfTableHeaderStyle: ReportsLayoutService.pdfTableHeaderStyle,
      exporterPdfMaxGridWidth: ReportsLayoutService.pdfLandscapeMaxGridWidth,

      // PDF header
      exporterPdfHeader: function() {
        return ReportsLayoutService.generatePdfPageHeader($scope.gridOptions.exporterPdfOrientation,
        gettextCatalog.getString('Donors Deferred Summary Report'),
        gettextCatalog.getString('Date Period: {{fromDate}} to {{toDate}}', {fromDate: $filter('bsisDate')($scope.search.startDate), toDate: $filter('bsisDate')($scope.search.endDate)}));
      },

      // Change formatting of PDF
      exporterPdfCustomFormatter: function(docDefinition) {
        if ($scope.venuesNumber > 1) {
          docDefinition = ReportsLayoutService.addSummaryContent($scope.gridOptions.summaryData, docDefinition);
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
  }

  function init() {
    ReportsService.getDonorsDeferredReportForm(function(res) {
      // Add deferral reason columns
      angular.forEach(res.deferralReasons, function(column) {
        $scope.deferralReasons.push(column.reason);
        // Add new column before the total column
        columnDefs.splice(-1, 0, {displayName: column.reason, field: column.reason, width: '**', maxWidth: '125'});
      });

      // Notify the grid of the changes if it has been initialised
      if ($scope.gridApi) {
        $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
      }
      initGridOptionsConfig();
    }, function(err) {
      $log.error(err);
    });
  }

  $scope.export = function(format) {
    if (format === 'pdf') {
      $scope.gridApi.exporter.pdfExport('all', 'all');
    } else if (format === 'csv') {
      $scope.gridApi.exporter.csvExport('all', 'all');
    }
  };

  init();

});
