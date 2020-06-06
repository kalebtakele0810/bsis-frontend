'use strict';

angular.module('bsis')

  .controller('ViewDonorCtrl', function($scope, $location, $log, $filter, $q, ngTableParams, $timeout, $routeParams,
                                         DonorService, DonationsService, TestingService, ConfigurationsService, ModalsService, AuthService, gettextCatalog,
                                         ICONS, MONTH, TITLE, GENDER, DATEFORMAT, UI, DONATION, PERMISSIONS) {

    //Initialize scope variables
    $scope.icons = ICONS;
    $scope.getBooleanValue = ConfigurationsService.getBooleanValue;
    $scope.ui = UI;
    $scope.dateFormat = DATEFORMAT;

    $scope.data = {};
    $scope.age = '';
    $scope.deferralsData = {};
    $scope.donationsData = {};
    $scope.donorPermissions = {
      canDelete: false
    };

    $scope.hstep = 1;
    $scope.mstep = 5;
    $scope.options = {
      hstep: [1, 2, 3],
      mstep: [1, 5, 10, 15, 25, 30]
    };

    $scope.bpUnit = DONATION.BPUNIT;
    $scope.hbUnit = DONATION.HBUNIT;
    $scope.weightUnit = DONATION.WEIGHTUNIT;
    $scope.pulseUnit = DONATION.PULSEUNIT;

    $scope.weightMin = DONATION.DONOR.WEIGHT_MIN;
    $scope.weightMax = DONATION.DONOR.WEIGHT_MAX;
    $scope.hbMin = DONATION.DONOR.HB_MIN;
    $scope.hbMax = DONATION.DONOR.HB_MAX;
    $scope.bpSystolicMin = DONATION.DONOR.BP_SYSTOLIC_MIN;
    $scope.bpSystolicMax = DONATION.DONOR.BP_SYSTOLIC_MAX;
    $scope.bpDiastolicMin = DONATION.DONOR.BP_DIASTOLIC_MIN;
    $scope.bpDiastolicMax = DONATION.DONOR.BP_DIASTOLIC_MAX;
    $scope.pulseMin = DONATION.DONOR.PULSE_MIN;
    $scope.pulseMax = DONATION.DONOR.PULSE_MAX;
    $scope.postalSameAsHome = false;
    $scope.workSameAsHome = false;
    $scope.dinLength = DONATION.DIN_LENGTH;

    $scope.formErrors = [];
    $scope.errorObject = {};
    $scope.invalidDeferredUntilDate = false;

    // The donation's previous pack type
    // Used to check if pack type has changed when updating a donation
    var previousPackType = null;

    //Donor Overview and Demographics Section

    function initializeDonor() {
      DonorService.getDonorById($routeParams.id, function(donor) {
        DonorService.setDonor(donor);
        $scope.donor = donor;
        $scope.donorPermissions.canDelete = donor.permissions.canDelete;
      }, function() {
        $location.path('/findDonor');
      });
    }

    function initializeDonorFormFields() {
      DonorService.getDonorFormFields(function(response) {
        if (response !== false) {
          $scope.data = response;
          $scope.addressTypes = $scope.data.addressTypes;
          $scope.languages = $scope.data.languages;
          $scope.venues = $scope.data.venues;
          $scope.idTypes = $scope.data.idTypes;
          $scope.preferredContactMethods = $scope.data.preferredContactMethods;
          $scope.title = TITLE.options;
          $scope.month = MONTH.options;
          $scope.gender = GENDER.options;

          $scope.languages = [{
            "id" : "11e868b0-5bb1-fd32-8826-e4a471449260 ",
            "preferredLanguage" : "English",
          }];

          $scope.userSelect = "11e868b0-5bb1-fd32-8826-e4a471449260";
        }
      });
    }

    function getDonorOverview() {
      DonorService.getDonorOverview($routeParams.id, function(response) {
        if (response !== false) {
          $scope.data = response;
          $scope.flaggedForCounselling = $scope.data.flaggedForCounselling;
          $scope.hasCounselling = $scope.data.hasCounselling;
          $scope.currentlyDeferred = $scope.data.currentlyDeferred;
          $scope.lastDeferral = $scope.data.deferral;
          $scope.deferredUntil = $scope.data.deferredUntil;
          $scope.lastDonation = $scope.data.lastDonation;
          $scope.dateOfFirstDonation = $scope.data.dateOfFirstDonation;
          $scope.totalDonations = $scope.data.totalDonations;
          $scope.dueToDonate = $scope.data.dueToDonate;
          $scope.totalAdverseEvents = response.totalAdverseEvents;
          $scope.donorPermissions.canDelete = response.canDelete;
          $scope.isEligible = response.isEligible;
          $scope.donorInitialized = true;
        }
      });
    }

    function confirmPackTypeChange(donation) {
      if (previousPackType.id === donation.packType.id) {
        return $q.resolve();
      }

      return ModalsService.showConfirmation({
        title: gettextCatalog.getString('Pack Type Update'),
        button: gettextCatalog.getString('Continue'),
        message: gettextCatalog.getString('The pack type has been updated - this will affect the initial components created with this donation. Do you want to continue?')
      });
    }

    $scope.sameAsHome = function(form, addressType) {
      if (addressType == 'Postal') {
        form.postalAddressLine1.$setViewValue((form.postalSameAsHome.$viewValue === false) ? '' : form.homeAddressLine1.$modelValue);
        form.postalAddressLine1.$render();
        form.postalAddressLine2.$setViewValue((form.postalSameAsHome.$viewValue === false) ? '' : form.homeAddressLine2.$modelValue);
        form.postalAddressLine2.$render();
        form.postalAddressCity.$setViewValue((form.postalSameAsHome.$viewValue === false) ? '' : form.homeAddressCity.$modelValue);
        form.postalAddressCity.$render();
        form.postalAddressDistrict.$setViewValue((form.postalSameAsHome.$viewValue === false) ? '' : form.homeAddressDistrict.$modelValue);
        form.postalAddressDistrict.$render();
        form.postalAddressState.$setViewValue((form.postalSameAsHome.$viewValue === false) ? '' : form.homeAddressState.$modelValue);
        form.postalAddressState.$render();
        form.postalAddressProvince.$setViewValue((form.postalSameAsHome.$viewValue === false) ? '' : form.homeAddressProvince.$modelValue);
        form.postalAddressProvince.$render();
        form.postalAddressCountry.$setViewValue((form.postalSameAsHome.$viewValue === false) ? '' : form.homeAddressCountry.$modelValue);
        form.postalAddressCountry.$render();
        form.postalAddressZipcode.$setViewValue((form.postalSameAsHome.$viewValue === false) ? null : form.homeAddressZipcode.$modelValue);
        form.postalAddressZipcode.$render();
      }

      if (addressType == 'Work') {
        form.workAddressLine1.$setViewValue((form.workSameAsHome.$viewValue === false) ? '' : form.homeAddressLine1.$modelValue);
        form.workAddressLine1.$render();
        form.workAddressLine2.$setViewValue((form.workSameAsHome.$viewValue === false) ? '' : form.homeAddressLine2.$modelValue);
        form.workAddressLine2.$render();
        form.workAddressCity.$setViewValue((form.workSameAsHome.$viewValue === false) ? '' : form.homeAddressCity.$modelValue);
        form.workAddressCity.$render();
        form.workAddressDistrict.$setViewValue((form.workSameAsHome.$viewValue === false) ? '' : form.homeAddressDistrict.$modelValue);
        form.workAddressDistrict.$render();
        form.workAddressState.$setViewValue((form.workSameAsHome.$viewValue === false) ? '' : form.homeAddressState.$modelValue);
        form.workAddressState.$render();
        form.workAddressProvince.$setViewValue((form.workSameAsHome.$viewValue === false) ? '' : form.homeAddressProvince.$modelValue);
        form.workAddressProvince.$render();
        form.workAddressCountry.$setViewValue((form.workSameAsHome.$viewValue === false) ? '' : form.homeAddressCountry.$modelValue);
        form.workAddressCountry.$render();
        form.workAddressZipcode.$setViewValue((form.workSameAsHome.$viewValue === false) ? null : form.homeAddressZipcode.$modelValue);
        form.workAddressZipcode.$render();
      }
    };

    /**
     *  Delete Donor Logic
     *
     */

    $scope.confirmDelete = function(donor) {
      return ModalsService.showConfirmation({
        title: gettextCatalog.getString('Delete Donor'),
        button: gettextCatalog.getString('Delete'),
        message: gettextCatalog.getString('Are you sure you wish to delete the donor "{{firstName}}, {{middleName}}, {{lastName}} {{donorNumber}}"?', {firstName: donor.firstName,middleName: donor.middleName, lastName: donor.lastName, donorNumber: donor.donorNumber})
      }).then(function() {
        // Delete confirmed - delete the donor
        $scope.deleteDonor(donor);
      }, function() {
        // delete cancelled - do nothing
      });

    };

    $scope.deleteDonor = function(donor) {
      DonorService.deleteDonor(donor.id, function() {
        $location.path('findDonor').search({});
      }, function(err) {
        $log.err(err);
      });
    };

    //Donations Section

    function getOpenDonationBatches() {
      DonorService.getOpenDonationBatches(function(response) {
        if (response !== false) {
          $scope.donationBatches = response.donationBatches;
          $scope.openDonationBatches = $scope.donationBatches.length > 0;
        }
      });
    }

    function getDonationsFormFields() {
      DonorService.getDonationsFormFields(function(response) {
        if (response !== false) {
          $scope.data = response;
          $scope.packTypes = $scope.data.packTypes;
          $scope.donationTypes = $scope.data.donationTypes;
          $scope.donation = $scope.data.addDonationForm;
          previousPackType = angular.copy($scope.donation.packType);
          $scope.haemoglobinLevels = $scope.data.haemoglobinLevels;
          $scope.adverseEventTypes = response.adverseEventTypes;
        }
      });
    }

    $scope.getDonations = function(donorId) {
      $scope.confirmDelete = false;
      $scope.donationsView = 'viewDonations';

      DonorService.getDonations(donorId, function(response) {
        if (response !== false) {
          $scope.donationsData = response.allDonations;
          $scope.donationResults = $scope.donationsData.length > 0;
        } else {
          $scope.donationResults = false;
        }
      });

      $scope.donationTableParams = new ngTableParams({
        page: 1,            // show first page
        count: 6,          // count per page
        filter: {},
        sorting: {}
      },
        {
          defaultSort: 'asc',
          counts: [], // hide page counts control
          total: $scope.donationsData.length, // length of data
          getData: function($defer, params) {
            var donationsData = $scope.donationsData;

            var orderedData = params.sorting() ?
              $filter('orderBy')(donationsData, params.orderBy()) : donationsData;
            params.total(orderedData.length); // set total for pagination
            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
          }
        });

      $scope.$watch('donationsData', function() {
        $timeout(function() {
          $scope.donationTableParams.reload();
        });
      });
    };

    $scope.showTestResults = false;

    $scope.viewDonationSummary = function(din) {

      $scope.donation = $filter('filter')($scope.donationsData, {donationIdentificationNumber: din})[0];
      previousPackType = angular.copy($scope.donation.packType);
      $scope.commentFieldDisabled = !$scope.donation.adverseEvent;

      DonorService.getDonationsFormFields(function(response) {
        if (response !== false) {
          $scope.haemoglobinLevels = response.haemoglobinLevels;
          $scope.packTypes = response.packTypes;
          $scope.adverseEventTypes = [null].concat(response.adverseEventTypes);
        }
      });
      if ($scope.donation.packType.testSampleProduced === true && AuthService.hasPermission(PERMISSIONS.VIEW_TEST_OUTCOME)) {
        TestingService.getTestResultsByDIN({donationIdentificationNumber: $scope.donation.donationIdentificationNumber}, function(testingResponse) {
          $scope.testResults = testingResponse.testResults.recentTestResults;
        }, function(err) {
          $log.error(err);
        });
      } else {
        $scope.testResults = null;
      }

      $scope.donationsView = 'viewDonationSummary';
    };

    $scope.toggleShowResults = function(show) {
      $scope.showTestResults = show;
    };

    $scope.returnToListView = function() {
      $scope.donationsView = 'viewDonations';
    };

    $scope.updateCommentFieldDisabledState = function(form) {
      $scope.commentFieldDisabled = !form.adverseEventType.$viewValue;
      if (!form.adverseEventType.$viewValue) {
        form.adverseEventComment.$setViewValue(null);
        form.adverseEventComment.$render();
      }
    };

    $scope.updateDonation = function(donation) {
      return confirmPackTypeChange(donation).then(function() {
        var d = $q.defer();
        DonorService.updateDonation(donation, function(response) {
          $scope.donation.permissions = response.permissions;
          $scope.addDonationSuccess = true;
          $scope.donation = {};
          previousPackType = null;
          $scope.err = null;
          $scope.viewDonationSummary(response.donationIdentificationNumber);
          d.resolve();
        }, function(err) {
          $log.error(err);
          $scope.err = err;
          $scope.addDonationSuccess = false;
          d.reject('Server Error');
        });
        return d.promise;
      });
    };

    $scope.editDonation = function(form) {
      DonationsService.getEditForm({id: $scope.donation.id}, function(res) {
        $scope.packTypes = res.packTypes;
        $scope.adverseEventTypes = [null].concat(res.adverseEventTypes);
        $scope.testBatchStatus = res.testBatchStatus;
        form.$show();
      }, function(err) {
        $log.error(err);
      });
    };

    $scope.cancelEditDonation = function(form) {
      $scope.formErrors = [];
      $scope.errorObject = [];
      form.$cancel();
    };

    $scope.checkBleedTimes = function(bleedTimeData) {

      if (bleedTimeData.bleedEndTime === null) {
        $scope.clearError('emptyBleedEndTime');
        $scope.raiseError('emptyBleedEndTime', gettextCatalog.getString('Enter a valid time'));
        $scope.getError('emptyBleedEndTime');
      } else {
        $scope.clearError('emptyBleedEndTime');
      }

      if (bleedTimeData.bleedStartTime === null) {
        $scope.clearError('emptyBleedStartTime');
        $scope.raiseError('emptyBleedStartTime', gettextCatalog.getString('Enter a valid time'));
        $scope.getError('emptyBleedStartTime');
      } else {
        $scope.clearError('emptyBleedStartTime');
      }

      if (new Date(bleedTimeData.bleedEndTime) < new Date(bleedTimeData.bleedStartTime) && $scope.formErrors.length === 0) {
        $scope.clearError('endTimeBeforeStartTime');
        $scope.raiseError('endTimeBeforeStartTime', gettextCatalog.getString('End time should be after Start time'));
        $scope.getError('endTimeBeforeStartTime');
      } else {
        $scope.clearError('endTimeBeforeStartTime');
      }

      if (new Date(bleedTimeData.bleedEndTime) > new Date(bleedTimeData.bleedStartTime.asMinute() >= 15) && $scope.formErrors.length === 0) {
        $scope.clearError('startTimeBeforeEndTime');
        $scope.raiseError('startTimeBeforeEndTime', gettextCatalog.getString('Maximum bleeding time exceeded'));
        $scope.getError('startTimeBeforeEndTime');
      } else {
        $scope.clearError('startTimeBeforeEndTime');
      }

      if ($scope.formErrors.length > 0) {
        return 'error ';
      }
    };

    $scope.deleteDonation = function(donationId) {
      DonorService.deleteDonation(donationId, function() {
        $scope.donationsData = $scope.donationsData.filter(function(donation) {
          return donation.id !== donationId;
        });
        getDonorOverview();
      }, function(err) {
        $log.error(err);
        $scope.confirmDelete = false;
      });
    };

    $scope.viewAddDonationForm = function() {
      // set initial bleed times
      $scope.donorDonationError = null;
      $scope.addDonationSuccess = true;
      $scope.bleedStartTime = new Date();
      $scope.bleedEndTime = new Date();
      $scope.adverseEvent = {
        type: null,
        comment: ''
      };

      $scope.donationsView = 'addDonation';

      getDonationsFormFields();
      getOpenDonationBatches();
    };

    $scope.addDonationSuccess = '';

    function confirmAddDonation(donation, donationBatch) {

      // Only show modal if donor is not eligible and batch is back entry
      if ($scope.isEligible || !donationBatch.backEntry || donation.packType.countAsDonation === false) {
        return $q.resolve(null);
      }

      return ModalsService.showConfirmation({
        title: gettextCatalog.getString('Ineligible Donor'),
        button: gettextCatalog.getString('Continue'),
        message: gettextCatalog.getString('This donor is not eligible to donate. Components for this donation will be flagged as unsafe. Do you want to continue?')
      });
    }

    $scope.resetAdverseEventComment = function() {
      if (!$scope.adverseEvent.type) {
        $scope.adverseEvent.comment = null;
      }
    };

    var clearDonationErrors = function() {
      $scope.donorDonationDINError = null;
      $scope.invalidDonorDonationError = null;
    };

    $scope.addDonation = function(donation, donationBatch, bleedStartTime, bleedEndTime, valid) {

      if (valid) {

        DonorService.checkDonorAge($scope.donor.birthDate).then(function() {
          return confirmAddDonation(donation, donationBatch);
        }).then(function() {
          $scope.addDonationSuccess = '';

          // set donation center, site & date to those of the donation batch
          donation.venue = donationBatch.venue;
          donation.donationDate = donationBatch.donationBatchDate;
          donation.donationBatchNumber = donationBatch.batchNumber;

          donation.donorNumber = $scope.donor.donorNumber;

          donation.bleedStartTime = bleedStartTime;
          donation.bleedEndTime = bleedEndTime;
          

          if ($scope.adverseEvent.type) {
            donation.adverseEvent = $scope.adverseEvent;
          }

          $scope.addingDonation = true;

          clearDonationErrors();

          DonorService.addDonation(donation, function() {
            // $scope.range = (bleedEndTime.getTime() - bleedStartTime.getTime()) / 1000;
            $scope.addDonationSuccess = true;
            $scope.donation = {};
            previousPackType = null;
            $scope.getDonations($scope.donor.id);
            $scope.donationsView = 'viewDonations';
            $scope.submitted = '';
            getDonorOverview();

            $scope.addingDonation = false;

          }, function(err) {
            $scope.donorDonationError = err;
            $scope.addDonationSuccess = false;

            if (angular.isDefined(err.fieldErrors)) {
              if (angular.isDefined(err.fieldErrors['donation.donationIdentificationNumber'])) {
                $scope.donorDonationDINError = err.fieldErrors['donation.donationIdentificationNumber'][0];
              }
              if (angular.isDefined(err.fieldErrors['donation.donor'])) {
                $scope.invalidDonorDonationError = err.fieldErrors['donation.donor'][0];
              }
            }

            // refresh donor overview after adding donation
            getDonorOverview();

            $scope.addingDonation = false;
          });
        }, function() {
          // Do nothing
        });
      } else {
        $scope.submitted = true;
      }
    };

    $scope.printDonorBarcode = function() {
      DonorService.getDonorBarcode($scope.donor.id, function(response) {
        if (response !== false) {
          $scope.labelZPL = response.labelZPL;
          $log.debug('$scope.labelZPL: ', $scope.labelZPL);
        }
      });
    };

    // Deferrals Section

    function getDeferralsFormFields() {
      DonorService.getDeferralsFormFields(function(response) {
        if (response !== false) {
          $scope.data = response;
          $scope.deferralReasons = $scope.data.deferralReasons;
          $scope.venues = $scope.data.venues;
        }
      });
    }

    function clearDeferralMessage() {
      $scope.currentlyDeferred = false;
      var today = new Date();
      today.setHours(23, 59, 59, 0);
      $scope.deferredUntilDate = today;
      $scope.deferredUntil = gettextCatalog.getString('No current deferrals');
    }

    function refreshDeferralMessage(deferral) {
      var deferredUntil = new Date(deferral.deferredUntil);
      deferredUntil.setHours(0, 0, 0, 0);
      if ($scope.deferredUntilDate.getTime() < deferredUntil.getTime()) {
        $scope.currentlyDeferred = true;
        $scope.deferredUntilDate = deferredUntil;
        $scope.deferredUntil = deferral.deferredUntil;
      }
    }

    $scope.getDeferrals = function(donorId) {
      $scope.deletingDeferral = false;
      $scope.deferralView = 'viewDeferrals';

      DonorService.getDeferrals(donorId, function(response) {
        if (response !== false) {
          $scope.deferralsData = response.allDonorDeferrals;
          $scope.deferralResults = true;
        } else {
          $scope.deferralResults = false;
        }
      });

      $scope.deferralTableParams = new ngTableParams({
        page: 1,            // show first page
        count: 6,          // count per page
        filter: {},
        sorting: {}
      },
        {
          defaultSort: 'asc',
          counts: [], // hide page counts control
          total: $scope.deferralsData.length, // length of data
          getData: function($defer, params) {
            var deferralsData = $scope.deferralsData;

            var orderedData = params.sorting() ?
              $filter('orderBy')(deferralsData, params.orderBy()) : deferralsData;
            params.total(orderedData.length); // set total for pagination
            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
          }
        }
      );

      $scope.$watch('deferralsData', function() {
        $timeout(function() {
          $scope.deferralTableParams.reload();
        });
      });

      $scope.endDonorDeferral = function(deferral, comment, endDeferralForm) {
        if (endDeferralForm.$valid) {
          var endDeferralPostData = {};
          endDeferralPostData.comment = comment;
          DonorService.endDonorDeferral(deferral.id, endDeferralPostData, function(response) {
            // refresh the notices at the top
            clearDeferralMessage();
            getDonorOverview();
            // edit the end date in the table
            var updatedDeferral = response;
            angular.forEach($scope.deferralsData, function(d) {
              if (d.id === updatedDeferral.id) {
                if (d.permissions) {
                  d.permissions = updatedDeferral.permissions;
                }
                d.deferredUntil = updatedDeferral.deferredUntil;
                d.deferralReasonText = updatedDeferral.deferralReasonText;
              }
              refreshDeferralMessage(d);
            });
          }, function(err) {
            $scope.err = err;
          });
        }
      };

      $scope.updateDonorDeferralReason = function(deferral, deferralReason) {
        // change end date
        var newEndDate = new Date();
        if (deferralReason.durationType === 'PERMANENT') {
          newEndDate.setFullYear(2100, 0, 1);
        } else {
          newEndDate.setDate(newEndDate.getDate() + deferralReason.defaultDuration);
        }
        deferral.deferredUntil = newEndDate;
      };

      $scope.deleteDonorDeferral = function(donorDeferral) {
        var message = '';
        if (donorDeferral.deferralReason.durationType === 'PERMANENT') {
          message = gettextCatalog.getString('Are you sure you want to void this permanent deferral? The donor may be eligible to donate as a result of this action.');
        } else {
          message = gettextCatalog.getString('Are you sure you want to void this deferral?');
        }

        var confirmationModalConfig = {
          title: gettextCatalog.getString('Void Deferral'),
          button: gettextCatalog.getString('Void'),
          message: message
        };

        ModalsService.showConfirmation(confirmationModalConfig).then(function() {
          $scope.deletingDeferral = true;
          DonorService.deleteDonorDeferral(donorDeferral.id, function() {
            // refresh the notices at the top
            clearDeferralMessage();
            getDonorOverview();
            // remove item from the table once it has been deleted
            var deferralsData = $scope.deferralsData.filter(function(deferral) {
              if (deferral.id === donorDeferral.id) {
                return false;
              }
              refreshDeferralMessage(deferral);
              return true;
            });
            $scope.deferralsData = deferralsData;
            $scope.deletingDeferral = false;
          }, function(err) {
            $scope.err = err;
            $scope.deletingDeferral = false;
          });
        }).catch(function() {
          // Confirmation was rejected
          $scope.deletingDeferral = false;
        });
      };
    };

    // End of Deferrals section

    $scope.updateDonor = function(donor) {
      var d = $q.defer();

      // Remove timezone from birth date
      donor.birthDate = moment(donor.birthDate).format('YYYY-MM-DD');

      DonorService.updateDonor(donor, function(response) {
        $scope.donor = response;
          //Reset Error Message
        $scope.err = null;
        d.resolve();
        if ($scope.donorPermissions) {
          $scope.donorPermissions.canDelete = response.permissions.canDelete;
        }
      },
        function(err) {
          $scope.donor = donor;
          $scope.err = err;
          d.reject('Server Error');
        });
      return d.promise;
    };

    $scope.checkIdentifier = function(identifierData) {
      if (!identifierData.idNumber || angular.isUndefined(identifierData.idType)) {
        $scope.clearError('identifier');
        $scope.raiseError('identifier', gettextCatalog.getString('Please enter a valid identifier'));
        $scope.getError('identifier');
        return ' ';
      } else {
        $scope.clearError('identifier');
      }
    };

    $scope.validateForm = function(form) {
      if (form.$valid) {
        return true;
      } else {
        return gettextCatalog.getString('This form is not valid');
      }
    };

    $scope.raiseError = function(errorName, errorMessage) {
      $scope.formErrors.push(
        {
          name: errorName,
          error: errorMessage
        }
      );
    };

    $scope.clearError = function(errorName) {
      $scope.errorObject[errorName] = [];
      $scope.formErrors = $scope.formErrors.filter(function(obj) {
        return obj.name !== errorName;
      });
    };

    $scope.getError = function(errorName) {
      $scope.errorObject[errorName] = $scope.formErrors.filter(function(obj) {
        return obj.name == errorName;
      });
    };

    $scope.checkErrors = function(min, max) {
      if (min || max) {
        return ' ';
      }
    };

    $scope.populateEndDate = function(deferral) {
      var deferralReason = deferral.deferralReason;
      deferral.deferredUntil = deferralReason.durationType === 'PERMANENT' ?
        moment('2100-01-01').toDate() :
        moment().add(deferralReason.defaultDuration, 'days').toDate();
    };

    // Manage deferral section

    $scope.manageDeferral = function(deferral) {
      $scope.format = DATEFORMAT;
      $scope.calIcon = 'fa-calendar';
      $scope.dateToOpen = true;
      $scope.deferralView = 'manageDeferral';
      $scope.deferral = {};
      $scope.submitted = '';

      if (deferral) {
        // This is an update
        // convert deferredUntil to a Date object
        deferral.deferredUntil = new Date(deferral.deferredUntil);
        $scope.deferral = deferral;
      }
    };

    var updateDeferral = function(deferral, saveDeferralForm) {
      DonorService.updateDonorDeferral(deferral, function(response) {
        var updatedDeferral = response;
        if (deferral.permissions) {
          deferral.permissions = updatedDeferral.permissions;
        }
        // refresh the notices at the top
        clearDeferralMessage();
        angular.forEach($scope.deferralsData, function(d) {
          refreshDeferralMessage(d);
        });
        $scope.getDeferrals($scope.donor.id);
        getDonorOverview();
        $scope.submitted = '';
        $scope.deferral = {};
        // set form back to pristine state
        saveDeferralForm.$setPristine();
        $scope.savingDeferral = false;
      }, function(err) {
        $scope.err = err;
        $scope.savingDeferral = false;
      });
    };

    var addDeferral = function(deferral, saveDeferralForm) {
      deferral.deferredDonor = $scope.donor;
      DonorService.addDeferral(deferral, function(response) {
        if (response === true) {
          $scope.getDeferrals($scope.donor.id);
          getDonorOverview();
          $scope.submitted = '';
          $scope.deferral = {};
          // set form back to pristine state
          saveDeferralForm.$setPristine();
        }
        $scope.savingDeferral = false;
      });
    };

    $scope.saveDeferral = function(deferral, saveDeferralForm) {
      // Validate deferredUntil date
      $scope.invalidDeferredUntilDate = false;
      if (!deferral.deferralDate) {
        deferral.deferralDate = new Date();
      }

      if (new Date(deferral.deferredUntil) < new Date(deferral.deferralDate)) {
        $scope.invalidDeferredUntilDate = true;
      }

      if (saveDeferralForm.$valid && !$scope.invalidDeferredUntilDate) {
        $scope.addingDeferral = true;
        if (deferral.id) {
          updateDeferral(deferral, saveDeferralForm);
        } else {
          addDeferral(deferral, saveDeferralForm);
        }
      } else {
        $scope.submitted = true;
      }
    };

    // Inits

    initializeDonor();
    initializeDonorFormFields();
    getDeferralsFormFields();
    getDonorOverview();

  });
