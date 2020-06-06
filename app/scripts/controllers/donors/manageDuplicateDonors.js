'use strict';

angular.module('bsis')
  .controller('ManageDonorsDuplicateCtrl', function($scope, $window, $location, $routeParams, DonorService, $filter, ngTableParams, $timeout, $log, ICONS, UI, DONATION, gettextCatalog) {
    $scope.icons = ICONS;
    $scope.ui = UI;
    $scope.weightUnit = DONATION.WEIGHTUNIT;

    var duplicatesData = [{}];
    $scope.duplicatesData = duplicatesData;
    $scope.duplicateCount = 0;

    var donationsData = [{}];
    $scope.donationsData = donationsData;

    var deferralsData = [{}];
    $scope.deferralsData = deferralsData;

    var groupKey = '1';
    if ($routeParams.groupKey) {
      groupKey = $routeParams.groupKey;
    }

    var currentStep = 1;
    $scope.currentStep = currentStep;
    $scope.lastStep = 7;
    var donorFields = {};
    $scope.donorFields = donorFields;

    var selectedDonorsData = [{}]; // donors to merge
    $scope.selectedDonorsData = selectedDonorsData;

    var mergedDonorData = {}; // donor data selected by the user during the wizard
    $scope.mergedDonorData = mergedDonorData;

    var mergedDonor = {}; // final merged donor to save
    $scope.mergedDonor = mergedDonor;

    // 1a: load the duplicates
    $scope.manageDonorDuplicates = function() {
      DonorService.findDonorDuplicates(groupKey, function(response) {
        if (response !== false) {
          duplicatesData = [];
          var duplicates = response.duplicates;
          angular.forEach(duplicates, function(donor) {
            donor.merge = null;
            duplicatesData.push(donor);
          });
        }
        $scope.duplicatesData = duplicatesData;
        $scope.donor = duplicatesData[0];
        $scope.duplicateCount = $scope.duplicatesData.length;
        $scope.groupKey = groupKey;
      });
    };
    $scope.manageDonorDuplicates(); // loaded on the 1st step
    $scope.manageDuplicateDonorTableParams = new ngTableParams({
      page: 1,
      count: 100,         // don't paginate (?)
      filter: {},
      sorting: {}
    },
      {
        defaultSort: 'asc',
        counts: [], // hide page counts control
        total: $scope.duplicatesData.length,
        getData: function($defer, params) {
          var filteredData = params.filter() ? $filter('filter')(duplicatesData, params.filter()) : duplicatesData;
          var orderedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : duplicatesData;
          params.total(orderedData.length);
          $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
      });
    $scope.$watch('duplicatesData', function() {
      $timeout(function() {
        $scope.manageDuplicateDonorTableParams.reload();
      });
    });

    // 1b: selected donors to merge
    $scope.manageSelectedDuplicateDonorTableParams = new ngTableParams({
      page: 1,
      count: 100,         // don't paginate (?)
      filter: {},
      sorting: {}
    },
      {
        defaultSort: 'asc',
        counts: [], // hide page counts control
        total: $scope.selectedDonorsData.length,
        getData: function($defer, params) {
          var filteredData = params.filter() ? $filter('filter')(selectedDonorsData, params.filter()) : selectedDonorsData;
          var orderedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : selectedDonorsData;
          params.total(orderedData.length);
          $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
      });
    $scope.$watch('selectedDonorsData', function() {
      $timeout(function() {
        $scope.manageSelectedDuplicateDonorTableParams.reload();
      });
    });

    // 2: do a preview of the merge and load the donations and the deferrals
    $scope.previewMerge = function() {
      DonorService.mergePreviewDonorsDuplicate(groupKey, $scope.copyMergedDonor(),
        function(response) {
          // process donations
          donationsData = response.allDonations;
          $scope.donationsData = donationsData;
          $scope.donationResults = donationsData.length !== 0;
          // process deferrals
          deferralsData = response.allDeferrals;
          $scope.deferralResults = deferralsData.length !== 0;
          $scope.deferralsData = deferralsData;
          var deferrals = deferralsData.slice();
          deferrals.sort(function(a, b) {
            return (a.deferredUntil - b.deferredUntil);
          });
          if (deferrals.length > 0) {
            $scope.lastDeferral = deferrals[0];
            $scope.durationType = $scope.lastDeferral.deferralReason.durationType;
          } else {
            $scope.lastDeferral = null;
          }
          // update mergedDonor
          $scope.updatedMergedDonor = response.mergedDonor;
          mergedDonor.dateOfFirstDonation = response.mergedDonor.dateOfFirstDonation;
          mergedDonor.dueToDonate = response.mergedDonor.dueToDonate;
          mergedDonor.dateOfLastDonation = response.mergedDonor.dateOfLastDonation;
        },
        function(err) {
          $scope.hasMessage = true;
          $scope.message = gettextCatalog.getString('Error merging the duplicate Donors.');
          $log.log('More information: ' + err.moreInfo + ' ... ' + angular.toJson(err));
        }
      );
    };

    $scope.copyMergedDonor = function() {
      // copy the existing mergedDonor
      var newMergedDonor = angular.copy(mergedDonor);
      // set the data that isn't selectable
      newMergedDonor.firstName = selectedDonorsData[0].firstName;
      newMergedDonor.middleName = selectedDonorsData[0].middleName;
      newMergedDonor.lastName = selectedDonorsData[0].lastName;
      newMergedDonor.gender = selectedDonorsData[0].gender;
      newMergedDonor.birthDate = selectedDonorsData[0].birthDate;
      // set the duplicate donor numbers
      newMergedDonor.duplicateDonorNumbers = [];
      angular.forEach(selectedDonorsData, function(donor) {
        newMergedDonor.duplicateDonorNumbers.push(donor.donorNumber);
      });
      return newMergedDonor;
    };

    // Donations Table
    $scope.manageDuplicateDonorDonationsTableParams = new ngTableParams({
      page: 1,
      count: 6,
      filter: {},
      sorting: {}
    },
      {
        defaultSort: 'asc',
        counts: [],
        total: $scope.donationsData.length,
        getData: function($defer, params) {
          var filteredData = params.filter() ? $filter('filter')(donationsData, params.filter()) : donationsData;
          var orderedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : donationsData;
          params.total(orderedData.length);
          $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
      });
    $scope.$watch('donationsData', function() {
      $timeout(function() {
        $scope.manageDuplicateDonorDonationsTableParams.reload();
      });
    });

    // Deferrals Table
    $scope.manageDuplicateDonorDeferralTableParams = new ngTableParams({
      page: 1,
      count: 6,
      filter: {},
      sorting: {}
    },
      {
        defaultSort: 'asc',
        counts: [],
        total: $scope.deferralsData.length,
        getData: function($defer, params) {
          var returnedDeferralsData = $scope.deferralsData;
          var filteredData = params.filter() ? $filter('filter')(deferralsData, params.filter()) : returnedDeferralsData;
          var orderedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : returnedDeferralsData;
          params.total(orderedData.length);
          $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
      });
    $scope.$watch('deferralsData', function() {
      $timeout(function() {
        $scope.manageDuplicateDonorDeferralTableParams.reload();
      });
    });

    $scope.goBack = function() {
      $window.history.back();
    };

    $scope.step = function(previousStep, newStep, mergeDonorForm) {
      $scope.invalid = false;
      $scope.hasMessage = false;
      $scope.message = '';
      if ($scope.currentStep < newStep && !mergeDonorForm.$valid) {
        $scope.invalid = true;
        return;
      }
      if (previousStep == 1 && newStep == 2) {
        // see which donors have been selected and then move onto the overview page
        selectedDonorsData = [];
        donorFields = {};
        // set up the "None of the above" option and required error message flags
        donorFields.idNumber = false;
        donorFields.title = false;
        donorFields.callingName = false;
        donorFields.preferredLanguage = false;
        donorFields.venue = false;
        donorFields.contactMethodType = false;
        donorFields.email = false;
        donorFields.mobileNumber = false;
        donorFields.homeNumber = false;
        donorFields.workNumber = false;

        var bloodTypingMismatch = false;
        angular.forEach(duplicatesData, function(donor) {
          // if the donor is selected
          if (donor.merge) {
            // check if the donor has got any data and set the flags for the error message and none option to display
            if (donor.idNumber !== null && donor.idNumber !== '') {
              donorFields.idNumber = true;
            }

            if (donor.title !== null && donor.title !== '') {
              donorFields.title = true;
            }

            if (donor.callingName !== null && donor.callingName !== '') {
              donorFields.callingName = true;
            }

            if (donor.preferredLanguage !== null && donor.preferredLanguage !== '') {
              donorFields.preferredLanguage = true;
            }

            if (donor.venue !== null && donor.venue !== '') {
              donorFields.venue = true;
            }

            if (donor.contactMethodType !== null && donor.contactMethodType !== '') {
              donorFields.contactMethodType = true;
            }

            if (donor.contact.email !== null && donor.contact.email !== '') {
              donorFields.email = true;
            }

            if (donor.contact.mobileNumber !== null && donor.contact.mobileNumber !== '') {
              donorFields.mobileNumber = true;
            }

            if (donor.contact.homeNumber !== null && donor.contact.homeNumber !== '') {
              donorFields.homeNumber = true;
            }

            if (donor.contact.workNumber !== null && donor.contact.workNumber !== '') {
              donorFields.workNumber = true;
            }

            if (donor.preferredAddressType !== null && donor.preferredAddressType !== '') {
              donorFields.preferredAddressType = true;
            }

            if (donor.address.homeAddressLine1 !== null && donor.address.homeAddressLine1 !== '') {
              donorFields.homeAddress = true;
            }

            if (donor.address.workAddressLine1 !== null && donor.address.workAddressLine1 !== '') {
              donorFields.workAddress = true;
            }

            if (donor.address.postalAddressLine1 !== null && donor.address.postalAddressLine1 !== '') {
              donorFields.postalAddress = true;
            }

            // check the blood typing of the selected users
            if (mergedDonor.bloodRh) {
              if (donor.bloodRh && mergedDonor.bloodRh != donor.bloodRh) {
                bloodTypingMismatch = true;
              }
            } else {
              mergedDonor.bloodRh = donor.bloodRh;
            }
            if (mergedDonor.bloodAbo) {
              if (donor.bloodAbo && mergedDonor.bloodAbo != donor.bloodAbo) {
                bloodTypingMismatch = true;
              }
            } else {
              mergedDonor.bloodAbo = donor.bloodAbo;
            }
            // save the donor
            selectedDonorsData.push(donor);
          }
        });
        $scope.selectedDonorsData = selectedDonorsData;
        $scope.donorFields = donorFields;
        if (selectedDonorsData === null || selectedDonorsData.length <= 1) {
          $scope.message = gettextCatalog.getString('Please select at least two donors.');
          $scope.invalid = true;
          $scope.hasMessage = true;
          return;
        }
        if (bloodTypingMismatch) {
          if ($scope.bloodTypingMismatchCheck) {
            // they've confirmed the mismatch
            mergedDonor.bloodAbo = '';
            mergedDonor.bloodRh = '';
          } else {
            // show them the mismatch message
            $scope.message = gettextCatalog.getString('The selected donors do not have the same blood group. If you continue, the merged donor will not be assigned a blood group, and will be considered a first time donor.');
            $scope.invalid = true;
            $scope.hasMessage = true;
            $scope.bloodTypingMismatchCheck = true;
            return;
          }
        }
      } else if (previousStep == 2 && newStep == 3) {
        mergedDonor.notes = '';
        angular.forEach(selectedDonorsData, function(donor) {
          // set the selected title
          if (donor.id == mergedDonorData.title) {
            mergedDonor.title = donor.title;
          }
          // set the selected callingName
          if (donor.id == mergedDonorData.callingName) {
            mergedDonor.callingName = donor.callingName;
          }
          // set the selected preferredLanguage
          if (donor.id == mergedDonorData.preferredLanguage) {
            mergedDonor.preferredLanguage = donor.preferredLanguage;
          }
          // set the selected venue
          if (donor.id == mergedDonorData.venue) {
            mergedDonor.venue = donor.venue;
          }
          // set the selected idNumber
          if (donor.id == mergedDonorData.idNumber) {
            mergedDonor.idType = donor.idType;
            mergedDonor.idNumber = donor.idNumber;
          }
          // set the notes according to what was selected
          if (mergedDonorData.noteSelection && mergedDonorData.noteSelection[donor.id]) {
            if (mergedDonor.notes) {
              if (mergedDonor.notes.length > 0) {
                mergedDonor.notes = mergedDonor.notes.concat(', ');
              }
              mergedDonor.notes = mergedDonor.notes.concat(donor.notes);
            } else {
              mergedDonor.notes = donor.notes;
            }
          }
        });
      } else if (previousStep == 3 && newStep == 4) {
        mergedDonor.contact = {};
        angular.forEach(selectedDonorsData, function(donor) {
          // set the selected contactMethodType
          if (donor.id == mergedDonorData.contactMethodType) {
            mergedDonor.contactMethodType = donor.contactMethodType;
          }
          // set the selected contact.email
          if (donor.id == mergedDonorData.email) {
            mergedDonor.contact.email = donor.contact.email;
          }
          // set the selected contact.mobileNumber
          if (donor.id == mergedDonorData.mobileNumber) {
            mergedDonor.contact.mobileNumber = donor.contact.mobileNumber;
          }
          // set the selected contact.homeNumber
          if (donor.id == mergedDonorData.homeNumber) {
            mergedDonor.contact.homeNumber = donor.contact.homeNumber;
          }
          // set the selected contact.workNumber
          if (donor.id == mergedDonorData.workNumber) {
            mergedDonor.contact.workNumber = donor.contact.workNumber;
          }
        });
      } else if (previousStep == 4 && newStep == 5) {
        mergedDonor.address = {};
        angular.forEach(selectedDonorsData, function(donor) {
          // set the selected preferredAddressType
          if (donor.id == mergedDonorData.preferredAddressType) {
            mergedDonor.preferredAddressType = donor.preferredAddressType;
          }
          // set the work, home and postal addresses according to which option was selected
          if (donor.id == mergedDonorData.homeAddress) {
            mergedDonor.address.homeAddressLine1 = donor.address.homeAddressLine1;
            mergedDonor.address.homeAddressLine2 = donor.address.homeAddressLine2;
            mergedDonor.address.homeAddressCity = donor.address.homeAddressCity;
            mergedDonor.address.homeAddressProvince = donor.address.homeAddressProvince;
            mergedDonor.address.homeAddressDistrict = donor.address.homeAddressDistrict;
            mergedDonor.address.homeAddressCountry = donor.address.homeAddressCountry;
            mergedDonor.address.homeAddressState = donor.address.homeAddressState;
            mergedDonor.address.homeAddressZipcode = donor.address.homeAddressZipcode;
          }
          if (donor.id == mergedDonorData.postalAddress) {
            mergedDonor.address.postalAddressLine1 = donor.address.postalAddressLine1;
            mergedDonor.address.postalAddressLine2 = donor.address.postalAddressLine2;
            mergedDonor.address.postalAddressCity = donor.address.postalAddressCity;
            mergedDonor.address.postalAddressProvince = donor.address.postalAddressProvince;
            mergedDonor.address.postalAddressDistrict = donor.address.postalAddressDistrict;
            mergedDonor.address.postalAddressCountry = donor.address.postalAddressCountry;
            mergedDonor.address.postalAddressState = donor.address.postalAddressState;
            mergedDonor.address.postalAddressZipcode = donor.address.postalAddressZipcode;
          }
          if (donor.id == mergedDonorData.workAddress) {
            mergedDonor.address.workAddressLine1 = donor.address.workAddressLine1;
            mergedDonor.address.workAddressLine2 = donor.address.workAddressLine2;
            mergedDonor.address.workAddressCity = donor.address.workAddressCity;
            mergedDonor.address.workAddressProvince = donor.address.workAddressProvince;
            mergedDonor.address.workAddressDistrict = donor.address.workAddressDistrict;
            mergedDonor.address.workAddressCountry = donor.address.workAddressCountry;
            mergedDonor.address.workAddressState = donor.address.workAddressState;
            mergedDonor.address.workAddressZipcode = donor.address.workAddressZipcode;
          }
        });
        // do a preview of the merge and load data for next two steps
        $scope.previewMerge();
      }
      $scope.currentStep = newStep;
    };

    $scope.merge = function() {
      // submit
      DonorService.mergeDonorsDuplicate(groupKey, $scope.copyMergedDonor(),
        function(returnedMergedDonor) {
          $location.path('/viewDonor/' + returnedMergedDonor.id).search({});
        },
        function(err) {
          $scope.hasMessage = true;
          $scope.message = gettextCatalog.getString('Error merging the duplicate Donors.');
          $log.log('More information: ' + err.moreInfo + ' ... ' + angular.toJson(err));
        }
      );
    };

    $scope.cancel = function() {
      $location.path('/duplicateDonors');
    };

    $scope.viewDonor = function(donor) {
      $location.path('/viewDonor/' + donor.id).search({});
    };
  });
