'use strict';

angular.module('bsis')
  .factory('DeferralReasonsService', function($http, Api) {

    var deferralReasonObj = {};
    return {

      getDeferrals: function(response) {
        Api.deferralReasons.get({}, function(apiResponse) {
          response(apiResponse.allDeferralReasons);
        }, function() {
          response(false);
        });
      },

      getDeferralReasonById: function(id, onSuccess, onError) {
        Api.deferralReasons.get({id: id}, function(apiResponse) {
          onSuccess(apiResponse.reason);
        }, function(err) {
          onError(err.data);
        });
      },

      setDeferralReason: function(deferral) {
        deferralReasonObj = deferral;
      },

      getDeferralReason: function() {
        return deferralReasonObj;
      },

      addDeferralReason: function(deferral, response) {
        var addDeferral = new Api.deferralReasons();
        angular.copy(deferral, addDeferral);

        addDeferral.$save(function(data) {
          response(data.reason);
        }, function(err) {
          response(false, err.data);
        });

      },

      updateDeferralReason: function(deferral, response) {

        var updatedDeferral = angular.copy(deferral);
        Api.deferralReasons.update({id: deferral.id}, updatedDeferral, function(data) {
          deferralReasonObj = data.reason;
          response(deferralReasonObj);
        }, function(err) {
          response(false, err.data);
        });

      },

      removeDeferralReason: function(deferral, response) {
        var deleteDeferral = new Api.deferralReasons();
        angular.copy(deferral, deleteDeferral);

        deleteDeferral.$delete({id: deferral.id}, function(data) {
          response(data);
        }, function(err) {
          response(false, err.data);
        });
      }

    };
  });
