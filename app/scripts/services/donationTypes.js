'use strict';

angular.module('bsis')
  .factory('DonationTypesService', function($http, Api) {

    var donationTypeObj = {};
    return {

      getDonationTypes: function(response) {
        Api.DonationTypes.get({}, function(apiResponse) {
          response(apiResponse.allDonationTypes);
        }, function() {
          response(false);
        });
      },

      getDonationTypeById: function(id, response) {
        var apiResponse = Api.DonationTypes.get({id: id}, function() {
          response(apiResponse.donationType);
        }, function() {
          response(false);
        });
      },

      setDonationType: function(donationType) {
        donationTypeObj = donationType;
      },

      getDonationType: function() {
        return donationTypeObj;
      },

      addDonationType: function(donationType, response) {
        var addDonationType = new Api.DonationTypes();
        angular.copy(donationType, addDonationType);

        addDonationType.$save(function(data) {
          response(data.donationType);
        }, function(err) {
          response(false, err.data);
        });

      },

      updateDonationType: function(donationType, response) {
        var updatedDonationType = angular.copy(donationType);
        Api.DonationTypes.update({id: donationType.id}, updatedDonationType, function(data) {
          donationTypeObj = data.donationType;
          response(donationTypeObj);
        }, function(err) {
          response(false, err.data);
        });
      },

      removeDonationType: function(donationType, response) {
        var deleteDonationType = new Api.DonationTypes();
        angular.copy(donationType, deleteDonationType);

        deleteDonationType.$delete({id: donationType.id}, function(data) {
          response(data);
        }, function(err) {
          response(false, err.data);
        });
      }

    };
  });
