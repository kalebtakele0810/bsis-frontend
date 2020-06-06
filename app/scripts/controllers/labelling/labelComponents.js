'use strict';

angular.module('bsis').controller('LabelComponentsCtrl', function($scope, $location, $log, $routeParams, $timeout, LabellingService, gettextCatalog) {

  $scope.serverErrorMessage = null;
  $scope.searchResults = null;
  $scope.search = {
    donationIdentificationNumber: angular.isDefined($routeParams.donationIdentificationNumber) ? $routeParams.donationIdentificationNumber : null,
    componentType: angular.isDefined($routeParams.componentType) ? $routeParams.componentType : null
  };
  $scope.componentTypes = [];
  $scope.verificationParams = {
    componentId: null,
    prePrintedDIN: null,
    packLabelDIN: null
  };
  $scope.verifyComponent = null;
  $scope.verifying = false;
  $scope.rescanning = false;

  $scope.getComponents = function(form) {

    if (form && form.$invalid) {
      return;
    }

    $scope.verifyComponent = null;
    $scope.serverErrorMessage = null;
    $location.search(angular.extend({search: true}, $scope.search));
    $scope.searching = true;
    $scope.searchResults = false;
    LabellingService.getComponents($scope.search, function(response) {
      $scope.components = response.components;
      $scope.searchResults = true;
      $scope.searching = false;
      $scope.clearLabelVerificationForm();
    }, function(err) {
      $log.error(err);
      $scope.searching = false;
    });
  };

  if ($routeParams.search) {
    $scope.getComponents();
  }

  $scope.verifyPackLabel = function(component, labellingVerificationForm) {
    $scope.verifying = true;
    if (labellingVerificationForm.$invalid) {
      $scope.verifying = false;
      return;
    }
    if ($scope.verificationParams.prePrintedDIN === $scope.verificationParams.packLabelDIN) {
      labellingVerificationForm.packLabelDIN.$setValidity('sameDinScanned', false);
      $scope.verifying = false;
      $scope.rescanning = true;
      return;
    }
    $scope.verificationParams.componentId = component.id;
    LabellingService.verifyPackLabel($scope.verificationParams, function(response) {
      if (response.labelVerified) {
        component.verificationStatus = 'verified';
        $scope.clearLabelVerificationForm(labellingVerificationForm);
        $scope.verifying = false;
        $scope.verifyComponent = null;
      } else {
        labellingVerificationForm.packLabelDIN.$setValidity('notVerified', false);
        $scope.rescanning = true;
        $scope.verifying = false;
      }
    }, function(err) {
      $log.error(err);
      $scope.verifying = false;
    });
  };

  $scope.printPackLabel = function(component) {
    $scope.serverErrorMessage = null;
    LabellingService.printPackLabel(component.id, function(response) {
      $scope.labelZPL = response.labelZPL;
      $log.debug('$scope.labelZPL: ', $scope.labelZPL);
      $scope.verifyComponent = component;
    }, function(err) {
      if (err.errorCode === 'CONFLICT') {
        $scope.serverErrorMessage = gettextCatalog.getString('This component cannot be labelled - please check the status of the donor and donation');
      }
      $log.error(err);
    });
  };

  $scope.printDiscardLabel = function(componentId) {
    LabellingService.printDiscardLabel(componentId, function(response) {
      $scope.labelZPL = response.labelZPL;
      $log.debug('$scope.labelZPL: ', $scope.labelZPL);
    }, function(err) {
      $log.error(err);
    });
  };

  $scope.clear = function(form) {
    if (form) {
      form.$setUntouched();
      form.$setPristine();
    }
    $location.search({});
    $scope.search = {};
    $scope.searchResults = null;
    $scope.serverErrorMessage = null;
    $scope.verifyComponent = null;
    $scope.clearLabelVerificationForm();
  };

  $scope.clearLabelVerificationForm = function(form) {
    $scope.verificationParams = {};
    $scope.verificationParams.prePrintedDIN = null;
    $scope.verificationParams.packLabelDIN = null;
    $scope.rescanning = false;
    $scope.verifying = false;
    if (form) {
      form.$setUntouched();
      form.$setPristine();
    }
  };

  $scope.rescanPackLabel = function(form) {
    $scope.clearLabelVerificationForm(form);
    $scope.verifying = false;
    $scope.rescanning = false;
    form.packLabelDIN.$setValidity('sameDinScanned', null);
    form.packLabelDIN.$setValidity('notVerified', null);
    $timeout(function() {
      document.getElementById('prePrintedDIN').focus();
    }, 0);
  };

  $scope.onTextClick = function($event) {
    // Select the target's text on click
    $event.target.select();
  };

  function fetchFormFields() {
    LabellingService.getComponentForm({}, function(response) {
      $scope.componentTypes = response.componentTypes;
    }, $log.error);
  }

  fetchFormFields();
});
