'use strict';

angular.module('bsis').controller('TransfusionReactionTypesCtrl', function($scope, $filter, $location, $log, gettextCatalog, $timeout, ICONS, TransfusionReactionTypesService) {

  $scope.icons = ICONS;
  $scope.transfusionReactionTypes = {};

  var columnDefs = [
    {
      name: 'Name',
      field: 'name',
      displayName: gettextCatalog.getString('Name'),
      width: '**',
      maxWidth: '300'
    },
    {
      name: 'Description',
      displayName: gettextCatalog.getString('Description'),
      field: 'description',
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

  $scope.getTransfusionReactionTypes = function() {
    TransfusionReactionTypesService.getTransfusionReactionTypes(function(response) {
      $scope.gridOptions.data = response.transfusionReactionTypes;
      $scope.transfusionReactionTypes = response.transfusionReactionTypes;
      $scope.transfusionReactionTypesCount = $scope.transfusionReactionTypes.length;
    }, $log.error);
  };

  $scope.onRowClick = function(row) {
    $location.path('/manageTransfusionReactionType/' + row.entity.id);
  };

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

  $scope.getTransfusionReactionTypes();
});
