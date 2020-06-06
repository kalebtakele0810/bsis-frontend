'use strict';

angular.module('bsis').factory('AdverseEventsService', function(Api) {

  return {

    getAdverseEventTypes: function(onSuccess, onError) {
      return Api.AdverseEventTypes.query(onSuccess, onError);
    },

    getAdverseEventTypeById: function(id, onSuccess, onError) {
      return Api.AdverseEventTypes.get({id: id}, onSuccess, onError);
    },

    createAdverseEventType: function(adverseEventType, onSuccess, onError) {
      return Api.AdverseEventTypes.save({}, adverseEventType, onSuccess, onError);
    },

    updateAdverseEventType: function(adverseEventType, onSuccess, onError) {
      return Api.AdverseEventTypes.update({}, adverseEventType, onSuccess, onError);
    }
  };
});
