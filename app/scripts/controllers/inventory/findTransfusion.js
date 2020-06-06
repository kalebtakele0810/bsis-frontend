'use strict';

angular.module('bsis')
  .controller('FindTransfusionCtrl', function($scope, $location, $filter, $log, $routeParams, TransfusionService, gettextCatalog, DATEFORMAT) {

    $scope.dateFormat = DATEFORMAT;
    $scope.transfusionOutcomes = [];
    $scope.componentTypes = [];
    $scope.transfusionSites = [];

    $scope.searchParams = {};
    $scope.submitted = false;
    $scope.searching = false;
    $scope.searchForm = {};

    $scope.clearFields = function() {
      $scope.searchParams.receivedFromId = null;
      $scope.searchParams.transfusionOutcome = null;

      if ($scope.searchParams.donationIdentificationNumber) {
        $scope.searchParams.startDate = null;
        $scope.searchParams.endDate = null;
      } else {
        $scope.searchParams.startDate = moment().subtract(7, 'days').startOf('day').toDate();
        $scope.searchParams.endDate = moment().endOf('day').toDate();
      }
    };

    var master = {
      donationIdentificationNumber: null,
      componentCode: null,
      componentTypeId: null,
      receivedFromId: null,
      transfusionOutcome: null,
      startDate: moment().subtract(7, 'days').startOf('day').toDate(),
      endDate: moment().endOf('day').toDate()
    };

    var columnDefs = [
      {
        name: 'DIN',
        displayName: gettextCatalog.getString('DIN'),
        field: 'donationIdentificationNumber',
        width: '**',
        maxWidth: '150'
      },
      {
        name: 'Component Code',
        displayName: gettextCatalog.getString('Component Code'),
        field: 'componentCode',
        width: '**',
        maxWidth: '150'
      },
      {
        name: 'Component Type',
        displayName: gettextCatalog.getString('Component Type'),
        field: 'componentType',
        width: '**'
      },
      {
        name: 'Transfused On',
        displayName: gettextCatalog.getString('Transfused On'),
        field: 'dateTransfused',
        cellFilter: 'bsisDate',
        width: '**',
        maxWidth: '150'
      },
      {
        name: 'Outcome',
        displayName: gettextCatalog.getString('Outcome'),
        field: 'transfusionOutcome',
        cellFilter: 'titleCase | translate',
        width: '**'
      },
      {
        name: 'Transfusion Site',
        displayName: gettextCatalog.getString('Transfusion Site'),
        field: 'receivedFrom.name',
        width: '**'
      }
    ];

    $scope.gridOptions = {
      data: [],
      paginationPageSize: 8,
      paginationPageSizes: [10],
      paginationTemplate: 'views/template/pagination.html',
      minRowsToShow: 8,
      columnDefs: columnDefs,
      rowTemplate: 'views/template/clickablerow.html',

      exporterPdfOrientation: 'portrait',
      exporterPdfPageSize: 'A4',
      exporterPdfDefaultStyle: {fontSize: 4, margin: [-2, 0, 0, 0] },
      exporterPdfTableStyle: {margin: [-10, 10, 0, 0]},
      exporterPdfTableHeaderStyle: {fontSize: 5, bold: true, margin: [-2, 0, 0, 0] },
      exporterPdfMaxGridWidth: 400,

      exporterFieldCallback: function(grid, row, col, value) {
        if (col.field === 'dateTransfused') {
          return $filter('bsisDate')(value);
        } if (col.field === 'transfusionOutcome') {
          return gettextCatalog.getString($filter('titleCase')(value));
        }
        return value;
      },

      // PDF header
      exporterPdfHeader: function() {
        var finalArray = [
          {
            text: gettextCatalog.getString('Component Transfusion Information'),
            fontSize: 10,
            bold: true,
            margin: [30, 20, 0, 0] // [left, top, right, bottom]
          }
        ];
        return finalArray;
      },

      exporterPdfCustomFormatter: function(docDefinition) {
        var componentType = $filter('filter')($scope.componentTypes, function(ct) {
          return ct.id === $scope.searchParams.componentTypeId;
        });
        var transfusionSite = $filter('filter')($scope.transfusionSites, function(usageSite) {
          return usageSite.id === $scope.searchParams.receivedFromId;
        });
        var transfusionOutcome = $scope.searchParams.transfusionOutcome;
        var allText = gettextCatalog.getString('All');
        var searchParams = [{
          text: [
            {text: gettextCatalog.getString('Component Type') + ': ', bold: true},
            (componentType && componentType[0] ? componentType[0].componentTypeName : allText) + '          ',
            {text: gettextCatalog.getString('Transfusion Site') + ': ', bold: true},
            (transfusionSite && transfusionSite[0] ? transfusionSite[0].name : allText) + '          ',
            {text: gettextCatalog.getString('Transfusion Outcome') + ': ', bold: true},
            (transfusionOutcome ? transfusionOutcome : allText)
          ], margin: [-10, 0, 0, 0], fontSize: 7
        }];
        docDefinition.content = searchParams.concat(docDefinition.content);
        return docDefinition;
      },

      // PDF footer
      exporterPdfFooter: function(currentPage, pageCount) {
        var columns = [
          {text: gettextCatalog.getString('Total Units: {{total}}', {total: $scope.gridOptions.data.length}), width: 'auto'},
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

    $scope.onRowClick = function(row) {
      $location.search({}).path('/recordTransfusions/' + row.entity.id);
    };

    function initialise() {
      $scope.searchParams = angular.copy(master);
      $scope.submitted = false;
      $scope.searching = false;
      TransfusionService.getSearchForm(function(response) {
        $scope.componentTypes = response.componentTypes;
        $scope.transfusionSites = response.usageSites;
        $scope.transfusionOutcomes = response.transfusionOutcomes;
      }, $log.error);
      if ($routeParams.din) {
        $scope.searchParams.donationIdentificationNumber = $routeParams.din;
        $scope.searchParams.componentCode = $routeParams.componentCode;
        $scope.findTransfusion($scope.searchForm);
      }
    }

    $scope.findTransfusion = function(searchForm) {
      if (searchForm.$invalid) {
        return;
      }
      $scope.submitted = true;
      $scope.searching = true;
      $scope.gridOptions.data = [];
      TransfusionService.search($scope.searchParams, function(response) {
        $scope.gridOptions.paginationCurrentPage = 1;
        $scope.gridOptions.data = response.transfusions;
        $scope.searching = false;
      }, function(err) {
        $log.error(err);
        $scope.searching = false;
      });
    };

    $scope.setComponentType = function(componentCode) {
      if (componentCode) {
        var filteredComponentTypes = $scope.componentTypes.filter(function(componentType) {
          return componentCode.indexOf(componentType.componentTypeCode) !== -1;
        });

        if (filteredComponentTypes.length > 0) {
          $scope.searchParams.componentTypeId = filteredComponentTypes[0].id;
        } else {
          $scope.searchParams.componentTypeId = null;
        }
      }
    };

    $scope.export = function(format) {
      if (format === 'pdf') {
        $scope.gridApi.exporter.pdfExport('all', 'all');
      } else if (format === 'csv') {
        $scope.gridApi.exporter.csvExport('all', 'all');
      }
    };

    $scope.clearSearch = function(searchForm) {
      $scope.gridOptions.data = [];
      $scope.searchParams = angular.copy(master);
      $scope.submitted = false;
      $scope.searching = false;
      $location.search({});
      searchForm.$setPristine();
    };
    initialise();
  });