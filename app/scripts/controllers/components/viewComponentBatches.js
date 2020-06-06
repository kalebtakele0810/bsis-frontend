'use strict';

angular.module('bsis').controller('ViewComponentBatchesCtrl', function($scope, $filter, $location, ComponentBatchService, $log, DATEFORMAT, gettextCatalog) {

  $scope.dateFormat = DATEFORMAT;

  var master = {
    startDate: moment().subtract(7, 'days').startOf('day').toDate(),
    endDate: moment().endOf('day').toDate()
  };

  $scope.findComponentBatches = function() {
    if ($scope.findComponentBatchesForm.$invalid) {
      return;
    }
    $scope.searching = true;
    $scope.submitted = true;
    ComponentBatchService.findComponentBatches($scope.period, function(response) {
      $scope.gridOptions.data = response.componentBatches;
      $scope.gridOptions.paginationCurrentPage = 1;
      $scope.searching = false;
    }, function(err) {
      $scope.searching = false;
      $log.log(err);
    });
  };

  $scope.init = function() {
    $scope.period = angular.copy(master);
    $scope.gridOptions.data = [];
    $scope.submitted = false;
  };

  var columnDefs = [
    {
      name: 'Collection Date',
      displayName: gettextCatalog.getString('Collection Date'),
      field: 'collectionDate',
      cellFilter: 'bsisDate',
      width: '**',
      maxWidth: '250'
    },
    {
      name: 'Processing Site',
      displayName: gettextCatalog.getString('Processing Site'),
      field: 'location.name',
      width: '**',
      maxWidth: '350'
    },
    {
      name: 'Num Initial Components',
      displayName: gettextCatalog.getString('Num Initial Components'),
      field: 'numberOfInitialComponents',
      width: '**',
      maxWidth: '200'
    },
    {
      name: 'Donation Batch Status',
      displayName: gettextCatalog.getString('Donation Batch Status'),
      field: 'donationBatch.status',
      cellFilter: 'titleCase | translate',
      width: '**',
      maxWidth: '200'
    },
    {
      name: 'Delivery Date',
      displayName: gettextCatalog.getString('Delivery Date'),
      field: 'deliveryDate',
      cellFilter: 'bsisDate',
      width: '**',
      maxWidth: '250'
    },
    {
      name: 'Num Boxes',
      displayName: gettextCatalog.getString('Num Boxes'),
      field: 'numberOfBoxes',
      width: '**'
    }
  ];

  $scope.onRowClick = function(row) {
    $location.path('/viewComponentBatch/' + row.entity.id);
  };

  $scope.gridOptions = {
    data: [],
    paginationPageSize: 10,
    paginationPageSizes: [10],
    paginationTemplate: 'views/template/pagination.html',
    rowTemplate: 'views/template/clickablerow.html',
    columnDefs: columnDefs,

    exporterPdfOrientation: 'portrait',
    exporterPdfPageSize: 'A4',
    exporterPdfDefaultStyle: {fontSize: 4, margin: [-2, 0, 0, 0] },
    exporterPdfTableHeaderStyle: {fontSize: 5, bold: true, margin: [-2, 0, 0, 0] },
    exporterPdfMaxGridWidth: 400,

    exporterFieldCallback: function(grid, row, col, value) {
      if (col.field === 'collectionDate' || col.field === 'deliveryDate') {
        return $filter('bsisDate')(value);
      } else if (col.field === 'donationBatch.status') {
        return gettextCatalog.getString($filter('titleCase')(value));
      }
      return value;
    },

    // PDF header
    exporterPdfHeader: function() {
      var finalArray = [
        {
          text: gettextCatalog.getString('Component Delivery Forms'),
          fontSize: 10,
          bold: true,
          margin: [30, 20, 0, 0] // [left, top, right, bottom]
        }
      ];
      return finalArray;
    },

    exporterPdfTableStyle: {margin: [-10, 10, 0, 0]},

    // PDF footer
    exporterPdfFooter: function(currentPage, pageCount) {
      var columns = [
        {text: gettextCatalog.getString('Number of forms: {{count}}', {count: $scope.gridOptions.data.length}), width: 'auto'},
        {text: gettextCatalog.getString('Date generated: {{date}}', {date: $filter('bsisDateTime')(new Date())}), width: 'auto'},
        {text: gettextCatalog.getString('Page {{currentPage}} of {{pageCount}}', {currentPage: currentPage, pageCount: pageCount}), style: {alignment: 'right'}}
      ];
      return {
        columns: columns,
        columnGap: 10,
        margin: [30, 0],
        fontSize: 6
      };
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

  $scope.init();

});
