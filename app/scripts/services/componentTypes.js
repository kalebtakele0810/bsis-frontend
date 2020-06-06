'use strict';

angular.module('bsis')
  .factory('ComponentTypesService', function(Api) {
    return {
      getComponentTypes: Api.ComponentTypes.getAll,
      getComponentTypeById: Api.ComponentTypes.get,
      updateComponentType: Api.ComponentTypes.update,
      createComponentType: Api.ComponentTypes.save
    };
  });