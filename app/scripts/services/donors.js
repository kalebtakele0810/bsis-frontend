'use strict';

angular.module('bsis')
  .factory('DonorService', function($http, Api, ConfigurationsService, gettextCatalog, $uibModal) {

    var donorObj = {};
    var donationBatchObj = {};
    var donorsObj = {};

    return {

      findDonor: function(donorSearch, onSuccess, onError) {
        var query = {
          firstName: donorSearch.firstName,
          middleName: donorSearch.middleName,
          lastName: donorSearch.lastName,
          donorNumber: donorSearch.donorNumber,
          phoneNumber: donorSearch.phoneNumber,
          donationIdentificationNumber: donorSearch.donationIdentificationNumber,
          usePhraseMatch: donorSearch.usePhraseMatch
        };
        Api.FindDonors.query(query, function(response) {
          // Keep a reference to the donors
          donorsObj = response.donors;
          onSuccess(response);
        }, onError);
      },

      addDonor: function(donor, onSuccess, onError) {
        // create $Resource object and assign donor values
        var addDonor = new Api.Donor();
        angular.copy(donor, addDonor);

        // save donor (POST /donor) and assign response donor object to 'donorObj'
        addDonor.$save(function(response) {
          donorObj = response.donor;
          onSuccess(response.donor);
        }, function(err) {
          onError(err.data);
        });
      },

      updateDonor: function(donor, onSuccess, onError) {
        Api.Donor.update({id: donor.id}, donor, function(data) {
          donorObj = data.donor;
          onSuccess(donorObj);
        }, function(err) {
          onError(err.data);
        });
      },
      getDonor: function() {
        return donorObj;
      },
      getDonorById: function(id, onSuccess, onFailure) {
        Api.Donor.get({id: id}, function(response) {
          onSuccess(response.donor);
        }, function(err) {
          onFailure(err.data);
        });
      },
      getDonationBatch: function() {
        return donationBatchObj;
      },

      getDonationBatchById: function(id, onSuccess, onFailure) {
        Api.DonationBatches.get({id: id}, function(response) {
          onSuccess(response.donationBatch);
        }, function(err) {
          onFailure(err.data);
        });
      },

      getDonors: function() {
        return donorsObj;
      },
      getDonorFormFields: function(response) {
        Api.DonorFormFields.get({}, function(backingForm) {
          response(backingForm);
        }, function() {
          response(false);
        });
      },
      getDonorOverview: function(donorId, response) {
        Api.DonorOverview.get({id: donorId}, function(overview) {
          response(overview);
        }, function() {
          response(false);
        });
      },
      getDonorListFormFields: function(response) {
        Api.DonorCommunicationsFormFields.get({}, function(backingForm) {
          response(backingForm);
        }, function() {
          response(false);
        });
      },
      findDonorListDonors: function(donorSearch, onSuccess, onError) {
        var donors = Api.DonorCommunicationsSearch.query({
          bloodGroups: donorSearch.bloodGroups,
          venues: donorSearch.venues,
          clinicDate: donorSearch.clinicDate,
          lastDonationFromDate: donorSearch.lastDonationFromDate,
          lastDonationToDate: donorSearch.lastDonationToDate,
          anyBloodGroup: donorSearch.anyBloodGroup,
          noBloodGroup: donorSearch.noBloodGroup
        }, function() {
          onSuccess(donors.donors);
        }, function(err) {
          onError(err.data);
        });
      },
      setDonor: function(donor) {
        donorObj = donor;
      },
      setDonationBatch: function(donationBatch) {
        donationBatchObj = donationBatch;
      },
      setDonors: function(donors) {
        donorsObj = donors;
      },
      getDonationsFormFields: function(response) {
        Api.DonationsFormFields.get({}, function(backingForm) {
          response(backingForm);
        }, function() {
          response(false);
        });
      },
      addDonationToBatch: function(donation, onSuccess, onError) {
        // create $Resource object and assign donation values
        var addDonation = new Api.Donations();

        angular.copy(donation, addDonation);

        // save donation (POST /donations)
        addDonation.$save(function() {
          // refresh donation batch after adding donation to it, and add to response
          Api.DonationBatches.get({id: donationBatchObj.id}, function(donationBatch) {
            donationBatchObj = donationBatch.donationBatch;
            // Created date needs to be a JS Date object for the datepicker
            donationBatch.donationBatch.donationBatchDate = new Date(donationBatch.donationBatch.donationBatchDate);
            onSuccess(donationBatch.donationBatch);
          });
        }, function(err) {
          onError(err.data);
        });
      },
      addDonation: function(donation, onSuccess, onError) {
        // create $Resource object and assign donation values
        var addDonation = new Api.Donations();

        angular.copy(donation, addDonation);

        if (addDonation.adverseEvent && !addDonation.adverseEvent.type) {
          addDonation.adverseEvent = null;
        }

        // save donation (POST /donations)
        addDonation.$save(function() {
          onSuccess(true);
        }, function(err) {
          onError(err.data);
        });
      },
      updateDonation: function(donation, onSuccess, onError) {

        var updateDonation = Api.Donations.get({id: donation.id}, function() {
          updateDonation = updateDonation.donation;

          angular.copy(donation, updateDonation);

          if (updateDonation.adverseEvent && !updateDonation.adverseEvent.type) {
            updateDonation.adverseEvent = null;
          }

          Api.Donations.update({id: donation.id}, updateDonation, function(data) {
            onSuccess(data.donation);
          }, function(err) {
            onError(err.data);
          });

        });
      },
      deleteDonation: function(donationId, onSuccess, onError) {
        Api.Donations.delete({id: donationId}, onSuccess, onError);
      },
      getDeferralsFormFields: function(response) {
        Api.DeferralsFormFields.get({}, function(backingForm) {
          response(backingForm);
        }, function() {
          response(false);
        });
      },
      addDeferral: function(deferral, response) {
        // create $Resource object and assign donation values
        var addDeferral = new Api.Deferrals();

        angular.copy(deferral, addDeferral);

        // save deferral (POST /deferral)
        addDeferral.$save(function() {
          response(true);
        }, function() {
          response(false);
        });
      },
      getDeferrals: function(donorId, response) {
        Api.DonorDeferrals.get({id: donorId}, function(deferrals) {
          response(deferrals);
        }, function() {
          response(false);
        });
      },
      deleteDonorDeferral: function(donorDeferralId, onSuccess, onError) {
        Api.Deferrals.delete({id: donorDeferralId}, onSuccess, onError);
      },
      endDonorDeferral: function(donorDeferralId, comment, onSuccess, onError) {
        Api.Deferrals.end({id: donorDeferralId}, comment, function(data) {
          onSuccess(data.deferral);
        }, function(err) {
          onError(err.data);
        });
      },
      updateDonorDeferral: function(donorDeferral, onSuccess, onError) {
        Api.Deferrals.update({id: donorDeferral.id}, donorDeferral, function(data) {
          onSuccess(data.deferral);
        }, function(err) {
          onError(err.data);
        });
      },
      getDonations: function(donorId, response) {
        Api.DonorDonations.get({id: donorId}, function(donations) {
          response(donations);
        }, function() {
          response(false);
        });
      },
      getDonorBarcode: function(donorId, response) {
        Api.DonorBarcode.get({id: donorId}, function(label) {
          response(label);

          var hiddenElement = document.createElement('a');
          hiddenElement.href = 'data:attachment/zpl,' + encodeURI(label.labelZPL);
          hiddenElement.target = '_blank';
          hiddenElement.download = 'barcode' + moment(new Date()) + '.bc';
          hiddenElement.click();

        }, function() {
          response(false);
        });
      },
      getDonationBatchDonations: function() {
        return $http.get('/getDonationBatch');
      },
      getDonationBatchFormFields: function(onSuccess, onError) {
        Api.DonationBatchFormFields.get({}, onSuccess, function(err) {
          onError(err.data);
        });
      },
      getOpenDonationBatches: function(response) {
        Api.FindDonationBatches.query({isClosed: false}, function(donationBatches) {
          response(donationBatches);
        }, function() {
          response(false);
        });
      },
      getRecentDonationBatches: function(searchObject, onSuccess, onError) {
        Api.FindDonationBatches.query(searchObject, function(donationBatches) {
          onSuccess(donationBatches);
        }, function(err) {
          onError(err.data);
        });
      },
      addDonationBatch: function(donationBatch, onSuccess, onError) {
        // create $Resource object and assign donation values
        var addDonationBatch = new Api.DonationBatches();

        angular.copy(donationBatch, addDonationBatch);

        // save deferral (POST /deferral)
        addDonationBatch.$save(function() {
          onSuccess(true);
        }, function(err) {
          onError(err.data);
        });
      },
      closeDonationBatch: function(donationBatch, onSuccess, onError) {
        Api.DonationBatches.get({id: donationBatch.id}, function(response) {
          var updateDonationBatch = response.donationBatch;

          updateDonationBatch.isClosed = true;
          updateDonationBatch.venue = updateDonationBatch.venue.id;

          Api.DonationBatches.update({id: donationBatch.id}, updateDonationBatch, function(data) {
            onSuccess(data.donationBatch);
          }, function(err) {
            onError(err.data);
          });
        });
      },
      reopenDonationBatch: function(donationBatch, onSuccess, onError) {
        Api.DonationBatches.get({id: donationBatch.id}, function(response) {
          var updateDonationBatch = response.donationBatch;

          updateDonationBatch.donationBatchDate = donationBatch.donationBatchDate;
          updateDonationBatch.venue = donationBatch.venue.id;
          updateDonationBatch.isClosed = false;

          Api.DonationBatches.update({id: donationBatch.id}, updateDonationBatch, function(data) {
            onSuccess(data.donationBatch);
          }, function(err) {
            onError(err.data);
          });
        });
      },
      updateDonationBatch: function(donationBatch, onSuccess, onError) {
        Api.DonationBatches.get({id: donationBatch.id}, function(response) {
          var updateDonationBatch = response.donationBatch;

          updateDonationBatch.donationBatchDate = donationBatch.donationBatchDate;
          updateDonationBatch.venue = donationBatch.venue.id;

          Api.DonationBatches.update({id: donationBatch.id}, updateDonationBatch, function(data) {
            onSuccess(data.donationBatch);
          }, function(err) {
            onError(err.data);
          });
        });
      },
      deleteDonationBatch: function(donationBatchId, onSuccess, onError) {
        Api.DonationBatches.delete({id: donationBatchId}, onSuccess, onError);
      },

      getDonorSummaries: function(donorNumber, onSuccess, onError) {
        Api.DonorSummaries.get({donorNumber: donorNumber}, onSuccess, onError);
      },

      getDonorPostDonationCounselling: function(donorId, onSuccess, onError) {
        Api.DonorPostDonationCounselling.get({donorId: donorId}, onSuccess, onError);
      },

      deleteDonor: function(donorId, onSuccess, onError) {
        Api.Donors.delete({id: donorId}, onSuccess, onError);
      },

      findAllDonorDuplicates: function(response) {
        Api.AllDonorDuplicates.get({}, function(data) {
          response(data);
        }, function() {
          response(false);
        });
      },

      findDonorDuplicates: function(donorNumber, response) {
        Api.DonorDuplicates.get({donorNumber: donorNumber}, function(data) {
          response(data);
        }, function() {
          response(false);
        });
      },

      mergePreviewDonorsDuplicate: function(donorNumber, donors, onSuccess, onError) {
        var duplicateDonors = new Api.DonorPreviewMergeDuplicates();
        angular.copy(donors, duplicateDonors);
        // save donation (POST /duplicates/merge/preview)
        duplicateDonors.$save({donorNumber: donorNumber}, function(data) {
          onSuccess(data);
        }, function(err) {
          onError(err.data);
        });
      },

      mergeDonorsDuplicate: function(donorNumber, donors, onSuccess, onError) {
        // create $Resource object and assign donor values
        var duplicateDonors = new Api.DonorMergeDuplicates();
        angular.copy(donors, duplicateDonors);
        // save donation (POST /duplicates/merge)
        duplicateDonors.$save({donorNumber: donorNumber}, function(data) {
          onSuccess(data.donor);
        }, function(err) {
          onError(err.data);
        });
      },

      getDonation: function(donationId, onSuccess, onError) {
        return Api.Donations.get({id: donationId}, onSuccess, onError);
      },

      checkDonorAge: function(birthDate) {

        var minAge = ConfigurationsService.getIntValue('donors.minimumAge');
        var maxAge = ConfigurationsService.getIntValue('donors.maximumAge') || 100;
        var minBirthDate = moment().subtract(maxAge, 'years');
        var maxBirthDate = moment().subtract(minAge, 'years');
        var donorBirthDate = moment(birthDate);
        var message;

        if (donorBirthDate.isBefore(minBirthDate)) {
          message = gettextCatalog.getString('This donor is over the maximum age of {{maxAge}}', {maxAge: maxAge}) + '.';
        } else if (donorBirthDate.isAfter(maxBirthDate)) {
          message = gettextCatalog.getString('This donor is below the minimum age of {{minAge}}', {minAge: minAge}) + '.';
        } else {
        // Don't show confirmation
          return Promise.resolve(null);
        }

        message += ' ';
        message += gettextCatalog.getString('Are you sure that you want to continue?');

        var modal = $uibModal.open({
          animation: false,
          templateUrl: 'views/confirmModal.html',
          controller: 'ConfirmModalCtrl',
          resolve: {
            confirmObject: {
              title: gettextCatalog.getString('Invalid donor'),
              button: gettextCatalog.getString('Add'),
              message: message
            }
          }
        });

        return modal.result;
      }

    };
  });
