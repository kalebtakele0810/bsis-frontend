'use strict';

angular.module('bsis')
  .controller('ViewStockLevelsCtrl', function($scope, $location, $filter, $log, ReportsService, gettextCatalog) {

    $scope.distributionCenters = null;

    var searchedParams = {};
    $scope.searched = false;
    $scope.searching = false;

    var master = {
      inventoryStatus: 'IN_STOCK',
      allSites: true
    };

    var componentTypeTitle = gettextCatalog.getString('Component Type');
    var totalTitle = gettextCatalog.getString('Total');

    var inStockColumnDefs = [
      { name: 'Component Type', displayName:componentTypeTitle, field: 'componentType', width: '**' },
      { name: 'A+', displayName: 'A+', field: 'aPlus', width: 55 },
      { name: 'A-', displayName: 'A-', field: 'aMinus', width: 55 },
      { name: 'B+', displayName: 'B+', field: 'bPlus', width: 55 },
      { name: 'B-', displayName: 'B-', field: 'bMinus', width: 55 },
      { name: 'AB+', displayName: 'AB+', field: 'abPlus', width: 65 },
      { name: 'AB-', displayName: 'AB-', field: 'abMinus', width: 65 },
      { name: 'O+', displayName: 'O+', field: 'oPlus', width: 55 },
      { name: 'O-', displayName: 'O-', field: 'oMinus', width: 55 },
      { name: 'Total', displayName: totalTitle, field: 'total', width: 95 }
    ];

    var notLabelledColumnDefs = [
      { name: 'Component Type', displayName:componentTypeTitle, field: 'componentType', width: '**' },
      { name: 'A+', displayName: 'A+', field: 'aPlus', width: 55 },
      { name: 'A-', displayName: 'A-', field: 'aMinus', width: 55 },
      { name: 'B+', displayName: 'B+', field: 'bPlus', width: 55 },
      { name: 'B-', displayName: 'B-', field: 'bMinus', width: 55 },
      { name: 'AB+', displayName: 'AB+', field: 'abPlus', width: 65 },
      { name: 'AB-', displayName: 'AB-', field: 'abMinus', width: 65 },
      { name: 'O+', displayName: 'O+', field: 'oPlus', width: 55 },
      { name: 'O-', displayName: 'O-', field: 'oMinus', width: 55 },
      { name: 'NTD', displayName: 'NTD', field: 'empty', width: 65 },
      { name: 'Total', displayName: totalTitle, field: 'total', width: 95 }
    ];

    function isInStockSearch() {
      if (searchedParams && searchedParams.inventoryStatus === 'IN_STOCK') {
        return true;
      }
      return false;
    }

    function exportPDFCustomFormatter(docDefinition) {
      var prefix = [];
      if (!searchedParams.distributionCenter) {
        prefix.push(
          {
            text: gettextCatalog.getString('All Sites'),
            fontSize: 8,
            bold: true
          }
        );
      } else {
        var selectedDistributionCenter = $scope.distributionCenters.filter(function(center) {
          return searchedParams.distributionCenter === center.id.toString();
        });
        prefix.push(
          {
            text: gettextCatalog.getString('Distribution Center') + ': ',
            fontSize: 8,
            bold: true
          }, {
            text: selectedDistributionCenter[0].name
          }
        );
      }

      docDefinition.content = [{text: prefix, margin: [-10, 0, 0, 0], fontSize: 7}].concat(docDefinition.content);
      return docDefinition;
    }

    function exportPDFHeader() {
      return [
        {
          text: gettextCatalog.getString('Stock Levels') + ': ' + (isInStockSearch() ? gettextCatalog.getString('In Stock') : gettextCatalog.getString('Not Labelled')),
          fontSize: 10,
          bold: true,
          margin: [30, 20, 0, 0]
        }
      ];
    }

    function exportPDFFooter(gridOptions, currentPage, pageCount) {
      var columns = [
        {text: gettextCatalog.getString('Date generated: {{date}}', {date: $filter('bsisDateTime')(new Date())}), width: 'auto'},
        {text: gettextCatalog.getString('Page {{currentPage}} of {{pageCount}}', {currentPage: currentPage, pageCount: pageCount}), style: {alignment: 'right'}}
      ];
      return {
        columns: columns,
        columnGap: 10,
        margin: [30, 0]
      };
    }

    $scope.gridOptions = {
      data: [],
      columnDefs: [],
      paginationPageSize: 10,
      paginationPageSizes: [10],
      paginationTemplate: 'views/template/pagination.html',
      minRowsToShow: 10,

      exporterPdfOrientation: 'portrait',
      exporterPdfPageSize: 'A4',
      exporterPdfDefaultStyle: {fontSize: 6, margin: [-2, 0, 0, 0] },
      exporterPdfTableHeaderStyle: {fontSize: 6, bold: true, margin: [-2, 0, 0, 0] },
      exporterPdfMaxGridWidth: 400,

      exporterPdfCustomFormatter: function(docDefinition) {
        return exportPDFCustomFormatter(docDefinition);
      },
      exporterPdfHeader: function() {
        return exportPDFHeader();
      },
      exporterPdfFooter: function(currentPage, pageCount) {
        return exportPDFFooter($scope.gridOptions, currentPage, pageCount);
      },
      onRegisterApi: function(gridApi) {
        $scope.gridApi = gridApi;
      }
    };

    function createZeroValuesRow(newRow, componentType) {
      return {
        componentType: componentType,
        aPlus: 0,
        aMinus: 0,
        bPlus: 0,
        bMinus: 0,
        abPlus: 0,
        abMinus: 0,
        oPlus: 0,
        oMinus: 0,
        empty: 0,
        total: 0
      };
    }

    function mergeRows(newRow, mergedRow) {

      var cohorts = newRow.cohorts;
      var bloodType = cohorts[1].option;
      if (bloodType === 'A+') {
        mergedRow.aPlus = newRow.value;
      } else if (bloodType === 'A-') {
        mergedRow.aMinus = newRow.value;
      } else if (bloodType === 'B+') {
        mergedRow.bPlus = newRow.value;
      } else if (bloodType === 'B-') {
        mergedRow.bMinus = newRow.value;
      } else if (bloodType === 'AB+') {
        mergedRow.abPlus = newRow.value;
      } else if (bloodType === 'AB-') {
        mergedRow.abMinus = newRow.value;
      } else if (bloodType === 'O+') {
        mergedRow.oPlus = newRow.value;
      } else if (bloodType === 'O-') {
        mergedRow.oMinus = newRow.value;
      } else if (bloodType === 'nullnull' || !bloodType) {
        mergedRow.empty = newRow.value;
      }

      mergedRow.total = mergedRow.total + newRow.value;

      return mergedRow;
    }

    function mergeData(dataValues) {

      var previousComponentType = '';
      var mergedData = [];
      var mergedRow = {};

      angular.forEach(dataValues, function(newRow) {

        var cohorts = newRow.cohorts;
        var componentType = cohorts[0].option;

        if (componentType !== previousComponentType) {
          mergedRow = createZeroValuesRow(newRow, componentType);
          mergedData.push(mergedRow);
          previousComponentType = componentType;
        }

        mergedRow = mergeRows(newRow, mergedRow);
      });

      return mergedData;
    }

    $scope.export = function(format) {
      if (format === 'pdf') {
        $scope.gridApi.exporter.pdfExport('all', 'all');
      } else if (format === 'csv') {
        $scope.gridApi.exporter.csvExport('all', 'all');
      }
    };

    $scope.clearSearch = function(searchForm) {
      $scope.search = angular.copy(master);
      $scope.searched = false;
      searchForm.$setPristine();
      $location.search({});
    };

    $scope.clearDistributionCenter = function() {
      $scope.search.distributionCenter = null;
    };

    $scope.updateAllSites = function() {
      if ($scope.search.distributionCenter) {
        $scope.search.allSites = false;
      } else {
        $scope.search.allSites = true;
      }
    };

    $scope.viewStockLevels = function(searchForm) {
      if (searchForm.$invalid) {
        return;
      }

      $scope.searched = false;
      $scope.searching = true;
      searchedParams = angular.copy($scope.search);

      ReportsService.generateStockLevelsReport({ location: searchedParams.distributionCenter, inventoryStatus: searchedParams.inventoryStatus}, function(report) {
        $scope.gridOptions.data = mergeData(report.dataValues);
        $scope.gridOptions.columnDefs = isInStockSearch() ? inStockColumnDefs : notLabelledColumnDefs;
        $scope.searched = true;
        $scope.searching = false;
        $scope.gridOptions.paginationCurrentPage = 1;
      }, function(err) {
        $scope.searching = false;
        $log.error(err);
      });
    };

    function initialiseForm() {
      $scope.search = angular.copy(master);
      $scope.searched = false;
      ReportsService.getStockLevelsReportForm(function(response) {
        $scope.distributionCenters = response.distributionSites;
      }, $log.error);
    }

    initialiseForm();
  });