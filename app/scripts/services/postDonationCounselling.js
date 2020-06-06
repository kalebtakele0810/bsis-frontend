'use strict';

angular.module('bsis').factory('PostDonationCounsellingService', function(Api) {

  return {
    update: Api.PostDonationCounsellings.update,
    getForm: Api.PostDonationCounsellings.getForm,
    getSearchForm: Api.PostDonationCounsellings.getSearchForm,
    search: Api.PostDonationCounsellings.get
  };
});
