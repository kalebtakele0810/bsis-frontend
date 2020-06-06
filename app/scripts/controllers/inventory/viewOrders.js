'use strict';

angular.module('bsis').controller('ViewOrdersCtrl', function($scope, $location, $log, OrderFormsService, DATEFORMAT, gettextCatalog) {

  $scope.dateFormat = DATEFORMAT;

  var master = {
    orderDateFrom: moment().subtract(7, 'days').startOf('day').toDate(),
    orderDateTo: moment().endOf('day').toDate(),
    type: null,
    dispatchedFromId: null,
    dispatchedToId: null
  };

  var orderDateTitle = gettextCatalog.getString('Order Date');
  var orderStatusTitle = gettextCatalog.getString('Order Status');
  var dispatchTypeTitle = gettextCatalog.getString('Dispatch Type');
  var dispatchFromTitle = gettextCatalog.getString('Dispatch From');
  var dispatchToTitle = gettextCatalog.getString('Dispatched To');

  var columnDefs = [
    {
      name: 'Order Date',
      displayName: orderDateTitle,
      field: 'orderDate',
      cellFilter: 'bsisDate',
      width: '**',
      maxWidth: '200'
    },
    {
      name: 'Order Status',
      displayName: orderStatusTitle,
      field: 'status',
      width: '**',
      maxWidth: '200'
    },
    {
      name: 'Dispatch Type',
      displayName: dispatchTypeTitle,
      field: 'type',
      width: '**',
      maxWidth: '200'
    },
    {
      name: 'Dispatched From',
      displayName: dispatchFromTitle,
      field: 'dispatchedFrom.name',
      width: '**'
    },
    {
      name: 'Dispatched To',
      displayName: dispatchToTitle,
      field: 'dispatchedTo.name',
      width: '**'
    }
  ];

  var distributionSites = [];
  var usageSites = [];

  $scope.searchParams = {};
  $scope.dispatchToSites = [];
  $scope.dispatchFromSites = [];
  $scope.searching = false;
  $scope.submitted = false;

  $scope.gridOptions = {
    data: [],
    paginationPageSize: 6,
    paginationPageSizes: [6],
    paginationTemplate: 'views/template/pagination.html',
    minRowsToShow: 6,
    columnDefs: columnDefs,
    rowTemplate: 'views/template/clickablerow.html',

    onRegisterApi: function(gridApi) {
      $scope.gridApi = gridApi;
    }
  };

  // Set the "dispatch to" sites based on dispatch type
  function updateDispatchToSites() {
    if ($scope.searchParams.type === 'TRANSFER') {
      $scope.dispatchToSites = distributionSites.filter(function(site) {
        // Filter the selected distribution site from the options
        return site.id !== $scope.searchParams.dispatchedFrom;
      });
    } else if ($scope.searchParams.type === 'ISSUE' || $scope.searchParams.type === 'PATIENT_REQUEST') {
      $scope.dispatchToSites = usageSites;
    } else {
      $scope.dispatchToSites = [];
    }
  }

  $scope.$watch('searchParams.type', function() {
    // Update to set available options based on type
    updateDispatchToSites();
  });

  $scope.$watch('searchParams.dispatchedFrom', function() {
    // Update to ensure that the correct site is filtered
    updateDispatchToSites();
  });

  $scope.findOrders = function(findOrderForm) {
    if (findOrderForm.$invalid) {
      return;
    }
    $scope.searching = true;
    $scope.submitted = true;

    // Find orders
    OrderFormsService.findOrderForms($scope.searchParams, function(res) {
      $scope.gridOptions.data = res.orderForms;
      $scope.searching = false;
      $scope.gridOptions.paginationCurrentPage = 1;
    }, function(err) {
      $scope.searching = false;
      $log.error(err);
    });
  };

  $scope.onRowClick = function(row) {
    $location.path('/viewOrder/' + row.entity.id);
  };

  $scope.init = function() {
    $scope.gridOptions.data = [];
    $scope.searchParams = angular.copy(master);
    $scope.submitted = false;
    $scope.searching = false;
    OrderFormsService.getOrderFormsForm(function(response) {
      $scope.dispatchFromSites = distributionSites = response.distributionSites;
      usageSites = response.usageSites;
      updateDispatchToSites();
    }, $log.error);
  };

  $scope.init();


});
