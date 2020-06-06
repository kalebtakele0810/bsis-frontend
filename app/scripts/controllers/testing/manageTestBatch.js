'use strict';

angular.module('bsis')

  .controller('ManageTestBatchCtrl', function($scope, $location, $log, $filter, $timeout, $routeParams, $q, $route, DONATION, uiGridConstants, gettextCatalog, TestingService, ModalsService, DATEFORMAT) {

    $scope.dateFormat = DATEFORMAT;
    $scope.today = new Date();
    $scope.dinLength = DONATION.DIN_LENGTH;

    var samplesToRemoveList = [];
    var dinRangeMaster = {
      toDIN: null,
      fromDIN: null
    };
    $scope.dinRange = angular.copy(dinRangeMaster);

    $scope.exportOptions = [
      {
        id: 'allSamples',
        value: gettextCatalog.getString('All Samples'),
        reportName: gettextCatalog.getString('Test Batch Outcomes Summary Report'),
        filterKeys: [],
        columns: ['ttistatus', 'bloodTypingStatus', 'bloodTypingMatchStatus'],
        matchType: true
      },
      {
        id: 'ttiUnsafeSample',
        value: gettextCatalog.getString('TTI Unsafe or Incomplete'),
        reportName: gettextCatalog.getString('Test Batch Outcomes Summary Report - TTI Unsafe and Tests Outstanding'),
        filterKeys: ['SAFE'],
        columns: ['ttistatus'],
        matchType: false
      },
      {
        id: 'testingIncompleteSamples',
        value: gettextCatalog.getString('Blood Typing Issues or Incomplete'),
        reportName: gettextCatalog.getString('Test Batch Outcomes Summary Report - Blood Typing Issues and Tests Outstanding'),
        filterKeys: ['MATCH', 'RESOLVED'],
        columns: ['bloodTypingMatchStatus'],
        matchType: false
      }
    ];
    $scope.dataExportType = $scope.exportOptions[0];

    $scope.getCurrentTestBatch = function() {
      TestingService.getTestBatchById($routeParams.id, function(response) {
        $scope.testBatch = response.testBatch;
        $scope.refreshCurrentTestBatch(response);
        $scope.refreshEditTestBatchForm();
      }, function(err) {
        $log.error(err);
      });
    };

    $scope.refreshCurrentTestBatch = function(response) {
      var numReleasedSamples = 0;
      angular.forEach($scope.testBatch.donations, function(donation) {
        // calculate the number of released samples
        if (donation.released) {
          numReleasedSamples++;
        }
      });

      if (angular.isDefined(response.donations)) {
        $scope.gridOptions.data = response.donations;
      } else {
        $scope.gridOptions.data = $scope.testBatch.donations;
      }
      $scope.testBatch.numReleasedSamples = numReleasedSamples;
      $scope.testBatchDate = {
        // set the testBatchDate so it can be edited
        date: new Date($scope.testBatch.testBatchDate),
        time: new Date($scope.testBatch.testBatchDate)
      };
    };

    $scope.refreshEditTestBatchForm = function() {
      TestingService.getTestBatchFormFields(function(response) {
        if (response !== false) {
          $scope.locations = response.testingSites;
        }
      });
    };

    $scope.getCurrentTestBatch();

    $scope.getCurrentTestBatchOverview = function() {
      TestingService.getTestBatchOverviewById({testBatch: $routeParams.id}, function(response) {
        $scope.testBatchOverview = response;
        $scope.hasPendingRepeatBloodTypingTests = response.hasPendingRepeatBloodTypingTests;
        $scope.hasPendingRepeatTTITests = response.hasPendingRepeatTTITests;
        $scope.hasPendingConfirmatoryTTITests = response.hasPendingConfirmatoryTTITests;
        $scope.hasPendingBloodTypingConfirmations = response.hasPendingBloodTypingConfirmations;
        $scope.hasRepeatBloodTypingTests = response.hasRepeatBloodTypingTests;
        $scope.hasConfirmatoryTTITests = response.hasConfirmatoryTTITests;
        $scope.hasRepeatTTITests = response.hasRepeatTTITests;
        $scope.hasReEntryRequiredTTITests = response.hasReEntryRequiredTTITests;
        $scope.hasReEntryRequiredBloodTypingTests = response.hasReEntryRequiredBloodTypingTests;
        $scope.hasReEntryRequiredRepeatBloodTypingTests = response.hasReEntryRequiredRepeatBloodTypingTests;
        $scope.hasReEntryRequiredRepeatTTITests = response.hasReEntryRequiredRepeatTTITests;
        $scope.hasReEntryRequiredConfirmatoryTTITests = response.hasReEntryRequiredConfirmatoryTTITests;
      }, function(err) {
        $log.error(err);
      });
    };

    $scope.getCurrentTestBatchOverview();

    var columnDefs = [
      {
        name: 'DIN',
        displayName: gettextCatalog.getString('DIN'),
        field: 'donationIdentificationNumber',
        visible: true,
        width: '**',
        maxWidth: '120',
        sort: {
          direction: 'asc'
        }
      },
      {
        name: 'Date Bled',
        displayName: gettextCatalog.getString('Date Bled'),
        field: 'donationDate',
        cellFilter: 'bsisDate',
        visible: true,
        width: '**',
        maxWidth: '150'
      },
      {
        name: 'Pack Type',
        displayName: gettextCatalog.getString('Pack Type'),
        field: 'packType.packType',
        visible: true,
        width: '**',
        maxWidth: '100'
      },
      {
        name: 'Venue',
        displayName: gettextCatalog.getString('Venue'),
        field: 'venue.name',
        visible: true,
        width: '**'
      },
      {
        name: 'Released',
        displayName: gettextCatalog.getString('Released'),
        field: 'released',
        cellTemplate: '<div class="ui-grid-cell-contents">' +
          '{{row.entity["released"] ? "' + gettextCatalog.getString('Y') + '" : "' + gettextCatalog.getString('N') + '"}}' +
          '</div>',
        visible: true,
        width: '**',
        maxWidth: '100'
      },
      {
        name: 'ttistatus',
        displayName: gettextCatalog.getString('TTI Status'),
        field: 'ttistatus',
        cellTemplate: '<div class="ui-grid-cell-contents">' +
          '{{row.entity["ttistatus"] | titleCase | translate}}' +
          '</div>',
        visible: true,
        width: '**',
        maxWidth: '150'
      },
      {
        name: 'bloodTypingStatusBloodTypingMatchStatus',
        displayName: gettextCatalog.getString('Blood Group Serology'),
        field: 'bloodTypingStatusBloodTypingMatchStatus',
        cellTemplate: '<div class="ui-grid-cell-contents">' +
          '{{row.entity["bloodTypingStatus"] | titleCase | translate }} - ' +
          '{{row.entity["bloodTypingMatchStatus"] | titleCase | translate }} ' +
          '<em>({{row.entity["bloodRh"] === "" ? "" : row.entity["bloodAbo"]}}{{row.entity["bloodAbo"] === "" ? "" : row.entity["bloodRh"]}})</em>' +
          '</div>',
        visible: true,
        width: '**'
      },
      {
        name: 'previousDonationAboRhOutcome',
        displayName: gettextCatalog.getString('Previous ABO/Rh'),
        field: 'previousDonationAboRhOutcome',
        visible: false,
        width: '100'
      }
    ];

    $scope.gridOptions = {
      data: [],
      paginationPageSize: 10,
      paginationPageSizes: [10],
      paginationTemplate: 'views/template/pagination.html',
      columnDefs: columnDefs,
      enableRowSelection: true,
      multiSelect: true,
      enableSelectAll: false,

      exporterPdfOrientation: 'landscape',
      exporterPdfPageSize: 'A4',
      exporterPdfDefaultStyle: {fontSize: 4, margin: [-2, 0, 0, 0] },
      exporterPdfTableHeaderStyle: {fontSize: 5, bold: true, margin: [-2, 0, 0, 0] },
      exporterPdfMaxGridWidth: 500,
      exporterSuppressColumns: ['Venue'],
      // Format values for exports
      exporterFieldCallback: function(grid, row, col, value) {
        if (col.name === 'Date Bled') {
          return $filter('bsisDate')(value);
        } else if (col.name === 'ttistatus') {
          value = value;
          return gettextCatalog.getString($filter('titleCase')(value));
        } else if (col.name === 'bloodAboRh') {
          var bloodSerology = '';
          if (row.entity.bloodTypingStatus !== 'NOT_DONE') {
            bloodSerology = gettextCatalog.getString($filter('titleCase')(row.entity.bloodTypingMatchStatus));
          }
          return bloodSerology;
        } else if (col.name === 'previousDonationAboRhOutcome') {
          if (row.entity.previousDonationAboRhOutcome === null) {
            return '';
          } else {
            return row.entity.previousDonationAboRhOutcome;
          }
        } else if (col.name === 'bloodTypingStatusBloodTypingMatchStatus') {
          var bloodGroup = (row.entity.bloodRh === '' ? '' : row.entity.bloodAbo) + (row.entity.bloodAbo === '' ? '' : row.entity.bloodRh);
          return gettextCatalog.getString($filter('titleCase')(row.entity.bloodTypingStatus)) + ' - ' +
            gettextCatalog.getString($filter('titleCase')(row.entity.bloodTypingMatchStatus)) +
            ' (' + bloodGroup + ')';
        }
        //modify value of value of released column
        if (col.name === 'Released') {
          return value === true ? gettextCatalog.getString('Y') : gettextCatalog.getString('N');
        }
        // assume that column is a test outcome column, and manage empty values
        if (col.name !== 'DIN' && col.name !== 'Pack Type' && col.name !== 'Venue' && col.name !== 'Released' && col.name !== 'TTI Status' && col.name !== 'bloodTypingStatusBloodTypingMatchStatus' && col.name !== 'previousDonationAboRhOutcome') {
          for (var test in value) {
            if (test === col.name) {
              return value[test] || '';
            }
          }
          return '';
        }

        return value;
      },

      // PDF header
      exporterPdfHeader: function() {
        var finalArray = [
          {
            text: $scope.reportName,
            fontSize: 10,
            bold: true,
            margin: [30, 20, 0, 0] // [left, top, right, bottom]
          }
        ];
        return finalArray;
      },

      exporterPdfTableStyle: {margin: [-10, 10, 0, 0]},


      // PDF footer
      exporterPdfFooter: function(currentPage, pageCount) {
        var columns = [
          {text: gettextCatalog.getString('Number of Samples: {{sampleNumber}}', {sampleNumber: $scope.gridOptions.data.length}), width: 'auto'},
          {text: gettextCatalog.getString('Date generated: {{date}}', {date: $filter('bsisDateTime')(new Date())}), width: 'auto'},
          {text: gettextCatalog.getString('Page {{currentPage}} of {{pageCount}}', {currentPage: currentPage, pageCount: pageCount}), style: {alignment: 'right'}}
        ];
        return {
          columns: columns,
          columnGap: 10,
          margin: [30, 0],
          fontSize: 6
        };
      },
      enableFiltering: false,

      isRowSelectable: function(row) {
        return $scope.testBatch.permissions.canEditDonations && row.entity.status !== 'RELEASED';
      },

      onRegisterApi: function(gridApi) {
        $scope.gridApi = gridApi;
        gridApi.selection.on.rowSelectionChanged($scope, function() {
          samplesToRemoveList = gridApi.selection.getSelectedRows();
          $scope.isRemoveSamplesEnabled = samplesToRemoveList.length > 0;
        });
      }
    };

    $scope.filter = function(filterType) {

      $scope.dataExportType = filterType;
      $scope.getCurrentTestBatch();
      $scope.gridApi.grid.registerRowsProcessor($scope.singleFilter, 200);

    };

    $scope.resetGrid = function() {
      $route.reload();
    };

    $scope.singleFilter = function(renderableRows) {
      $scope.filteredData = [];

      renderableRows.forEach(function(row) {
        var match = false;
        $scope.dataExportType.columns.forEach(function(field) {
          if ($scope.dataExportType.filterKeys.length === 0) {
            match = true;
          } else if ($scope.dataExportType.filterKeys.indexOf(row.entity[field]) !== -1) {
            match = true;
          }
        });

        if (match != $scope.dataExportType.matchType) {
          row.visible = false;
        } else {
          $scope.filteredData.push(row.entity);
        }
      });

      $scope.gridOptions.data = $scope.filteredData;
      return renderableRows;
    };

    function addTestNamesToColumnDefs(testBatchOutcomesReport) {
      angular.forEach(testBatchOutcomesReport.basicTtiTestNames, function(testName) {
        columnDefs.push(
          {
            name: testName,
            displayName: testName,
            field: 'testResults',
            visible: false,
            width: '80'
          }
        );
      });

      angular.forEach(testBatchOutcomesReport.repeatTtiTestNames, function(testName) {
        columnDefs.push(
          {
            name: testName,
            displayName: testName,
            field: 'testResults',
            visible: false,
            width: '80'
          }
        );
      });

      angular.forEach(testBatchOutcomesReport.confirmatoryTtiTestNames, function(testName) {
        columnDefs.push(
          {
            name: testName,
            displayName: testName,
            field: 'testResults',
            visible: false,
            width: '80'
          }
        );
      });

      angular.forEach(testBatchOutcomesReport.basicBloodTypingTestNames, function(testName) {
        columnDefs.push(
          {
            name: testName,
            displayName: testName,
            field: 'testResults',
            visible: false,
            width: '65'
          }
        );
      });

      angular.forEach(testBatchOutcomesReport.repeatBloodTypingTestNames, function(testName) {
        columnDefs.push(
          {
            name: testName,
            displayName: testName,
            field: 'testResults',
            visible: false,
            width: '70'
          }
        );
      });

      // notify grid-ui that the column defs have changed
      $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.COLUMN);
    }

    $scope.export = function(format) {

      TestingService.getTestBatchOutcomesReport({testBatch: $routeParams.id}, function(testBatchOutcomesReport) {

        addTestNamesToColumnDefs(testBatchOutcomesReport);

        // load test outcomes and previous ABO/Rh for each donation in the test batch
        angular.forEach($scope.gridOptions.data, function(item, key) {
          angular.forEach(testBatchOutcomesReport.donationTestOutcomesReports, function(donationTestOutcomesReport) {
            if (item.donationIdentificationNumber === donationTestOutcomesReport.donationIdentificationNumber) {
              $scope.gridOptions.data[key].testResults = donationTestOutcomesReport.bloodTestOutcomes;
              $scope.gridOptions.data[key].previousDonationAboRhOutcome = donationTestOutcomesReport.previousDonationAboRhOutcome;
            }
          });
        });

        $scope.reportName = $scope.dataExportType.reportName;
        if (format === 'pdf') {
          $scope.gridApi.exporter.pdfExport('all', 'all');
        } else if (format === 'csv') {
          $scope.gridApi.exporter.csvExport('all', 'all');
        }
      }, function(err) {
        $log.error(err);
      });
    };

    $scope.closeTestBatch = function(testBatch) {

      var confirmation = {
        title: gettextCatalog.getString('Confirm Close'),
        button: gettextCatalog.getString('Close'),
        message: gettextCatalog.getString('Are you sure that you want to close this test batch?')
      };

      ModalsService.showConfirmation(confirmation).then(function() {

        TestingService.closeTestBatch(testBatch, function() {
          $location.path('/manageTestBatches');
        }, function(err) {
          $log.error(err);
        });
      });
    };

    $scope.reopenTestBatch = function(testBatch) {

      var confirmation = {
        title: gettextCatalog.getString('Confirm Reopen'),
        button: gettextCatalog.getString('Reopen'),
        message: gettextCatalog.getString('Are you sure that you want to reopen this test batch?')
      };

      ModalsService.showConfirmation(confirmation).then(function() {

        TestingService.reopenTestBatch(testBatch, function(response) {
          if (testBatch.permissions) {
            testBatch.permissions = response.permissions;
            testBatch.status = response.status;
          }
        }, function(err) {
          $scope.err = err;
          $log.error(err);
        });
      });
    };

    $scope.deleteTestBatch = function(testBatchId) {

      var confirmation = {
        title: gettextCatalog.getString('Confirm Void'),
        button: gettextCatalog.getString('Void'),
        message: gettextCatalog.getString('Are you sure that you want to void this test batch?')
      };

      ModalsService.showConfirmation(confirmation).then(function() {

        TestingService.deleteTestBatch(testBatchId, function() {
          $location.path('/manageTestBatches');
        }, function(err) {
          $scope.err = err;
          $log.error(err);
        });
      });
    };

    $scope.releaseTestBatch = function(testBatch) {
      var message;
      if (testBatch.readyForReleaseCount < testBatch.numSamples) {
        message = gettextCatalog.getString('{{count}} of {{total}} samples will be released, ' +
          'the remaining samples require discrepancies to be resolved. ' +
          'Once you release these samples you will no longer be able to add DINs to this batch. ' +
          'Are you sure that you want to release this test batch?',
          {count: testBatch.readyForReleaseCount, total: testBatch.numSamples});
      } else {
        message = gettextCatalog.getString('{{count}} of {{total}} samples will be released. ' +
          'Once you release these samples you will no longer be able to add DINs to this batch. ' +
          'Are you sure that you want to release this test batch?',
          {count: testBatch.readyForReleaseCount, total: testBatch.numSamples});
      }

      var confirmation = {
        title: gettextCatalog.getString('Confirm Release'),
        button: gettextCatalog.getString('Release'),
        message: message
      };

      ModalsService.showConfirmation(confirmation).then(function() {
        TestingService.releaseTestBatch(testBatch, function(response) {
          $scope.testBatch = response;
          $scope.refreshCurrentTestBatch(response);
        }, function(err) {
          $scope.err = err;
          $log.error(err);
        });
      });
    };

    $scope.updateTestBatch = function(testBatch) {
      testBatch.testBatchDate = $scope.testBatchDate.date;
      TestingService.updateTestBatch(testBatch, function(response) {
        $scope.testBatch = response;
        $scope.refreshCurrentTestBatch(response);
        $scope.err = '';
      }, function(err) {
        $scope.err = err;
        $log.error(err);
      });
    };

    $scope.validateForm = function(editableForm) {
      if (editableForm.$invalid) {
        return 'invalid';
      } else {
        $scope.confirmEdit = false;
        return true;
      }
    };

    $scope.updateTimeOnTestBatchDate = function() {
      if ($scope.testBatchDate.time) {
        $scope.testBatchDate.date = moment($scope.testBatchDate.date).hour($scope.testBatchDate.time.getHours()).minutes($scope.testBatchDate.time.getMinutes()).toDate();
      }
    };

    $scope.validateDINRange = function() {
      if ($scope.dinRange.toDIN && $scope.dinRange.fromDIN > $scope.dinRange.toDIN) {
        $scope.addDonationToTestBatchForm.toDIN.$setValidity('invalidDINRange', false);
      } else {
        $scope.addDonationToTestBatchForm.toDIN.$setValidity('invalidDINRange', true);
      }
    };

    $scope.addSampleToTestBatch = function() {
      var testBatchSamples = {
        testBatchId : $routeParams.id,
        fromDIN     : $scope.dinRange.fromDIN,
        toDIN       : $scope.dinRange.toDIN
      };

      $scope.validateDINRange();
      if ($scope.addDonationToTestBatchForm.$invalid) {
        return ;
      }

      if (!$scope.dinRange.toDIN) {
        testBatchSamples.toDIN = $scope.dinRange.fromDIN;
      }

      var currentDonationsInBatch = $scope.testBatch.donations.length;

      TestingService.addDonationsToTestBatch({id: testBatchSamples.testBatchId}, testBatchSamples, function(response) {
        $scope.testBatch = response;
        $scope.refreshCurrentTestBatch(response);
        $scope.clearAddDonationToTestBatchForm($scope.addDonationToTestBatchForm);

        $scope.dinsToAdd = response.donations.length + response.dinsWithoutTestSamples.length + response.dinsInOtherTestBatches.length + response.dinsInOpenDonationanBatch.length - currentDonationsInBatch;
        $scope.dinsAdded = response.donations.length - currentDonationsInBatch;
        $scope.dinsIgnored = response.dinsWithoutTestSamples.length + response.dinsInOtherTestBatches.length + response.dinsInOpenDonationanBatch.length;
      }, function(err) {
        $log.error(err);
        $scope.hasErrors = false;
        if (err.status !== 404 && err.status !== 500 && err.data.hasErrors === 'true') {
          $scope.hasErrors = true;
        }
      });
    };

    $scope.clearAddDonationToTestBatchForm = function(addDonationToTestBatchForm) {
      addDonationToTestBatchForm.$setPristine();
      addDonationToTestBatchForm.$setUntouched();
      $scope.dinRange = angular.copy(dinRangeMaster);
      $scope.hasErrors = false;
    };

    function removeSamplesFromTestBatch(sampleIds) {
      $scope.dinsToAdd = null;
      $scope.dinsIgnored = null;
      TestingService.removeDonationsFromTestBatch(
        {id: $routeParams.id},
          {testBatchId: $routeParams.id, donationIds: sampleIds},
          function(response) {
            $scope.testBatch = response;
            $scope.refreshCurrentTestBatch(response);
          }, function(err) {
            $log.error(err);
            $scope.hasErrors = false;
            if (err.status !== 404 && err.status !== 500 && err.data.hasErrors === 'true') {
              $scope.hasErrors = true;
            }
          });
      $scope.removingSamples = false;
    }

    $scope.removeSamplesFromTestBatch = function() {
      $scope.removingSamples = true;
      var testOutcomesCaptured = false;
      var sampleIds = [];
      angular.forEach(samplesToRemoveList, function(sample) {
        $log.info(sample.donationIdentificationNumber);
        sampleIds.push(sample.id);
        if (sample.ttistatus !== 'NOT_DONE' || sample.bloodTypingStatus !== 'NOT_DONE' || sample.bloodTypingMatchStatus !== 'NOT_DONE') {
          testOutcomesCaptured = true;
        }
      });

      if (!testOutcomesCaptured) {
        removeSamplesFromTestBatch(sampleIds);
        return;
      }

      var removalConfirmation = {
        title: gettextCatalog.getString('Remove Test Sample(s)'),
        button: gettextCatalog.getString('Remove'),
        message: gettextCatalog.getString('Test outcomes have been recorded for one or more samples. Removing these from the test batch will clear all outcomes for those samples. Are you sure you want to continue?')
      };

      ModalsService.showConfirmation(removalConfirmation).then(function() {
        removeSamplesFromTestBatch(sampleIds);
      }).catch(function() {
        // Confirmation was rejected
        $scope.removingSamples = false;
      });
    };
  });
