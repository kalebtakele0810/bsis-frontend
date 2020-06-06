'use strict';

angular.module('bsis').factory('ReturnFormsService', function(Api) {

  return {
    getReturnFormsForm: Api.ReturnForms.getForm,
    addReturnForm: Api.ReturnForms.save,
    getReturnForm: Api.ReturnForms.get,
    updateReturnForm: Api.ReturnForms.update,
    findReturnForms: Api.ReturnForms.search,
    deleteReturnForm: Api.ReturnForms.delete
  };
});
