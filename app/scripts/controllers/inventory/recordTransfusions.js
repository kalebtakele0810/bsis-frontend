'use strict';

angular.module('bsis').controller('RecordTransfusionsCtrl', function($scope, $location, $log, $timeout, $routeParams, TransfusionService, ModalsService, gettextCatalog, BLOODGROUP, GENDER, DATEFORMAT) {

  $scope.submitted = false;
  $scope.componentTypes = null;
  $scope.locations = null;
  $scope.transfusionOutcomes = null;
  $scope.transfusionReactionTypes = null;
  $scope.genders = null;
  $scope.bloodGroups = null;
  $scope.today = moment().startOf('day').toDate();

  $scope.masterDetails = {
    donationIdentificationNumber: null,
    componentCode: null,
    componentType: {id: null},
    patient: {dateOfBirth: null},
    transfusionOutcome: null,
    transfusionReactionType: {id: null},
    notes: null,
    receivedFrom: {id: null},
    dateTransfused: $scope.today
  };

  function initializeRecordTransfusionForm() {
    TransfusionService.getTransfusionForm(function(response) {
      if (response !== false) {
        $scope.format = DATEFORMAT;
        $scope.componentTypes = response.componentTypes;
        $scope.locations = response.usageSites;
        $scope.transfusionOutcomes = response.transfusionOutcomes;
        $scope.genders = GENDER.options;
        $scope.transfusionReactionTypes = response.transfusionReactionTypes;
        $scope.bloodGroups = BLOODGROUP.options;

        if ($routeParams.id) {
          TransfusionService.getTransfusionById({id: $routeParams.id}, function(res) {
            $scope.transfusion = res.transfusion;
            $scope.transfusion.componentCode = res.transfusion.component.componentCode;
            $scope.transfusion.componentType = res.transfusion.component.componentType;
            $scope.transfusion.dateTransfused = new Date(res.transfusion.dateTransfused);
            $scope.transfusion.patient.dateOfBirth = new Date(res.transfusion.patient.dateOfBirth);
          }, $log.error);
        } else {
          $scope.transfusion = angular.copy($scope.masterDetails);
        }
      }
    });
  }

  $scope.$watch('transfusion.donationIdentificationNumber', function() {
    $timeout(function() {
      $scope.recordTransfusionsForm.donationIdentificationNumber.$setValidity('invalid', true);
    });
  });

  $scope.$watch('transfusion.componentCode', function() {
    $timeout(function() {
      $scope.recordTransfusionsForm.componentCode.$setValidity('invalid', true);
      $scope.recordTransfusionsForm.componentCode.$setValidity('invalidComponentCode', true);
    });
  });

  $scope.$watch('transfusion.componentType.id', function() {
    $timeout(function() {
      $scope.recordTransfusionsForm.componentType.$setValidity('invalid', true);
      $scope.recordTransfusionsForm.componentType.$setValidity('noComponents', true);
      $scope.recordTransfusionsForm.componentType.$setValidity('multipleComponents', true);
      $scope.recordTransfusionsForm.componentType.$setValidity('invalidComponentStatus', true);
    });
  });

  $scope.$watch('transfusion.dateTransfused', function() {
    $timeout(function() {
      $scope.recordTransfusionsForm.dateTransfused.$setValidity('invalid', true);
      $scope.recordTransfusionsForm.dateTransfused.$setValidity('dateTransfusedAfterComponentCreated', true);
    });
  });

  function getCodeByComponentTypeId(componentTypeId) {
    if (componentTypeId) {
      var filteredComponentTypes = $scope.componentTypes.filter(function(componentType) {
        return componentTypeId === componentType.id;
      });
      return filteredComponentTypes[0].componentTypeCode;
    }
  }

  function onSaveError(err) {
    if (err.data && err.data.donationIdentificationNumber) {
      $scope.recordTransfusionsForm.donationIdentificationNumber.$setValidity('invalid', false);
    }

    if (err.data && err.data.componentCode) {
      if (err.data.fieldErrors.componentCode[0].code === 'errors.invalid.componentStatus') {
        $scope.recordTransfusionsForm.componentCode.$setValidity('invalidComponentCode', false);
      } else if (err.data.fieldErrors.componentCode[0].code === 'errors.invalid') {
        $scope.recordTransfusionsForm.componentCode.$setValidity('invalid', false);
      }
    }

    if (err.data && err.data.componentType) {
      if (err.data.fieldErrors.componentType[0].code === 'errors.invalid.noComponents') {
        $scope.recordTransfusionsForm.componentType.$setValidity('noComponents', false);
      } else if (err.data.fieldErrors.componentType[0].code === 'errors.invalid.multipleComponents') {
        $scope.transfusion.componentCode = getCodeByComponentTypeId($scope.transfusion.componentType.id);
        $scope.recordTransfusionsForm.componentType.$setValidity('multipleComponents', false);
      } else if (err.data.fieldErrors.componentType[0].code === 'errors.invalid.componentStatus' && !$scope.transfusion.componentCode) {
        $scope.recordTransfusionsForm.componentType.$setValidity('invalidComponentStatus', false);
      } else if (err.data.fieldErrors.componentType[0].code === 'errors.invalid') {
        $scope.recordTransfusionsForm.componentType.$setValidity('invalid', false);
      }
    }

    if (err.data && err.data.dateTransfused) {
      if (err.data.fieldErrors.dateTransfused[0].code === 'errors.invalid.dateTransfusedAfterComponentCreated') {
        $scope.recordTransfusionsForm.dateTransfused.$setValidity('dateTransfusedAfterComponentCreated', false);
      } else if (err.data.fieldErrors.dateTransfused[0].code === 'errors.invalid') {
        $scope.recordTransfusionsForm.dateTransfused.$setValidity('invalid', false);
      }
    }
  }

  $scope.setComponentType = function(componentCode) {
    if (componentCode) {
      var filteredComponentTypes = $scope.componentTypes.filter(function(componentType) {
        return componentCode.indexOf(componentType.componentTypeCode) !== -1;
      });

      if (filteredComponentTypes.length > 0) {
        $scope.transfusion.componentType.id = filteredComponentTypes[0].id;
        $scope.recordTransfusionsForm.componentType.$setValidity('multipleComponents', true);
      } else {
        $scope.transfusion.componentType.id = null;
      }
    } else {
      $scope.transfusion.componentCode = null;
    }
  };

  $scope.updateReactionType = function(transactionOutcome) {
    if (transactionOutcome && transactionOutcome !== 'TRANSACTION_REACTION_OCCURED') {
      $scope.transfusion.transfusionReactionType = null;
    }
  };

  $scope.recordTransfusion = function recordTransfusion() {
    if ($scope.recordTransfusionsForm.$invalid) {
      return;
    }
    $scope.submitted = true;
    $scope.savingTransfusionForm = true;
    var transfusionRecord = angular.copy($scope.transfusion);

    if ($routeParams.id) {
      TransfusionService.update(transfusionRecord, function() {
        $scope.savingTransfusionForm = false;
        $location.search({din: transfusionRecord.donationIdentificationNumber, componentCode: transfusionRecord.componentCode}).path('/findTransfusion');
      }, function(response) {
        onSaveError(response);
        $scope.savingTransfusionForm = false;
      });
    } else {
      TransfusionService.createTransfusion(transfusionRecord, function(res) {
        $scope.savingTransfusionForm = false;
        var transfusionItem = res.transfusion;
        $location.search({din: transfusionItem.donationIdentificationNumber, componentCode: transfusionItem.component.componentCode}).path('/findTransfusion');
      }, function(response) {
        onSaveError(response);
        $scope.savingTransfusionForm = false;
      });
    }
  };

  $scope.voidTransfusion = function() {
    var voidTransfusionConfirmation = {
      title: gettextCatalog.getString('Void Tranfusion'),
      button: gettextCatalog.getString('Void'),
      message: gettextCatalog.getString('Are you sure that you want to void this Tranfusion?')
    };

    ModalsService.showConfirmation(voidTransfusionConfirmation).then(function() {
      $scope.deleting = true;
      TransfusionService.voidTransfusion({id: $routeParams.id}, function() {
        $location.path('/findTransfusion');
      }, function(response) {
        $log.error('Error when voiding transfusion: ');
        $log.error(response);
        $scope.deleting = false;
      });
    }).catch(function() {
      // Confirmation was rejected
      $scope.deleting = false;
    });
  };
  $scope.clear = function() {
    $scope.transfusion = angular.copy($scope.masterDetails);
    $scope.savingTransfusionForm = false;
    $scope.submitted = false;
    $scope.recordTransfusionsForm.$setPristine();
  };
  initializeRecordTransfusionForm();
});