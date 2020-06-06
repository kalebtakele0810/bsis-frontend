'use strict';

angular.module('bsis').controller('FindSafeComponentsCtrl', function($scope, $log, $filter, gettextCatalog, LabellingService, UtilsService, BLOODGROUP, DATEFORMAT) {
  var searchMaster = {
    donationIdentificationNumber: null,
    componentCode: null,
    locationId: null,
    bloodGroups: [],
    componentTypeId: null,
    allSites: true,
    allComponentTypes: true,
    anyBloodGroup: true,
    inventoryStatus: 'NOT_IN_STOCK',
    startDate: moment().subtract(28, 'days').startOf('day').toDate(),
    endDate: moment().endOf('day').toDate()
  };

  $scope.search = angular.copy(searchMaster);

  var columnDefs = [
    {
      name: 'DIN',
      displayName: gettextCatalog.getString('DIN'),
      field: 'donationIdentificationNumber',
      width: '**',
      maxWidth: '100'
    },
    {
      name: 'Component Code',
      displayName: gettextCatalog.getString('Component Code'),
      field: 'componentCode',
      width: '**',
      maxWidth: '150'
    },
    {
      name: 'Date Collected',
      displayName: gettextCatalog.getString('Date Collected'),
      field: 'createdOn',
      cellFilter: 'bsisDate',
      width: '**',
      maxWidth: '130'
    },
    {
      name: 'Component Type',
      displayName: gettextCatalog.getString('Component Type'),
      field: 'componentType.componentTypeName',
      width: '**'
    },
    {
      name: 'Component Status',
      displayName: gettextCatalog.getString('Component Status'),
      field: 'status',
      cellFilter: 'titleCase | translate',
      width: '**',
      maxWidth: '150'
    },
    {
      name: 'Inventory Status',
      displayName: gettextCatalog.getString('Inventory Status'),
      field: 'inventoryStatus',
      cellFilter: 'titleCase | translate',
      width: '150',
      maxWidth: '150'

    },
    {
      name: 'Expiry Status',
      displayName: gettextCatalog.getString('Expiry Status'),
      field: 'daysToExpire',
      cellFilter: 'daysToExpire',
      width: '**',
      maxWidth: '200',
      sortingAlgorithm: function(a, b, rowA, rowB) {
        return UtilsService.dateSort(rowA.entity.expiresOn, rowB.entity.expiresOn);
      }
    },
    {
      name: 'Site',
      displayName: gettextCatalog.getString('Site'),
      field: 'location.name',
      width: '**',
      maxWidth: '350'
    },
    {
      name: 'Blood Group',
      displayName: gettextCatalog.getString('Blood Group'),
      field: 'bloodGroup',
      cellTemplate: '<div class="ui-grid-cell-contents">{{row.entity.bloodAbo}}{{row.entity.bloodRh}}</div>',
      width: '**',
      maxWidth: '150'
    }
  ];

  $scope.dateFormat = DATEFORMAT;
  $scope.searchParams = {};
  $scope.submitted = false;
  $scope.searching = false;
  $scope.dinSearch = false;
  $scope.componentTypes = [];
  $scope.locations = [];
  $scope.gridOptions = {
    data: [],
    paginationPageSize: 8,
    paginationPageSizes: [10],
    paginationTemplate: 'views/template/pagination.html',
    minRowsToShow: 8,
    columnDefs: columnDefs,

    exporterPdfOrientation: 'portrait',
    exporterPdfPageSize: 'A4',
    exporterPdfDefaultStyle: {fontSize: 4, margin: [-2, 0, 0, 0] },
    exporterPdfTableHeaderStyle: {fontSize: 5, bold: true, margin: [-2, 0, 0, 0] },
    exporterPdfMaxGridWidth: 400,

    exporterFieldCallback: function(grid, row, col, value) {
      if (col.field === 'createdOn') {
        return $filter('bsisDate')(value);
      } else if (col.field === 'bloodGroup') {
        return row.entity.bloodAbo + row.entity.bloodRh;
      } else if (col.field === 'status') {
        return gettextCatalog.getString($filter('titleCase')(value));
      } else if (col.field === 'inventoryStatus') {
        return gettextCatalog.getString($filter('titleCase')(value));
      } else if (col.field === 'daysToExpire') {
        return gettextCatalog.getString($filter('daysToExpire')(value));
      }
      return value;
    },

      // PDF header
    exporterPdfHeader: function() {
      var finalArray = [
        {
          text: gettextCatalog.getString('Safe components'),
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
          {text: gettextCatalog.getString('Number of components: {{componentNumber}}', {componentNumber: $scope.gridOptions.data.length}), width: 'auto'},
          {text: gettextCatalog.getString('Date generated: {{date}}', {date: $filter('bsisDateTime')(new Date())}), width: 'auto'},
          {text: gettextCatalog.getString('Page {{currentPage}} of {{pageCount}}', {currentPage: currentPage, pageCount: pageCount }), style: {alignment: 'right'}}
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

  function initialiseForm() {
    $scope.searchParams = angular.copy(searchMaster);
    $scope.submitted = false;
    $scope.searching = false;
    LabellingService.getComponentForm(function(response) {
      if (response !== false) {
        $scope.locations = response.locations;
        $scope.componentTypes = response.componentTypes;
        $scope.bloodGroups = BLOODGROUP.options;
      }
    });
  }

  $scope.findSafeComponents = function(search) {
    if ($scope.findSafeComponentsForm.$invalid) {
      return;
    }

    $scope.submitted = true;
    $scope.searching = true;
    $scope.gridOptions.paginationCurrentPage = 1;

    if (search.componentCode === '') {
      search.componentCode = null;
    }

    LabellingService.getSafeComponents(search, function(searchResponse) {
      $scope.gridOptions.data = searchResponse.components;
      $scope.searching = false;
    });
  }, function(err) {
    $scope.gridOptions.data = [];
    $log.error(err);
    $scope.searching = false;
  };

  $scope.updateDinSearch = function() {
    var din = $scope.searchParams.donationIdentificationNumber;
    $scope.searchParams = angular.copy(searchMaster);
    if (din && din.length > 0) {
      $scope.dinSearch = true;
      $scope.searchParams.donationIdentificationNumber = din;
      $scope.searchParams.startDate = null;
      $scope.searchParams.endDate = null;
      $scope.searchParams.inventoryStatus = null;
    } else {
      $scope.dinSearch = false;
    }
  };

  $scope.updateAllSites = function() {
    if ($scope.searchParams.locationId) {
      $scope.searchParams.allSites = false;
    }
  };

  $scope.clearLocationId = function() {
    $scope.searchParams.locationId = null;
  };

  $scope.updateAllComponentTypes = function() {
    if ($scope.searchParams.componentTypeId) {
      $scope.searchParams.allComponentTypes = false;
    }
  };

  $scope.clearComponentTypeId = function() {
    $scope.searchParams.componentTypeId = null;
  };

  $scope.updateAnyBloodGroup = function() {
    if ($scope.searchParams.bloodGroups && $scope.searchParams.bloodGroups.length !== 0) {
      $scope.searchParams.anyBloodGroup = false;
    } else {
      $scope.searchParams.anyBloodGroup = true;
    }
  };

  $scope.clearBloodGroups = function() {
    $scope.searchParams.bloodGroups = [];
  };

  $scope.clearSearch = function(searchForm) {
    $scope.gridOptions.data = [];
    $scope.searchParams = angular.copy(searchMaster);
    $scope.submitted = false;
    $scope.searching = false;
    $scope.dinSearch = false;
    searchForm.$setPristine();
  };
  initialiseForm();
});
