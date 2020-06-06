'use strict';

angular.module('bsis')
  .controller('AboRhGroupsReportCtrl', function($scope, $log, $filter, ReportsService, ReportsLayoutService, DATEFORMAT, gettextCatalog) {

    // Initialize variables

    var mergedData = [];
    var mergedKey = {};
    var summaryData = [];
    var master = {
      startDate: moment().subtract(7, 'days').startOf('day').toDate(),
      endDate: moment().endOf('day').toDate()
    };

    $scope.dateFormat = DATEFORMAT;
    $scope.search = angular.copy(master);

    // Report methods

    $scope.clearSearch = function(form) {
      $scope.search = angular.copy(master);
      form.$setPristine();
      form.$setUntouched();
      $scope.gridOptions.data = [];
      $scope.submitted = false;
    };

    function createZeroValuesRow(row, venue, gender) {
      var zeroValuesRow = angular.copy(row);
      zeroValuesRow.venue = venue;
      zeroValuesRow.cohorts = gender;
      zeroValuesRow.aPlus = 0;
      zeroValuesRow.aMinus = 0;
      zeroValuesRow.bPlus = 0;
      zeroValuesRow.bMinus = 0;
      zeroValuesRow.abPlus = 0;
      zeroValuesRow.abMinus = 0;
      zeroValuesRow.oPlus = 0;
      zeroValuesRow.oMinus = 0;
      zeroValuesRow.empty = 0;
      zeroValuesRow.total = 0;
      return zeroValuesRow;
    }

    function createAllGendersRow(femaleRow, maleRow) {
      var allGendersRow = angular.copy(femaleRow);
      allGendersRow.venue = '';
      allGendersRow.cohorts = 'All';
      allGendersRow.aPlus = femaleRow.aPlus + maleRow.aPlus;
      allGendersRow.aMinus = femaleRow.aMinus + maleRow.aMinus;
      allGendersRow.bPlus = femaleRow.bPlus + maleRow.bPlus;
      allGendersRow.bMinus = femaleRow.bMinus + maleRow.bMinus;
      allGendersRow.abPlus = femaleRow.abPlus + maleRow.abPlus;
      allGendersRow.abMinus = femaleRow.abMinus + maleRow.abMinus;
      allGendersRow.oPlus = femaleRow.oPlus + maleRow.oPlus;
      allGendersRow.oMinus = femaleRow.oMinus + maleRow.oMinus;
      allGendersRow.empty = femaleRow.empty + maleRow.empty;
      allGendersRow.total = femaleRow.total + maleRow.total;
      return allGendersRow;
    }

    function mergeRows(newRow, existingRow, bloodType) {
      var mergedRow = angular.copy(existingRow);
      if (bloodType === 'A+') {
        mergedRow.aPlus += newRow.value;
      } else if (bloodType === 'A-') {
        mergedRow.aMinus += newRow.value;
      } else if (bloodType === 'B+') {
        mergedRow.bPlus += newRow.value;
      } else if (bloodType === 'B-') {
        mergedRow.bMinus += newRow.value;
      } else if (bloodType === 'AB+') {
        mergedRow.abPlus += newRow.value;
      } else if (bloodType === 'AB-') {
        mergedRow.abMinus += newRow.value;
      } else if (bloodType === 'O+') {
        mergedRow.oPlus += newRow.value;
      } else if (bloodType === 'O-') {
        mergedRow.oMinus += newRow.value;
      } else if (bloodType === 'nullnull' || !bloodType) {
        mergedRow.empty += newRow.value;
      }
      mergedRow.total = mergedRow.aPlus + mergedRow.aMinus + mergedRow.bPlus + mergedRow.bMinus + mergedRow.abPlus + mergedRow.abMinus +
        mergedRow.oPlus + mergedRow.oMinus + mergedRow.empty;
      return mergedRow;
    }

    function addFemaleMaleAllRows(mergedFemaleRow, mergedMaleRow) {
      mergedData[mergedKey] = mergedFemaleRow;
      mergedKey = mergedKey + 1;
      mergedData[mergedKey] = mergedMaleRow;
      mergedKey = mergedKey + 1;
      mergedData[mergedKey] = createAllGendersRow(mergedFemaleRow, mergedMaleRow);
      mergedKey = mergedKey + 1;
    }

    function calculateSummary() {
      var translatedMale = gettextCatalog.getString('Male');
      var translatedFemale = gettextCatalog.getString('Female');

      summaryData = [
        [gettextCatalog.getString('All venues'), translatedFemale, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ['', translatedMale, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ['', gettextCatalog.getString('All'), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      ];
      var summaryRow = null;
      angular.forEach(mergedData, function(row) {
        if (row.cohorts === translatedFemale) {
          summaryRow = summaryData[0];
        }
        if (row.cohorts === translatedMale) {
          summaryRow = summaryData[1];
        }
        if (row.cohorts === gettextCatalog.getString('All')) {
          summaryRow = summaryData[2];
        }

        summaryRow[2] = summaryRow[2] + row.aPlus;
        summaryRow[3] = summaryRow[3] + row.aMinus;
        summaryRow[4] = summaryRow[4] + row.bPlus;
        summaryRow[5] = summaryRow[5] + row.bMinus;
        summaryRow[6] = summaryRow[6] + row.abPlus;
        summaryRow[7] = summaryRow[7] + row.abMinus;
        summaryRow[8] = summaryRow[8] + row.oPlus;
        summaryRow[9] = summaryRow[9] + row.oMinus;
        summaryRow[10] = summaryRow[10] + row.empty;
        summaryRow[11] = summaryRow[11] + row.total;
      });

      // Convert all summary values to text
      summaryData = ReportsLayoutService.convertAllValuesToText(summaryData);
    }

    function mergeData(dataValues) {
      var previousVenue = '';
      var mergedFemaleRow = {};
      var mergedMaleRow = {};
      mergedKey = 0;
      mergedData = [];

      angular.forEach(dataValues, function(newRow) {
        var cohorts = newRow.cohorts;
        var gender = cohorts[1].option;
        var bloodType = cohorts[2].option;
        newRow.cohorts = gender;

        // New venue
        if (newRow.location.name !== previousVenue) {
          $scope.venuesNumber += 1;

          if (previousVenue !== '') {
            // Add female, male and all rows for previous venue
            addFemaleMaleAllRows(mergedFemaleRow, mergedMaleRow);
          }

          // Initialize values for the new venue
          previousVenue = newRow.location.name;
          mergedFemaleRow = createZeroValuesRow(newRow, previousVenue, 'female');
          mergedMaleRow = createZeroValuesRow(newRow, '', 'male');
        }

        // Merge gender row with new row
        if (gender === 'female') {
          mergedFemaleRow = mergeRows(newRow, mergedFemaleRow, bloodType);
        }
        if (gender === 'male') {
          mergedMaleRow = mergeRows(newRow, mergedMaleRow, bloodType);
        }

      });

      // Run this one last time for the last row
      addFemaleMaleAllRows(mergedFemaleRow, mergedMaleRow);

      $scope.gridOptions.data = mergedData;

      angular.forEach($scope.gridOptions.data, function(row) {
        row.cohorts = gettextCatalog.getString($filter('titleCase')(row.cohorts));
      });
    }

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

      ReportsService.generateDonationsReport(period, function(report) {
        $scope.searching = false;
        $scope.venuesNumber = 0;
        if (report.dataValues.length > 0) {
          mergeData(report.dataValues);
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

    // Grid ui variables and methods

    var columnDefs = [
      { name: 'Venue', displayName: gettextCatalog.getString('Venue'), field: 'venue' },
      { name: 'Gender', displayName: gettextCatalog.getString('Gender'), field: 'cohorts'},
      { name: 'A+', field: 'aPlus', width: 55 },
      { name: 'A-', field: 'aMinus', width: 55 },
      { name: 'B+', field: 'bPlus', width: 55 },
      { name: 'B-', field: 'bMinus', width: 55 },
      { name: 'AB+', displayName: 'AB+', field: 'abPlus', width: 65 },
      { name: 'AB-', displayName: 'AB-', field: 'abMinus', width: 65 },
      { name: 'O+', field: 'oPlus', width: 55 },
      { name: 'O-', field: 'oMinus', width: 55 },
      { name: 'NTD', displayName: gettextCatalog.getString('NTD'), field: 'empty', width: 65 },
      { name: 'Total', displayName: gettextCatalog.getString('Total'), field: 'total' }
    ];

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

      // Change formatting of PDF
      exporterPdfCustomFormatter: function(docDefinition) {
        if ($scope.venuesNumber > 1) {
          calculateSummary();
          docDefinition = ReportsLayoutService.addSummaryContent(summaryData, docDefinition);
        }
        docDefinition = ReportsLayoutService.highlightTotalRows(gettextCatalog.getString('All'), 1, docDefinition);
        docDefinition = ReportsLayoutService.paginatePdf(27, docDefinition);
        return docDefinition;
      },

      // PDF header
      exporterPdfHeader: function() {
        var header =  ReportsLayoutService.generatePdfPageHeader($scope.gridOptions.exporterPdfOrientation,
          gettextCatalog.getString('ABO Rh Blood Grouping Report'),
          gettextCatalog.getString('Date Period: {{fromDate}} to {{toDate}}', {fromDate: $filter('bsisDate')($scope.search.startDate), toDate: $filter('bsisDate')($scope.search.endDate)}));
        return header;
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

  });
