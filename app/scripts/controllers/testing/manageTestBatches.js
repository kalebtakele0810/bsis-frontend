angular.module('bsis')
  .controller('ManageTestBatchesCtrl', function($scope, $location, TestingService, ngTableParams, $timeout, $filter, $log, DATEFORMAT, ICONS) {

    $scope.icons = ICONS;
    $scope.maxDate = moment().toDate();

    var data = [{}];
    $scope.openTestBatches = false;
    var testBatchMaster = {
      testBatchDate: null,
      location: null,
      backEntry: false
    };
    var testBatchDateMaster = {
      date: moment().toDate(),
      time: moment().toDate()
    };
    $scope.testBatch = angular.copy(testBatchMaster);
    $scope.testBatchDate = angular.copy(testBatchDateMaster);

    $scope.clearAddTestBatchForm = function(form) {
      $location.search({});
      form.$setPristine();
      $scope.submitted = '';
      $scope.testBatch = angular.copy(testBatchMaster);
      $scope.testBatchDate = angular.copy(testBatchDateMaster);
      $scope.searchResults = '';
      $scope.addingTestBatch = false;
    };

    $scope.applyBackEntryChange = function() {
      if ($scope.testBatch.backEntry) {
        $scope.testBatchDate.date = null;
        $scope.testBatchDate.time = moment().startOf('day').toDate();
      } else {
        $scope.testBatchDate = angular.copy(testBatchDateMaster);
      }
    };

    function getTestBatchDate(date, time) {
      return moment(date).hour(time.getHours()).minutes(time.getMinutes()).toDate();
    }

    $scope.clearLocationId = function() {
      $scope.search.locationId = null;
    };

    $scope.manageTestBatch = function(item) {
      $location.path('/manageTestBatch/' + item.id);
    };

    $scope.getOpenTestBatches = function() {
      TestingService.getOpenTestBatches(function(response) {
        if (response !== false) {
          data = response.testBatches;
          $scope.data = data;
          if ($scope.testBatchTableParams.data.length >= 0) {
            $scope.testBatchTableParams.reload();
          }
          $scope.openTestBatches = data.length > 0;

        }
      });
    };

    $scope.getTestBatchForm = function() {
      TestingService.getTestBatchFormFields(function(response) {
        if (response !== false) {
          $scope.testingSites = response.testingSites;
        }
      });
    };

    $scope.getOpenTestBatches();
    $scope.getTestBatchForm();

    $scope.addTestBatch = function(addTestBatchForm) {
      if (addTestBatchForm.$valid) {
        $scope.addingTestBatch = true;
        $scope.testBatch.testBatchDate = getTestBatchDate($scope.testBatchDate.date, $scope.testBatchDate.time);
        TestingService.addTestBatch($scope.testBatch, function() {
          $scope.getOpenTestBatches();
          $scope.clearAddTestBatchForm(addTestBatchForm);
        }, function(err) {
          $log.error(err);
          $scope.addingTestBatch = false;
        });
      } else {
        $scope.submitted = true;
      }
    };

    $scope.testBatchTableParams = new ngTableParams({
      page: 1,            // show first page
      count: 4,          // count per page
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
        $scope.testBatchTableParams.reload();
      });
    });

    // Closed batches functions

    $scope.dateFormat = DATEFORMAT;
    var closedTestBatchData = null;
    $scope.closedTestBatchData = closedTestBatchData;
    $scope.closedTestBatches = false;

    var master = {
      allSites: true,
      status: 'CLOSED',
      startDate: moment().subtract(7, 'days').startOf('day').toDate(),
      endDate: moment().endOf('day').toDate()
    };

    $scope.search = angular.copy(master);

    $scope.clearClosedBatchesSearch = function(closedTestBatchesForm) {
      $scope.searched = false;
      $location.search({});
      $scope.search = angular.copy(master);
      closedTestBatchesForm.$setPristine();
    };

    $scope.getClosedTestBatches = function(closedTestBatchesForm) {
      if (closedTestBatchesForm.$valid) {
        var query = {
          status: 'CLOSED'
        };

        if ($scope.search.startDate) {
          var startDate = moment($scope.search.startDate).startOf('day').toDate();
          query.startDate = startDate;
        }

        if ($scope.search.endDate) {
          var endDate = moment($scope.search.endDate).endOf('day').toDate();
          query.endDate = endDate;
        }

        if ($scope.search.locationId) {
          query.locationId = $scope.search.locationId;
        }

        $scope.searching = true;

        TestingService.getRecentTestBatches(query, function(response) {
          $scope.searching = false;
          if (response !== false) {
            closedTestBatchData = response.testBatches;
            $scope.closedTestBatchData = closedTestBatchData;
            $scope.closedTestBatchesTableParams.$params.page = 1;
            $scope.closedTestBatches = closedTestBatchData.length > 0;
          }
        }, function() {
          $scope.searching = false;
        });
      }
    };

    $scope.closedTestBatchesTableParams = new ngTableParams({
      page: 1,            // show first page
      count: 8,          // count per page
      filter: {},
      sorting: {}
    },
      {
        defaultSort: 'asc',
        counts: [], // hide page counts control
        getData: function($defer, params) {
          var filteredData = params.filter() ?
            $filter('filter')(closedTestBatchData, params.filter()) : closedTestBatchData;
          var orderedData = params.sorting() ?
            $filter('orderBy')(filteredData, params.orderBy()) : closedTestBatchData;
          params.total(orderedData.length); // set total for pagination
          $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
      });

    $scope.$watch('closedTestBatchData', function() {
      $timeout(function() {
        $scope.closedTestBatchesTableParams.reload();
      });
    });

  })
;
