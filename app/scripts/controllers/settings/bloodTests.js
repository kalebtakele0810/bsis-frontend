'use strict';

angular.module('bsis').controller('BloodTestsCtrl', function($scope, $log, ICONS, $location, BloodTestsService, gettextCatalog) {

  var columnDefs = [
    {
      name: 'Name',
      displayName: gettextCatalog.getString('Name'),
      field: 'testName',
      width: '**'
    },
    {
      name: 'Short Name',
      displayName: gettextCatalog.getString('Short Name'),
      field: 'testNameShort',
      width: '**'
    },
    {
      name: 'Category',
      displayName: gettextCatalog.getString('Category'),
      field: 'category',
      width: '**',
      maxWidth: '200'
    },
    {
      name: 'Rank in Category',
      displayName: gettextCatalog.getString('Rank in Category'),
      field: 'rankInCategory',
      width: '**',
      maxWidth: '140'
    },
    {
      name: 'BloodTestType',
      displayName: gettextCatalog.getString('Blood Test Type'),
      field: 'bloodTestType',
      width: '**',
      maxWidth: '200'
    },
    {
      name: 'IsActive',
      displayName: gettextCatalog.getString('In Active Use'),
      field: 'isActive',
      cellTemplate: '<div class="ui-grid-cell-contents">' +
        '<span ng-show="row.entity.isActive"><i class="fa {{grid.appScope.icons.SQUARECHECK}}"></i></span>' +
        '<span ng-show="!row.entity.isActive"><i class="fa {{grid.appScope.icons.SQUARE}}"></i></span></div>',
      width: '**',
      maxWidth: '150'
    },
    {
      name: 'Enabled',
      displayName: gettextCatalog.getString('Enabled'),
      field: 'isDeleted',
      cellTemplate: '<div class="ui-grid-cell-contents">' +
        '<span ng-show="!row.entity.isDeleted"><i class="fa {{grid.appScope.icons.SQUARECHECK}}"></i></span>' +
        '<span ng-show="row.entity.isDeleted"><i class="fa {{grid.appScope.icons.SQUARE}}"></i></span></div>',
      width: '**',
      maxWidth: '115'
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
    $location.path('/manageBloodTest/' + row.entity.id);
  };

  function init() {
    BloodTestsService.getBloodTests(function(response) {
      $scope.gridOptions.data = response.bloodTests;
    }, $log.error);
  }

  init();

});