'use strict';

angular.module('bsis').factory('TransfusionService', function(Api) {

  return {
    getTransfusionForm: Api.Transfusion.getForm,
    createTransfusion: Api.Transfusion.save,
    getSearchForm: Api.Transfusion.getSearchForm,
    search: Api.Transfusion.search,
    getTransfusionById: Api.Transfusion.get,
    update: Api.Transfusion.update,
    voidTransfusion: Api.Transfusion.delete
  };
});
