'use strict';

angular.module('bsis')
  .controller('ViewDonationBatchCtrl', function($scope, $location, $log, DonorService, DonationsService, TestingService, ConfigurationsService, ModalsService, AuthService, $q, $filter, $routeParams, ICONS, DATEFORMAT, DONATION, PERMISSIONS, gettextCatalog) {

    $scope.icons = ICONS;
    $scope.dateFormat = DATEFORMAT;

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
    $scope.dinLength = DONATION.DIN_LENGTH;
    $scope.timeRange = DONATION.TIME_RANGE;

    // The donation's previous pack type
    // Used to check if pack type has changed when updating a donation
    var previousPackType = null;

    $scope.getBooleanValue = ConfigurationsService.getBooleanValue;

    var data = [{}];
    $scope.data = data;

    $scope.errorObject = {};
    $scope.formErrors = [];
    $scope.addDonationSuccess = '';

    $scope.showTestResults = false;
    $scope.today = new Date();

    var columnDefs = [
      {
        name: 'Donor Number',
        displayName: gettextCatalog.getString('Donor Number'),
        field: 'donorNumber'
      },
      {
        name: 'DIN',
        displayName: gettextCatalog.getString('DIN'),
        field: 'donationIdentificationNumber'
      },
      {
        name: 'Pack Type',
        displayName: gettextCatalog.getString('Pack Type'),
        field: 'packType.packType'
      },
      {
        name: 'Donation Type',
        displayName: gettextCatalog.getString('Donation Type'),
        field: 'donationType.type'
      }
    ];

    $scope.gridOptions = {
      data: [],
      paginationPageSize: 10,
      paginationPageSizes: [10],
      paginationTemplate: 'views/template/pagination.html',
      rowTemplate: 'views/template/clickablerow.html',
      columnDefs: columnDefs,

      // Format values for exports
      exporterFieldCallback: function(grid, row, col, value) {
        if (col.name === 'Date of Last Donation') {
          return $filter('bsisDate')(value);
        }
        return value;
      },

      // PDF header
      exporterPdfHeader: function() {

        var venue = $scope.donationBatch.venue.name;
        var dateCreated = $filter('bsisDate')($scope.donationBatch.donationBatchDate);
        var lastUpdated = $filter('bsisDate')($scope.donationBatch.lastUpdated);
        var status;
        if ($scope.donationBatch.isClosed) {
          status = gettextCatalog.getString('Closed');
        } else {
          status = gettextCatalog.getString('Open');
        }

        var columns = [
          {text: gettextCatalog.getString('Batch Status') + ': ' + status, width: 'auto'},
          {text: gettextCatalog.getString('Venue') + ': ' + venue, width: 'auto'},
          {text: gettextCatalog.getString('Date Created') + ': ' + dateCreated, width: 'auto'},
          {text: gettextCatalog.getString('Last Updated') + ': ' + lastUpdated, width: 'auto'}
        ];

        return [
          {
            text: gettextCatalog.getString('Donation Batch Report'),
            bold: true,
            margin: [30, 10, 30, 0]
          },
          {
            columns: columns,
            columnGap: 10,
            margin: [30, 0]
          }
        ];
      },

      // PDF footer
      exporterPdfFooter: function(currentPage, pageCount) {
        var columns = [
          {text: gettextCatalog.getString('Total donations') + ': ' + $scope.gridOptions.data.length, width: 'auto'},
          {text: gettextCatalog.getString('Date generated: {{date}}', {date: $filter('bsisDateTime')(new Date())}), width: 'auto'},
          {text: gettextCatalog.getString('Page {{currentPage}} of {{pageCount}}', {currentPage: currentPage, pageCount: pageCount}), style: {alignment: 'right'}}
        ];
        return {
          columns: columns,
          columnGap: 10,
          margin: [30, 0]
        };
      },

      onRegisterApi: function(gridApi) {
        $scope.gridApi = gridApi;
      }
    };

    function init() {
      DonorService.getDonationBatchById($routeParams.id, function(donationBatch) {
        $scope.donationBatch = donationBatch;
        data = donationBatch.donations;
        $scope.gridOptions.data = donationBatch.donations;
        $scope.data = data;

        DonorService.getDonationBatchFormFields(function(response) {
          $scope.venues = response.venues;
        }, $log.error);
        $scope.donationBatchDate = {
          date: new Date($scope.donationBatch.donationBatchDate),
          time: new Date($scope.donationBatch.donationBatchDate)
        };
      }, $log.error);
    }

    $scope.export = function(format) {
      if (format === 'pdf') {
        $scope.gridApi.exporter.pdfExport('all', 'all');
      } else if (format === 'csv') {
        $scope.gridApi.exporter.csvExport('all', 'all');
      }
    };

    $scope.returnToListView = function() {

      $scope.format = DATEFORMAT;
      $scope.initDate = '';
      $scope.calIcon = 'fa-calendar';
      init();

      $scope.donationBatchView = 'viewDonationBatch';

    };

    $scope.validateDonationBatchEditableForm = function(editableForm) {
      if (editableForm.donationBatchDate.$error.dateInFuture || editableForm.donationBatchDate.$error.required || editableForm.donationBatchDateTime.$invalid) {
        return 'invalid';
      } else {
        $scope.confirmEdit = false;
        return true;
      }
    };

    $scope.cancelDonationBatchEditing = function() {
      init();
    };

    $scope.updateDonationBatch = function(donationBatch, reopen) {
      if (reopen) {
        DonorService.reopenDonationBatch(donationBatch, function(response) {
          donationBatch.isClosed = response.isClosed;
          $scope.refreshDonationBatch(donationBatch, response);
        }, function(err) {
          $log.error(err);
        });
      } else {
        donationBatch.donationBatchDate = $scope.donationBatchDate.date;
        DonorService.updateDonationBatch(donationBatch, function(response) {
          $scope.refreshDonationBatch(donationBatch, response);
        }, function(err) {
          $log.error(err);
        });
      }
    };

    $scope.updateTimeOnDonationBatchDate = function() {
      if ($scope.donationBatchDate.time) {
        $scope.donationBatchDate.date = moment($scope.donationBatchDate.date).hour($scope.donationBatchDate.time.getHours()).minutes($scope.donationBatchDate.time.getMinutes()).toDate();
      }
    };

    $scope.refreshDonationBatch = function(donationBatch, response) {
      // refresh the donation batch permissions
      if (donationBatch.permissions) {
        donationBatch.permissions = response.permissions;
      }
      // update the donations (in the case of the date or venue change)
      donationBatch.donations = response.donations;
      data = donationBatch.donations;
      $scope.gridOptions.data = donationBatch.donations;
      $scope.data = data;
      if ($scope.donation) {
        // update the currently selected donation
        $scope.donation = $filter('filter')($scope.data, {donationIdentificationNumber: $scope.donation.donationIdentificationNumber})[0];
        previousPackType = angular.copy($scope.donation.packType);
      }
    };

    $scope.closeDonationBatch = function(donationBatch) {
      DonorService.closeDonationBatch(donationBatch, function() {
        $location.path('/manageDonationBatches');
      }, function(err) {
        $log.error(err);
      });
    };

    $scope.deleteDonationBatch = function(donationBatchId) {
      DonorService.deleteDonationBatch(donationBatchId, function() {
        $location.path('/manageDonationBatches');
      }, function(err) {
        $log.error(err);
      });
    };

    function viewDonationSummary(donation) {
      $scope.donation = donation;
      previousPackType = angular.copy(donation.packType);
      $scope.donationBatchView = 'viewDonationSummary';
      $scope.commentFieldDisabled = !donation.adverseEvent;

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
    }

    $scope.onRowClick = function(row) {
      DonorService.getDonation(row.entity.id, function(response) {
        viewDonationSummary(response.donation);
      }, function(err) {
        $log.error(err);
      });
    };

    $scope.updateCommentFieldDisabledState = function(form) {
      $scope.commentFieldDisabled = !form.adverseEventType.$viewValue;
      if (!form.adverseEventType.$viewValue) {
        form.adverseEventComment.$setViewValue(null);
        form.adverseEventComment.$render();
      }
    };

    $scope.toggleShowResults = function(show) {
      $scope.showTestResults = show;
    };

    $scope.viewAddDonationForm = function() {

      $scope.err = {};
      $scope.addDonationSuccess = null;
      $scope.donation = {};
      previousPackType = angular.copy($scope.donation.packType);
      $scope.donorSummary = {};
      $scope.donorSummaryLoading = false;
      $scope.adverseEvent = {
        type: null,
        comment: ''
      };

      $scope.$watch('donation.donorNumber', function() {
        if ($scope.donation.donorNumber) {
          $scope.donorSummaryLoading = true;
          DonorService.getDonorSummaries($scope.donation.donorNumber, function(donorSummaries) {
            $scope.donorSummary = donorSummaries.donor;
            $scope.donorSummary.eligible = donorSummaries.eligible;
            $scope.donorSummaryLoading = false;
          });
        }
      });

      // set initial bleed times
      $scope.bleedStartTime = new Date();
      $scope.bleedEndTime = new Date();

      
      

      $scope.donationBatchView = 'addDonation';

      DonorService.getDonationsFormFields(function(response) {
        if (response !== false) {
          $scope.data = response;
          $scope.venues = response.venues;
          $scope.packTypes = $scope.data.packTypes;
          $scope.donationTypes = $scope.data.donationTypes;
          $scope.donation = $scope.data.addDonationForm;
          previousPackType = angular.copy($scope.donation.packType);
          $scope.haemoglobinLevels = $scope.data.haemoglobinLevels;
          $scope.adverseEventTypes = response.adverseEventTypes;
        }
      });
    };

    $scope.resetAdverseEventComment = function() {
      if (!$scope.adverseEvent.type) {
        $scope.adverseEvent.comment = null;
      }
    };

    function confirmAddDonation(donation) {

      // Only show modal if donor is not eligible and batch is back entry
      if ($scope.donorSummary.eligible || $scope.donationBatch.backEntry === false || donation.packType.countAsDonation === false) {
        return $q.resolve(null);
      }

      return ModalsService.showConfirmation({
        title: gettextCatalog.getString('Ineligible Donor'),
        button: gettextCatalog.getString('Continue'),
        message: gettextCatalog.getString('This donor is not eligible to donate. Components for this donation will be flagged as unsafe. Do you want to continue?')
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

    var clearDonationErrors = function() {
      $scope.donationIdentificationNumberError = null;
      $scope.invalidDonorError = null;
    };

    $scope.addDonation = function(donation, bleedStartTime, bleedEndTime, valid) {
      
      if (valid) {
        
        DonorService.checkDonorAge($scope.donorSummary.birthDate).then(function() {
          return confirmAddDonation(donation);
        }).then(function() {
          $scope.addDonationSuccess = '';

          DonorService.setDonationBatch($scope.donationBatch);

          // set donation center, site & date to those of the donation batch
          donation.venue = $scope.donationBatch.venue;
          donation.donationDate = $scope.donationBatch.donationBatchDate;
          donation.donationBatchNumber = $scope.donationBatch.batchNumber;
          donation.bleedStartTime = bleedStartTime;
          donation.bleedEndTime = bleedEndTime;

          $scope.range = (bleedEndTime.getTime() - bleedStartTime.getTime()) / 1000;
          console.log("gfgf");

          if ($scope.adverseEvent.type) {
            donation.adverseEvent = $scope.adverseEvent;
          }

          $scope.addingDonation = true;

          clearDonationErrors();

          DonorService.addDonationToBatch(donation, function(response) {
            
            $scope.addDonationSuccess = true;
            $scope.donation = {};
            previousPackType = null;
            $scope.donationBatchView = 'viewDonationBatch';

            $scope.donationBatch = response;
            $scope.gridOptions.data = $scope.donationBatch.donations;
            $scope.submitted = '';
            $scope.err = {};
            $scope.addingDonation = false;
          }, function(err) {

            $scope.err = err;
            $scope.addDonationSuccess = false;
            $scope.addingDonation = false;

            if (angular.isDefined(err.fieldErrors)) {
              $log.debug(err.fieldErrors);
              if (angular.isDefined(err.fieldErrors['donation.donationIdentificationNumber'])) {
                $scope.donationIdentificationNumberError = err.fieldErrors['donation.donationIdentificationNumber'][0];
              }

              if (angular.isDefined(err.fieldErrors['donation.donor'])) {
                $scope.invalidDonorError = err.fieldErrors['donation.donor'][0];
              }
            }
          });
        }, function() {
          // Do nothing
        });
      } else {
        $scope.submitted = true;
      }
    };

    $scope.viewDonationBatch = function() {
      $scope.donation = {};
      previousPackType = null;
      $scope.donationBatchView = 'viewDonationBatch';
    };

    $scope.updateDonation = function(donation) {

      return confirmPackTypeChange(donation).then(function() {
        DonorService.updateDonation(donation, function() {
          $scope.addDonationSuccess = true;
          $scope.donation = {};
          previousPackType = null;
          viewDonationSummary(donation);
        }, function(err) {
          $log.error(err);
          $scope.addDonationSuccess = false;
        });
      });
    };

    $scope.deleteDonation = function(donationId) {
      DonorService.deleteDonation(donationId, function() {
        data = data.filter(function(donation) {
          return donation.id !== donationId;
        });
        $scope.donorClinicTableParams.reload();
      }, function(err) {
        $log.error(err);
        $scope.confirmDelete = false;
      });
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
      if (min || max && range) {
        return ' ';
      }
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

      // if (new Date(bleedTimeData.bleedStartTime) > new Date(bleedTimeData.bleedEndTime) && $scope.formErrors.length === 0) {
      //   $scope.clearError('startTimeBeforeEndTime');
      //   $scope.raiseError('startTimeBeforeEndTime', gettextCatalog.getString('Maximum bleeding time exceeded'));
      //   $scope.getError('startTimeBeforeEndTime');
      // } else {
      //   $scope.clearError('startTimeBeforeEndTime');
      // }

      if ($scope.formErrors.length > 0) {
        return ' ';
      }
    };

    init();
  });
