'use strict';

angular.module('bsis')
  .factory('DiscardReasonsService', function($http, Api) {

    var discardReasonObj = {};
    return {

      getDiscards: function(response) {
        Api.DiscardReasons.get({}, function(apiResponse) {
          response(apiResponse.allDiscardReasons);
        }, function() {
          response(false);
        });
      },

      getDiscardReasonById: function(id, onSuccess, onError) {
        Api.DiscardReasons.get({id: id}, function(apiResponse) {
          onSuccess(apiResponse.reason);
        }, function(err) {
          onError(err.data);
        });
      },

      setDiscardReason: function(discard) {
        discardReasonObj = discard;
      },

      getDiscardReason: function() {
        return discardReasonObj;
      },

      addDiscardReason: function(discard, response) {
        var addDiscard = new Api.DiscardReasons();
        angular.copy(discard, addDiscard);

        addDiscard.$save(function(data) {
          response(data.reason);
        }, function(err) {
          response(false, err.data);
        });

      },

      updateDiscardReason: function(discard, response) {

        var updatedDiscard = angular.copy(discard);
        Api.DiscardReasons.update({id: discard.id}, updatedDiscard, function(data) {
          discardReasonObj = data.reason;
          response(discardReasonObj);
        }, function(err) {
          response(false, err.data);
        });

      },

      removeDiscardReason: function(discard, response) {
        var deleteDiscard = new Api.DiscardReasons();
        angular.copy(discard, deleteDiscard);

        deleteDiscard.$delete({id: discard.id}, function(data) {
          response(data);
        }, function(err) {
          response(false, err.data);
        });
      }

    };
  });
