'use strict';

angular.module('bsis')

  .controller('ReenterTestOutcomesCtrl', function($scope, $location, $log, TestingService, $uibModal, $sce, $filter, ngTableParams, $timeout, $routeParams, gettextCatalog) {

    $scope.data = [];

    $scope.go = function(path) {
      $location.path(path + '/' + $routeParams.id);
    };

    // This test names will be the column names. They are specific to each blood test type.
    var getTestNames = function() {
      $scope.bloodTestType = $routeParams.bloodTestType;
      if ($scope.bloodTestType === 'BASIC_TTI') {
        $scope.showTTIStatus = true;
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
        $scope.showTTIStatus = false;
        TestingService.getTTITestingFormFields(function(response) {
          if (response !== false) {
            $scope.testNames = response.repeatTTITestNames;
          }
        });
      } else if ($scope.bloodTestType === 'CONFIRMATORY_TTI') {
        $scope.showTTIStatus = false;
        TestingService.getTTITestingFormFields(function(response) {
          if (response !== false) {
            $scope.testNames = response.confirmatoryTTITestNames;
          }
        });
      }
    };

    // The array reEnteredTestOutcomes is originally populated with all test outcomes where reEntryRequired is false.
    // As the reEntry values are selected from the dropdowns, they are added to this array.
    var getReEnteredTestOutcomes = function() {
      TestingService.getTestOutcomesByBatchIdAndBloodTestType({testBatch: $routeParams.id, bloodTestType: $routeParams.bloodTestType}, function(response) {
        $scope.data = response.testResults;
        $scope.testBatchCreatedDate = response.testBatchCreatedDate;
        $scope.reEnteredTestOutcomes = {};

        angular.forEach($scope.data, function(donationResults) {
          var din = donationResults.donation.donationIdentificationNumber;
          $scope.reEnteredTestOutcomes[din] = {'donationIdentificationNumber': din, 'testResults': {}};
          angular.forEach(donationResults.recentTestResults, function(test) {
            if (test.reEntryRequired === false) {
              $scope.reEnteredTestOutcomes[din].testResults[test.bloodTest.id] = test.result;
            } else {
              donationResults.editableRow = true;
            }
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
    getReEnteredTestOutcomes();

    var reEntriesConfirmed = 0;
    var reEntriesWithDiscrepancies = 0;
    var totalReEntries = 0;
    $scope.reEntryConfirmations = {};
    var testOutcomesToSave = {};

    // This method calculates the values used in the confirmation popup and
    // populates testOutcomesToSave
    var preSaveCalculations = function() {
      reEntriesConfirmed = 0;
      reEntriesWithDiscrepancies = 0;
      totalReEntries = 0;

      angular.forEach($scope.data, function(donationResults) {
        var donationWasUpdated = false;
        var din = donationResults.donation.donationIdentificationNumber;
        testOutcomesToSave[din] = {'donationIdentificationNumber': din, 'testResults': {}};

        angular.forEach(donationResults.recentTestResults, function(testOutcome) {
          // only check outcomes where reEntryRequired = true
          if (testOutcome.reEntryRequired === true) {
            totalReEntries++;
            // check that a reEntry outcome has been selected
            if ($scope.reEnteredTestOutcomes[din].testResults[testOutcome.bloodTest.id]) {
              donationWasUpdated = true;

              // populate test outcomes to save
              testOutcomesToSave[din].testResults[testOutcome.bloodTest.id] = $scope.reEnteredTestOutcomes[din].testResults[testOutcome.bloodTest.id];

              // case 1: selected same outcome as before
              if (testOutcome.result === $scope.reEnteredTestOutcomes[din].testResults[testOutcome.bloodTest.id]) {
                reEntriesConfirmed++;
              // case 2: selected different outcome as before, and it was confirmed
              } else if ($scope.reEntryConfirmations[din] && $scope.reEntryConfirmations[din][testOutcome.bloodTest.id]) {
                reEntriesConfirmed++;
              // case 3: selected different outcome as before, and it wasn't confirmed (discrepancy)
              } else {
                reEntriesWithDiscrepancies++;
              }
            }
          }
        });

        // if donation was not updated, delete the object from testOutcomesToSave
        if (!donationWasUpdated) {
          delete testOutcomesToSave[din];
        }

      });
    };

    var saveTestOutcomes = function() {
      $scope.savingTestOutcomes = true;
      var testResultsArray = {};
      testResultsArray.testOutcomesForDonations = [];

      angular.forEach(testOutcomesToSave, function(value) {
        testResultsArray.testOutcomesForDonations.push(value);
      });

      TestingService.saveTestResults({reEntry: true}, testResultsArray, function() {
        $location.path('/manageTestBatch/' + $routeParams.id);
      }, function(err) {
        $log.error(err);
        $scope.savingTestOutcomes = false;
      });
    };

    var confirmSaveTestOutcomes = function() {
      var saveObject = {
        title: gettextCatalog.getString('Save test outcomes'),
        button: gettextCatalog.getString('Save'),
        message: gettextCatalog.getString('Re-entry completed for {{reEntriesConfirmed}} of {{totalReEntries}} outcomes.', {reEntriesConfirmed: reEntriesConfirmed,
          totalReEntries: totalReEntries}) + ' <br/>' + gettextCatalog.getString(
          'Re-entry required for {{reEntriesNotConfirmed}} of {{totalReEntries}} outcomes.', {
            totalReEntries: totalReEntries, reEntriesNotConfirmed: (totalReEntries - reEntriesConfirmed)})
      };
      var modalInstance = $uibModal.open({
        animation: false,
        templateUrl: 'views/confirmModal.html',
        controller: 'ConfirmModalCtrl',
        resolve: {
          confirmObject: function() {
            return saveObject;
          }
        }
      });
      modalInstance.result.then(function() {
        // Then save the test outcomes
        saveTestOutcomes();
      }, function() {
        // save cancelled - do nothing
      });
    };

    $scope.validateSaveTestOutcomesForm = function() {
      preSaveCalculations();

      // Only save once all the discrepancies have been confirmed
      if (reEntriesWithDiscrepancies > 0) {
        $scope.showAlert = true;
      } else {
        $scope.showAlert = false;
        confirmSaveTestOutcomes();
      }
    };

    $scope.resetPreviousConfirmations = function(din, bloodTestId, firstEntryResult) {
      // If there was a previous confirmation for that outcome, if the outcome now selected is the same as first entry,
      // update reEntryConfirmations to false for that outcome
      if ($scope.reEntryConfirmations[din] && $scope.reEntryConfirmations[din][bloodTestId]) {
        if ($scope.reEnteredTestOutcomes[din].testResults[bloodTestId] === firstEntryResult) {
          $scope.reEntryConfirmations[din][bloodTestId] = false;
        }
      }
    };

    $scope.testOutcomesTableParams = new ngTableParams({
      page: 1,            // show first page
      count: 10,          // count per page
      filter: {},
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


