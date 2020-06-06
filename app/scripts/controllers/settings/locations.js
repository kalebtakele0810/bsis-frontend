'use strict';

angular.module('bsis').controller('LocationsCtrl', function($scope, $location, $routeParams, $log, ICONS, LocationsService, ConfigurationsService, gettextCatalog) {

  var master = {
    name: '',
    includeSimilarResults: true,
    locationType: null
  };

  var columnDefs = [
    {
      name: 'Name',
      displayName: gettextCatalog.getString('Name'),
      field: 'name',
      width: '**'
    },
    {
      name: 'Enabled',
      displayName: gettextCatalog.getString('Enabled'),
      field: 'isDeleted',
      cellTemplate: '<div class="ui-grid-cell-contents">' +
        '<span ng-show="!row.entity.isDeleted"><i class="fa {{grid.appScope.icons.SQUARECHECK}}"></i></span>' +
        '<span ng-show="row.entity.isDeleted"><i class="fa {{grid.appScope.icons.SQUARE}}"></i></span></div>',
      width: '**',
      maxWidth: '200'
    },
    {
      displayName: ConfigurationsService.getStringValue('ui.division.level3.displayName'),
      field: 'divisionLevel3.name',
      width: '**'
    }

  ];

  $scope.icons = ICONS;
  $scope.findLocationForm = {};
  $scope.locationSearch = {};
  $scope.locationType = [];
  $scope.searching = false;
  $scope.searched = false;

  $scope.gridOptions = {
    data: [],
    paginationPageSize: 7,
    paginationTemplate: 'views/template/pagination.html',
    minRowsToShow: 7,
    columnDefs: columnDefs,
    rowTemplate: 'views/template/clickablerow.html',

    onRegisterApi: function(gridApi) {
      $scope.gridApi = gridApi;
    }
  };

  function init() {
    $scope.searched = false;
    $scope.searching = false;

    // inspect the parameters in the URL + copy for the search
    $scope.locationSearch = angular.copy(master);
    if ($routeParams.name) {
      $scope.locationSearch.name = $routeParams.name;
    }
    if ($routeParams.includeSimilarResults) {
      if ($routeParams.includeSimilarResults === 'false') {
        $scope.locationSearch.includeSimilarResults = false;
      } else {
        $scope.locationSearch.includeSimilarResults = true;
      }
    }
    if ($routeParams.locationType) {
      $scope.locationSearch.locationType = $routeParams.locationType;
    }
    if ($scope.locationSearch.name || $scope.locationSearch.locationType) {
      // if search paramaters have been defined, find the requested locations
      $scope.findLocations();
    }

    // initialise the form: locationType
    LocationsService.getSearchForm(function(response) {
      $scope.locationType = response.locationType;
    }, $log.error);
  }

  $scope.onRowClick = function(row) {
    $location.search({}).path('/manageLocation/' + row.entity.id);
  };

  $scope.clear = function() {
    $location.search({});
    $scope.locationSearch = angular.copy(master);
    $scope.searched = false;
    $scope.searching = false;
    $scope.gridOptions.data = [];
    $scope.findLocationForm.$setPristine();
  };

  $scope.findLocations = function() {
    if ($scope.findLocationForm.$invalid) {
      return;
    }
    $scope.searched = false;
    $scope.searching = true;
    $location.search($scope.locationSearch);
    LocationsService.search($scope.locationSearch, function(response) {
      $scope.gridOptions.data = response.locations;
      $scope.searched = true;
      $scope.searching = false;
      $scope.gridOptions.paginationCurrentPage = 1;
    }, function(error) {
      $log.error(error);
      $scope.searching = false;
    });
  };

  init();

});
