'use strict';

angular.module('bsis').controller('DivisionsCtrl', function($scope, $location, $routeParams, $filter, $log, DivisionsService, gettextCatalog) {

  var masterSearch = {
    name: null,
    includeSimilarResults: true,
    level: null
  };

  function init() {
    // Refresh search if route params are set
    if ($routeParams.search) {
      $scope.search = {
        name: $routeParams.name,
        includeSimilarResults: $routeParams.includeSimilarResults,
        level: $routeParams.level ? +$routeParams.level : null
      };

      $scope.findDivisions();
    }
  }

  function resetUIGridPage() {
    if ($scope.gridApi != null) {
      $scope.gridApi.pagination.seek(1);
    }
  }


  // Initialise scope variables
  $scope.search = angular.copy(masterSearch);
  $scope.searching = false;

  $scope.divisionLevels = [1, 2, 3].map(function(value) {
    return {
      label: $filter('divisionLevel')(value),
      value: value
    };
  });

  $scope.gridOptions = {
    data: null,
    columnDefs: [
      {displayName: gettextCatalog.getString('Name'), field: 'name'},
      {displayName: gettextCatalog.getString('Division Level'), field: 'level', cellFilter: 'divisionLevel'},
      {displayName: gettextCatalog.getString('Parent Division'), field: 'parent.name'}
    ],
    paginationPageSize: 7,
    paginationTemplate: 'views/template/pagination.html',
    minRowsToShow: 7,
    rowTemplate: 'views/template/clickablerow.html',
    onRegisterApi: function(gridApi) {
      $scope.gridApi = gridApi;
    }
  };

  $scope.onRowClick = function(row) {
    $location.path('/manageDivision/' + row.entity.id);
  };

  $scope.findDivisions = function() {

    if ($scope.searchForm && $scope.searchForm.$invalid) {
      // Form is invalid so don't continue
      return;
    }

    resetUIGridPage();

    $scope.searching = true;
    $location.search(angular.extend({search: true}, $scope.search));

    DivisionsService.findDivisions($scope.search, function(res) {
      $scope.gridOptions.data = res.divisions;
      $scope.searching = false;
    }, function(err) {
      $log.error(err);
      $scope.searching = false;
    });
  };

  $scope.clearSearch = function() {
    $scope.gridOptions.data = null;
    $scope.search = angular.copy(masterSearch);
    $location.search({});
    $scope.searchForm.$setPristine();
  };

  init();
});
