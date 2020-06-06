'use strict';

angular.module('bsis')
  .controller('FindDiscardsCtrl', function($scope, $location, ComponentService, DATEFORMAT, ngTableParams, $timeout, $routeParams, $filter) {

    $scope.dateFormat = DATEFORMAT;

    // Initialize variables

    var data = [{}];
    var searchMaster = {
      donationIdentificationNumber: '',
      componentTypes: [],
      donationDateFrom: moment().subtract(7, 'days').startOf('day').toDate(),
      donationDateTo: moment().endOf('day').toDate()
    };
    $scope.dinSearch = false;
    $scope.searchResults = '';
    $scope.format = DATEFORMAT;
    $scope.startDateOpen = false;
    $scope.endDateOpen = false;
    $scope.componentTypes = [];
    $scope.discardsSearch = angular.copy(searchMaster);

    // Find discards methods (findDiscards.html)

    $scope.clear = function() {
      $scope.discardsSearch = angular.copy(searchMaster);
      $scope.searchResults = '';
      $scope.dinSearch = false;
      $scope.status = [];
      $location.search({});
    };

    $scope.updateDinSearch = function() {
      var din = $scope.discardsSearch.donationIdentificationNumber;
      if (din && din.length > 0) {
        $scope.dinSearch = true;
        $scope.discardsSearch.componentTypes = [];
        $scope.discardsSearch.donationDateFrom = null;
        $scope.discardsSearch.donationDateTo = null;
      } else {
        $scope.dinSearch = false;
        if ($scope.discardsSearch.donationDateFrom == null || $scope.discardsSearch.donationDateTo == null) {
          $scope.discardsSearch.donationDateFrom = moment().subtract(7, 'days').startOf('day').toDate();
          $scope.discardsSearch.donationDateTo = moment().endOf('day').toDate();
        }
      }
    };

    $scope.findDiscards = function(discardsSearch) {
      if (!$scope.findDiscardedComponentsForm.$valid) {
        return;
      }

      $scope.componentsView = 'viewDonations';

      discardsSearch.search = true;
      // limit results to DISCARDED components
      $scope.status = [];
      $scope.status.push('DISCARDED');
      discardsSearch.status = $scope.status;
      $location.search(discardsSearch);

      $scope.searching = true;
      ComponentService.ComponentsSearch(discardsSearch, function(searchResponse) {
        if (searchResponse !== false) {
          data = searchResponse.components;
          $scope.data = data;
          $scope.searchResults = true;
          $scope.componentsSearchCount = $scope.data.length;
          $scope.searching = false;
          $scope.componentsSummaryTableParams.$params.page = 1;
        } else {
          $scope.searchResults = false;
          $scope.searching = false;
        }
      });
    };

    function initialiseRouteParams() {
      if ($routeParams.search) {

        if ($routeParams.donationIdentificationNumber) {
          $scope.discardsSearch.donationIdentificationNumber = $routeParams.donationIdentificationNumber;
        }
        if ($routeParams.donationDateFrom) {
          var donationDateFrom = new Date($routeParams.donationDateFrom);
          $scope.discardsSearch.donationDateFrom = donationDateFrom;
        }
        if ($routeParams.donationDateTo) {
          var donationDateTo = new Date($routeParams.donationDateTo);
          $scope.discardsSearch.donationDateTo = donationDateTo;
        }
        if ($routeParams.componentTypes) {
          var componentTypes = $routeParams.componentTypes;
          if (!angular.isArray(componentTypes)) {
            componentTypes = [componentTypes];
          }
          $scope.discardsSearch.componentTypes = componentTypes;
        }

        $scope.updateDinSearch();
        $scope.findDiscards($scope.discardsSearch);
      }
    }

    function initialiseDiscardsForm() {
      ComponentService.getComponentsFormFields(function(response) {
        if (response !== false) {
          $scope.componentTypes = response.componentTypes;
          initialiseRouteParams();
        }
      });
    }

    // View components methods (viewDonations.html)

    $scope.viewComponents = function(din) {
      $scope.din = din;
      ComponentService.getComponentsByDIN(din, function(componentsResponse) {
        if (componentsResponse !== false) {
          $scope.components = componentsResponse.components;
          $scope.componentsView = 'viewComponents';
        }
      });
    };

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
          var orderedData = params.sorting() ?
            $filter('orderBy')(data, params.orderBy()) : data;
          params.total(orderedData.length); // set total for pagination
          $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
      });

    $scope.$watch('data', function() {
      $timeout(function() {
        $scope.componentsSummaryTableParams.reload();
      });
    });

    // View component summary methods (viewComponents.html)

    $scope.setcomponentsView = function(view) {
      $scope.componentsView = view;
    };

    // Execute when findDiscards.html loads

    initialiseDiscardsForm();

  });
