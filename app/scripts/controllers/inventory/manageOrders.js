'use strict';

angular.module('bsis').controller('ManageOrdersCtrl', function($scope, $log, $location, OrderFormsService, GENDER, BLOODGROUP, DATEFORMAT, gettextCatalog) {

  var distributionSites = [];
  var usageSites = [];

  $scope.dateFormat = DATEFORMAT;

  $scope.maxDateOfBirth = moment().endOf('day').toDate();

  // Set the "dispatch to" sites based on dispatch type
  function updateDispatchToSites() {
    if ($scope.orderForm.type === 'TRANSFER') {
      $scope.dispatchToSites = distributionSites.filter(function(site) {
        // Filter the selected distribution site from the options
        return site.id !== $scope.orderForm.dispatchedFrom;
      });
    } else if ($scope.orderForm.type === 'ISSUE' || $scope.orderForm.type === 'PATIENT_REQUEST') {
      $scope.dispatchToSites = usageSites;
    } else {
      $scope.dispatchToSites = [];
    }
  }

  function initialise() {

    // Get current order forms
    var params = {
      status: 'CREATED'
    };
    OrderFormsService.findOrderForms(params, function(res) {
      $scope.gridOptions.data = res.orderForms;
    }, $log.error);

    // Get form elements
    OrderFormsService.getOrderFormsForm(function(res) {
      $scope.dispatchFromSites = distributionSites = res.distributionSites;
      usageSites = res.usageSites;
      updateDispatchToSites();
    }, $log.error);

    // Initialise the gender and blood group lists
    $scope.genders = GENDER.options;
    $scope.bloodGroups = BLOODGROUP.options;
  }

  $scope.orderForm = {
    orderDate: new Date(),
    type: null,
    dispatchedFrom: null,
    dispatchedTo: null,
    patient: null
  };
  $scope.addingOrderForm = false;
  // The available sites to be dispatched from
  $scope.dispatchFromSites = [];
  // The available sites to be dispatched to
  $scope.dispatchToSites = [];

  $scope.addOrder = function() {
    if ($scope.addOrderForm.$invalid) {
      // Don't submit if invalid
      return;
    }
    $scope.addingOrderForm = true;

    if ($scope.orderForm.type !== 'PATIENT_REQUEST') {
      $scope.orderForm.patient = null;
    }

    var orderForm = {
      status: 'CREATED',
      orderDate: $scope.orderForm.orderDate,
      type: $scope.orderForm.type,
      dispatchedFrom: {
        id: $scope.orderForm.dispatchedFrom
      },
      dispatchedTo: {
        id: $scope.orderForm.dispatchedTo
      },
      patient: $scope.orderForm.patient
    };

    OrderFormsService.addOrderForm({}, orderForm, function(res) {
      $scope.addingOrderForm = false;
      $location.path('/fulfilOrder/' + res.orderForm.id);
    }, function(err) {
      $log.error(err);
      $scope.addingOrderForm = false;
    });
  };

  $scope.clearForm = function() {
    $scope.orderForm.orderDate = new Date();
    $scope.orderForm.type = null;
    $scope.orderForm.dispatchedFrom = null;
    $scope.orderForm.dispatchedTo = null;
    $scope.orderForm.patient = null;
    $scope.addOrderForm.$setPristine();
  };

  $scope.$watch('orderForm.type', function() {
    // Update to set available options based on type
    updateDispatchToSites();
  });
  $scope.$watch('orderForm.dispatchedFrom', function() {
    // Update to ensure that the correct site is filtered
    updateDispatchToSites();
  });

  $scope.onRowClick = function(row) {
    $location.path('/viewOrder/' + row.entity.id);
  };

  var columnDefs = [
    {
      displayName: gettextCatalog.getString('Order Date'),
      field: 'orderDate',
      cellFilter: 'bsisDate',
      width: '**',
      maxWidth: '200'
    },
    {
      displayName: gettextCatalog.getString('Dispatch Type'),
      field: 'type',
      cellFilter: 'titleCase | translate',
      width: '**',
      maxWidth: '200'
    },
    {
      displayName: gettextCatalog.getString('Dispatch From'),
      field: 'dispatchedFrom.name',
      width: '**'
    },
    {
      displayName: gettextCatalog.getString('Dispatched To'),
      field: 'dispatchedTo.name',
      width: '**'
    }
  ];

  $scope.gridOptions = {
    data: [],
    paginationPageSize: 6,
    paginationPageSizes: [6],
    paginationTemplate: 'views/template/pagination.html',
    rowTemplate: 'views/template/clickablerow.html',
    columnDefs: columnDefs,
    minRowsToShow: 6,

    onRegisterApi: function(gridApi) {
      $scope.gridApi = gridApi;
    }
  };

  initialise();
});
