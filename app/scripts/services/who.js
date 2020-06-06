'use strict';

angular.module('bsis')
  .factory('WhoService', function(Api) {

    var whoGdbsObj = {};
    return {


      getWho: function(response) {
        Api.whoGdbs.get({}, function(apiResponse) {
          response(apiResponse.allWhoGdbs);
        }, function() {
          response(false);
        });
      },

      getWhoById: function(id, onSuccess, onError) {
        Api.whoGdbs.get({id: id}, function(apiResponse) {
          onSuccess(apiResponse.reason);
        }, function(err) {
          onError(err.data);
        });
      },

      setWho: function(who) {
        whoGdbsObj = who;
      },

      getWhoGdbs: function() {
        return whoGdbsObj;
      },

      addWhoGdbs: function(who, response) {
        var addWho = new Api.deferralReasons();
        angular.copy(who, addWho);

        addWho.$save(function(data) {
          response(data.reason);
        }, function(err) {
          response(false, err.data);
        });

      },

      updateWhoGdbs: function(who, response) {

        var updatedWho = angular.copy(who);
        Api.whoGdbs.update({id: who.id}, updatedWho, function(data) {
            whoGdbsObj = data.reason;
          response(whoGdbsObj);
        }, function(err) {
          response(false, err.data);
        });

      },

      removeWhoGdbs: function(who, response) {
        var deleteWho = new Api.whoGdbs();
        angular.copy(who, deleteWho);

        deleteWho.$delete({id: who.id}, function(data) {
          response(data);
        }, function(err) {
          response(false, err.data);
        });
      }

    };
  });
