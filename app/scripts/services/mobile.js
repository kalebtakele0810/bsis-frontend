'use strict';

angular.module('bsis').factory('MobileService', function(Api) {
  return {
    getMobileClinicLookUpFormFields: Api.MobileClinicDonors.getForm,
    mobileClinicLookUp: Api.MobileClinicDonors.search,
    mobileClinicExport: Api.MobileClinicDonors.export,
    getDonorOutcomesForm: Api.MobileClinicDonors.getDonorOutcomesForm,
    getDonorOutcomes: Api.MobileClinicDonors.getDonorOutcomes
  };
});
