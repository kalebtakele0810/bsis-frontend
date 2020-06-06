'use strict';

angular.module('bsis').factory('BloodTestsService', function(Api) {
  return {
    getBloodTests: Api.BloodTests.search,
    getBloodTestsForm: Api.BloodTests.getForm,
    createBloodTest: Api.BloodTests.save,
    updateBloodTest: Api.BloodTests.update,
    getBloodTestById: Api.BloodTests.get
  };
});