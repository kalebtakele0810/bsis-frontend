'use strict';

angular.module('bsis')
  .factory('TestingService', function($http, Api) {
    return {
      getTestBatchFormFields: function(response) {
        Api.TestBatches.getTestBatchForm({}, function(backingForm) {
          response(backingForm);
        }, function() {
          response(false);
        });
      },
      getTTITestingFormFields: function(response) {
        Api.TTITestingFormFields.get({}, function(backingForm) {
          response(backingForm);
        }, function() {
          response(false);
        });
      },
      getBloodGroupTestingFormFields: function(response) {
        Api.BloodGroupTestingFormFields.get({}, function(backingForm) {
          response(backingForm);
        }, function() {
          response(false);
        });
      },
      getTestBatchById: function(id, onSuccess, onError) {
        Api.TestBatches.get({id: id}, function(testBatch) {
          onSuccess(testBatch);
        }, function(err) {
          onError(err.data);
        });
      },
      getOpenTestBatches: function(response) {
        Api.TestBatches.search({status: ['OPEN', 'RELEASED']}, function(testBatches) {
          response(testBatches);
        }, function() {
          response(false);
        });
      },
      addTestBatch: function(testBatch, onSuccess, onError) {
        Api.TestBatches.save({}, testBatch, onSuccess, onError);
      },
      closeTestBatch: function(testBatch, onSuccess, onError) {
        testBatch.status = 'CLOSED';

        Api.TestBatches.update({}, testBatch, function(data) {
          onSuccess(data);
        }, function() {
          onError(false);
        });
      },
      reopenTestBatch: function(testBatch, onSuccess, onError) {
        testBatch.status = 'RELEASED';

        Api.TestBatches.update({}, testBatch, function(data) {
          onSuccess(data);
        }, function() {
          onError(false);
        });
      },
      releaseTestBatch: function(testBatch, onSuccess, onError) {
        testBatch.status = 'RELEASED';
        Api.TestBatches.update({}, testBatch, onSuccess, onError);
      },
      updateTestBatch: function(testBatch, onSuccess, onError) {
        Api.TestBatches.update({}, testBatch, function(data) {
          onSuccess(data);
        }, function(err) {
          onError(err.data);
        });
      },
      deleteTestBatch: function(testBatchId, onSuccess, onError) {
        Api.TestBatches.delete({id: testBatchId}, onSuccess, onError);
      },
      getRecentTestBatches: function(options, onSuccess, onError) {
        Api.TestBatches.search(options, function(testBatches) {
          onSuccess(testBatches);
        }, function(err) {
          onError(err.data);
        });
      },
      getTestBatchDonations: function(id, bloodTypingMatchStatus, onSuccess, onError) {
        Api.TestBatches.getTestBatchDonations({id: id, bloodTypingMatchStatus: bloodTypingMatchStatus}, function(data) {
          onSuccess(data);
        }, function(err) {
          onError(err);
        });
      },
      getTestResultsForm: Api.TestResults.form,
      getTestResultsByDIN: Api.TestResults.get,
      getTestSampleByDIN: Api.TestResults.getTestSample,
      getTestBatchOverviewById: Api.TestResults.overview,
      getTestBatchOutcomesReport: Api.TestResults.report,
      getTestOutcomesByBatchIdAndBloodTestType: Api.TestResults.search,
      saveTestResults: Api.TestResults.saveResults,
      saveBloodTypingResolutions: Api.Donations.bloodTypingResolutions,
      addDonationsToTestBatch: Api.TestBatches.addDonationsToTestBatch,
      removeDonationsFromTestBatch: Api.TestBatches.removeDonationsFromTestBatch
    };
  });