'use strict';

angular.module('bsis')
  .factory('LocationsService', function(Api) {
    return {
      addLocation: Api.Locations.save,
      updateLocation: Api.Locations.update,
      getLocationById: Api.Locations.get,
      getSearchForm: Api.Locations.getSearchForm,
      search: Api.Locations.search,
      getForm: Api.Locations.getForm
    };
  });
