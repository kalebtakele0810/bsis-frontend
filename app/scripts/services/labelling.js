'use strict';

angular.module('bsis')
  .factory('LabellingService', function($http, Api) {
    return {
      search: Api.Labelling.search,
      getComponentForm: Api.Labelling.getComponentForm,
      getComponents: Api.Labelling.getComponents,
      getSafeComponents: function(componentsSearch, response) {
        var components = Api.Labelling.getSafeComponents({
          donationIdentificationNumber: componentsSearch.donationIdentificationNumber,
          componentCode: componentsSearch.componentCode,
          componentTypeId: componentsSearch.componentTypeId,
          locationId: componentsSearch.locationId,
          bloodGroups: componentsSearch.bloodGroups,
          startDate: componentsSearch.startDate,
          endDate: componentsSearch.endDate,
          inventoryStatus: componentsSearch.inventoryStatus
        }, function() {
          response(components);
        }, function() {
          response(false);
        });
      },
      verifyPackLabel: function(verificationParams, onSuccess, onError) {
        Api.Labelling.verifyPackLabel(verificationParams, function(res) {
          onSuccess(res);
        }, function(err) {
          onError(err.data);
        });
      },
      printPackLabel: function(componentId, onSuccess, onError) {
        Api.Labelling.printPackLabel({componentId: componentId}, function(label) {
          onSuccess(label);
          var hiddenElement = document.createElement('a');
          hiddenElement.href = 'data:attachment/zpl,' + encodeURI(label.labelZPL);
          hiddenElement.target = '_blank';
          hiddenElement.download = 'label' + moment(new Date()) + '.zpl';
          hiddenElement.click();
        }, function(err) {
          onError(err.data);
        });
      },

      printDiscardLabel: function(componentId, onSuccess, onError) {
        Api.Labelling.printDiscardLabel({componentId: componentId}, function(label) {
          onSuccess(label);
          var hiddenElement = document.createElement('a');
          hiddenElement.href = 'data:attachment/zpl,' + encodeURI(label.labelZPL);
          hiddenElement.target = '_blank';
          hiddenElement.download = 'label' + moment(new Date()) + '.zpl';
          hiddenElement.click();
        }, function(err) {
          onError(err.data);
        });
      }
    };
  }
);
