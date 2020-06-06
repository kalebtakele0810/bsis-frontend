'use strict';

angular.module('bsis').controller('ComponentTypeCombinationsCtrl', function($scope, $location, $routeParams, gettextCatalog, $log, ICONS, ComponentTypeCombinationsService) {

  var columnDefs = [
    {
      name: 'Name',
      field: 'combinationName',
      displayName: gettextCatalog.getString('Name'),
      width: '**'
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

  $scope.onRowClick = function(row) {
    $location.path('/manageComponentTypeCombination/' + row.entity.id);
  };

  function init() {
    ComponentTypeCombinationsService.getComponentTypeCombinations(function(response) {
      $scope.gridOptions.data = response.componentTypeCombinations;
    }, $log.error);
  }

  init();

});