'use strict';

angular.module('bsis')

  .controller('RecordTestOutcomesCtrl', function($scope, $location, $log, TestingService, $filter, ngTableParams, $timeout, $routeParams) {
    $scope.data = [{}];

    $scope.go = function(path) {
      $location.path(path + '/' + $routeParams.id);
    };

    // This test names will be the column names. They are specific to each blood test type.
    var getTestNames = function() {
      $scope.bloodTestType = $routeParams.bloodTestType;
      if ($scope.bloodTestType === 'BASIC_TTI') {
        TestingService.getTTITestingFormFields(function(response) {
          if (response !== false) {
            $scope.testNames = response.basicTTITestNames;
          }
        });
      } else if ($scope.bloodTestType === 'BASIC_BLOODTYPING') {
        TestingService.getBloodGroupTestingFormFields(function(response) {
          if (response !== false) {
            $scope.testNames = response.basicBloodTypingTests;
          }
        });
      } else if ($scope.bloodTestType === 'REPEAT_BLOODTYPING') {
        TestingService.getBloodGroupTestingFormFields(function(response) {
          if (response !== false) {
            $scope.testNames = response.repeatBloodTypingTests;
          }
        });
      } else if ($scope.bloodTestType === 'REPEAT_TTI') {
        TestingService.getTTITestingFormFields(function(response) {
          if (response !== false) {
            $scope.testNames = response.repeatTTITestNames;
          }
        });
      } else if ($scope.bloodTestType === 'CONFIRMATORY_TTI') {
        TestingService.getTTITestingFormFields(function(response) {
          if (response !== false) {
            $scope.testNames = response.confirmatoryTTITestNames;
          }
        });
      }
    };

    var getTestOutcomes = function() {

      $scope.allTestOutcomes = {};
      var bloodTestType = $routeParams.bloodTestType;
      TestingService.getTestOutcomesByBatchIdAndBloodTestType({testBatch: $routeParams.id, bloodTestType: bloodTestType}, function(response) {
        $scope.data = response.testResults;
        $scope.testBatchCreatedDate = response.testBatchCreatedDate;
        angular.forEach($scope.data, function(donationResults) {
          var din = donationResults.donation.donationIdentificationNumber;
          var pendingTests = {};
          $scope.allTestOutcomes[din] = {'donationIdentificationNumber': din, 'testResults': {}};
          if (bloodTestType === 'REPEAT_TTI') {
            pendingTests = donationResults.pendingRepeatTTITestsIds;
          } else if (bloodTestType === 'CONFIRMATORY_TTI') {
            pendingTests = donationResults.pendingConfirmatoryTTITestsIds;
          }
          if (pendingTests.length !== 0) {
            donationResults.editableRow = true;
          }
          angular.forEach(donationResults.recentTestResults, function(test) {
            $scope.allTestOutcomes[din].testResults[test.bloodTest.id] = test.result;
            donationResults.editableRow = true;
          });
        });

        // Filter rows that are not editable from $scope.data
        $scope.data = $scope.data.filter(function(row) {
          return (row.editableRow === true);
        });

        //record number of donations after filtering has been done
        $scope.numberOfDonations = $scope.data.length;
      }, function(err) {
        $log.error(err);
      });
    };

    getTestNames();
    getTestOutcomes();

    $scope.saveTestResults = function(testResults, reEntry) {
      $scope.savingTestResults = true;

      var testResultsArray = {};
      testResultsArray.testOutcomesForDonations = [];

      angular.forEach(testResults, function(value) {
        testResultsArray.testOutcomesForDonations.push(value);
      });

      TestingService.saveTestResults({reEntry: reEntry}, testResultsArray, function() {
        $location.path('/manageTestBatch/' + $routeParams.id);
      }, function(err) {
        $log.error(err);
        $scope.savingTestResults = false;
      });
    };

    $scope.testOutcomesTableParams = new ngTableParams({
      page: 1,            // show first page
      count: 10,          // count per page
      sorting: {
        'donation.donationIdentificationNumber': 'asc'
      }
    },
      {
        defaultSort: 'asc',
        counts: [], // hide page counts control
        total: $scope.data.length, // length of data
        getData: function($defer, params) {
          var orderedData = params.sorting() ? $filter('orderBy')($scope.data, params.orderBy()) : $scope.data;
          params.total(orderedData.length); // set total for pagination
          $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
      });

    $scope.$watch('data', function() {
      $timeout(function() {
        $scope.testOutcomesTableParams.reload();
      });
    });

  })
;