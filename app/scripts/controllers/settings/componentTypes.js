'use strict';

angular.module('bsis').controller('ComponentTypesCtrl', function($scope, $location, $routeParams, $log, gettextCatalog, ICONS, ComponentTypesService) {

  var columnDefs = [
    {
      name: 'Name',
      field: 'componentTypeName',
      displayName: gettextCatalog.getString('Name'),
      width: '**'
    },
    {
      name: 'ComponentCode',
      displayName: gettextCatalog.getString('Component Code'),
      field: 'componentTypeCode',
      width: '**',
      maxWidth: '200'
    },
    {
      name: 'CanBeIssued',
      displayName: gettextCatalog.getString('Can be Issued'),
      field: 'canBeIssued',
      cellTemplate: '<div class="ui-grid-cell-contents">' +
        '<span ng-show="row.entity.canBeIssued"><i class="fa {{grid.appScope.icons.SQUARECHECK}}"></i></span>' +
        '<span ng-show="!row.entity.canBeIssued"><i class="fa {{grid.appScope.icons.SQUARE}}"></i></span></div>',
      width: '**',
      maxWidth: '125'
    },
    {
      name: 'ContainsPlasma',
      displayName: gettextCatalog.getString('Contains Plasma'),
      field: 'containsPlasma',
      cellTemplate: '<div class="ui-grid-cell-contents">' +
        '<span ng-show="row.entity.containsPlasma"><i class="fa {{grid.appScope.icons.SQUARECHECK}}"></i></span>' +
        '<span ng-show="!row.entity.containsPlasma"><i class="fa {{grid.appScope.icons.SQUARE}}"></i></span></div>',
      width: '**',
      maxWidth: '150'
    },
    {
      name: 'ExpiresAfter',
      displayName: gettextCatalog.getString('Expires After'),
      field: 'expiresAfter',
      cellTemplate: '<div class="ui-grid-cell-contents">' +
      '<span translate translate-params-count="row.entity.expiresAfter">{{count}} day(s)</span></div>',
      width: '**',
      maxWidth: '150'
    },
    {
      name: 'Enabled',
      field: 'isDeleted',
      displayName: gettextCatalog.getString('Enabled'),
      cellTemplate: '<div class="ui-grid-cell-contents">' +
        '<span ng-show="!row.entity.isDeleted"><i class="fa {{grid.appScope.icons.SQUARECHECK}}"></i></span>' +
        '<span ng-show="row.entity.isDeleted"><i class="fa {{grid.appScope.icons.SQUARE}}"></i></span></div>',
      width: '**',
      maxWidth: '100'
    }
  ];

  $scope.icons = ICONS;

  $scope.gridOptions = {
    data: [],
    paginationPageSize: 10,
    paginationTemplate: 'views/template/pagination.html',
    minRowsToShow: 10,
    columnDefs: columnDefs,
    rowTemplate: 'views/template/clickablerow.html',

    onRegisterApi: function(gridApi) {
      $scope.gridApi = gridApi;
    }
  };

  function init() {
    ComponentTypesService.getComponentTypes(function(response) {
      $scope.gridOptions.data = response.componentTypes;
    }, $log.error);
  }

  $scope.onRowClick = function(row) {
    $location.path('/manageComponentType/' + row.entity.id);
  };

  init();

});