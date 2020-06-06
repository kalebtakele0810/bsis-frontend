'use strict';

angular.module('bsis').factory('ComponentTypeCombinationsService', function(Api) {
  return {
    getComponentTypeCombinations: Api.ComponentTypeCombinations.search,
    updateComponentTypeCombinations: Api.ComponentTypeCombinations.update,
    getComponentTypeCombinationsForm: Api.ComponentTypeCombinations.getForm,
    createComponentTypeCombinations: Api.ComponentTypeCombinations.save,
    getComponentTypeCombinationById: Api.ComponentTypeCombinations.get
  };
});