'use strict';

angular.module('bsis').factory('TransfusionReactionTypesService', function(Api) {

  return {
    getTransfusionReactionTypeById: Api.TransfusionReactionTypes.get,
    getTransfusionReactionTypes: Api.TransfusionReactionTypes.get,
    createTransfusionReactionType: Api.TransfusionReactionTypes.save,
    updateTransfusionReactionType: Api.TransfusionReactionTypes.update
  };
});
