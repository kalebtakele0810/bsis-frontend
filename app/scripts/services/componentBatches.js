'use strict';

angular.module('bsis')
  .factory('ComponentBatchService', function($http, Api) {
    return {
      getComponentBatchesFormFields: function(onSuccess, onError) {
        Api.ComponentBatchesFormFields.get({}, function(response) {
          onSuccess(response);
        }, function(err) {
          onError(err.data);
        });
      },
      addComponentBatch: function(componentBatch, onSuccess, onError) {

        var addComponentBatch = new Api.ComponentBatches();
        angular.copy(componentBatch, addComponentBatch);

        // save componentBatch (POST /componentBatches)
        addComponentBatch.$save(function(response) {
          onSuccess(response);
        }, function(err) {
          onError(err.data);
        });
      },
      getComponentBatch: function(id, onSuccess, onFailure) {
        Api.ComponentBatches.get({id: id}, function(response) {
          onSuccess(response);
        }, function(err) {
          onFailure(err);
        });
      },
      findComponentBatches: function(period, onSuccess, onError) {
        Api.ComponentBatchesSearch.get({startDate: period.startDate, endDate: period.endDate}, function(response) {
          onSuccess(response);
        }, function(err) {
          onError(err.data);
        });
      }
    };
  });
