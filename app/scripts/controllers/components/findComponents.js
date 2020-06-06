'use strict';

angular.module('bsis')
  .controller('FindComponentsCtrl', function($scope, $location, ComponentService, ICONS, DATEFORMAT, $filter, ngTableParams, $timeout, $routeParams) {

    $scope.icons = ICONS;

    $scope.format = DATEFORMAT;
    $scope.startDateOpen = false;
    $scope.endDateOpen = false;

    var data = [{}];
    $scope.data = data;
    $scope.component = {};

    var searchMaster = {
      donationIdentificationNumber: '',
      componentTypes: [],
      locationId: null,
      status: null,
      allSites: true,
      allStatuses: true,
      donationDateFrom: moment().subtract(7, 'days').startOf('day').toDate(),
      donationDateTo: moment().endOf('day').toDate()
    };
    $scope.searchResults = '';
    $scope.search = angular.copy(searchMaster);
    $scope.dinSearch = false;

    $scope.componentsSummaryTableParams = new ngTableParams({
      page: 1,            // show first page
      count: 6,          // count per page
      filter: {},
      sorting: {}
    },
      {
        defaultSort: 'asc',
        counts: [], // hide page counts control
        total: data.length, // length of data
        getData: function($defer, params) {
          var filteredData = params.filter() ?
            $filter('filter')(data, params.filter()) : data;
          var orderedData = params.sorting() ?
            $filter('orderBy')(filteredData, params.orderBy()) : data;
          params.total(orderedData.length); // set total for pagination
          $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
      });

    $scope.$watch('data', function() {
      $timeout(function() {
        $scope.componentsSummaryTableParams.reload();
      });
    });

    $scope.findComponents = function(search) {
      if (!$scope.findComponentForm.$valid) {
        return;
      }

      $scope.componentsView = 'viewDonations';
      search.findComponentsSearch = true;
      $scope.componentsSummaryTableParams.page(1);
      $location.search(search);

      $scope.searching = true;
      ComponentService.ComponentsSearch(search, function(searchResponse) {
        if (searchResponse !== false) {
          data = searchResponse.components;
          $scope.data = data;
          $scope.searchResults = true;
          $scope.componentsSearchCount = $scope.data.length;
          $scope.searching = false;
        } else {
          $scope.searchResults = false;
          $scope.searching = false;
        }
      });
    };

    $scope.clear = function() {
      $scope.search = angular.copy(searchMaster);
      $scope.dinSearch = false;
      $scope.searchResults = '';
      $scope.findComponentForm.$setPristine();
      $location.search({});
    };

    $scope.updateDinSearch = function() {
      var din = $scope.search.donationIdentificationNumber;
      if (din && din.length > 0) {
        $scope.dinSearch = true;
        $scope.search.componentTypes = [];
        $scope.search.locationId = null;
        $scope.search.status = null;
        $scope.search.donationDateFrom = null;
        $scope.search.donationDateTo = null;
        $scope.search.allSites = true;
        $scope.search.allStatuses = true;
      } else {
        $scope.dinSearch = false;
        $scope.search.donationDateFrom = moment().subtract(7, 'days').startOf('day').toDate();
        $scope.search.donationDateTo = moment().endOf('day').toDate();
      }
    };

    $scope.setcomponentsView = function(view) {
      $scope.componentsView = view;
    };

    $scope.clearLocations = function() {
      $scope.search.locationId = null;
    };

    $scope.clearComponentStatuses = function() {
      $scope.search.status = null;
    };

    $scope.updateAllSites = function() {
      if ($scope.search.locationId) {
        $scope.search.allSites = false;
      }
    };

    $scope.updateAllStatuses = function() {
      if ($scope.search.status) {
        $scope.search.allStatuses = false;
      }
    };

    $scope.viewComponents = function(din) {
      $scope.din = din;
      ComponentService.getComponentsByDIN(din, function(componentsResponse) {
        if (componentsResponse !== false) {
          $scope.components = componentsResponse.components;
          $scope.componentsView = 'viewComponents';
        }
      });
    };

    function initialiseRouteParams() {
      if ($routeParams.findComponentsSearch) {
        if ($routeParams.donationIdentificationNumber) {
          $scope.search.donationIdentificationNumber = $routeParams.donationIdentificationNumber;
        }
        if ($routeParams.donationDateFrom) {
          var donationDateFrom = new Date($routeParams.donationDateFrom);
          $scope.search.donationDateFrom = donationDateFrom;
        }
        if ($routeParams.donationDateTo) {
          var donationDateTo = new Date($routeParams.donationDateTo);
          $scope.search.donationDateTo = donationDateTo;
        }
        if ($routeParams.componentTypes) {
          var componentTypes = $routeParams.componentTypes;
          if (!angular.isArray(componentTypes)) {
            componentTypes = [componentTypes];
          }
          $scope.search.componentTypes = componentTypes;
        }
        if ($routeParams.locationId) {
          var locationId = $routeParams.locationId;
          $scope.search.locationId = locationId;
        }
        if ($routeParams.status) {
          var status = $routeParams.status;
          $scope.search.status = status;
        }
        $scope.updateDinSearch();
        $scope.findComponents($scope.search);
      }
    }

    function initialiseFindComponentForm() {
      ComponentService.getComponentsFormFields(function(response) {
        if (response !== false) {
          $scope.componentTypes = response.componentTypes;
          $scope.locations = response.locations;
          $scope.componentStatuses = response.componentStatuses;
          initialiseRouteParams();
        }
      });
    }

    initialiseFindComponentForm();
  })
;
