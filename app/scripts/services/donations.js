'use strict';

angular.module('bsis').factory('DonationsService', function(Api) {
  return {
    getEditForm: Api.Donations.getEditForm,
    findByDin: Api.Donations.findByDin,
    search: Api.Donations.search
  };
});
