'use strict';

angular.module('bsis').factory('BloodTestingRulesService', function(Api) {
  return {
    getBloodTestingRules: Api.BloodTestingRules.search,
    getBloodTestingRuleForm: Api.BloodTestingRules.getForm,
    createBloodTestingRule: Api.BloodTestingRules.save,
    updateBloodTestingRule: Api.BloodTestingRules.update,
    getBloodTestingRuleById: Api.BloodTestingRules.get
  };
});