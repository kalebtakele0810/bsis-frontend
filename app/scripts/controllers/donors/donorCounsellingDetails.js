'use strict';

angular.module('bsis').controller('DonorCounsellingDetailsCtrl', function($scope, $window, $routeParams, $log, DonorService, PostDonationCounsellingService, TestingService, ICONS, DATEFORMAT) {

  $scope.icons = ICONS;
  $scope.dateFormat = DATEFORMAT;

  $scope.postDonationCounselling = {};
  $scope.donation = {};
  $scope.donor = {};

  $scope.counsellingStatuses = [];
  $scope.referralSites = [];
  $scope.testResults = [];
  $scope.today = moment().startOf('day').toDate();

  $scope.goBack = function() {
    $window.history.back();
  };

  $scope.updateReferralSites = function() {
    $scope.postDonationCounselling.referralSite = null;
  };

  $scope.updateReferredEnabled = function() {

    // If couselling status is "Received Counselling" enable the referred checkbox,
    // and if referred was null, initialize it to false.
    // Else, set referredEnabled to false, and referred to null.
    if ($scope.postDonationCounselling.counsellingStatus === 'RECEIVED_COUNSELLING') {
      $scope.referredEnabled = true;
      if ($scope.postDonationCounselling.referred === null) {
        $scope.postDonationCounselling.referred = false;
      }
    } else {
      $scope.referredEnabled = false;
      $scope.postDonationCounselling.referred = null;
      $scope.postDonationCounselling.referralSite = null;
    }
  };

  $scope.updatePostDonationCounselling = function() {
    if (!$scope.postDonationCounselling.counsellingDate || !$scope.postDonationCounselling.counsellingStatus || $scope.postDonationCounsellingForm.$invalid) {
      return;
    }

    var update = {
      id: $scope.postDonationCounselling.id,
      counsellingStatus: $scope.postDonationCounselling.counsellingStatus,
      counsellingDate: $scope.postDonationCounselling.counsellingDate,
      notes: $scope.postDonationCounselling.notes,
      referred: $scope.postDonationCounselling.referred,
      referralSite: $scope.postDonationCounselling.referralSite
    };

    $scope.updatingCounselling = true;
    PostDonationCounsellingService.update(update, function() {
      $scope.goBack();
      $scope.updatingCounselling = false;
    }, function(err) {
      $log.error(err);
      $scope.updatingCounselling = false;
    });
  };

  // Fetch form fields
  PostDonationCounsellingService.getForm(function(response) {
    $scope.counsellingStatuses = response.counsellingStatuses;
    $scope.referralSites = response.referralSites;
  }, function(err) {
    $log.error(err);
  });

  $scope.removeStatus = function() {
    $scope.updatingCounselling = true;
    PostDonationCounsellingService.update({
      id: $scope.postDonationCounselling.id,
      flaggedForCounselling: true
    }, function() {
      $scope.goBack();
      $scope.updatingCounselling = false;
    }, function(err) {
      $log.error(err.data);
      $scope.updatingCounselling = false;
    });
  };

  // Fetch data
  DonorService.getDonorPostDonationCounselling($routeParams.donorId, function(postDonationCounselling) {
    $scope.postDonationCounselling = postDonationCounselling;
    $scope.donation = postDonationCounselling.donation;
    $scope.donor = postDonationCounselling.donor;

    if ($scope.postDonationCounselling.counsellingStatus !== null && $scope.postDonationCounselling.counsellingStatus === 'RECEIVED_COUNSELLING') {
      $scope.referredEnabled = true;
    }

    if (postDonationCounselling.counsellingDate) {
      $scope.postDonationCounselling.counsellingDate = new Date(postDonationCounselling.counsellingDate);
    } else {
      $scope.postDonationCounselling.counsellingDate = new Date();
    }

    TestingService.getTestResultsByDIN({donationIdentificationNumber: postDonationCounselling.donation.donationIdentificationNumber}, function(response) {
      $scope.testResults = response.testResults.recentTestResults;
    }, function(err) {
      $log.error(err);
    });
  }, function(err) {
    $log.error(err);
  });
});
